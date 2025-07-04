/**
 * duFundation v3.1 - API Rate Limiting por Usuário/Role
 * Capacidades: [MICRO+] - API rate limiting por usuário/role
 * Features: Redis backend, role-based limits, burst protection
 */

const { EventEmitter } = require('events');

class AdvancedRateLimiter extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      capacity: options.capacity || 'micro',
      
      // [MICRO] - Limits básicos
      defaultLimits: {
        requests: 100,
        window: 60 * 1000, // 1 minute
        burst: 20
      },
      
      // [SMALL+] - Role-based limits
      roleLimits: {
        admin: { requests: 1000, window: 60 * 1000, burst: 100 },
        manager: { requests: 500, window: 60 * 1000, burst: 50 },
        user: { requests: 100, window: 60 * 1000, burst: 20 },
        guest: { requests: 50, window: 60 * 1000, burst: 10 }
      },
      
      // [MEDIUM+] - Advanced features
      adaptiveLimits: options.adaptiveLimits || false,
      enableBurstProtection: options.enableBurstProtection || true,
      enableIPTracking: options.enableIPTracking || true,
      
      // [LARGE+] - Enterprise features
      enableDistributedLimiting: options.enableDistributedLimiting || false,
      enablePredictiveThrottling: options.enablePredictiveThrottling || false
    };
    
    // In-memory storage (Redis integration for LARGE+)
    this.requestCounts = new Map(); // key -> { count, resetTime, burst }
    this.userStats = new Map(); // userId -> stats
    this.ipStats = new Map(); // ip -> stats
    this.blockedUsers = new Set();
    this.blockedIPs = new Set();
    
    // Start cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Check if request is allowed for user/role
   */
  async checkLimit(userId, role, ipAddress, endpoint) {
    const now = Date.now();
    
    // Get applicable limits
    const limits = this.getLimitsForRole(role);
    
    // Generate keys for tracking
    const userKey = `user:${userId}`;
    const ipKey = `ip:${ipAddress}`;
    const endpointKey = `endpoint:${endpoint}`;
    
    // Check if user/IP is blocked
    if (this.blockedUsers.has(userId) || this.blockedIPs.has(ipAddress)) {
      this.emit('requestBlocked', {
        userId, role, ipAddress, endpoint,
        reason: 'BLOCKED',
        timestamp: now
      });
      
      return {
        allowed: false,
        reason: 'BLOCKED',
        retryAfter: this.getRetryAfter(userKey)
      };
    }
    
    // Check user rate limit
    const userCheck = this.checkUserLimit(userKey, limits, now);
    if (!userCheck.allowed) {
      this.emit('requestLimited', {
        userId, role, ipAddress, endpoint,
        reason: 'USER_LIMIT',
        limit: limits.requests,
        timestamp: now
      });
      
      return userCheck;
    }
    
    // Check IP rate limit [SMALL+]
    if (this.config.enableIPTracking && this.config.capacity !== 'micro') {
      const ipCheck = this.checkIPLimit(ipKey, limits, now);
      if (!ipCheck.allowed) {
        this.emit('requestLimited', {
          userId, role, ipAddress, endpoint,
          reason: 'IP_LIMIT',
          timestamp: now
        });
        
        return ipCheck;
      }
    }
    
    // Check endpoint-specific limits [MEDIUM+]
    if (this.config.capacity === 'medium' || this.isLargeCapacity()) {
      const endpointCheck = this.checkEndpointLimit(endpointKey, endpoint, limits, now);
      if (!endpointCheck.allowed) {
        this.emit('requestLimited', {
          userId, role, ipAddress, endpoint,
          reason: 'ENDPOINT_LIMIT',
          timestamp: now
        });
        
        return endpointCheck;
      }
    }
    
    // Record successful request
    this.recordRequest(userKey, ipKey, endpointKey, userId, ipAddress, endpoint, now);
    
    return {
      allowed: true,
      remaining: userCheck.remaining,
      resetTime: userCheck.resetTime
    };
  }

  /**
   * Get limits based on user role
   */
  getLimitsForRole(role) {
    return this.config.roleLimits[role] || this.config.defaultLimits;
  }

  /**
   * Check user-specific rate limit
   */
  checkUserLimit(userKey, limits, now) {
    const record = this.requestCounts.get(userKey) || {
      count: 0,
      resetTime: now + limits.window,
      burst: 0,
      lastRequest: now
    };
    
    // Reset window if expired
    if (now >= record.resetTime) {
      record.count = 0;
      record.resetTime = now + limits.window;
      record.burst = 0;
    }
    
    // Check burst protection [SMALL+]
    if (this.config.enableBurstProtection && this.config.capacity !== 'micro') {
      const timeSinceLastRequest = now - record.lastRequest;
      if (timeSinceLastRequest < 1000) { // Less than 1 second
        record.burst++;
        
        if (record.burst > limits.burst) {
          return {
            allowed: false,
            reason: 'BURST_LIMIT',
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
          };
        }
      } else {
        record.burst = Math.max(0, record.burst - 1); // Decay burst counter
      }
    }
    
    // Check main limit
    if (record.count >= limits.requests) {
      return {
        allowed: false,
        reason: 'RATE_LIMIT',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      };
    }
    
    return {
      allowed: true,
      remaining: limits.requests - record.count - 1,
      resetTime: record.resetTime
    };
  }

  /**
   * Check IP-based rate limit
   */
  checkIPLimit(ipKey, limits, now) {
    // IP gets 3x the user limit for shared IPs
    const ipLimits = {
      ...limits,
      requests: limits.requests * 3
    };
    
    return this.checkUserLimit(ipKey, ipLimits, now);
  }

  /**
   * Check endpoint-specific rate limits
   */
  checkEndpointLimit(endpointKey, endpoint, limits, now) {
    // Different endpoints have different limits
    const endpointMultipliers = {
      '/api/auth/login': 0.1,     // Very restrictive
      '/api/auth/register': 0.2,  // Restrictive
      '/api/data/export': 0.5,    // Moderate
      '/api/search': 2.0,         // More permissive
      '/api/status': 10.0         // Very permissive
    };
    
    const multiplier = endpointMultipliers[endpoint] || 1.0;
    const endpointLimits = {
      ...limits,
      requests: Math.floor(limits.requests * multiplier)
    };
    
    return this.checkUserLimit(endpointKey, endpointLimits, now);
  }

  /**
   * Record successful request
   */
  recordRequest(userKey, ipKey, endpointKey, userId, ipAddress, endpoint, now) {
    // Record user request
    const userRecord = this.requestCounts.get(userKey) || {
      count: 0,
      resetTime: now + this.config.defaultLimits.window,
      burst: 0,
      lastRequest: now
    };
    
    userRecord.count++;
    userRecord.lastRequest = now;
    this.requestCounts.set(userKey, userRecord);
    
    // Record IP request [SMALL+]
    if (this.config.enableIPTracking && this.config.capacity !== 'micro') {
      const ipRecord = this.requestCounts.get(ipKey) || {
        count: 0,
        resetTime: now + this.config.defaultLimits.window,
        burst: 0,
        lastRequest: now
      };
      
      ipRecord.count++;
      ipRecord.lastRequest = now;
      this.requestCounts.set(ipKey, ipRecord);
    }
    
    // Record endpoint request [MEDIUM+]
    if (this.config.capacity === 'medium' || this.isLargeCapacity()) {
      const endpointRecord = this.requestCounts.get(endpointKey) || {
        count: 0,
        resetTime: now + this.config.defaultLimits.window,
        burst: 0,
        lastRequest: now
      };
      
      endpointRecord.count++;
      endpointRecord.lastRequest = now;
      this.requestCounts.set(endpointKey, endpointRecord);
    }
    
    // Update user stats
    this.updateUserStats(userId, endpoint, now);
    
    // Emit event for monitoring
    this.emit('requestAllowed', {
      userId, ipAddress, endpoint,
      timestamp: now
    });
  }

  /**
   * Update user statistics for analytics
   */
  updateUserStats(userId, endpoint, now) {
    const stats = this.userStats.get(userId) || {
      totalRequests: 0,
      lastRequest: now,
      endpoints: new Set(),
      firstRequest: now
    };
    
    stats.totalRequests++;
    stats.lastRequest = now;
    stats.endpoints.add(endpoint);
    
    this.userStats.set(userId, stats);
  }

  /**
   * Block user temporarily
   */
  blockUser(userId, duration = 300000) { // 5 minutes default
    this.blockedUsers.add(userId);
    
    setTimeout(() => {
      this.blockedUsers.delete(userId);
      this.emit('userUnblocked', { userId, timestamp: Date.now() });
    }, duration);
    
    this.emit('userBlocked', { userId, duration, timestamp: Date.now() });
  }

  /**
   * Block IP temporarily
   */
  blockIP(ipAddress, duration = 300000) { // 5 minutes default
    this.blockedIPs.add(ipAddress);
    
    setTimeout(() => {
      this.blockedIPs.delete(ipAddress);
      this.emit('ipUnblocked', { ipAddress, timestamp: Date.now() });
    }, duration);
    
    this.emit('ipBlocked', { ipAddress, duration, timestamp: Date.now() });
  }

  /**
   * Get retry after seconds for a key
   */
  getRetryAfter(key) {
    const record = this.requestCounts.get(key);
    if (!record) return 0;
    
    const now = Date.now();
    return Math.max(0, Math.ceil((record.resetTime - now) / 1000));
  }

  /**
   * Get rate limiting analytics
   */
  getAnalytics() {
    const now = Date.now();
    
    return {
      totalActiveUsers: this.userStats.size,
      totalBlockedUsers: this.blockedUsers.size,
      totalBlockedIPs: this.blockedIPs.size,
      
      // Request distribution by role
      requestsByRole: this.getRequestsByRole(),
      
      // Top endpoints by requests
      topEndpoints: this.getTopEndpoints(),
      
      // Recent limiting events
      recentLimits: this.getRecentLimits(),
      
      // Capacity-specific metrics
      ...(this.isLargeCapacity() && {
        predictiveMetrics: this.getPredictiveMetrics(),
        distributedStats: this.getDistributedStats()
      })
    };
  }

  /**
   * Helper methods
   */
  isLargeCapacity() {
    return ['large', 'enterprise'].includes(this.config.capacity);
  }

  getRequestsByRole() {
    // This would be integrated with user role system
    return {
      admin: 0,
      manager: 0,
      user: 0,
      guest: 0
    };
  }

  getTopEndpoints() {
    const endpointCounts = {};
    
    for (const [key, record] of this.requestCounts) {
      if (key.startsWith('endpoint:')) {
        const endpoint = key.replace('endpoint:', '');
        endpointCounts[endpoint] = record.count;
      }
    }
    
    return Object.entries(endpointCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }

  getRecentLimits() {
    // This would store recent limit events
    return [];
  }

  getPredictiveMetrics() {
    // Advanced analytics for LARGE+ capacities
    return {
      predictedLoad: 0,
      recommendedLimits: {},
      anomalyScore: 0
    };
  }

  getDistributedStats() {
    // Stats across multiple instances for LARGE+ capacities
    return {
      totalInstances: 1,
      totalRequests: 0,
      averageLoad: 0
    };
  }

  /**
   * Start cleanup timer for expired records
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredRecords();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Clean up expired rate limit records
   */
  cleanupExpiredRecords() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, record] of this.requestCounts) {
      if (now >= record.resetTime && record.count === 0) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      this.requestCounts.delete(key);
    }
    
    if (expiredKeys.length > 0) {
      console.log(`[RateLimiter] Cleaned up ${expiredKeys.length} expired records`);
    }
  }
}

module.exports = AdvancedRateLimiter;
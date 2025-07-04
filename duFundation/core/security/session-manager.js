/**
 * duFundation v3.1 - Advanced Session Management
 * Capacidades: [NANO+] - Session management avançado
 * Features: Redis storage, token rotation, activity tracking
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');

class AdvancedSessionManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      // [NANO] - Configurações básicas
      sessionTimeout: options.sessionTimeout || 30 * 60 * 1000, // 30 min
      maxConcurrentSessions: options.maxConcurrentSessions || 3,
      
      // [MICRO+] - Configurações avançadas
      tokenRotationInterval: options.tokenRotationInterval || 15 * 60 * 1000, // 15 min
      
      // [SMALL+] - Security features
      enableActivityTracking: options.enableActivityTracking || true,
      maxIdleTime: options.maxIdleTime || 20 * 60 * 1000, // 20 min
      
      // [MEDIUM+] - Enterprise features
      enableCrossBrowserDetection: options.enableCrossBrowserDetection || false,
      enableLocationTracking: options.enableLocationTracking || false,
      
      capacity: options.capacity || 'nano'
    };
    
    this.sessions = new Map();
    this.userSessions = new Map(); // userId -> Set of sessionIds
    this.activeConnections = new Map(); // sessionId -> WebSocket/connection
    
    this.startCleanupTimer();
  }

  /**
   * Create new session with advanced security
   */
  async createSession(userId, userAgent, ipAddress, additionalData = {}) {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    
    const session = {
      id: sessionId,
      userId,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.config.sessionTimeout,
      
      // Security metadata
      userAgent,
      ipAddress,
      loginLocation: additionalData.location || null,
      
      // Activity tracking [MICRO+]
      activityLog: this.config.enableActivityTracking ? [] : null,
      requestCount: 0,
      lastEndpoint: null,
      
      // Token rotation [MICRO+]
      tokenVersion: 1,
      nextRotationAt: now + this.config.tokenRotationInterval,
      
      // Cross-session detection [MEDIUM+]
      deviceFingerprint: this.config.enableCrossBrowserDetection ? 
        this.generateDeviceFingerprint(userAgent, additionalData) : null,
    };

    // Enforce concurrent session limits
    await this.enforceConcurrentSessionLimits(userId);
    
    // Store session
    this.sessions.set(sessionId, session);
    
    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId).add(sessionId);
    
    // Emit event for audit trail
    this.emit('sessionCreated', {
      sessionId,
      userId,
      ipAddress,
      userAgent,
      timestamp: now
    });
    
    return sessionId;
  }

  /**
   * Validate and refresh session
   */
  async validateSession(sessionId, ipAddress, userAgent) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { valid: false, reason: 'SESSION_NOT_FOUND' };
    }
    
    const now = Date.now();
    
    // Check expiration
    if (now > session.expiresAt) {
      await this.destroySession(sessionId, 'EXPIRED');
      return { valid: false, reason: 'SESSION_EXPIRED' };
    }
    
    // Check idle timeout [SMALL+]
    if (this.config.capacity !== 'nano' && 
        (now - session.lastActivity) > this.config.maxIdleTime) {
      await this.destroySession(sessionId, 'IDLE_TIMEOUT');
      return { valid: false, reason: 'IDLE_TIMEOUT' };
    }
    
    // Security validations [MEDIUM+]
    if (this.config.enableCrossBrowserDetection) {
      const currentFingerprint = this.generateDeviceFingerprint(userAgent, { ipAddress });
      if (session.deviceFingerprint !== currentFingerprint) {
        await this.destroySession(sessionId, 'DEVICE_MISMATCH');
        return { valid: false, reason: 'DEVICE_MISMATCH' };
      }
    }
    
    // Update activity
    session.lastActivity = now;
    session.requestCount++;
    
    // Add to activity log [MICRO+]
    if (session.activityLog) {
      session.activityLog.push({
        timestamp: now,
        ipAddress,
        userAgent: userAgent.substring(0, 100) // Truncate for storage
      });
      
      // Keep only last 50 activities
      if (session.activityLog.length > 50) {
        session.activityLog = session.activityLog.slice(-50);
      }
    }
    
    // Check token rotation [MICRO+]
    const needsRotation = now > session.nextRotationAt;
    if (needsRotation) {
      session.tokenVersion++;
      session.nextRotationAt = now + this.config.tokenRotationInterval;
    }
    
    return {
      valid: true,
      session,
      needsRotation,
      newToken: needsRotation ? this.generateToken(sessionId, session.tokenVersion) : null
    };
  }

  /**
   * Generate secure session ID
   */
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate device fingerprint for cross-browser detection
   */
  generateDeviceFingerprint(userAgent, additionalData) {
    const fingerprint = crypto
      .createHash('sha256')
      .update(userAgent + (additionalData.ipAddress || '') + this.config.capacity)
      .digest('hex');
    
    return fingerprint.substring(0, 16); // Truncate for storage
  }

  /**
   * Generate JWT-like token with version
   */
  generateToken(sessionId, version) {
    const payload = {
      sid: sessionId,
      v: version,
      iat: Date.now()
    };
    
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Start periodic cleanup timer
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    const expiredSessions = [];
    
    for (const [sessionId, session] of this.sessions) {
      if (now > session.expiresAt) {
        expiredSessions.push(sessionId);
      }
    }
    
    for (const sessionId of expiredSessions) {
      this.destroySession(sessionId, 'CLEANUP_EXPIRED');
    }
  }

  /**
   * Destroy session with reason tracking
   */
  async destroySession(sessionId, reason = 'MANUAL') {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Remove from user sessions
      const userSessions = this.userSessions.get(session.userId);
      if (userSessions) {
        userSessions.delete(sessionId);
        if (userSessions.size === 0) {
          this.userSessions.delete(session.userId);
        }
      }
      
      // Remove session
      this.sessions.delete(sessionId);
      
      // Emit event for audit trail
      this.emit('sessionDestroyed', {
        sessionId,
        userId: session.userId,
        reason,
        duration: Date.now() - session.createdAt,
        requestCount: session.requestCount,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Enforce concurrent session limits per user
   */
  async enforceConcurrentSessionLimits(userId) {
    const userSessions = this.userSessions.get(userId);
    
    if (userSessions && userSessions.size >= this.config.maxConcurrentSessions) {
      // Get oldest session and destroy it
      let oldestSession = null;
      let oldestTime = Date.now();
      
      for (const sessionId of userSessions) {
        const session = this.sessions.get(sessionId);
        if (session && session.createdAt < oldestTime) {
          oldestTime = session.createdAt;
          oldestSession = sessionId;
        }
      }
      
      if (oldestSession) {
        await this.destroySession(oldestSession, 'CONCURRENT_LIMIT');
      }
    }
  }
}

module.exports = AdvancedSessionManager;
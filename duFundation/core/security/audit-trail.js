/**
 * duFundation v3.1 - Audit Trail Completo
 * Capacidades: [MICRO+] - Audit trail completo de ações
 * Features: Action logging, security events, compliance tracking
 */

const { EventEmitter } = require('events');
const crypto = require('crypto');

class AuditTrailManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      capacity: options.capacity || 'micro',
      
      // [MICRO] - Basic audit logging
      enableActionLogging: true,
      maxLogRetention: 30, // days
      
      // [SMALL+] - Enhanced logging
      enableSecurityEvents: options.enableSecurityEvents || true,
      enableDataChanges: options.enableDataChanges || true,
      enableFileIntegrity: options.enableFileIntegrity || false,
      
      // [MEDIUM+] - Compliance features
      enableComplianceMode: options.enableComplianceMode || false,
      enableEncryptedLogs: options.enableEncryptedLogs || false,
      enableImmutableLogs: options.enableImmutableLogs || false,
      
      // [LARGE+] - Enterprise features
      enableRealTimeAlerts: options.enableRealTimeAlerts || false,
      enableAdvancedAnalytics: options.enableAdvancedAnalytics || false,
      enableForensicsMode: options.enableForensicsMode || false,
      
      storage: options.storage || 'memory' // memory, database, file
    };
    
    // In-memory storage (database integration for SMALL+)
    this.auditLogs = [];
    this.securityEvents = [];
    this.complianceEvents = [];
    this.systemChanges = [];
    
    // Real-time alerts [LARGE+]
    this.alertRules = new Map();
    this.activeAlerts = new Set();
    
    // Initialize compliance mode [MEDIUM+]
    if (this.config.enableComplianceMode) {
      this.initializeComplianceMode();
    }
    
    // Start background tasks
    this.startLogRotation();
    this.startIntegrityChecks();
  }

  /**
   * Log user action with full context
   */
  async logAction(action, userId, details = {}) {
    const timestamp = Date.now();
    const actionId = this.generateActionId();
    
    const auditEntry = {
      id: actionId,
      timestamp,
      action,
      userId,
      
      // Basic details [MICRO+]
      ipAddress: details.ipAddress || null,
      userAgent: details.userAgent || null,
      sessionId: details.sessionId || null,
      
      // Enhanced details [SMALL+]
      ...(this.isSmallCapacity() && {
        resourceId: details.resourceId || null,
        resourceType: details.resourceType || null,
        beforeState: details.beforeState || null,
        afterState: details.afterState || null,
        metadata: details.metadata || {}
      }),
      
      // Compliance details [MEDIUM+]
      ...(this.config.enableComplianceMode && {
        complianceLevel: this.calculateComplianceLevel(action),
        dataClassification: details.dataClassification || 'internal',
        retentionPeriod: this.getRetentionPeriod(action),
        legalHold: details.legalHold || false
      }),
      
      // Security context [LARGE+]
      ...(this.isLargeCapacity() && {
        securityContext: {
          riskScore: this.calculateRiskScore(action, userId, details),
          threatIndicators: this.detectThreats(action, userId, details),
          contextualFlags: this.getContextualFlags(userId, details)
        }
      })
    };
    
    // Encrypt if required [MEDIUM+]
    if (this.config.enableEncryptedLogs) {
      auditEntry.encrypted = true;
      auditEntry.data = this.encryptLogData(auditEntry);
    }
    
    // Add integrity hash [MEDIUM+]
    if (this.config.enableImmutableLogs) {
      auditEntry.hash = this.calculateLogHash(auditEntry);
      auditEntry.previousHash = this.getLastLogHash();
    }
    
    // Store audit entry
    this.auditLogs.push(auditEntry);
    
    // Check for security events [SMALL+]
    if (this.config.enableSecurityEvents) {
      this.analyzeForSecurityEvents(auditEntry);
    }
    
    // Check compliance triggers [MEDIUM+]
    if (this.config.enableComplianceMode) {
      this.checkComplianceTriggers(auditEntry);
    }
    
    // Real-time alerts [LARGE+]
    if (this.config.enableRealTimeAlerts) {
      this.checkAlertRules(auditEntry);
    }
    
    // Emit event for integrations
    this.emit('actionLogged', auditEntry);
    
    return actionId;
  }

  /**
   * Log security event with threat analysis
   */
  async logSecurityEvent(eventType, severity, details = {}) {
    const timestamp = Date.now();
    const eventId = this.generateEventId();
    
    const securityEvent = {
      id: eventId,
      timestamp,
      type: eventType,
      severity, // low, medium, high, critical
      
      // Basic event data
      source: details.source || 'system',
      userId: details.userId || null,
      ipAddress: details.ipAddress || null,
      
      // Threat analysis [SMALL+]
      ...(this.isSmallCapacity() && {
        threatVector: details.threatVector || null,
        mitigationStatus: 'pending',
        automatedResponse: details.automatedResponse || null
      }),
      
      // Advanced analysis [LARGE+]
      ...(this.isLargeCapacity() && {
        correlationId: this.findCorrelatedEvents(eventType, details),
        forensicData: this.gatherForensicData(details),
        aiAnalysis: this.performAIAnalysis(eventType, details)
      }),
      
      details
    };
    
    this.securityEvents.push(securityEvent);
    
    // Auto-response for critical events [MEDIUM+]
    if (severity === 'critical' && this.isMediumCapacity()) {
      await this.triggerIncidentResponse(securityEvent);
    }
    
    // Emit for real-time monitoring
    this.emit('securityEvent', securityEvent);
    
    return eventId;
  }

  /**
   * Track data changes with before/after states
   */
  async logDataChange(operation, table, recordId, beforeData, afterData, userId) {
    if (!this.config.enableDataChanges) return;
    
    const changeId = this.generateChangeId();
    const timestamp = Date.now();
    
    const dataChange = {
      id: changeId,
      timestamp,
      operation, // CREATE, UPDATE, DELETE
      table,
      recordId,
      userId,
      
      // Change details
      beforeData: beforeData || null,
      afterData: afterData || null,
      changedFields: this.getChangedFields(beforeData, afterData),
      
      // Metadata [SMALL+]
      ...(this.isSmallCapacity() && {
        changeSize: JSON.stringify(afterData || {}).length,
        impactLevel: this.calculateChangeImpact(operation, table, beforeData, afterData),
        approvalRequired: this.checkApprovalRequired(operation, table)
      }),
      
      // Compliance tracking [MEDIUM+]
      ...(this.config.enableComplianceMode && {
        complianceImpact: this.assessComplianceImpact(operation, table, beforeData, afterData),
        dataRetentionImpact: this.assessRetentionImpact(operation, table),
        privacyImpact: this.assessPrivacyImpact(beforeData, afterData)
      })
    };
    
    this.systemChanges.push(dataChange);
    
    // Check for suspicious data patterns [LARGE+]
    if (this.isLargeCapacity()) {
      this.analyzeSuspiciousDataPatterns(dataChange);
    }
    
    this.emit('dataChanged', dataChange);
    
    return changeId;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startDate, endDate, reportType = 'full') {
    if (!this.config.enableComplianceMode) {
      throw new Error('Compliance mode not enabled');
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const relevantLogs = this.auditLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
    
    const report = {
      id: this.generateReportId(),
      generatedAt: Date.now(),
      period: { start: start.toISOString(), end: end.toISOString() },
      type: reportType,
      
      summary: {
        totalActions: relevantLogs.length,
        uniqueUsers: new Set(relevantLogs.map(log => log.userId)).size,
        securityEvents: this.securityEvents.filter(event => {
          const eventDate = new Date(event.timestamp);
          return eventDate >= start && eventDate <= end;
        }).length,
        dataChanges: this.systemChanges.filter(change => {
          const changeDate = new Date(change.timestamp);
          return changeDate >= start && changeDate <= end;
        }).length
      },
      
      // Detailed sections
      userActivity: this.generateUserActivityReport(relevantLogs),
      securitySummary: this.generateSecuritySummary(start, end),
      dataActivity: this.generateDataActivityReport(start, end),
      complianceStatus: this.generateComplianceStatus(relevantLogs),
      
      // Risk assessment [LARGE+]
      ...(this.isLargeCapacity() && {
        riskAssessment: this.generateRiskAssessment(relevantLogs),
        anomalyDetection: this.generateAnomalyReport(relevantLogs),
        recommendations: this.generateComplianceRecommendations(relevantLogs)
      })
    };
    
    // Store report for future reference
    if (this.config.storage === 'database') {
      await this.storeComplianceReport(report);
    }
    
    return report;
  }

  /**
   * Search audit logs with advanced filters
   */
  async searchLogs(filters = {}) {
    let results = [...this.auditLogs];
    
    // Apply filters
    if (filters.userId) {
      results = results.filter(log => log.userId === filters.userId);
    }
    
    if (filters.action) {
      results = results.filter(log => log.action.includes(filters.action));
    }
    
    if (filters.startDate) {
      results = results.filter(log => log.timestamp >= new Date(filters.startDate).getTime());
    }
    
    if (filters.endDate) {
      results = results.filter(log => log.timestamp <= new Date(filters.endDate).getTime());
    }
    
    if (filters.ipAddress) {
      results = results.filter(log => log.ipAddress === filters.ipAddress);
    }
    
    // Advanced filters [MEDIUM+]
    if (this.isMediumCapacity()) {
      if (filters.riskScore) {
        results = results.filter(log => 
          log.securityContext && log.securityContext.riskScore >= filters.riskScore
        );
      }
      
      if (filters.complianceLevel) {
        results = results.filter(log => log.complianceLevel === filters.complianceLevel);
      }
    }
    
    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const start = (page - 1) * limit;
    const paginatedResults = results.slice(start, start + limit);
    
    return {
      logs: paginatedResults,
      total: results.length,
      page,
      limit,
      totalPages: Math.ceil(results.length / limit)
    };
  }

  /**
   * Helper methods for capacity detection
   */
  isSmallCapacity() {
    return ['small', 'medium', 'large', 'enterprise'].includes(this.config.capacity);
  }

  isMediumCapacity() {
    return ['medium', 'large', 'enterprise'].includes(this.config.capacity);
  }

  isLargeCapacity() {
    return ['large', 'enterprise'].includes(this.config.capacity);
  }

  /**
   * Generate unique IDs
   */
  generateActionId() {
    return `action_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  generateEventId() {
    return `event_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  generateChangeId() {
    return `change_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  generateReportId() {
    return `report_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Security analysis methods
   */
  calculateRiskScore(action, userId, details) {
    let score = 0;
    
    // Base risk by action type
    const actionRisks = {
      'user_login': 2,
      'user_logout': 1,
      'data_export': 8,
      'config_change': 7,
      'user_create': 5,
      'user_delete': 9,
      'permission_change': 8
    };
    
    score += actionRisks[action] || 3;
    
    // IP risk factors
    if (details.ipAddress && this.isHighRiskIP(details.ipAddress)) {
      score += 5;
    }
    
    // Time-based risk
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      score += 2; // Off-hours activity
    }
    
    return Math.min(score, 10);
  }

  detectThreats(action, userId, details) {
    const threats = [];
    
    // Detect rapid actions
    const recentActions = this.auditLogs.filter(log => 
      log.userId === userId && 
      (Date.now() - log.timestamp) < 60000 // Last minute
    );
    
    if (recentActions.length > 20) {
      threats.push('RAPID_ACTIONS');
    }
    
    // Detect unusual IP
    if (details.ipAddress && this.isUnusualIP(userId, details.ipAddress)) {
      threats.push('UNUSUAL_IP');
    }
    
    // Detect privilege escalation attempts
    if (action.includes('permission') || action.includes('role')) {
      threats.push('PRIVILEGE_ESCALATION');
    }
    
    return threats;
  }

  analyzeForSecurityEvents(auditEntry) {
    // Check for known attack patterns
    if (auditEntry.action === 'login_failed' && this.getFailedLoginCount(auditEntry.userId) > 5) {
      this.logSecurityEvent('BRUTE_FORCE_ATTEMPT', 'high', {
        userId: auditEntry.userId,
        ipAddress: auditEntry.ipAddress,
        threatVector: 'authentication'
      });
    }
    
    // Check for data exfiltration patterns
    if (auditEntry.action === 'data_export' && auditEntry.afterState && auditEntry.afterState.size > 100000) {
      this.logSecurityEvent('LARGE_DATA_EXPORT', 'medium', {
        userId: auditEntry.userId,
        dataSize: auditEntry.afterState.size,
        threatVector: 'data_exfiltration'
      });
    }
  }

  /**
   * Background tasks
   */
  startLogRotation() {
    setInterval(() => {
      this.rotateOldLogs();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  startIntegrityChecks() {
    if (this.config.enableFileIntegrity) {
      setInterval(() => {
        this.performIntegrityCheck();
      }, 60 * 60 * 1000); // Hourly
    }
  }

  rotateOldLogs() {
    const cutoffDate = Date.now() - (this.config.maxLogRetention * 24 * 60 * 60 * 1000);
    
    const beforeCount = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter(log => log.timestamp > cutoffDate);
    this.securityEvents = this.securityEvents.filter(event => event.timestamp > cutoffDate);
    this.systemChanges = this.systemChanges.filter(change => change.timestamp > cutoffDate);
    
    const removed = beforeCount - this.auditLogs.length;
    if (removed > 0) {
      console.log(`[AuditTrail] Rotated ${removed} old log entries`);
    }
  }

  performIntegrityCheck() {
    // Verify log integrity using hashes
    let integrityOk = true;
    
    for (let i = 1; i < this.auditLogs.length; i++) {
      const currentLog = this.auditLogs[i];
      const previousLog = this.auditLogs[i - 1];
      
      if (currentLog.previousHash !== previousLog.hash) {
        integrityOk = false;
        this.logSecurityEvent('LOG_INTEGRITY_FAILURE', 'critical', {
          logId: currentLog.id,
          expectedHash: previousLog.hash,
          actualHash: currentLog.previousHash
        });
      }
    }
    
    if (integrityOk) {
      console.log('[AuditTrail] Log integrity check passed');
    }
  }

  // Stub methods for full implementation
  calculateComplianceLevel(action) { return 'standard'; }
  getRetentionPeriod(action) { return 2555; } // 7 years in days
  getChangedFields(before, after) { return []; }
  calculateChangeImpact() { return 'low'; }
  checkApprovalRequired() { return false; }
  getContextualFlags() { return []; }
  encryptLogData(entry) { return entry; }
  calculateLogHash(entry) { return crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex'); }
  getLastLogHash() { return this.auditLogs.length > 0 ? this.auditLogs[this.auditLogs.length - 1].hash : null; }
  isHighRiskIP() { return false; }
  isUnusualIP() { return false; }
  getFailedLoginCount() { return 0; }
  initializeComplianceMode() { }
  checkComplianceTriggers() { }
  checkAlertRules() { }
  triggerIncidentResponse() { }
  findCorrelatedEvents() { return null; }
  gatherForensicData() { return {}; }
  performAIAnalysis() { return {}; }
  assessComplianceImpact() { return 'none'; }
  assessRetentionImpact() { return 'none'; }
  assessPrivacyImpact() { return 'none'; }
  analyzeSuspiciousDataPatterns() { }
  generateUserActivityReport() { return {}; }
  generateSecuritySummary() { return {}; }
  generateDataActivityReport() { return {}; }
  generateComplianceStatus() { return {}; }
  generateRiskAssessment() { return {}; }
  generateAnomalyReport() { return {}; }
  generateComplianceRecommendations() { return []; }
  storeComplianceReport() { }
}

module.exports = AuditTrailManager;
/**
 * duFundation v3.1 - Structured Logging System
 * Capacidades: [SMALL+] - Structured logging (JSON format)
 * Features: JSON logs, log levels, correlation IDs, performance tracking
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class StructuredLogger extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      capacity: options.capacity || 'small',
      
      // [SMALL] - Basic structured logging
      level: options.level || 'info',
      format: 'json',
      includeTimestamp: true,
      includeCorrelationId: true,
      
      // [MEDIUM+] - Enhanced logging
      enablePerformanceTracking: options.enablePerformanceTracking || false,
      enableContextualLogging: options.enableContextualLogging || false,
      enableLogAggregation: options.enableLogAggregation || false,
      
      // [LARGE+] - Enterprise features
      enableDistributedTracing: options.enableDistributedTracing || false,
      enableLogAnalytics: options.enableLogAnalytics || false,
      enableAlertingIntegration: options.enableAlertingIntegration || false,
      
      // Output configuration
      outputs: options.outputs || ['console', 'file'],
      logDirectory: options.logDirectory || './logs',
      maxFileSize: options.maxFileSize || 100 * 1024 * 1024, // 100MB
      maxFiles: options.maxFiles || 10,
      
      // Performance
      bufferSize: options.bufferSize || 1000,
      flushInterval: options.flushInterval || 5000, // 5 seconds
      
      // Service information
      serviceName: options.serviceName || 'duFundation',
      serviceVersion: options.serviceVersion || '3.1.0',
      environment: options.environment || 'production'
    };
    
    // Log levels
    this.levels = {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
      fatal: 5
    };
    
    this.currentLevel = this.levels[this.config.level];
    
    // Internal state
    this.logBuffer = [];
    this.correlationContext = new Map(); // requestId -> context
    this.performanceMetrics = new Map(); // operation -> metrics
    this.logStats = {
      total: 0,
      byLevel: {},
      byService: {},
      errors: 0
    };
    
    // Initialize outputs
    this.initializeOutputs();
    
    // Start background processes
    this.startLogFlusher();
    if (this.config.enableLogAggregation) {
      this.startLogAggregation();
    }
  }

  /**
   * Main logging method
   */
  log(level, message, context = {}, metadata = {}) {
    const levelNum = this.levels[level];
    
    if (levelNum < this.currentLevel) {
      return; // Skip logs below current level
    }
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      '@timestamp': timestamp,
      level,
      message,
      
      // Service information
      service: {
        name: this.config.serviceName,
        version: this.config.serviceVersion,
        environment: this.config.environment
      },
      
      // Basic context
      ...context,
      
      // Correlation ID [SMALL+]
      ...(this.config.includeCorrelationId && context.correlationId && {
        correlationId: context.correlationId,
        traceId: context.traceId || context.correlationId
      }),
      
      // Performance data [MEDIUM+]
      ...(this.config.enablePerformanceTracking && context.performance && {
        performance: context.performance
      }),
      
      // Distributed tracing [LARGE+]
      ...(this.config.enableDistributedTracing && this.isLargeCapacity() && {
        trace: {
          spanId: context.spanId || this.generateSpanId(),
          parentSpanId: context.parentSpanId || null,
          baggage: context.baggage || {}
        }
      }),
      
      // Additional metadata
      metadata: {
        ...metadata,
        pid: process.pid,
        hostname: require('os').hostname(),
        memory: this.isMediumCapacity() ? process.memoryUsage() : undefined
      }
    };
    
    // Add to buffer
    this.logBuffer.push(logEntry);
    
    // Update statistics
    this.updateLogStats(level, logEntry);
    
    // Immediate output for high priority logs
    if (level === 'error' || level === 'fatal') {
      this.flushLogs();
    }
    
    // Emit for real-time processing [LARGE+]
    if (this.config.enableLogAnalytics && this.isLargeCapacity()) {
      this.emit('logEntry', logEntry);
    }
    
    // Trigger alerts for critical logs [LARGE+]
    if (this.config.enableAlertingIntegration && (level === 'error' || level === 'fatal')) {
      this.emit('criticalLog', logEntry);
    }
  }

  /**
   * Convenience methods for different log levels
   */
  trace(message, context = {}, metadata = {}) {
    this.log('trace', message, context, metadata);
  }

  debug(message, context = {}, metadata = {}) {
    this.log('debug', message, context, metadata);
  }

  info(message, context = {}, metadata = {}) {
    this.log('info', message, context, metadata);
  }

  warn(message, context = {}, metadata = {}) {
    this.log('warn', message, context, metadata);
  }

  error(message, context = {}, metadata = {}) {
    // Enhanced error logging
    if (context.error && context.error instanceof Error) {
      context.error = {
        name: context.error.name,
        message: context.error.message,
        stack: context.error.stack,
        code: context.error.code || null
      };
    }
    
    this.log('error', message, context, metadata);
  }

  fatal(message, context = {}, metadata = {}) {
    this.log('fatal', message, context, metadata);
    
    // Force immediate flush for fatal logs
    this.flushLogs();
  }

  /**
   * Start performance tracking for an operation
   */
  startPerformanceTracking(operationName, correlationId = null) {
    if (!this.config.enablePerformanceTracking) return null;
    
    const trackingId = this.generateTrackingId();
    const startTime = process.hrtime.bigint();
    
    const tracking = {
      id: trackingId,
      operation: operationName,
      startTime,
      correlationId,
      metadata: {}
    };
    
    this.performanceMetrics.set(trackingId, tracking);
    
    return trackingId;
  }

  /**
   * End performance tracking and log results
   */
  endPerformanceTracking(trackingId, additionalContext = {}) {
    if (!this.config.enablePerformanceTracking) return;
    
    const tracking = this.performanceMetrics.get(trackingId);
    if (!tracking) return;
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - tracking.startTime) / 1000000; // Convert to milliseconds
    
    const performanceData = {
      operation: tracking.operation,
      duration_ms: duration,
      start_time: new Date(Number(tracking.startTime / 1000000n)).toISOString(),
      end_time: new Date().toISOString(),
      ...additionalContext
    };
    
    this.info(`Performance: ${tracking.operation} completed`, {
      correlationId: tracking.correlationId,
      performance: performanceData
    });
    
    this.performanceMetrics.delete(trackingId);
    
    return performanceData;
  }

  /**
   * Create correlation context for request tracking
   */
  createCorrelationContext(requestId, additionalContext = {}) {
    const context = {
      correlationId: requestId,
      traceId: this.generateTraceId(),
      createdAt: Date.now(),
      ...additionalContext
    };
    
    this.correlationContext.set(requestId, context);
    
    return context;
  }

  /**
   * Get correlation context
   */
  getCorrelationContext(requestId) {
    return this.correlationContext.get(requestId);
  }

  /**
   * Clear correlation context
   */
  clearCorrelationContext(requestId) {
    this.correlationContext.delete(requestId);
  }

  /**
   * Log with automatic correlation context
   */
  logWithContext(level, message, requestId, additionalContext = {}, metadata = {}) {
    const correlationContext = this.getCorrelationContext(requestId) || {};
    
    const context = {
      ...correlationContext,
      ...additionalContext
    };
    
    this.log(level, message, context, metadata);
  }

  /**
   * Flush logs to outputs
   */
  flushLogs() {
    if (this.logBuffer.length === 0) return;
    
    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];
    
    // Output to console
    if (this.config.outputs.includes('console')) {
      this.outputToConsole(logsToFlush);
    }
    
    // Output to file
    if (this.config.outputs.includes('file')) {
      this.outputToFile(logsToFlush);
    }
    
    // Output to external systems [MEDIUM+]
    if (this.isMediumCapacity()) {
      if (this.config.outputs.includes('elasticsearch')) {
        this.outputToElasticsearch(logsToFlush);
      }
      
      if (this.config.outputs.includes('syslog')) {
        this.outputToSyslog(logsToFlush);
      }
    }
    
    // Output to cloud services [LARGE+]
    if (this.isLargeCapacity()) {
      if (this.config.outputs.includes('cloudwatch')) {
        this.outputToCloudWatch(logsToFlush);
      }
      
      if (this.config.outputs.includes('datadog')) {
        this.outputToDatadog(logsToFlush);
      }
    }
  }

  /**
   * Output logs to console
   */
  outputToConsole(logs) {
    logs.forEach(log => {
      const output = JSON.stringify(log);
      
      switch (log.level) {
        case 'error':
        case 'fatal':
          console.error(output);
          break;
        case 'warn':
          console.warn(output);
          break;
        default:
          console.log(output);
      }
    });
  }

  /**
   * Output logs to file
   */
  outputToFile(logs) {
    try {
      // Ensure log directory exists
      if (!fs.existsSync(this.config.logDirectory)) {
        fs.mkdirSync(this.config.logDirectory, { recursive: true });
      }
      
      const logFileName = path.join(this.config.logDirectory, `app.${new Date().toISOString().split('T')[0]}.log`);
      
      const logLines = logs.map(log => JSON.stringify(log)).join('\n') + '\n';
      
      fs.appendFileSync(logFileName, logLines);
      
      // Rotate logs if needed
      this.rotateLogsIfNeeded(logFileName);
      
    } catch (error) {
      console.error('Failed to write logs to file:', error);
    }
  }

  /**
   * Rotate log files if they exceed size limit
   */
  rotateLogsIfNeeded(logFileName) {
    try {
      const stats = fs.statSync(logFileName);
      
      if (stats.size > this.config.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFileName = logFileName.replace('.log', `.${timestamp}.log`);
        
        fs.renameSync(logFileName, rotatedFileName);
        
        // Clean up old log files
        this.cleanupOldLogs();
      }
    } catch (error) {
      console.error('Failed to rotate logs:', error);
    }
  }

  /**
   * Clean up old log files
   */
  cleanupOldLogs() {
    try {
      const files = fs.readdirSync(this.config.logDirectory)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.config.logDirectory, file),
          stats: fs.statSync(path.join(this.config.logDirectory, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);
      
      // Keep only the most recent files
      const filesToDelete = files.slice(this.config.maxFiles);
      
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
      });
      
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  /**
   * Get logging statistics
   */
  getLogStats() {
    return {
      ...this.logStats,
      bufferSize: this.logBuffer.length,
      correlationContexts: this.correlationContext.size,
      performanceTracking: this.performanceMetrics.size,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

  /**
   * Initialize output systems
   */
  initializeOutputs() {
    // Ensure log directory exists for file output
    if (this.config.outputs.includes('file')) {
      if (!fs.existsSync(this.config.logDirectory)) {
        fs.mkdirSync(this.config.logDirectory, { recursive: true });
      }
    }
  }

  /**
   * Start automatic log flushing
   */
  startLogFlusher() {
    setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.flushLogs();
      }
    }, this.config.flushInterval);
    
    // Also flush when buffer reaches limit
    if (this.logBuffer.length >= this.config.bufferSize) {
      this.flushLogs();
    }
  }

  /**
   * Start log aggregation process [MEDIUM+]
   */
  startLogAggregation() {
    if (!this.isMediumCapacity()) return;
    
    setInterval(() => {
      this.aggregateLogs();
    }, 60000); // Every minute
  }

  /**
   * Aggregate logs for analytics [MEDIUM+]
   */
  aggregateLogs() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // This would typically aggregate logs from the last minute
    const aggregatedMetrics = {
      timestamp: new Date().toISOString(),
      period: '1m',
      totalLogs: this.logStats.total,
      logsByLevel: { ...this.logStats.byLevel },
      errorRate: this.logStats.errors / this.logStats.total,
      performance: this.getPerformanceAggregates()
    };
    
    this.emit('logAggregation', aggregatedMetrics);
  }

  /**
   * Get performance aggregates
   */
  getPerformanceAggregates() {
    // This would calculate performance statistics
    return {
      operationCount: this.performanceMetrics.size,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      slowQueries: []
    };
  }

  /**
   * Update internal statistics
   */
  updateLogStats(level, logEntry) {
    this.logStats.total++;
    
    if (!this.logStats.byLevel[level]) {
      this.logStats.byLevel[level] = 0;
    }
    this.logStats.byLevel[level]++;
    
    if (level === 'error' || level === 'fatal') {
      this.logStats.errors++;
    }
    
    const serviceName = logEntry.service.name;
    if (!this.logStats.byService[serviceName]) {
      this.logStats.byService[serviceName] = 0;
    }
    this.logStats.byService[serviceName]++;
  }

  /**
   * Helper methods
   */
  generateTrackingId() {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTraceId() {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSpanId() {
    return `span_${Math.random().toString(36).substr(2, 9)}`;
  }

  isMediumCapacity() {
    return ['medium', 'large', 'enterprise'].includes(this.config.capacity);
  }

  isLargeCapacity() {
    return ['large', 'enterprise'].includes(this.config.capacity);
  }

  // Stub methods for external integrations
  outputToElasticsearch(logs) {
    // Elasticsearch integration would be implemented here
    console.log(`[Logger] Would send ${logs.length} logs to Elasticsearch`);
  }

  outputToSyslog(logs) {
    // Syslog integration would be implemented here
    console.log(`[Logger] Would send ${logs.length} logs to Syslog`);
  }

  outputToCloudWatch(logs) {
    // CloudWatch integration would be implemented here
    console.log(`[Logger] Would send ${logs.length} logs to CloudWatch`);
  }

  outputToDatadog(logs) {
    // Datadog integration would be implemented here
    console.log(`[Logger] Would send ${logs.length} logs to Datadog`);
  }
}

module.exports = StructuredLogger;
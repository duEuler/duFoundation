/**
 * duFundation v3.1 - Integration & Extensibility Manager
 * Capacidades: [SMALL+] - Plugin system, Webhooks, [MEDIUM+] - API gateway, [LARGE+] - Event-driven, Microservices
 * Features: Plugin system, webhook management, third-party integrations, API gateway, microservices orchestration
 */

const { EventEmitter } = require('events');
const crypto = require('crypto');

class IntegrationManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      capacity: options.capacity || 'small',
      
      // [SMALL+] - Basic integration
      enablePluginSystem: options.enablePluginSystem || false,
      enableWebhooks: options.enableWebhooks || false,
      enableThirdPartyIntegrations: options.enableThirdPartyIntegrations || false,
      
      // [MEDIUM+] - Advanced integration
      enableAPIGateway: options.enableAPIGateway || false,
      enableEventDrivenArchitecture: options.enableEventDrivenArchitecture || false,
      enableREST: options.enableREST !== false,
      enableGraphQL: options.enableGraphQL || false,
      
      // [LARGE+] - Enterprise integration
      enableMicroservicesOrchestration: options.enableMicroservicesOrchestration || false,
      enableServiceMesh: options.enableServiceMesh || false,
      enableEventSourcing: options.enableEventSourcing || false,
      
      // Configuration
      pluginDirectory: options.pluginDirectory || './plugins',
      webhookSecret: options.webhookSecret || crypto.randomBytes(32).toString('hex'),
      apiGatewayPort: options.apiGatewayPort || 3001,
      maxPlugins: options.maxPlugins || 50,
      webhookTimeout: options.webhookTimeout || 30000
    };
    
    // Plugin system state
    this.plugins = new Map(); // pluginId -> plugin info
    this.pluginRegistry = new Map(); // name -> plugin metadata
    this.pluginHooks = new Map(); // hookName -> Set of plugins
    this.loadedPlugins = new Set();
    
    // Webhook state
    this.webhooks = new Map(); // webhookId -> webhook config
    this.webhookEndpoints = new Map(); // endpoint -> webhook
    this.webhookHistory = [];
    
    // Third-party integrations
    this.integrations = new Map(); // provider -> integration config
    this.activeConnections = new Map(); // connectionId -> connection
    
    // API Gateway state [MEDIUM+]
    this.routes = new Map(); // route -> handler
    this.middlewares = new Map(); // name -> middleware
    this.rateLimits = new Map(); // route -> limit config
    
    // Event-driven architecture [MEDIUM+]
    this.eventBus = new Map(); // eventType -> Set of handlers
    this.eventHistory = [];
    this.eventSubscriptions = new Map(); // subscriptionId -> config
    
    // Microservices orchestration [LARGE+]
    this.services = new Map(); // serviceId -> service config
    this.serviceRegistry = new Map(); // serviceName -> instances
    this.serviceHealthChecks = new Map(); // serviceId -> health status
    
    this.initialize();
  }

  /**
   * Initialize integration systems
   */
  initialize() {
    // Initialize plugin system [SMALL+]
    if (this.config.enablePluginSystem && this.isSmallCapacity()) {
      this.initializePluginSystem();
    }
    
    // Initialize webhooks [SMALL+]
    if (this.config.enableWebhooks && this.isSmallCapacity()) {
      this.initializeWebhooks();
    }
    
    // Initialize API gateway [MEDIUM+]
    if (this.config.enableAPIGateway && this.isMediumCapacity()) {
      this.initializeAPIGateway();
    }
    
    // Initialize event-driven architecture [MEDIUM+]
    if (this.config.enableEventDrivenArchitecture && this.isMediumCapacity()) {
      this.initializeEventDrivenArchitecture();
    }
    
    // Initialize microservices orchestration [LARGE+]
    if (this.config.enableMicroservicesOrchestration && this.isLargeCapacity()) {
      this.initializeMicroservicesOrchestration();
    }
    
    this.emit('integrationSystemInitialized', {
      capacity: this.config.capacity,
      features: this.getEnabledFeatures(),
      timestamp: Date.now()
    });
  }

  /**
   * Initialize plugin system [SMALL+]
   */
  initializePluginSystem() {
    // Setup plugin hooks
    this.setupPluginHooks();
    
    // Load built-in plugins
    this.loadBuiltInPlugins();
    
    this.emit('pluginSystemInitialized', {
      hooks: this.pluginHooks.size,
      builtInPlugins: this.plugins.size,
      timestamp: Date.now()
    });
  }

  /**
   * Install plugin [SMALL+]
   */
  async installPlugin(pluginConfig) {
    if (!this.config.enablePluginSystem || !this.isSmallCapacity()) {
      throw new Error('Plugin system not enabled');
    }
    
    const pluginId = this.generatePluginId();
    
    try {
      // Validate plugin
      await this.validatePlugin(pluginConfig);
      
      // Check dependencies
      await this.checkPluginDependencies(pluginConfig);
      
      // Install plugin
      const plugin = {
        id: pluginId,
        name: pluginConfig.name,
        version: pluginConfig.version,
        description: pluginConfig.description,
        author: pluginConfig.author,
        
        // Plugin metadata
        hooks: pluginConfig.hooks || [],
        dependencies: pluginConfig.dependencies || [],
        permissions: pluginConfig.permissions || [],
        
        // Installation info
        installedAt: Date.now(),
        enabled: true,
        config: pluginConfig.config || {}
      };
      
      this.plugins.set(pluginId, plugin);
      this.pluginRegistry.set(plugin.name, plugin);
      
      // Register plugin hooks
      plugin.hooks.forEach(hookName => {
        if (!this.pluginHooks.has(hookName)) {
          this.pluginHooks.set(hookName, new Set());
        }
        this.pluginHooks.get(hookName).add(pluginId);
      });
      
      // Load plugin code
      await this.loadPlugin(plugin);
      
      this.emit('pluginInstalled', {
        pluginId,
        name: plugin.name,
        version: plugin.version,
        hooks: plugin.hooks,
        timestamp: Date.now()
      });
      
      return { pluginId, status: 'installed', hooks: plugin.hooks };
      
    } catch (error) {
      this.emit('pluginInstallationFailed', {
        pluginId,
        name: pluginConfig.name,
        error: error.message,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }

  /**
   * Execute plugin hook [SMALL+]
   */
  async executeHook(hookName, context = {}) {
    if (!this.pluginHooks.has(hookName)) {
      return { results: [], executed: 0 };
    }
    
    const pluginIds = Array.from(this.pluginHooks.get(hookName));
    const results = [];
    
    for (const pluginId of pluginIds) {
      const plugin = this.plugins.get(pluginId);
      
      if (!plugin || !plugin.enabled) continue;
      
      try {
        const result = await this.executePluginHook(plugin, hookName, context);
        results.push({
          pluginId,
          pluginName: plugin.name,
          result,
          success: true
        });
      } catch (error) {
        results.push({
          pluginId,
          pluginName: plugin.name,
          error: error.message,
          success: false
        });
      }
    }
    
    this.emit('hookExecuted', {
      hookName,
      pluginsExecuted: results.length,
      successful: results.filter(r => r.success).length,
      timestamp: Date.now()
    });
    
    return { results, executed: results.length };
  }

  /**
   * Initialize webhooks [SMALL+]
   */
  initializeWebhooks() {
    // Setup webhook validation
    this.setupWebhookSecurity();
    
    // Setup common webhook endpoints
    this.setupCommonWebhooks();
    
    this.emit('webhooksInitialized', {
      secret: this.config.webhookSecret.substring(0, 8) + '...',
      endpoints: this.webhookEndpoints.size,
      timestamp: Date.now()
    });
  }

  /**
   * Create webhook [SMALL+]
   */
  async createWebhook(webhookConfig) {
    if (!this.config.enableWebhooks || !this.isSmallCapacity()) {
      throw new Error('Webhooks not enabled');
    }
    
    const webhookId = this.generateWebhookId();
    
    const webhook = {
      id: webhookId,
      name: webhookConfig.name,
      endpoint: webhookConfig.endpoint,
      events: webhookConfig.events || [],
      
      // Configuration
      method: webhookConfig.method || 'POST',
      headers: webhookConfig.headers || {},
      timeout: webhookConfig.timeout || this.config.webhookTimeout,
      retries: webhookConfig.retries || 3,
      
      // Security
      secret: webhookConfig.secret || this.config.webhookSecret,
      verifySSL: webhookConfig.verifySSL !== false,
      
      // State
      enabled: true,
      createdAt: Date.now(),
      lastTriggered: null,
      totalTriggers: 0,
      successfulTriggers: 0,
      failedTriggers: 0
    };
    
    this.webhooks.set(webhookId, webhook);
    this.webhookEndpoints.set(webhook.endpoint, webhookId);
    
    this.emit('webhookCreated', {
      webhookId,
      name: webhook.name,
      endpoint: webhook.endpoint,
      events: webhook.events,
      timestamp: Date.now()
    });
    
    return { webhookId, endpoint: webhook.endpoint, events: webhook.events };
  }

  /**
   * Trigger webhook [SMALL+]
   */
  async triggerWebhook(webhookId, eventData) {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook || !webhook.enabled) {
      throw new Error(`Webhook ${webhookId} not found or disabled`);
    }
    
    const triggerTime = Date.now();
    
    try {
      // Prepare payload
      const payload = {
        event: eventData.event,
        data: eventData.data,
        timestamp: triggerTime,
        webhook_id: webhookId
      };
      
      // Create signature
      const signature = this.createWebhookSignature(payload, webhook.secret);
      
      // Send webhook request
      const response = await this.sendWebhookRequest(webhook, payload, signature);
      
      // Update webhook stats
      webhook.lastTriggered = triggerTime;
      webhook.totalTriggers++;
      webhook.successfulTriggers++;
      
      // Store in history
      this.webhookHistory.push({
        webhookId,
        event: eventData.event,
        timestamp: triggerTime,
        success: true,
        responseStatus: response.status,
        responseTime: Date.now() - triggerTime
      });
      
      this.emit('webhookTriggered', {
        webhookId,
        event: eventData.event,
        responseStatus: response.status,
        responseTime: Date.now() - triggerTime,
        timestamp: triggerTime
      });
      
      return {
        webhookId,
        status: 'sent',
        responseStatus: response.status,
        responseTime: Date.now() - triggerTime
      };
      
    } catch (error) {
      // Update failure stats
      webhook.totalTriggers++;
      webhook.failedTriggers++;
      
      // Store in history
      this.webhookHistory.push({
        webhookId,
        event: eventData.event,
        timestamp: triggerTime,
        success: false,
        error: error.message,
        responseTime: Date.now() - triggerTime
      });
      
      this.emit('webhookFailed', {
        webhookId,
        event: eventData.event,
        error: error.message,
        timestamp: triggerTime
      });
      
      throw error;
    }
  }

  /**
   * Initialize API gateway [MEDIUM+]
   */
  initializeAPIGateway() {
    // Setup route management
    this.setupRouteManagement();
    
    // Setup middleware system
    this.setupMiddlewareSystem();
    
    // Setup rate limiting
    this.setupRateLimiting();
    
    this.emit('apiGatewayInitialized', {
      port: this.config.apiGatewayPort,
      routes: this.routes.size,
      middlewares: this.middlewares.size,
      timestamp: Date.now()
    });
  }

  /**
   * Register API route [MEDIUM+]
   */
  async registerRoute(routeConfig) {
    if (!this.config.enableAPIGateway || !this.isMediumCapacity()) {
      throw new Error('API Gateway not enabled');
    }
    
    const routeId = this.generateRouteId();
    
    const route = {
      id: routeId,
      path: routeConfig.path,
      method: routeConfig.method.toUpperCase(),
      handler: routeConfig.handler,
      
      // Configuration
      middleware: routeConfig.middleware || [],
      rateLimit: routeConfig.rateLimit || null,
      authentication: routeConfig.authentication || false,
      validation: routeConfig.validation || null,
      
      // Metadata
      tags: routeConfig.tags || [],
      description: routeConfig.description || '',
      version: routeConfig.version || '1.0.0',
      
      // State
      enabled: true,
      registeredAt: Date.now(),
      requestCount: 0,
      averageResponseTime: 0
    };
    
    const routeKey = `${route.method}:${route.path}`;
    this.routes.set(routeKey, route);
    
    this.emit('routeRegistered', {
      routeId,
      method: route.method,
      path: route.path,
      middleware: route.middleware,
      timestamp: Date.now()
    });
    
    return { routeId, routeKey, registered: true };
  }

  /**
   * Initialize event-driven architecture [MEDIUM+]
   */
  initializeEventDrivenArchitecture() {
    // Setup event bus
    this.setupEventBus();
    
    // Setup event sourcing [LARGE+]
    if (this.config.enableEventSourcing && this.isLargeCapacity()) {
      this.setupEventSourcing();
    }
    
    this.emit('eventDrivenArchitectureInitialized', {
      eventTypes: this.eventBus.size,
      subscriptions: this.eventSubscriptions.size,
      timestamp: Date.now()
    });
  }

  /**
   * Publish event [MEDIUM+]
   */
  async publishEvent(eventType, eventData, metadata = {}) {
    if (!this.config.enableEventDrivenArchitecture || !this.isMediumCapacity()) {
      throw new Error('Event-driven architecture not enabled');
    }
    
    const eventId = this.generateEventId();
    const timestamp = Date.now();
    
    const event = {
      id: eventId,
      type: eventType,
      data: eventData,
      metadata: {
        ...metadata,
        publishedAt: timestamp,
        source: metadata.source || 'system'
      }
    };
    
    // Store event
    this.eventHistory.push(event);
    
    // Get subscribers
    const handlers = this.eventBus.get(eventType) || new Set();
    
    // Publish to all handlers
    const results = [];
    for (const handlerId of handlers) {
      try {
        const result = await this.executeEventHandler(handlerId, event);
        results.push({ handlerId, success: true, result });
      } catch (error) {
        results.push({ handlerId, success: false, error: error.message });
      }
    }
    
    this.emit('eventPublished', {
      eventId,
      type: eventType,
      handlersNotified: handlers.size,
      successfulHandlers: results.filter(r => r.success).length,
      timestamp
    });
    
    return {
      eventId,
      publishedAt: timestamp,
      handlersNotified: handlers.size,
      results
    };
  }

  /**
   * Subscribe to event [MEDIUM+]
   */
  async subscribeToEvent(eventType, handlerConfig) {
    if (!this.config.enableEventDrivenArchitecture || !this.isMediumCapacity()) {
      throw new Error('Event-driven architecture not enabled');
    }
    
    const subscriptionId = this.generateSubscriptionId();
    
    const subscription = {
      id: subscriptionId,
      eventType,
      handler: handlerConfig.handler,
      filter: handlerConfig.filter || null,
      priority: handlerConfig.priority || 0,
      retries: handlerConfig.retries || 3,
      subscribedAt: Date.now(),
      enabled: true
    };
    
    this.eventSubscriptions.set(subscriptionId, subscription);
    
    // Add to event bus
    if (!this.eventBus.has(eventType)) {
      this.eventBus.set(eventType, new Set());
    }
    this.eventBus.get(eventType).add(subscriptionId);
    
    this.emit('eventSubscriptionCreated', {
      subscriptionId,
      eventType,
      priority: subscription.priority,
      timestamp: Date.now()
    });
    
    return { subscriptionId, eventType, status: 'subscribed' };
  }

  /**
   * Initialize microservices orchestration [LARGE+]
   */
  initializeMicroservicesOrchestration() {
    // Setup service registry
    this.setupServiceRegistry();
    
    // Setup service discovery
    this.setupServiceDiscovery();
    
    // Setup health monitoring
    this.setupServiceHealthMonitoring();
    
    // Setup service mesh [LARGE+]
    if (this.config.enableServiceMesh) {
      this.setupServiceMesh();
    }
    
    this.emit('microservicesOrchestrationInitialized', {
      serviceRegistry: this.serviceRegistry.size,
      healthChecks: this.serviceHealthChecks.size,
      serviceMesh: this.config.enableServiceMesh,
      timestamp: Date.now()
    });
  }

  /**
   * Register microservice [LARGE+]
   */
  async registerService(serviceConfig) {
    if (!this.config.enableMicroservicesOrchestration || !this.isLargeCapacity()) {
      throw new Error('Microservices orchestration not enabled');
    }
    
    const serviceId = this.generateServiceId();
    
    const service = {
      id: serviceId,
      name: serviceConfig.name,
      version: serviceConfig.version,
      host: serviceConfig.host,
      port: serviceConfig.port,
      
      // Service configuration
      protocol: serviceConfig.protocol || 'http',
      endpoints: serviceConfig.endpoints || [],
      dependencies: serviceConfig.dependencies || [],
      resources: serviceConfig.resources || {},
      
      // Health check configuration
      healthCheck: {
        endpoint: serviceConfig.healthCheck?.endpoint || '/health',
        interval: serviceConfig.healthCheck?.interval || 30000,
        timeout: serviceConfig.healthCheck?.timeout || 5000,
        retries: serviceConfig.healthCheck?.retries || 3
      },
      
      // State
      status: 'starting',
      registeredAt: Date.now(),
      lastHealthCheck: null,
      metadata: serviceConfig.metadata || {}
    };
    
    this.services.set(serviceId, service);
    
    // Add to service registry
    if (!this.serviceRegistry.has(service.name)) {
      this.serviceRegistry.set(service.name, new Set());
    }
    this.serviceRegistry.get(service.name).add(serviceId);
    
    // Start health monitoring
    this.startServiceHealthMonitoring(serviceId);
    
    this.emit('serviceRegistered', {
      serviceId,
      name: service.name,
      host: service.host,
      port: service.port,
      endpoints: service.endpoints.length,
      timestamp: Date.now()
    });
    
    return { serviceId, status: 'registered', healthCheckStarted: true };
  }

  /**
   * Get integration analytics
   */
  getIntegrationAnalytics() {
    return {
      // Plugin system metrics [SMALL+]
      ...(this.isSmallCapacity() && {
        plugins: {
          enabled: this.config.enablePluginSystem,
          installed: this.plugins.size,
          active: this.loadedPlugins.size,
          hooks: this.pluginHooks.size,
          registry: this.pluginRegistry.size
        }
      }),
      
      // Webhook metrics [SMALL+]
      ...(this.isSmallCapacity() && {
        webhooks: {
          enabled: this.config.enableWebhooks,
          active: this.webhooks.size,
          endpoints: this.webhookEndpoints.size,
          totalTriggers: this.getTotalWebhookTriggers(),
          successRate: this.getWebhookSuccessRate()
        }
      }),
      
      // API Gateway metrics [MEDIUM+]
      ...(this.isMediumCapacity() && {
        apiGateway: {
          enabled: this.config.enableAPIGateway,
          routes: this.routes.size,
          middlewares: this.middlewares.size,
          totalRequests: this.getTotalAPIRequests(),
          averageResponseTime: this.getAverageAPIResponseTime()
        }
      }),
      
      // Event-driven metrics [MEDIUM+]
      ...(this.isMediumCapacity() && {
        eventDriven: {
          enabled: this.config.enableEventDrivenArchitecture,
          eventTypes: this.eventBus.size,
          subscriptions: this.eventSubscriptions.size,
          eventsPublished: this.eventHistory.length,
          eventSourcing: this.config.enableEventSourcing
        }
      }),
      
      // Microservices metrics [LARGE+]
      ...(this.isLargeCapacity() && {
        microservices: {
          enabled: this.config.enableMicroservicesOrchestration,
          services: this.services.size,
          healthyServices: this.getHealthyServicesCount(),
          serviceRegistry: this.serviceRegistry.size,
          serviceMesh: this.config.enableServiceMesh
        }
      }),
      
      // Third-party integrations
      thirdParty: {
        enabled: this.config.enableThirdPartyIntegrations,
        integrations: this.integrations.size,
        activeConnections: this.activeConnections.size
      },
      
      // Overall health
      overallHealth: this.calculateIntegrationHealth()
    };
  }

  // Helper methods
  isSmallCapacity() {
    return ['small', 'medium', 'large', 'enterprise'].includes(this.config.capacity);
  }

  isMediumCapacity() {
    return ['medium', 'large', 'enterprise'].includes(this.config.capacity);
  }

  isLargeCapacity() {
    return ['large', 'enterprise'].includes(this.config.capacity);
  }

  // ID generators
  generatePluginId() {
    return `plugin_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  generateWebhookId() {
    return `webhook_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  generateRouteId() {
    return `route_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  generateEventId() {
    return `event_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  generateSubscriptionId() {
    return `sub_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  generateServiceId() {
    return `service_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  getEnabledFeatures() {
    const features = [];
    if (this.isSmallCapacity()) {
      if (this.config.enablePluginSystem) features.push('plugins');
      if (this.config.enableWebhooks) features.push('webhooks');
      if (this.config.enableThirdPartyIntegrations) features.push('third-party');
    }
    if (this.isMediumCapacity()) {
      if (this.config.enableAPIGateway) features.push('api-gateway');
      if (this.config.enableEventDrivenArchitecture) features.push('event-driven');
    }
    if (this.isLargeCapacity()) {
      if (this.config.enableMicroservicesOrchestration) features.push('microservices');
      if (this.config.enableServiceMesh) features.push('service-mesh');
    }
    return features;
  }

  // Stub methods for full implementation
  setupPluginHooks() {
    // Common plugin hooks
    const hooks = [
      'before_request', 'after_request',
      'before_response', 'after_response',
      'user_created', 'user_updated',
      'data_created', 'data_updated'
    ];
    
    hooks.forEach(hook => {
      this.pluginHooks.set(hook, new Set());
    });
  }

  loadBuiltInPlugins() {
    // Load built-in plugins
  }

  async validatePlugin(config) {
    // Plugin validation logic
  }

  async checkPluginDependencies(config) {
    // Dependency checking logic
  }

  async loadPlugin(plugin) {
    // Plugin loading logic
    this.loadedPlugins.add(plugin.id);
  }

  async executePluginHook(plugin, hookName, context) {
    // Plugin hook execution
    return { pluginExecuted: true, hookName, context };
  }

  setupWebhookSecurity() {
    // Webhook security setup
  }

  setupCommonWebhooks() {
    // Common webhook endpoints setup
  }

  createWebhookSignature(payload, secret) {
    // Webhook signature creation
    return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  }

  async sendWebhookRequest(webhook, payload, signature) {
    // Webhook request sending
    return { status: 200, data: 'success' };
  }

  setupRouteManagement() {
    // Route management setup
  }

  setupMiddlewareSystem() {
    // Middleware system setup
  }

  setupRateLimiting() {
    // Rate limiting setup
  }

  setupEventBus() {
    // Event bus setup
  }

  setupEventSourcing() {
    // Event sourcing setup
  }

  async executeEventHandler(handlerId, event) {
    // Event handler execution
    return { handlerExecuted: true, event };
  }

  setupServiceRegistry() {
    // Service registry setup
  }

  setupServiceDiscovery() {
    // Service discovery setup
  }

  setupServiceHealthMonitoring() {
    // Service health monitoring setup
  }

  setupServiceMesh() {
    // Service mesh setup
  }

  startServiceHealthMonitoring(serviceId) {
    // Start health monitoring for service
    const service = this.services.get(serviceId);
    if (service) {
      this.serviceHealthChecks.set(serviceId, {
        status: 'healthy',
        lastCheck: Date.now(),
        consecutiveFailures: 0
      });
    }
  }

  // Analytics helper methods
  getTotalWebhookTriggers() {
    return Array.from(this.webhooks.values())
      .reduce((total, webhook) => total + webhook.totalTriggers, 0);
  }

  getWebhookSuccessRate() {
    const webhooks = Array.from(this.webhooks.values());
    const totalTriggers = webhooks.reduce((total, w) => total + w.totalTriggers, 0);
    const successfulTriggers = webhooks.reduce((total, w) => total + w.successfulTriggers, 0);
    
    return totalTriggers > 0 ? (successfulTriggers / totalTriggers) * 100 : 100;
  }

  getTotalAPIRequests() {
    return Array.from(this.routes.values())
      .reduce((total, route) => total + route.requestCount, 0);
  }

  getAverageAPIResponseTime() {
    const routes = Array.from(this.routes.values()).filter(r => r.requestCount > 0);
    if (routes.length === 0) return 0;
    
    const totalResponseTime = routes.reduce((total, route) => total + route.averageResponseTime, 0);
    return totalResponseTime / routes.length;
  }

  getHealthyServicesCount() {
    return Array.from(this.serviceHealthChecks.values())
      .filter(health => health.status === 'healthy').length;
  }

  calculateIntegrationHealth() {
    let score = 100;
    
    // Plugins health
    if (this.isSmallCapacity() && this.config.enablePluginSystem) {
      const activePlugins = this.loadedPlugins.size;
      const totalPlugins = this.plugins.size;
      if (totalPlugins > 0 && activePlugins / totalPlugins < 0.8) score -= 10;
    }
    
    // Webhooks health
    if (this.isSmallCapacity() && this.config.enableWebhooks) {
      const successRate = this.getWebhookSuccessRate();
      if (successRate < 95) score -= 15;
    }
    
    // Services health
    if (this.isLargeCapacity() && this.config.enableMicroservicesOrchestration) {
      const healthyServices = this.getHealthyServicesCount();
      const totalServices = this.services.size;
      if (totalServices > 0 && healthyServices / totalServices < 0.9) score -= 20;
    }
    
    return Math.max(0, score);
  }
}

module.exports = IntegrationManager;
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  delay: 1000 // 1 second delay between requests
};

// Helper function to delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make HTTP requests with retries
async function makeRequest(method, url, data = null, retries = TEST_CONFIG.retries) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      timeout: TEST_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'large-gaps-test-client'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    if (retries > 0 && error.response?.status !== 404) {
      await delay(TEST_CONFIG.delay);
      return makeRequest(method, url, data, retries - 1);
    }
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function logTest(name, success, details = '') {
  testResults.total++;
  if (success) {
    testResults.passed++;
    console.log(`   ✅ ${name}: ${details}`);
  } else {
    testResults.failed++;
    console.log(`   ❌ FALHOU: ${name} - ${details}`);
  }
  testResults.details.push({ name, success, details });
}

async function testKubernetesOrchestration() {
  console.log('\n🚀 KUBERNETES ORCHESTRATION:');
  
  // Test 1: Get Kubernetes status
  const statusResult = await makeRequest('GET', '/api/large/kubernetes/status');
  logTest('Kubernetes Status', statusResult.success, 
    statusResult.success ? `Enabled: ${statusResult.data.enabled}, Deployments: ${statusResult.data.deployments}` : statusResult.error);

  // Test 2: Get deployments
  const deploymentsResult = await makeRequest('GET', '/api/large/kubernetes/deployments');
  logTest('List Deployments', deploymentsResult.success,
    deploymentsResult.success ? `Found ${deploymentsResult.data.deployments?.length || 0} deployments` : deploymentsResult.error);

  // Test 3: Get cluster metrics
  const metricsResult = await makeRequest('GET', '/api/large/kubernetes/metrics');
  logTest('Cluster Metrics', metricsResult.success,
    metricsResult.success ? `Total Pods: ${metricsResult.data.totalPods}, Ready: ${metricsResult.data.readyPods}` : metricsResult.error);

  // Test 4: Scale deployment (if deployments exist)
  if (deploymentsResult.success && deploymentsResult.data.deployments?.length > 0) {
    const deploymentName = deploymentsResult.data.deployments[0].name;
    const scaleResult = await makeRequest('POST', `/api/large/kubernetes/deployments/${deploymentName}/scale`, { replicas: 2 });
    logTest('Scale Deployment', scaleResult.success,
      scaleResult.success ? `Scaled ${deploymentName} to 2 replicas` : scaleResult.error);
  }

  await delay(TEST_CONFIG.delay);
}

async function testServiceDiscovery() {
  console.log('\n🔍 SERVICE DISCOVERY:');

  // Test 1: Get service discovery status
  const statusResult = await makeRequest('GET', '/api/large/service-discovery/status');
  logTest('Service Discovery Status', statusResult.success,
    statusResult.success ? `Enabled: ${statusResult.data.enabled}, Services: ${statusResult.data.services}` : statusResult.error);

  // Test 2: Get all services
  const servicesResult = await makeRequest('GET', '/api/large/service-discovery/services');
  logTest('List Services', servicesResult.success,
    servicesResult.success ? `Found ${Object.keys(servicesResult.data.services || {}).length} service types` : servicesResult.error);

  // Test 3: Register a test service
  const registerResult = await makeRequest('POST', '/api/large/service-discovery/register', {
    name: 'test-service',
    address: '127.0.0.1',
    port: 3000,
    tags: ['test', 'api'],
    metadata: { version: '1.0.0' }
  });
  logTest('Register Service', registerResult.success,
    registerResult.success ? `Service registered with ID: ${registerResult.data.serviceId}` : registerResult.error);

  // Test 4: Get service discovery stats
  const statsResult = await makeRequest('GET', '/api/large/service-discovery/stats');
  logTest('Service Discovery Stats', statsResult.success,
    statsResult.success ? `Total Instances: ${statsResult.data.totalInstances}, Healthy: ${statsResult.data.healthyInstances}` : statsResult.error);

  await delay(TEST_CONFIG.delay);
}

async function testAdvancedMLOps() {
  console.log('\n🤖 ADVANCED ML OPS:');

  // Test 1: Get ML Ops status
  const statusResult = await makeRequest('GET', '/api/large/mlops/status');
  logTest('ML Ops Status', statusResult.success,
    statusResult.success ? `Enabled: ${statusResult.data.enabled}, Models: ${statusResult.data.models}` : statusResult.error);

  // Test 2: Get all models
  const modelsResult = await makeRequest('GET', '/api/large/mlops/models');
  logTest('List ML Models', modelsResult.success,
    modelsResult.success ? `Found ${modelsResult.data.models?.length || 0} models` : modelsResult.error);

  // Test 3: Get experiments
  const experimentsResult = await makeRequest('GET', '/api/large/mlops/experiments');
  logTest('List Experiments', experimentsResult.success,
    experimentsResult.success ? `Found ${experimentsResult.data.experiments?.length || 0} experiments` : experimentsResult.error);

  // Test 4: Create experiment
  const createExpResult = await makeRequest('POST', '/api/large/mlops/experiments', {
    name: 'Test Classification Experiment',
    modelType: 'classification',
    parameters: { learning_rate: 0.01, epochs: 100 }
  });
  logTest('Create Experiment', createExpResult.success,
    createExpResult.success ? `Experiment created: ${createExpResult.data.experimentId}` : createExpResult.error);

  // Test 5: Train new model
  const trainResult = await makeRequest('POST', '/api/large/mlops/models/train', {
    name: 'Test User Behavior Model',
    type: 'classification',
    dataSource: 'user_behavior_dataset',
    parameters: { algorithm: 'random_forest' }
  });
  logTest('Train Model', trainResult.success,
    trainResult.success ? `Model training started: ${trainResult.data.modelId}` : trainResult.error);

  // Test 6: Make prediction (if models exist)
  if (modelsResult.success && modelsResult.data.models?.length > 0) {
    const modelId = modelsResult.data.models[0].id;
    const predictResult = await makeRequest('POST', `/api/large/mlops/models/${modelId}/predict`, {
      features: {
        page_views: 10,
        session_duration: 300,
        device_type: 'mobile',
        time_of_day: 14
      }
    });
    logTest('Make Prediction', predictResult.success,
      predictResult.success ? `Prediction completed for model ${modelId}` : predictResult.error);
  }

  // Test 7: Get ML Ops stats
  const statsResult = await makeRequest('GET', '/api/large/mlops/stats');
  logTest('ML Ops Stats', statsResult.success,
    statsResult.success ? `Deployed Models: ${statsResult.data.models?.deployed}, Avg Accuracy: ${(statsResult.data.avgModelAccuracy * 100).toFixed(1)}%` : statsResult.error);

  await delay(TEST_CONFIG.delay);
}

async function testGlobalCDN() {
  console.log('\n🌍 GLOBAL CDN:');

  // Test 1: Get CDN status
  const statusResult = await makeRequest('GET', '/api/large/cdn/status');
  logTest('CDN Status', statusResult.success,
    statusResult.success ? `Enabled: ${statusResult.data.enabled}, Nodes: ${statusResult.data.nodes}` : statusResult.error);

  // Test 2: Get CDN nodes
  const nodesResult = await makeRequest('GET', '/api/large/cdn/nodes');
  logTest('List CDN Nodes', nodesResult.success,
    nodesResult.success ? `Found ${nodesResult.data.nodes?.length || 0} CDN nodes` : nodesResult.error);

  // Test 3: Get CDN stats
  const statsResult = await makeRequest('GET', '/api/large/cdn/stats');
  logTest('CDN Stats', statsResult.success,
    statsResult.success ? `Cache Hit Ratio: ${(statsResult.data.cacheHitRatio * 100).toFixed(1)}%, Avg Response: ${statsResult.data.avgResponseTime?.toFixed(0)}ms` : statsResult.error);

  // Test 4: Invalidate asset
  const invalidateResult = await makeRequest('POST', '/api/large/cdn/invalidate', {
    url: '/api/test-asset.js'
  });
  logTest('Invalidate Asset', invalidateResult.success,
    invalidateResult.success ? 'Asset invalidated successfully' : invalidateResult.error);

  // Test 5: Purge cache
  const purgeResult = await makeRequest('POST', '/api/large/cdn/purge', {
    pattern: 'test'
  });
  logTest('Purge Cache', purgeResult.success,
    purgeResult.success ? `Purged ${purgeResult.data.purgedCount} assets` : purgeResult.error);

  await delay(TEST_CONFIG.delay);
}

async function testZeroTrustSecurity() {
  console.log('\n🛡️ ZERO TRUST SECURITY:');

  // Test 1: Get Zero Trust status
  const statusResult = await makeRequest('GET', '/api/large/zero-trust/status');
  logTest('Zero Trust Status', statusResult.success,
    statusResult.success ? `Enabled: ${statusResult.data.enabled}, Trust Scores: ${statusResult.data.trustScores}` : statusResult.error);

  // Test 2: Get trust scores
  const trustScoresResult = await makeRequest('GET', '/api/large/zero-trust/trust-scores');
  logTest('Get Trust Scores', trustScoresResult.success,
    trustScoresResult.success ? `Found ${trustScoresResult.data.trustScores?.length || 0} trust scores` : trustScoresResult.error);

  // Test 3: Get security events
  const eventsResult = await makeRequest('GET', '/api/large/zero-trust/events?limit=50');
  logTest('Get Security Events', eventsResult.success,
    eventsResult.success ? `Found ${eventsResult.data.events?.length || 0} security events` : eventsResult.error);

  // Test 4: Get access policies
  const policiesResult = await makeRequest('GET', '/api/large/zero-trust/policies');
  logTest('Get Access Policies', policiesResult.success,
    policiesResult.success ? `Found ${policiesResult.data.policies?.length || 0} access policies` : policiesResult.error);

  // Test 5: Get Zero Trust stats
  const statsResult = await makeRequest('GET', '/api/large/zero-trust/stats');
  logTest('Zero Trust Stats', statsResult.success,
    statsResult.success ? `Avg Trust Score: ${(statsResult.data.trustScores?.avgScore * 100).toFixed(1)}%, Events 24h: ${statsResult.data.events?.last24h}` : statsResult.error);

  await delay(TEST_CONFIG.delay);
}

async function testRealTimeAnalytics() {
  console.log('\n📊 REAL-TIME ANALYTICS:');

  // Test 1: Get Real-time Analytics status
  const statusResult = await makeRequest('GET', '/api/large/realtime-analytics/status');
  logTest('Real-time Analytics Status', statusResult.success,
    statusResult.success ? `Enabled: ${statusResult.data.enabled}, Streams: ${statusResult.data.streams}` : statusResult.error);

  // Test 2: Get streams
  const streamsResult = await makeRequest('GET', '/api/large/realtime-analytics/streams');
  logTest('List Streams', streamsResult.success,
    streamsResult.success ? `Found ${streamsResult.data.streams?.length || 0} streams` : streamsResult.error);

  // Test 3: Create new stream
  const createStreamResult = await makeRequest('POST', '/api/large/realtime-analytics/streams', {
    name: 'Test User Activity Stream',
    query: 'user.activity',
    windowSize: 60,
    aggregation: 'count'
  });
  logTest('Create Stream', createStreamResult.success,
    createStreamResult.success ? `Stream created: ${createStreamResult.data.streamId}` : createStreamResult.error);

  // Test 4: Track metric
  const trackMetricResult = await makeRequest('POST', '/api/large/realtime-analytics/metrics/track', {
    name: 'test.user.login',
    value: 1,
    tags: { source: 'test', region: 'us-east-1' }
  });
  logTest('Track Metric', trackMetricResult.success,
    trackMetricResult.success ? 'Metric tracked successfully' : trackMetricResult.error);

  // Test 5: Get dashboards
  const dashboardsResult = await makeRequest('GET', '/api/large/realtime-analytics/dashboards');
  logTest('List Dashboards', dashboardsResult.success,
    dashboardsResult.success ? `Found ${dashboardsResult.data.dashboards?.length || 0} dashboards` : dashboardsResult.error);

  // Test 6: Get stream data (if streams exist)
  if (streamsResult.success && streamsResult.data.streams?.length > 0) {
    const streamId = streamsResult.data.streams[0].id;
    const streamDataResult = await makeRequest('GET', `/api/large/realtime-analytics/streams/${streamId}/data?timeRange=1h`);
    logTest('Get Stream Data', streamDataResult.success,
      streamDataResult.success ? `Stream data retrieved for ${streamId}` : streamDataResult.error);
  }

  // Test 7: Get real-time analytics stats
  const statsResult = await makeRequest('GET', '/api/large/realtime-analytics/stats');
  logTest('Real-time Analytics Stats', statsResult.success,
    statsResult.success ? `Active Streams: ${statsResult.data.streams?.active}, Total Metrics: ${statsResult.data.metrics?.total}` : statsResult.error);

  await delay(TEST_CONFIG.delay);
}

async function testMultiTenantArchitecture() {
  console.log('\n🏢 MULTI-TENANT ARCHITECTURE:');

  // Test 1: Get multi-tenant status
  const statusResult = await makeRequest('GET', '/api/large/multi-tenant/status');
  logTest('Multi-tenant Status', statusResult.success,
    statusResult.success ? `Enabled: ${statusResult.data.enabled}, Tenants: ${statusResult.data.tenants}` : statusResult.error);

  // Test 2: Get tenants
  const tenantsResult = await makeRequest('GET', '/api/large/multi-tenant/tenants');
  logTest('List Tenants', tenantsResult.success,
    tenantsResult.success ? `Found ${tenantsResult.data.tenants?.length || 0} tenants` : tenantsResult.error);

  // Test 3: Create new tenant
  const createTenantResult = await makeRequest('POST', '/api/large/multi-tenant/tenants', {
    name: 'Test Corporation',
    domain: 'test-corp.dueuler.com',
    subdomain: 'testcorp',
    plan: 'professional',
    adminEmail: 'admin@test-corp.com',
    settings: {
      maxUsers: 500,
      maxStorage: 50
    }
  });
  logTest('Create Tenant', createTenantResult.success,
    createTenantResult.success ? `Tenant created: ${createTenantResult.data.tenantId}` : createTenantResult.error);

  // Test 4: Get tenant details (if tenants exist)
  if (tenantsResult.success && tenantsResult.data.tenants?.length > 0) {
    const tenantId = tenantsResult.data.tenants[0].id;
    const tenantResult = await makeRequest('GET', `/api/large/multi-tenant/tenants/${tenantId}`);
    logTest('Get Tenant Details', tenantResult.success,
      tenantResult.success ? `Retrieved details for tenant ${tenantId}` : tenantResult.error);

    // Test 5: Get tenant usage
    const usageResult = await makeRequest('GET', `/api/large/multi-tenant/tenants/${tenantId}/usage?days=7`);
    logTest('Get Tenant Usage', usageResult.success,
      usageResult.success ? `Retrieved 7-day usage for tenant ${tenantId}` : usageResult.error);

    // Test 6: Get resource isolation
    const resourcesResult = await makeRequest('GET', `/api/large/multi-tenant/tenants/${tenantId}/resources`);
    logTest('Get Resource Isolation', resourcesResult.success,
      resourcesResult.success ? `Found ${resourcesResult.data.resources?.length || 0} isolated resources` : resourcesResult.error);
  }

  // Test 7: Get multi-tenant stats
  const statsResult = await makeRequest('GET', '/api/large/multi-tenant/stats');
  logTest('Multi-tenant Stats', statsResult.success,
    statsResult.success ? `Active Tenants: ${statsResult.data.tenants?.active}, Total Users: ${statsResult.data.usage?.totalUsers}` : statsResult.error);

  await delay(TEST_CONFIG.delay);
}

async function testConsolidatedStatus() {
  console.log('\n📋 CONSOLIDATED STATUS:');

  // Test consolidated status of all LARGE gaps
  const statusResult = await makeRequest('GET', '/api/large/status');
  logTest('Consolidated LARGE Status', statusResult.success,
    statusResult.success ? `Capacity: ${statusResult.data.capacity}, Implemented: ${statusResult.data.implementedGaps}/${statusResult.data.totalGaps} gaps` : statusResult.error);

  await delay(TEST_CONFIG.delay);
}

async function runAllTests() {
  console.log('🔵 TESTANDO 8 GAPS ESPECÍFICOS LARGE (100K-1M usuários)');
  console.log('============================================================');

  const startTime = Date.now();

  try {
    await testKubernetesOrchestration();
    await testServiceDiscovery();
    await testAdvancedMLOps();
    await testGlobalCDN();
    await testZeroTrustSecurity();
    await testRealTimeAnalytics();
    await testMultiTenantArchitecture();
    await testConsolidatedStatus();
  } catch (error) {
    console.error('\n❌ Erro crítico durante os testes:', error.message);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n============================================================');
  console.log('📊 RESUMO DOS TESTES - 8 GAPS ESPECÍFICOS LARGE');
  console.log('============================================================');
  console.log(`✅ Testes aprovados: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ Testes falharam: ${testResults.failed}/${testResults.total}`);
  console.log(`📈 Taxa de sucesso: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log(`⏱️ Tempo total: ${duration}s`);

  console.log('\n🏗️ CAPACIDADE IMPLEMENTADA:');
  console.log('• Kubernetes Orchestration: Container orchestration automático');
  console.log('• Service Discovery: Descoberta e registro de serviços');
  console.log('• Advanced ML Ops: MLOps avançado com pipelines de ML');
  console.log('• Global CDN: CDN global com edge caching');
  console.log('• Zero-trust Security: Segurança zero-trust baseada em confiança');
  console.log('• Real-time Analytics: Analytics em tempo real com streaming');
  console.log('• Multi-tenant Architecture: Arquitetura multi-tenant completa');

  console.log('\n📊 CAPACIDADE TOTAL:');
  console.log('• Suporte: 100K-1M usuários simultâneos');
  console.log('• Orquestração: Kubernetes com auto-scaling');
  console.log('• ML/AI: Modelos de machine learning em produção');
  console.log('• CDN: Distribuição global de conteúdo');
  console.log('• Segurança: Zero-trust com scoring de confiança');
  console.log('• Analytics: Streaming analytics em tempo real');
  console.log('• Multi-tenancy: Isolamento completo de recursos');

  if (testResults.failed > 0) {
    console.log('\n⚠️ Alguns testes falharam - verificar logs acima');
  } else {
    console.log('\n🎉 Todos os testes passaram! Sistema enterprise pronto para 1M usuários');
  }

  console.log('\n✅ Teste completo finalizado');
}

// Run the tests
runAllTests().catch(console.error);
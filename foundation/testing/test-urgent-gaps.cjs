const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const testConfig = {
  delay: 1000, // 1 second between requests to avoid rate limiting
  timeout: 5000
};

console.log('🔥 TESTANDO OS 6 GAPS URGENTES IMPLEMENTADOS\n');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealthCheck() {
  console.log('1. 🏥 Testing Health Check & SSL Verification...');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`, {
      timeout: testConfig.timeout
    });
    console.log('✅ Health Check Status:', response.status);
    console.log('📊 Health Data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Health Check Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAnalyticsTracking() {
  console.log('\n2. 📊 Testing Analytics Service...');
  
  // Test page view tracking
  try {
    const pageViewResponse = await axios.post(`${BASE_URL}/api/analytics/page-view`, {
      page: '/test-page',
      userId: 1,
      sessionId: 'test-session-123',
      referrer: 'https://google.com',
      loadTime: 250
    }, { timeout: testConfig.timeout });
    
    console.log('✅ Page View Tracking:', pageViewResponse.status);
    
    await delay(testConfig.delay);
    
    // Test event tracking
    const eventResponse = await axios.post(`${BASE_URL}/api/analytics/track`, {
      eventType: 'button_click',
      userId: 1,
      sessionId: 'test-session-123',
      page: '/test-page',
      action: 'test_button_clicked',
      metadata: { button_type: 'primary', test: true }
    }, { timeout: testConfig.timeout });
    
    console.log('✅ Event Tracking:', eventResponse.status);
    return true;
  } catch (error) {
    console.log('❌ Analytics Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testErrorTracking() {
  console.log('\n3. 🚨 Testing Error Tracking Service...');
  try {
    const response = await axios.post(`${BASE_URL}/api/errors/report`, {
      message: 'Test error for gap implementation',
      stack: 'Error: Test error\n    at testErrorTracking (test-urgent-gaps.js:65:5)',
      type: 'test_error',
      userId: 1,
      metadata: { test: true, gap: 'error_tracking' }
    }, { timeout: testConfig.timeout });
    
    console.log('✅ Error Reporting:', response.status);
    console.log('📝 Response:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Error Tracking Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testEmailService() {
  console.log('\n4. 📧 Testing Email Service...');
  try {
    // Get authentication token first
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste1@teste.com',
      password: 'teste123'
    });
    
    const token = loginResponse.data.token;
    
    await delay(testConfig.delay);
    
    const response = await axios.post(`${BASE_URL}/api/email/welcome`, {
      email: 'test@example.com',
      name: 'Test User'
    }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: testConfig.timeout
    });
    
    console.log('✅ Email Service:', response.status);
    console.log('📧 Response:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Email Service Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testFileUpload() {
  console.log('\n5. 📤 Testing File Upload Service...');
  try {
    // Create a test image file
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-image.png', testImageContent);
    
    // Get authentication token
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste1@teste.com',
      password: 'teste123'
    });
    
    const token = loginResponse.data.token;
    
    await delay(testConfig.delay);
    
    const form = new FormData();
    form.append('image', fs.createReadStream('test-image.png'));
    
    const response = await axios.post(`${BASE_URL}/api/upload/image`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      },
      timeout: testConfig.timeout
    });
    
    console.log('✅ File Upload:', response.status);
    console.log('📁 Uploaded File:', response.data.file?.filename);
    
    // Clean up test file
    fs.unlinkSync('test-image.png');
    return true;
  } catch (error) {
    console.log('❌ File Upload Failed:', error.response?.data || error.message);
    // Clean up test file even if failed
    try { fs.unlinkSync('test-image.png'); } catch {}
    return false;
  }
}

async function testCDNOptimization() {
  console.log('\n6. 🔐 Testing CDN & Static Assets Optimization...');
  try {
    // This requires admin authentication, let's try with admin user
    const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/admin/login`, {
      email: 'admin@dueuler.com',
      password: 'admin123'
    });
    
    const adminToken = adminLoginResponse.data.token;
    
    await delay(testConfig.delay);
    
    const response = await axios.get(`${BASE_URL}/api/assets/optimize`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      timeout: testConfig.timeout
    });
    
    console.log('✅ CDN Optimization:', response.status);
    console.log('📈 Asset Stats:', JSON.stringify(response.data.data, null, 2));
    console.log('💡 Recommendations:', response.data.recommendations.length, 'items');
    return true;
  } catch (error) {
    console.log('❌ CDN Optimization Failed:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  const results = {
    healthCheck: false,
    analytics: false,
    errorTracking: false,
    emailService: false,
    fileUpload: false,
    cdnOptimization: false
  };
  
  console.log('🚀 Starting comprehensive test of 6 urgent gaps...\n');
  
  results.healthCheck = await testHealthCheck();
  await delay(testConfig.delay);
  
  results.analytics = await testAnalyticsTracking();
  await delay(testConfig.delay);
  
  results.errorTracking = await testErrorTracking();
  await delay(testConfig.delay);
  
  results.emailService = await testEmailService();
  await delay(testConfig.delay);
  
  results.fileUpload = await testFileUpload();
  await delay(testConfig.delay);
  
  results.cdnOptimization = await testCDNOptimization();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 RESUMO DOS TESTES DOS 6 GAPS URGENTES');
  console.log('='.repeat(50));
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed], index) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${index + 1}. ${testName}: ${status}`);
  });
  
  console.log('\n📊 RESULTADO FINAL:');
  console.log(`✅ Aprovados: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TODOS OS 6 GAPS URGENTES FORAM IMPLEMENTADOS COM SUCESSO!');
  } else {
    console.log(`⚠️  ${totalTests - passedTests} gaps ainda precisam de ajustes.`);
  }
  
  return results;
}

// Run the tests
runAllTests().then(results => {
  process.exit(Object.values(results).every(Boolean) ? 0 : 1);
}).catch(error => {
  console.error('💥 Test suite failed:', error.message);
  process.exit(1);
});
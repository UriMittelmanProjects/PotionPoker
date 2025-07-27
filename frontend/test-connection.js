/**
 * Simple test script to verify frontend can connect to backend
 * Run this with: node test-connection.js
 */

const API_BASE_URL = 'http://localhost:3000';

/**
 * Test health endpoint
 */
async function testHealth() {
  console.log('🏥 Testing health endpoint...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Health endpoint working');
      return true;
    } else {
      console.log('❌ Health endpoint failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
    return false;
  }
}

/**
 * Test registration endpoint
 */
async function testRegistration() {
  console.log('\n📝 Testing registration endpoint...');
  
  const testUser = {
    email: `test_frontend_${Date.now()}@example.com`,
    password: 'TestPassword123',
    username: `testfrontend${Date.now()}`,
    firstName: 'Frontend',
    lastName: 'Test'
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Mode': 'true'  // Bypass rate limiting
      },
      body: JSON.stringify(testUser),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Registration working');
      console.log('📊 Response structure:', {
        success: data.success,
        hasData: !!data.data,
        hasToken: !!data.data?.token,
        hasUser: !!data.data?.user
      });
      return { success: true, data: data.data };
    } else {
      console.log('❌ Registration failed:', data);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return { success: false };
  }
}

/**
 * Test login endpoint
 */
async function testLogin(email, password) {
  console.log('\n🔐 Testing login endpoint...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Mode': 'true'  // Bypass rate limiting
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Login working');
      console.log('📊 Login response structure:', {
        success: data.success,
        hasData: !!data.data,
        hasToken: !!data.data?.token,
        hasUser: !!data.data?.user
      });
      return { success: true, data: data.data };
    } else {
      console.log('❌ Login failed:', data);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return { success: false };
  }
}

/**
 * Test protected route
 */
async function testProtectedRoute(token) {
  console.log('\n🛡️ Testing protected route...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Test-Mode': 'true'
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Protected route working');
      console.log('📊 Profile data:', {
        success: data.success,
        hasData: !!data.data,
        userEmail: data.data?.email
      });
      return true;
    } else {
      console.log('❌ Protected route failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Protected route error:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Frontend-Backend Connection Test');
  console.log('=' .repeat(50));
  
  // Test health
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n❌ Backend is not running or not accessible');
    console.log('💡 Make sure backend is running: npm run dev');
    return;
  }
  
  // Test registration
  const registerResult = await testRegistration();
  if (!registerResult.success) {
    console.log('\n❌ Registration test failed');
    return;
  }
  
  // Extract user credentials for login test
  const testEmail = registerResult.data.user.email;
  const testPassword = 'TestPassword123'; // We know this from registration
  
  // Test login
  const loginResult = await testLogin(testEmail, testPassword);
  if (!loginResult.success) {
    console.log('\n❌ Login test failed');
    return;
  }
  
  // Test protected route
  const protectedOk = await testProtectedRoute(loginResult.data.token);
  if (!protectedOk) {
    console.log('\n❌ Protected route test failed');
    return;
  }
  
  console.log('\n🎉 ALL TESTS PASSED!');
  console.log('✅ Frontend can successfully connect to backend');
  console.log('✅ Registration, login, and protected routes working');
  console.log('✅ API response structure is compatible with frontend');
  console.log('\n💡 You can now start the frontend with: npm start');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires Node.js 18+ or install node-fetch');
  console.log('💡 Alternatively, test in the React Native app directly');
  process.exit(1);
}

// Run tests
runTests().catch(console.error);
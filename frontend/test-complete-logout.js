/**
 * Test script to verify complete logout flow with backend endpoint
 */

const API_BASE_URL = 'http://localhost:3000';

async function testCompleteLogoutFlow() {
  console.log('🔐 Testing Complete Logout Flow with Backend');
  console.log('=' .repeat(50));

  // Step 1: Register a user
  console.log('\n1. 📝 Registering test user...');
  const testUser = {
    email: `complete_logout_${Date.now()}@example.com`,
    password: 'TestPassword123',
    username: `completelogout${Date.now()}`,
    firstName: 'Complete',
    lastName: 'Logout'
  };

  try {
    const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Mode': 'true'
      },
      body: JSON.stringify(testUser),
    });

    const registerData = await registerResponse.json();
    
    if (!registerResponse.ok || !registerData.success) {
      console.log('❌ Registration failed:', registerData);
      return;
    }

    console.log('✅ User registered successfully');
    const token = registerData.data.token;

    // Step 2: Test that we can access protected routes
    console.log('\n2. 🛡️ Testing protected route access...');
    const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Test-Mode': 'true'
      },
    });

    const profileData = await profileResponse.json();
    
    if (profileResponse.ok && profileData.success) {
      console.log('✅ Protected route accessible with token');
      console.log(`📧 User email: ${profileData.data.email}`);
    } else {
      console.log('❌ Protected route failed:', profileData);
      return;
    }

    // Step 3: Test backend logout endpoint
    console.log('\n3. 🚪 Testing backend logout endpoint...');
    const logoutResponse = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Test-Mode': 'true'
      },
    });

    const logoutData = await logoutResponse.json();
    
    if (logoutResponse.ok && logoutData.success) {
      console.log('✅ Backend logout endpoint working');
      console.log(`📝 Message: ${logoutData.message}`);
    } else {
      console.log('❌ Backend logout failed:', logoutData);
      return;
    }

    // Step 4: Test that token still works (JWT is stateless)
    console.log('\n4. 🔍 Testing token after backend logout...');
    const postLogoutResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Test-Mode': 'true'
      },
    });

    const postLogoutData = await postLogoutResponse.json();
    
    if (postLogoutResponse.ok && postLogoutData.success) {
      console.log('✅ Token still valid (expected for stateless JWT)');
      console.log('💡 Frontend should clear token from storage to complete logout');
    } else {
      console.log('⚠️ Token invalidated by backend (unexpected for basic JWT)');
    }

    // Step 5: Simulate complete frontend logout (clear token)
    console.log('\n5. 🗑️ Simulating frontend token clearing...');
    console.log('✅ Token cleared from local storage (simulated)');

    // Step 6: Test access without token
    console.log('\n6. 🚫 Testing access without token...');
    const noTokenResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        'X-Test-Mode': 'true'
      },
    });

    const noTokenData = await noTokenResponse.json();
    
    if (noTokenResponse.status === 401 && !noTokenData.success) {
      console.log('✅ Access properly denied without token');
    } else {
      console.log('❌ Should have denied access without token:', noTokenData);
      return;
    }

    console.log('\n🎉 COMPLETE LOGOUT FLOW TEST PASSED!');
    console.log('✅ Registration works');
    console.log('✅ Authentication protects routes');
    console.log('✅ Backend logout endpoint works');
    console.log('✅ Frontend token clearing prevents access');
    
    console.log('\n💡 Complete logout process:');
    console.log('   1. Frontend calls backend logout endpoint');
    console.log('   2. Backend logs the logout event');
    console.log('   3. Frontend clears token from AsyncStorage');
    console.log('   4. Frontend resets auth state');
    console.log('   5. App navigates to login screen');

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

// Check if fetch is available
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires Node.js 18+ or install node-fetch');
  process.exit(1);
}

// Run test
testCompleteLogoutFlow().catch(console.error);
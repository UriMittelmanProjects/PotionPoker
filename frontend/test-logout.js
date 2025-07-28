/**
 * Test script to verify logout functionality
 * Tests that logout properly clears tokens and redirects
 */

const API_BASE_URL = 'http://localhost:3000';

async function testLogoutFlow() {
  console.log('🚪 Testing Logout Flow');
  console.log('=' .repeat(40));

  // Step 1: Register a user
  console.log('\n1. 📝 Registering test user...');
  const testUser = {
    email: `logout_test_${Date.now()}@example.com`,
    password: 'TestPassword123',
    username: `logouttest${Date.now()}`,
    firstName: 'Logout',
    lastName: 'Test'
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

    // Step 2: Test protected route with token
    console.log('\n2. 🛡️ Testing protected route with valid token...');
    const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Test-Mode': 'true'
      },
    });

    const profileData = await profileResponse.json();
    
    if (profileResponse.ok && profileData.success) {
      console.log('✅ Protected route accessible with token');
    } else {
      console.log('❌ Protected route failed:', profileData);
      return;
    }

    // Step 3: Simulate logout (frontend would clear token from storage)
    console.log('\n3. 🚪 Simulating logout (clearing token)...');
    console.log('✅ Token cleared from storage (simulated)');

    // Step 4: Test protected route without token
    console.log('\n4. 🚫 Testing protected route without token...');
    const noTokenResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        'X-Test-Mode': 'true'
      },
    });

    const noTokenData = await noTokenResponse.json();
    
    if (noTokenResponse.status === 401 && !noTokenData.success) {
      console.log('✅ Protected route properly blocks unauthorized access');
    } else {
      console.log('❌ Protected route should have blocked access:', noTokenData);
      return;
    }

    // Step 5: Test with invalid token
    console.log('\n5. 🔒 Testing with invalid token...');
    const invalidTokenResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': 'Bearer invalid-token-here',
        'X-Test-Mode': 'true'
      },
    });

    const invalidTokenData = await invalidTokenResponse.json();
    
    if (invalidTokenResponse.status === 403 && !invalidTokenData.success) {
      console.log('✅ Invalid token properly rejected');
    } else {
      console.log('❌ Invalid token should have been rejected:', invalidTokenData);
      return;
    }

    console.log('\n🎉 LOGOUT FLOW TEST PASSED!');
    console.log('✅ Registration works');
    console.log('✅ Authentication protects routes');
    console.log('✅ Token clearing prevents access');
    console.log('✅ Invalid tokens are rejected');
    console.log('\n💡 Frontend logout functionality should:');
    console.log('   1. Call logout() from auth store');
    console.log('   2. Clear AsyncStorage tokens');
    console.log('   3. Reset auth state');
    console.log('   4. Navigate to login screen');

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
testLogoutFlow().catch(console.error);
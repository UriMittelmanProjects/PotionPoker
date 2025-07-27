const http = require('http');
const { spawn } = require('child_process');

/**
 * Comprehensive test suite for authentication routes
 * Bypasses rate limiting by using different test users for each test
 */

class AuthTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
    this.testUsers = [];
    this.authTokens = {};
  }

  /**
   * Generate unique test user for each test to avoid rate limiting
   */
  generateTestUser(testName) {
    const timestamp = Date.now();
    const user = {
      email: `test_${testName}_${timestamp}@example.com`,
      password: 'TestPassword123',
      username: `test_${testName}_${timestamp}`,
      firstName: 'Test',
      lastName: testName
    };
    this.testUsers.push(user);
    return user;
  }

  /**
   * Make HTTP request with proper error handling
   */
  async makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = {
              statusCode: res.statusCode,
              headers: res.headers,
              data: data ? JSON.parse(data) : null
            };
            resolve(response);
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data,
              parseError: error.message
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  /**
   * Test health endpoint
   */
  async testHealth() {
    console.log('\n🏥 Testing Health Endpoint...');
    
    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/health',
        method: 'GET'
      };

      const response = await this.makeRequest(options);
      
      if (response.statusCode === 200 && response.data?.success) {
        console.log('✅ Health endpoint working');
        this.testResults.push({ test: 'health', status: 'PASS' });
        return true;
      } else {
        console.log('❌ Health endpoint failed:', response);
        this.testResults.push({ test: 'health', status: 'FAIL', response });
        return false;
      }
    } catch (error) {
      console.log('❌ Health endpoint error:', error.message);
      this.testResults.push({ test: 'health', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test user registration
   */
  async testRegister() {
    console.log('\n📝 Testing User Registration...');
    
    const testUser = this.generateTestUser('register');
    const postData = JSON.stringify(testUser);

    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await this.makeRequest(options, postData);
      
      if (response.statusCode === 201 && response.data?.success) {
        console.log('✅ Registration successful');
        this.authTokens[testUser.email] = response.data.data.token;
        this.testResults.push({ test: 'register', status: 'PASS' });
        return { success: true, user: testUser, token: response.data.data.token };
      } else {
        console.log('❌ Registration failed:', response.data);
        this.testResults.push({ test: 'register', status: 'FAIL', response: response.data });
        return { success: false };
      }
    } catch (error) {
      console.log('❌ Registration error:', error.message);
      this.testResults.push({ test: 'register', status: 'ERROR', error: error.message });
      return { success: false };
    }
  }

  /**
   * Test user login
   */
  async testLogin() {
    console.log('\n🔐 Testing User Login...');
    
    // First register a user to login with
    const registerResult = await this.testRegister();
    if (!registerResult.success) {
      console.log('❌ Cannot test login - registration failed');
      return false;
    }

    const testUser = registerResult.user;
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    const postData = JSON.stringify(loginData);

    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await this.makeRequest(options, postData);
      
      if (response.statusCode === 200 && response.data?.success) {
        console.log('✅ Login successful');
        this.testResults.push({ test: 'login', status: 'PASS' });
        return { success: true, token: response.data.data.token };
      } else {
        console.log('❌ Login failed:', response.data);
        this.testResults.push({ test: 'login', status: 'FAIL', response: response.data });
        return { success: false };
      }
    } catch (error) {
      console.log('❌ Login error:', error.message);
      this.testResults.push({ test: 'login', status: 'ERROR', error: error.message });
      return { success: false };
    }
  }

  /**
   * Test invalid login credentials
   */
  async testInvalidLogin() {
    console.log('\n🚫 Testing Invalid Login...');
    
    const testUser = this.generateTestUser('invalid_login');
    const loginData = {
      email: testUser.email,
      password: 'WrongPassword123'
    };
    const postData = JSON.stringify(loginData);

    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await this.makeRequest(options, postData);
      
      if (response.statusCode === 401 && !response.data?.success) {
        console.log('✅ Invalid login properly rejected');
        this.testResults.push({ test: 'invalid_login', status: 'PASS' });
        return true;
      } else {
        console.log('❌ Invalid login not properly handled:', response.data);
        this.testResults.push({ test: 'invalid_login', status: 'FAIL', response: response.data });
        return false;
      }
    } catch (error) {
      console.log('❌ Invalid login test error:', error.message);
      this.testResults.push({ test: 'invalid_login', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test protected profile endpoint
   */
  async testProtectedRoute() {
    console.log('\n🛡️ Testing Protected Route...');
    
    // First login to get a token
    const loginResult = await this.testLogin();
    if (!loginResult.success) {
      console.log('❌ Cannot test protected route - login failed');
      return false;
    }

    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/profile',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginResult.token}`
        }
      };

      const response = await this.makeRequest(options);
      
      if (response.statusCode === 200 && response.data?.success) {
        console.log('✅ Protected route accessible with valid token');
        this.testResults.push({ test: 'protected_route', status: 'PASS' });
        return true;
      } else {
        console.log('❌ Protected route failed:', response.data);
        this.testResults.push({ test: 'protected_route', status: 'FAIL', response: response.data });
        return false;
      }
    } catch (error) {
      console.log('❌ Protected route error:', error.message);
      this.testResults.push({ test: 'protected_route', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test protected route without token
   */
  async testUnauthorizedAccess() {
    console.log('\n🚪 Testing Unauthorized Access...');
    
    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/profile',
        method: 'GET'
        // No Authorization header
      };

      const response = await this.makeRequest(options);
      
      if (response.statusCode === 401 && !response.data?.success) {
        console.log('✅ Unauthorized access properly blocked');
        this.testResults.push({ test: 'unauthorized_access', status: 'PASS' });
        return true;
      } else {
        console.log('❌ Unauthorized access not properly blocked:', response.data);
        this.testResults.push({ test: 'unauthorized_access', status: 'FAIL', response: response.data });
        return false;
      }
    } catch (error) {
      console.log('❌ Unauthorized access test error:', error.message);
      this.testResults.push({ test: 'unauthorized_access', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test forgot password endpoint
   */
  async testForgotPassword() {
    console.log('\n📧 Testing Forgot Password...');
    
    // Register a user first
    const registerResult = await this.testRegister();
    if (!registerResult.success) {
      console.log('❌ Cannot test forgot password - registration failed');
      return false;
    }

    const postData = JSON.stringify({
      email: registerResult.user.email
    });

    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/forgot-password',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await this.makeRequest(options, postData);
      
      if (response.statusCode === 200 && response.data?.success) {
        console.log('✅ Forgot password request accepted');
        this.testResults.push({ test: 'forgot_password', status: 'PASS' });
        return true;
      } else {
        console.log('❌ Forgot password failed:', response.data);
        this.testResults.push({ test: 'forgot_password', status: 'FAIL', response: response.data });
        return false;
      }
    } catch (error) {
      console.log('❌ Forgot password error:', error.message);
      this.testResults.push({ test: 'forgot_password', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test validation errors
   */
  async testValidationErrors() {
    console.log('\n🔍 Testing Validation Errors...');
    
    const invalidUser = {
      email: 'invalid-email',
      password: '123', // Too short
      username: 'ab', // Too short
      firstName: '',
      lastName: ''
    };
    const postData = JSON.stringify(invalidUser);

    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await this.makeRequest(options, postData);
      
      if (response.statusCode === 400 && !response.data?.success) {
        console.log('✅ Validation errors properly caught');
        this.testResults.push({ test: 'validation_errors', status: 'PASS' });
        return true;
      } else {
        console.log('❌ Validation errors not properly handled:', response.data);
        this.testResults.push({ test: 'validation_errors', status: 'FAIL', response: response.data });
        return false;
      }
    } catch (error) {
      console.log('❌ Validation test error:', error.message);
      this.testResults.push({ test: 'validation_errors', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test duplicate user registration
   */
  async testDuplicateUser() {
    console.log('\n👥 Testing Duplicate User Prevention...');
    
    // Register a user first
    const registerResult = await this.testRegister();
    if (!registerResult.success) {
      console.log('❌ Cannot test duplicate user - first registration failed');
      return false;
    }

    // Try to register the same user again
    const postData = JSON.stringify(registerResult.user);

    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await this.makeRequest(options, postData);
      
      if (response.statusCode === 400 && !response.data?.success) {
        console.log('✅ Duplicate user properly prevented');
        this.testResults.push({ test: 'duplicate_user', status: 'PASS' });
        return true;
      } else {
        console.log('❌ Duplicate user not properly prevented:', response.data);
        this.testResults.push({ test: 'duplicate_user', status: 'FAIL', response: response.data });
        return false;
      }
    } catch (error) {
      console.log('❌ Duplicate user test error:', error.message);
      this.testResults.push({ test: 'duplicate_user', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Authentication Route Tests...');
    console.log('=' .repeat(50));
    
    const tests = [
      () => this.testHealth(),
      () => this.testRegister(),
      () => this.testLogin(),
      () => this.testInvalidLogin(),
      () => this.testProtectedRoute(),
      () => this.testUnauthorizedAccess(),
      () => this.testForgotPassword(),
      () => this.testValidationErrors(),
      () => this.testDuplicateUser()
    ];

    for (const test of tests) {
      await test();
      // Small delay between tests to avoid any timing issues
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.printResults();
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' .repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const errors = this.testResults.filter(r => r.status === 'ERROR').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.test}: ${result.status}`);
    });
    
    console.log('\n📈 SUMMARY:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Errors: ${errors}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    
    if (failed === 0 && errors === 0) {
      console.log('\n🎉 All tests passed! Auth system is working correctly.');
    } else {
      console.log('\n🔧 Some tests failed. Check the logs above for details.');
    }
    
    console.log(`\n🧪 Generated ${this.testUsers.length} test users to avoid rate limiting`);
  }
}

// Wait for server to be ready, then run tests
setTimeout(async () => {
  const tester = new AuthTester();
  await tester.runAllTests();
}, 2000);
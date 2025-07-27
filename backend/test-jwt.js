const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

/**
 * JWT and authentication utility tests
 * Tests token generation, verification, and security features
 */

class JWTTester {
  constructor() {
    this.testResults = [];
    this.jwtSecret = 'test-jwt-secret-for-testing-only';
    
    // Set test environment variables
    process.env.JWT_SECRET = this.jwtSecret;
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  }

  /**
   * Test JWT token generation
   */
  async testTokenGeneration() {
    console.log('\n🔐 Testing JWT Token Generation...');
    
    try {
      // Import JWT utilities after setting env vars
      const jwtUtilsPath = path.join(__dirname, 'src', 'utils', 'jwt');
      const { generateAccessToken, generateRefreshToken } = require(jwtUtilsPath);
      
      const payload = {
        userId: 'test-user-id-123',
        email: 'test@example.com'
      };

      // Test access token generation
      const accessToken = generateAccessToken(payload);
      if (!accessToken || typeof accessToken !== 'string') {
        console.log('❌ Access token generation failed');
        this.testResults.push({ test: 'token_generation', status: 'FAIL' });
        return false;
      }

      // Test refresh token generation
      const refreshToken = generateRefreshToken(payload);
      if (!refreshToken || typeof refreshToken !== 'string') {
        console.log('❌ Refresh token generation failed');
        this.testResults.push({ test: 'token_generation', status: 'FAIL' });
        return false;
      }

      console.log('✅ Token generation working');
      this.testResults.push({ test: 'token_generation', status: 'PASS' });
      return { accessToken, refreshToken };
    } catch (error) {
      console.log('❌ Token generation error:', error.message);
      this.testResults.push({ test: 'token_generation', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test JWT token verification
   */
  async testTokenVerification() {
    console.log('\n🔍 Testing JWT Token Verification...');
    
    try {
      const jwtUtilsPath = path.join(__dirname, 'src', 'utils', 'jwt');
      const { generateAccessToken, verifyToken } = require(jwtUtilsPath);
      
      const payload = {
        userId: 'test-user-id-456',
        email: 'verify@example.com'
      };

      // Generate token
      const token = generateAccessToken(payload);
      
      // Verify token
      const decoded = verifyToken(token);
      
      if (decoded.userId === payload.userId && decoded.email === payload.email) {
        console.log('✅ Token verification working');
        this.testResults.push({ test: 'token_verification', status: 'PASS' });
        return true;
      } else {
        console.log('❌ Token verification returned incorrect data');
        this.testResults.push({ test: 'token_verification', status: 'FAIL' });
        return false;
      }
    } catch (error) {
      console.log('❌ Token verification error:', error.message);
      this.testResults.push({ test: 'token_verification', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test invalid token handling
   */
  async testInvalidTokens() {
    console.log('\n🚫 Testing Invalid Token Handling...');
    
    try {
      const jwtUtilsPath = path.join(__dirname, 'src', 'utils', 'jwt');
      const { verifyToken } = require(jwtUtilsPath);
      
      // Test invalid token
      try {
        verifyToken('invalid.token.here');
        console.log('❌ Invalid token not properly rejected');
        this.testResults.push({ test: 'invalid_tokens', status: 'FAIL' });
        return false;
      } catch (error) {
        // This should throw an error
      }

      // Test expired token (manually create one)
      const expiredToken = jwt.sign(
        { userId: 'test', email: 'test@example.com' },
        this.jwtSecret,
        { expiresIn: '-1h' } // Already expired
      );

      try {
        verifyToken(expiredToken);
        console.log('❌ Expired token not properly rejected');
        this.testResults.push({ test: 'invalid_tokens', status: 'FAIL' });
        return false;
      } catch (error) {
        // This should throw an error
      }

      // Test token with wrong secret
      const wrongSecretToken = jwt.sign(
        { userId: 'test', email: 'test@example.com' },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      try {
        verifyToken(wrongSecretToken);
        console.log('❌ Token with wrong secret not properly rejected');
        this.testResults.push({ test: 'invalid_tokens', status: 'FAIL' });
        return false;
      } catch (error) {
        // This should throw an error
      }

      console.log('✅ Invalid token handling working');
      this.testResults.push({ test: 'invalid_tokens', status: 'PASS' });
      return true;
    } catch (error) {
      console.log('❌ Invalid token test error:', error.message);
      this.testResults.push({ test: 'invalid_tokens', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test password reset tokens
   */
  async testResetTokens() {
    console.log('\n🔑 Testing Password Reset Tokens...');
    
    try {
      const jwtUtilsPath = path.join(__dirname, 'src', 'utils', 'jwt');
      const { generateResetToken, verifyToken } = require(jwtUtilsPath);
      
      const payload = {
        userId: 'reset-user-id-789',
        email: 'reset@example.com'
      };

      // Generate reset token
      const resetToken = generateResetToken(payload);
      
      // Verify reset token
      const decoded = verifyToken(resetToken);
      
      if (decoded.userId === payload.userId && decoded.email === payload.email) {
        console.log('✅ Reset token generation and verification working');
        this.testResults.push({ test: 'reset_tokens', status: 'PASS' });
        return true;
      } else {
        console.log('❌ Reset token verification returned incorrect data');
        this.testResults.push({ test: 'reset_tokens', status: 'FAIL' });
        return false;
      }
    } catch (error) {
      console.log('❌ Reset token test error:', error.message);
      this.testResults.push({ test: 'reset_tokens', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test password hashing and verification
   */
  async testPasswordHashing() {
    console.log('\n🔒 Testing Password Hashing...');
    
    try {
      const password = 'TestPassword123';
      
      // Test hashing
      const hashedPassword = await bcrypt.hash(password, 12);
      
      if (!hashedPassword || hashedPassword === password) {
        console.log('❌ Password hashing failed');
        this.testResults.push({ test: 'password_hashing', status: 'FAIL' });
        return false;
      }

      // Test verification with correct password
      const isValidCorrect = await bcrypt.compare(password, hashedPassword);
      if (!isValidCorrect) {
        console.log('❌ Password verification failed for correct password');
        this.testResults.push({ test: 'password_hashing', status: 'FAIL' });
        return false;
      }

      // Test verification with incorrect password
      const isValidIncorrect = await bcrypt.compare('WrongPassword', hashedPassword);
      if (isValidIncorrect) {
        console.log('❌ Password verification failed - accepted wrong password');
        this.testResults.push({ test: 'password_hashing', status: 'FAIL' });
        return false;
      }

      console.log('✅ Password hashing and verification working');
      this.testResults.push({ test: 'password_hashing', status: 'PASS' });
      return true;
    } catch (error) {
      console.log('❌ Password hashing test error:', error.message);
      this.testResults.push({ test: 'password_hashing', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test token expiration
   */
  async testTokenExpiration() {
    console.log('\n⏰ Testing Token Expiration...');
    
    try {
      const payload = {
        userId: 'expiry-test-user',
        email: 'expiry@example.com'
      };

      // Create token with very short expiration
      const shortLivedToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '1ms' });
      
      // Wait a moment for token to expire
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Try to verify expired token
      const jwtUtilsPath = path.join(__dirname, 'src', 'utils', 'jwt');
      const { verifyToken } = require(jwtUtilsPath);
      
      try {
        verifyToken(shortLivedToken);
        console.log('❌ Expired token was not properly rejected');
        this.testResults.push({ test: 'token_expiration', status: 'FAIL' });
        return false;
      } catch (error) {
        if (error.message.includes('expired') || error.message.includes('Invalid')) {
          console.log('✅ Token expiration working correctly');
          this.testResults.push({ test: 'token_expiration', status: 'PASS' });
          return true;
        } else {
          console.log('❌ Unexpected error for expired token:', error.message);
          this.testResults.push({ test: 'token_expiration', status: 'FAIL' });
          return false;
        }
      }
    } catch (error) {
      console.log('❌ Token expiration test error:', error.message);
      this.testResults.push({ test: 'token_expiration', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test JWT secret validation
   */
  async testSecretValidation() {
    console.log('\n🔐 Testing JWT Secret Validation...');
    
    try {
      // Temporarily clear JWT_SECRET
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      // Clear require cache to reload module
      const jwtUtilsPath = path.join(__dirname, 'src', 'utils', 'jwt');
      delete require.cache[require.resolve(jwtUtilsPath)];
      
      const { generateAccessToken } = require(jwtUtilsPath);
      
      try {
        generateAccessToken({ userId: 'test', email: 'test@example.com' });
        console.log('❌ Missing JWT secret not properly validated');
        this.testResults.push({ test: 'secret_validation', status: 'FAIL' });
        return false;
      } catch (error) {
        if (error.message.includes('JWT_SECRET')) {
          console.log('✅ JWT secret validation working');
          this.testResults.push({ test: 'secret_validation', status: 'PASS' });
          
          // Restore secret
          process.env.JWT_SECRET = originalSecret;
          delete require.cache[require.resolve(jwtUtilsPath)];
          
          return true;
        } else {
          console.log('❌ Unexpected error for missing secret:', error.message);
          this.testResults.push({ test: 'secret_validation', status: 'FAIL' });
          
          // Restore secret
          process.env.JWT_SECRET = originalSecret;
          delete require.cache[require.resolve(jwtUtilsPath)];
          
          return false;
        }
      }
    } catch (error) {
      console.log('❌ Secret validation test error:', error.message);
      this.testResults.push({ test: 'secret_validation', status: 'ERROR', error: error.message });
      
      // Restore secret in case of error
      process.env.JWT_SECRET = this.jwtSecret;
      const jwtUtilsPath = path.join(__dirname, 'src', 'utils', 'jwt');
      delete require.cache[require.resolve(jwtUtilsPath)];
      
      return false;
    }
  }

  /**
   * Run all JWT tests
   */
  async runAllTests() {
    console.log('🔐 Starting JWT and Security Tests...');
    console.log('=' .repeat(50));
    
    const tests = [
      () => this.testTokenGeneration(),
      () => this.testTokenVerification(),
      () => this.testInvalidTokens(),
      () => this.testResetTokens(),
      () => this.testPasswordHashing(),
      () => this.testTokenExpiration(),
      () => this.testSecretValidation()
    ];

    for (const test of tests) {
      await test();
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.printResults();
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 JWT & SECURITY TEST RESULTS');
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
      console.log('\n🎉 All JWT and security tests passed! Authentication security is working correctly.');
    } else {
      console.log('\n🔧 Some security tests failed. Check the logs above for details.');
    }
  }
}

// Run JWT tests immediately
(async () => {
  const tester = new JWTTester();
  await tester.runAllTests();
})();
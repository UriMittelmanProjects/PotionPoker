const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

/**
 * Database and Prisma integration tests
 * Tests database operations, constraints, and data persistence
 */

class DatabaseTester {
  constructor() {
    this.prisma = new PrismaClient();
    this.testResults = [];
    this.createdUsers = [];
  }

  /**
   * Generate test user data
   */
  generateTestUser(suffix = '') {
    const timestamp = Date.now();
    return {
      email: `dbtest_${suffix}_${timestamp}@example.com`,
      username: `dbtest_${suffix}_${timestamp}`,
      firstName: 'Database',
      lastName: `Test${suffix}`,
      password: 'TestPassword123',
      statusVisibility: 'public'
    };
  }

  /**
   * Test database connection
   */
  async testConnection() {
    console.log('\n🔌 Testing Database Connection...');
    
    try {
      await this.prisma.$connect();
      console.log('✅ Database connection successful');
      this.testResults.push({ test: 'connection', status: 'PASS' });
      return true;
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      this.testResults.push({ test: 'connection', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test user creation
   */
  async testUserCreation() {
    console.log('\n👤 Testing User Creation...');
    
    const testUser = this.generateTestUser('create');
    
    try {
      // Hash password like the controller does
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      
      const user = await this.prisma.user.create({
        data: {
          email: testUser.email,
          username: testUser.username,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          password: hashedPassword,
          statusVisibility: testUser.statusVisibility
        }
      });

      if (user && user.id) {
        console.log('✅ User creation successful');
        this.createdUsers.push(user);
        this.testResults.push({ test: 'user_creation', status: 'PASS' });
        return user;
      } else {
        console.log('❌ User creation returned invalid data');
        this.testResults.push({ test: 'user_creation', status: 'FAIL' });
        return null;
      }
    } catch (error) {
      console.log('❌ User creation failed:', error.message);
      this.testResults.push({ test: 'user_creation', status: 'ERROR', error: error.message });
      return null;
    }
  }

  /**
   * Test unique constraints
   */
  async testUniqueConstraints() {
    console.log('\n🔒 Testing Unique Constraints...');
    
    const testUser = this.generateTestUser('unique');
    
    try {
      // Create first user
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      
      const user1 = await this.prisma.user.create({
        data: {
          email: testUser.email,
          username: testUser.username,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          password: hashedPassword,
        }
      });

      this.createdUsers.push(user1);

      // Try to create second user with same email
      try {
        const user2 = await this.prisma.user.create({
          data: {
            email: testUser.email, // Same email
            username: testUser.username + '_different',
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            password: hashedPassword,
          }
        });

        console.log('❌ Unique email constraint not working - duplicate email allowed');
        this.testResults.push({ test: 'unique_constraints', status: 'FAIL' });
        return false;
      } catch (duplicateError) {
        console.log('✅ Unique email constraint working');
      }

      // Try to create user with same username
      try {
        const user3 = await this.prisma.user.create({
          data: {
            email: testUser.email + '_different',
            username: testUser.username, // Same username
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            password: hashedPassword,
          }
        });

        console.log('❌ Unique username constraint not working - duplicate username allowed');
        this.testResults.push({ test: 'unique_constraints', status: 'FAIL' });
        return false;
      } catch (duplicateError) {
        console.log('✅ Unique username constraint working');
      }

      this.testResults.push({ test: 'unique_constraints', status: 'PASS' });
      return true;
    } catch (error) {
      console.log('❌ Unique constraints test failed:', error.message);
      this.testResults.push({ test: 'unique_constraints', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test user queries
   */
  async testUserQueries() {
    console.log('\n🔍 Testing User Queries...');
    
    const user = await this.testUserCreation();
    if (!user) {
      console.log('❌ Cannot test queries - user creation failed');
      return false;
    }

    try {
      // Test find by email
      const userByEmail = await this.prisma.user.findUnique({
        where: { email: user.email }
      });

      if (!userByEmail || userByEmail.id !== user.id) {
        console.log('❌ Find by email failed');
        this.testResults.push({ test: 'user_queries', status: 'FAIL' });
        return false;
      }

      // Test find by username
      const userByUsername = await this.prisma.user.findUnique({
        where: { username: user.username }
      });

      if (!userByUsername || userByUsername.id !== user.id) {
        console.log('❌ Find by username failed');
        this.testResults.push({ test: 'user_queries', status: 'FAIL' });
        return false;
      }

      // Test find by ID
      const userById = await this.prisma.user.findUnique({
        where: { id: user.id }
      });

      if (!userById || userById.id !== user.id) {
        console.log('❌ Find by ID failed');
        this.testResults.push({ test: 'user_queries', status: 'FAIL' });
        return false;
      }

      console.log('✅ All user queries working');
      this.testResults.push({ test: 'user_queries', status: 'PASS' });
      return true;
    } catch (error) {
      console.log('❌ User queries test failed:', error.message);
      this.testResults.push({ test: 'user_queries', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test user updates
   */
  async testUserUpdates() {
    console.log('\n✏️ Testing User Updates...');
    
    const user = await this.testUserCreation();
    if (!user) {
      console.log('❌ Cannot test updates - user creation failed');
      return false;
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          playingStatus: 'Playing at Test Casino',
          currentLocation: 'Test Location',
          totalSessions: 5,
          totalWinnings: 250.75
        }
      });

      if (updatedUser.playingStatus === 'Playing at Test Casino' &&
          updatedUser.currentLocation === 'Test Location' &&
          updatedUser.totalSessions === 5 &&
          updatedUser.totalWinnings === 250.75) {
        console.log('✅ User updates working');
        this.testResults.push({ test: 'user_updates', status: 'PASS' });
        return true;
      } else {
        console.log('❌ User updates not persisted correctly');
        this.testResults.push({ test: 'user_updates', status: 'FAIL' });
        return false;
      }
    } catch (error) {
      console.log('❌ User updates test failed:', error.message);
      this.testResults.push({ test: 'user_updates', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test password reset token operations
   */
  async testResetToken() {
    console.log('\n🔑 Testing Reset Token Operations...');
    
    const user = await this.testUserCreation();
    if (!user) {
      console.log('❌ Cannot test reset token - user creation failed');
      return false;
    }

    try {
      const resetToken = 'test_reset_token_' + Date.now();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with reset token
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      });

      if (updatedUser.resetToken === resetToken && updatedUser.resetTokenExpiry) {
        console.log('✅ Reset token storage working');
        
        // Test finding user by reset token
        const userByToken = await this.prisma.user.findFirst({
          where: {
            resetToken,
            resetTokenExpiry: {
              gt: new Date()
            }
          }
        });

        if (userByToken && userByToken.id === user.id) {
          console.log('✅ Reset token query working');
          
          // Clear reset token
          const clearedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              resetToken: null,
              resetTokenExpiry: null
            }
          });

          if (clearedUser.resetToken === null && clearedUser.resetTokenExpiry === null) {
            console.log('✅ Reset token clearing working');
            this.testResults.push({ test: 'reset_token', status: 'PASS' });
            return true;
          } else {
            console.log('❌ Reset token clearing failed');
            this.testResults.push({ test: 'reset_token', status: 'FAIL' });
            return false;
          }
        } else {
          console.log('❌ Reset token query failed');
          this.testResults.push({ test: 'reset_token', status: 'FAIL' });
          return false;
        }
      } else {
        console.log('❌ Reset token storage failed');
        this.testResults.push({ test: 'reset_token', status: 'FAIL' });
        return false;
      }
    } catch (error) {
      console.log('❌ Reset token test failed:', error.message);
      this.testResults.push({ test: 'reset_token', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Test database transactions
   */
  async testTransactions() {
    console.log('\n🔄 Testing Database Transactions...');
    
    const testUser = this.generateTestUser('transaction');
    
    try {
      // Test successful transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        const hashedPassword = await bcrypt.hash(testUser.password, 12);
        
        const user = await prisma.user.create({
          data: {
            email: testUser.email,
            username: testUser.username,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            password: hashedPassword,
          }
        });

        // Update the user within the same transaction
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            totalSessions: 1,
            totalWinnings: 100
          }
        });

        return updatedUser;
      });

      if (result && result.totalSessions === 1 && result.totalWinnings === 100) {
        console.log('✅ Database transactions working');
        this.createdUsers.push(result);
        this.testResults.push({ test: 'transactions', status: 'PASS' });
        return true;
      } else {
        console.log('❌ Transaction result incorrect');
        this.testResults.push({ test: 'transactions', status: 'FAIL' });
        return false;
      }
    } catch (error) {
      console.log('❌ Transaction test failed:', error.message);
      this.testResults.push({ test: 'transactions', status: 'ERROR', error: error.message });
      return false;
    }
  }

  /**
   * Clean up test data
   */
  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      for (const user of this.createdUsers) {
        await this.prisma.user.delete({
          where: { id: user.id }
        });
      }
      console.log(`✅ Cleaned up ${this.createdUsers.length} test users`);
    } catch (error) {
      console.log('⚠️ Some cleanup operations failed:', error.message);
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }

  /**
   * Run all database tests
   */
  async runAllTests() {
    console.log('🗄️ Starting Database Tests...');
    console.log('=' .repeat(50));
    
    const tests = [
      () => this.testConnection(),
      () => this.testUserCreation(),
      () => this.testUniqueConstraints(),
      () => this.testUserQueries(),
      () => this.testUserUpdates(),
      () => this.testResetToken(),
      () => this.testTransactions()
    ];

    for (const test of tests) {
      await test();
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await this.cleanup();
    await this.disconnect();
    this.printResults();
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 DATABASE TEST RESULTS');
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
      console.log('\n🎉 All database tests passed! Database integration is working correctly.');
    } else {
      console.log('\n🔧 Some database tests failed. Check the logs above for details.');
    }
  }
}

// Run database tests immediately
(async () => {
  const tester = new DatabaseTester();
  await tester.runAllTests();
})();
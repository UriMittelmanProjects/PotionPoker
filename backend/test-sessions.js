const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let sessionId = '';

// Generate unique test user to avoid conflicts
const timestamp = Date.now();
const testUser = {
  email: `sessiontest${timestamp}@example.com`,
  password: 'TestPassword123',
  username: `sessiontest${timestamp}`,
  firstName: 'Session',
  lastName: 'Tester'
};

async function runSessionTests() {
  console.log('🧪 Starting Session API Tests...\n');

  try {
    // Step 1: Register test user
    console.log('1️⃣ Registering test user...');
    await axios.post(`${BASE_URL}/auth/register`, testUser, {
      headers: { 'x-test-mode': 'true' }
    });
    console.log('✅ Registration successful');

    // Step 2: Login to get auth token  
    console.log('2️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    }, {
      headers: { 'x-test-mode': 'true' }
    });
    authToken = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    const authHeaders = { 
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      } 
    };

    // Step 3: Create a new session
    console.log('3️⃣ Creating new session...');
    const newSession = {
      sessionType: 'live_casino',
      venue: 'Test Casino',
      address: '123 Test Street, Test City',
      latitude: 40.7128,
      longitude: -74.0060,
      gameType: 'NLH',
      stakes: '1/2',
      initialBuyIn: 200,
      updateStatus: true,
      notifyFriends: false,
      notes: 'Test session for API testing'
    };

    const createResponse = await axios.post(`${BASE_URL}/sessions`, newSession, authHeaders);
    sessionId = createResponse.data.data.id;
    console.log('✅ Session created:', {
      id: sessionId,
      venue: createResponse.data.data.venue,
      totalBuyIn: createResponse.data.data.totalBuyIn
    });
    console.log();

    // Step 4: Get all sessions
    console.log('4️⃣ Fetching all sessions...');
    const sessionsResponse = await axios.get(`${BASE_URL}/sessions`, authHeaders);
    console.log('✅ Sessions retrieved:', {
      count: sessionsResponse.data.data.length,
      total: sessionsResponse.data.pagination.total
    });
    console.log();

    // Step 5: Get specific session
    console.log('5️⃣ Fetching specific session...');
    const sessionResponse = await axios.get(`${BASE_URL}/sessions/${sessionId}`, authHeaders);
    console.log('✅ Session details:', {
      id: sessionResponse.data.data.id,
      venue: sessionResponse.data.data.venue,
      isActive: sessionResponse.data.data.isActive
    });
    console.log();

    // Step 6: Add buy-in
    console.log('6️⃣ Adding buy-in...');
    const buyInResponse = await axios.post(`${BASE_URL}/sessions/${sessionId}/buyin`, 
      { amount: 100 }, 
      authHeaders
    );
    console.log('✅ Buy-in added:', {
      newTotal: buyInResponse.data.data.totalBuyIn,
      buyInsCount: buyInResponse.data.data.buyIns.length
    });
    console.log();

    // Step 7: Update session
    console.log('7️⃣ Updating session...');
    const updateResponse = await axios.put(`${BASE_URL}/sessions/${sessionId}`, 
      { 
        handsPlayed: 45,
        notes: 'Updated notes - played some good hands!'
      }, 
      authHeaders
    );
    console.log('✅ Session updated:', {
      handsPlayed: updateResponse.data.data.handsPlayed,
      notes: updateResponse.data.data.notes
    });
    console.log();

    // Step 8: Get location suggestions
    console.log('8️⃣ Getting location suggestions...');
    const suggestionsResponse = await axios.get(`${BASE_URL}/sessions/location-suggestions`, authHeaders);
    console.log('✅ Location suggestions:', suggestionsResponse.data.data);
    console.log();

    // Step 9: Get session statistics
    console.log('9️⃣ Getting session statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/sessions/stats`, authHeaders);
    console.log('✅ Session stats:', {
      totalSessions: statsResponse.data.data.totalSessions,
      activeSessions: statsResponse.data.data.activeSessions,
      totalProfit: statsResponse.data.data.totalProfit
    });
    console.log();

    // Step 10: End session
    console.log('🔟 Ending session...');
    const endResponse = await axios.post(`${BASE_URL}/sessions/${sessionId}/end`, 
      { 
        cashOut: 450,
        handsPlayed: 67,
        notes: 'Great session! Won a big pot with AA vs KK'
      }, 
      authHeaders
    );
    console.log('✅ Session ended:', {
      cashOut: endResponse.data.data.cashOut,
      profit: endResponse.data.data.profit,
      duration: endResponse.data.data.duration,
      isComplete: endResponse.data.data.isComplete
    });
    console.log();

    // Step 11: Final statistics check
    console.log('1️⃣1️⃣ Final statistics check...');
    const finalStatsResponse = await axios.get(`${BASE_URL}/sessions/stats`, authHeaders);
    console.log('✅ Final stats:', {
      completedSessions: finalStatsResponse.data.data.completedSessions,
      totalProfit: finalStatsResponse.data.data.totalProfit,
      hourlyRate: finalStatsResponse.data.data.hourlyRate.toFixed(2)
    });

    console.log('\n🎉 All session tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Make sure you have a test user registered with email: test@example.com');
    }
    
    process.exit(1);
  }
}

// Run tests
runSessionTests();
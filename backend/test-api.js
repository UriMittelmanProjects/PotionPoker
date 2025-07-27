const http = require('http');

// Test the health endpoint
const testHealth = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Health check status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Health check response:', response);
        
        if (response.success) {
          console.log('✅ Backend is running successfully!');
          testRegister();
        } else {
          console.log('❌ Health check failed');
        }
      } catch (error) {
        console.error('Failed to parse health response:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Health check failed:', error.message);
  });

  req.end();
};

// Test registration endpoint
const testRegister = () => {
  const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'TestPassword123',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User'
  });

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

  const req = http.request(options, (res) => {
    console.log(`Register test status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Register response:', response);
        
        if (res.statusCode === 201 && response.success) {
          console.log('✅ Registration endpoint working!');
          testLogin();
        } else {
          console.log('Register response details:', response);
        }
      } catch (error) {
        console.error('Failed to parse register response:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Register test failed:', error.message);
  });

  req.write(postData);
  req.end();
};

// Test login endpoint
const testLogin = () => {
  const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'TestPassword123'
  });

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

  const req = http.request(options, (res) => {
    console.log(`Login test status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Login response:', response);
        
        if (res.statusCode === 200 && response.success) {
          console.log('✅ Login endpoint working!');
          console.log('🎉 Auth flow is fully functional!');
        } else {
          console.log('Login response details:', response);
        }
      } catch (error) {
        console.error('Failed to parse login response:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Login test failed:', error.message);
  });

  req.write(postData);
  req.end();
};

// Wait a moment for server to start, then test
setTimeout(() => {
  console.log('Testing backend API endpoints...');
  testHealth();
}, 2000);
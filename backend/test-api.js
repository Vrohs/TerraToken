const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testAPI = async () => {
  try {
    // Test basic server connection
    console.log('Testing server connection...');
    const rootResponse = await axios.get('http://localhost:5000/');
    console.log(`Server response: ${rootResponse.data.message}\n`);

    // Test user registration
    console.log('Testing user registration...');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
      });
      console.log('Registration successful:', registerResponse.data);
    } catch (err) {
      if (err.response && err.response.data.error === 'User already exists') {
        console.log('User already exists, continuing with tests...');
      } else {
        throw err;
      }
    }

    // Test user login
    console.log('\nTesting user login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login successful:', loginResponse.data.success);
    
    const token = loginResponse.data.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    // Test getting user profile
    console.log('\nTesting user profile retrieval...');
    const profileResponse = await axios.get(`${API_URL}/auth/me`, config);
    console.log('User profile:', profileResponse.data);

    // Test getting projects
    console.log('\nTesting project retrieval...');
    const projectsResponse = await axios.get(`${API_URL}/projects`);
    console.log(`Retrieved ${projectsResponse.data.count} projects`);
    if (projectsResponse.data.count > 0) {
      console.log('First project:', projectsResponse.data.data[0].name);
    }

    // Test getting carbon credits
    console.log('\nTesting carbon credit retrieval...');
    const creditsResponse = await axios.get(`${API_URL}/carbon-credits`);
    console.log(`Retrieved ${creditsResponse.data.count} carbon credits`);
    if (creditsResponse.data.count > 0) {
      console.log('First credit serial number:', creditsResponse.data.data[0].serialNumber);
    }

    // Test getting marketplace listings
    console.log('\nTesting marketplace listings...');
    const marketplaceResponse = await axios.get(`${API_URL}/marketplace`);
    console.log(`Retrieved ${marketplaceResponse.data.count} marketplace listings`);
    
    // Test getting marketplace stats
    console.log('\nTesting marketplace statistics...');
    const statsResponse = await axios.get(`${API_URL}/marketplace/stats`);
    console.log('Marketplace statistics:', statsResponse.data.data);

    console.log('\nAPI tests completed successfully!');
  } catch (error) {
    console.error('API Test Error:', error.response ? error.response.data : error.message);
  }
};

// Wait for server to start before running tests
setTimeout(testAPI, 5000);

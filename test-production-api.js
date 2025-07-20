// Test script to debug production API issues

const API_BASE_URL = 'https://prepstech-task-manager.onrender.com';

async function testEndpoint(endpoint, method = 'GET', body = null) {
    console.log(`\n🔍 Testing ${method} ${API_BASE_URL}${endpoint}`);
    
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
        
        if (response.status === 405) {
            console.log('❌ Method Not Allowed - This suggests routing or CORS issue');
        }
        
        const text = await response.text();
        try {
            const json = JSON.parse(text);
            console.log('Response:', json);
        } catch {
            console.log('Response (text):', text);
        }
        
        return response;
    } catch (error) {
        console.log('❌ Error:', error.message);
        return null;
    }
}

async function runTests() {
    console.log('🚀 Testing Production API Endpoints');
    console.log('=====================================');
    
    // Test basic health endpoints
    await testEndpoint('/api/health');
    await testEndpoint('/api/system/health');
    
    // Test auth endpoints
    await testEndpoint('/api/auth/signup', 'POST', {
        email: 'test@example.com',
        password: 'TestPassword123!'
    });
    
    await testEndpoint('/api/auth/login', 'POST', {
        email: 'test@example.com', 
        password: 'TestPassword123!'
    });
    
    // Test tasks endpoint (should fail without auth)
    await testEndpoint('/api/tasks');
    
    console.log('\n✅ Test completed');
}

runTests().catch(console.error);

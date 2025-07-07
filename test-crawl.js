// Test crawl endpoint
async function testCrawl() {
  const baseUrl = 'https://websyte.ai';
  const widgetId = '386afbd3-805e-45c5-985c-9ba7ee991403';
  
  // Get auth token from cookies or prompt
  const authToken = prompt('Enter your auth token (from browser cookies)');
  
  const response = await fetch(`${baseUrl}/api/widgets/${widgetId}/crawl`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `better-auth.session_token=${authToken}`
    },
    body: JSON.stringify({
      url: 'https://example.com',
      maxPages: 5
    })
  });
  
  console.log('Status:', response.status);
  console.log('Headers:', response.headers);
  
  const result = await response.json();
  console.log('Response:', result);
}

// Run in browser console
console.log('Copy and run this function in the browser console while logged in:');
console.log(testCrawl.toString());
console.log('testCrawl()');
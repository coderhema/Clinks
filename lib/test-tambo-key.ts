/**
 * Tambo API Key Test Utility
 * Run this to verify your Tambo API key is working correctly
 */

export async function testTamboApiKey(apiKey: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Validate API key format
    if (!apiKey || apiKey === 'your_api_key_here') {
      return {
        success: false,
        message: 'API key is not configured',
        details: { error: 'Missing or placeholder API key' },
      };
    }

    if (apiKey.length < 20) {
      return {
        success: false,
        message: 'API key appears invalid (too short)',
        details: { length: apiKey.length },
      };
    }

    if (!apiKey.startsWith('tambo_')) {
      return {
        success: false,
        message: 'API key does not start with "tambo_"',
        details: { prefix: apiKey.substring(0, 10) },
      };
    }

    // Test API connection with a simple request
    console.log('Testing Tambo API connection...');

    const response = await fetch('https://api.tambo.co/v1/beta/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: `API request failed with status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          error: data,
        },
      };
    }

    return {
      success: true,
      message: 'API key is valid and working!',
      details: {
        threadId: data.id || 'created',
        status: response.status,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to connect to Tambo API',
      details: {
        error: error.message,
        name: error.name,
      },
    };
  }
}

// Browser-based test function
export async function testTamboApiKeyInBrowser(): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY || '';

  console.log('=== Tambo API Key Test ===');
  console.log('API Key length:', apiKey.length);
  console.log('Starts with tambo_:', apiKey.startsWith('tambo_'));
  console.log('First 20 chars:', apiKey.substring(0, 20) + '...');

  const result = await testTamboApiKey(apiKey);

  console.log('\n=== Test Result ===');
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  if (result.details) {
    console.log('Details:', result.details);
  }

  return;
}

// Node.js test (for server-side testing)
if (typeof window === 'undefined' && require.main === module) {
  testTamboApiKeyInBrowser().then(() => {
    console.log('\nTest complete!');
  });
}

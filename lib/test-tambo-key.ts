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
    if (!apiKey || apiKey === "your_api_key_here") {
      return {
        success: false,
        message: "API key is not configured",
        details: { error: "Missing or placeholder API key" },
      };
    }

    if (apiKey.length < 20) {
      return {
        success: false,
        message: "API key appears invalid (too short)",
        details: { length: apiKey.length },
      };
    }

    if (!apiKey.startsWith("tambo_")) {
      return {
        success: false,
        message: 'API key does not start with "tambo_"',
        details: { prefix: apiKey.substring(0, 10) },
      };
    }

    // Check for problematic characters in API key
    const hasSpecialChars = /[\/\+\=]/.test(apiKey);
    console.log("🔍 API Key Diagnostics:");
    console.log("  Length:", apiKey.length);
    console.log("  Has special chars (/, +, =):", hasSpecialChars);
    console.log("  First 25 chars:", apiKey.substring(0, 25) + "...");
    console.log(
      "  Last 10 chars:",
      "..." + apiKey.substring(apiKey.length - 10),
    );

    // Test API connection with a simple request
    console.log("🌐 Testing Tambo API connection...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch("https://api.tambo.co/v1/beta/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);
      console.log(
        "📡 Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ API Error Response:", data);
        return {
          success: false,
          message: `API request failed with status ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            error: data,
            headers: Object.fromEntries(response.headers.entries()),
          },
        };
      }

      console.log("✅ API Response successful:", data);
      return {
        success: true,
        message: "API key is valid and working!",
        details: {
          threadId: data.id || "created",
          status: response.status,
        },
      };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("🚨 Fetch Error:", {
        message: fetchError.message,
        name: fetchError.name,
        stack: fetchError.stack,
      });
      throw fetchError;
    }
  } catch (error: any) {
    console.error("🚨 Test Error:", error);
    return {
      success: false,
      message: "Failed to connect to Tambo API",
      details: {
        error: error.message,
        name: error.name,
        stack: error.stack?.split("\n").slice(0, 3).join("\n"),
      },
    };
  }
}

// Browser-based test function
export async function testTamboApiKeyInBrowser(): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_TOKEN || "";

  console.log("=== 🔬 Tambo API Key Test ===");
  console.log("API Key length:", apiKey.length);
  console.log("Starts with tambo_:", apiKey.startsWith("tambo_"));
  console.log("First 20 chars:", apiKey.substring(0, 20) + "...");
  console.log("Contains special chars:", /[\/\+\=]/.test(apiKey));

  const result = await testTamboApiKey(apiKey);

  console.log("\n=== 📊 Test Result ===");
  console.log("Success:", result.success ? "✅" : "❌");
  console.log("Message:", result.message);
  if (result.details) {
    console.log("Details:", result.details);
  }

  return;
}

// Diagnostic function for stream errors
export async function diagnoseStreamError(): Promise<void> {
  console.log("=== 🔍 Tambo Stream Error Diagnostics ===");

  const apiKey = process.env.NEXT_PUBLIC_TAMBO_TOKEN || "";

  console.log("\n1️⃣ Environment Check:");
  console.log("  - API Key exists:", !!apiKey);
  console.log("  - API Key length:", apiKey.length);
  console.log("  - Starts with 'tambo_':", apiKey.startsWith("tambo_"));
  console.log("  - Contains forward slash (/):", apiKey.includes("/"));
  console.log("  - Contains plus (+):", apiKey.includes("+"));
  console.log("  - Contains equals (=):", apiKey.includes("="));

  console.log("\n2️⃣ Browser Environment:");
  console.log("  - User Agent:", navigator.userAgent);
  console.log("  - Online:", navigator.onLine);
  console.log("  - Language:", navigator.language);

  console.log("\n3️⃣ Network Test:");
  try {
    const start = Date.now();
    const response = await fetch("https://api.tambo.co/health", {
      method: "GET",
    });
    const duration = Date.now() - start;
    console.log("  - Health check status:", response.status);
    console.log("  - Response time:", duration + "ms");
    console.log(
      "  - CORS headers:",
      response.headers.get("access-control-allow-origin"),
    );
  } catch (error: any) {
    console.error("  - Health check failed:", error.message);
  }

  console.log("\n4️⃣ API Key Test:");
  const result = await testTamboApiKey(apiKey);
  console.log("  - Test result:", result.success ? "✅ PASS" : "❌ FAIL");
  console.log("  - Message:", result.message);

  if (!result.success) {
    console.log("\n⚠️ TROUBLESHOOTING STEPS:");
    console.log("1. Check that your .env.local file has:");
    console.log("   NEXT_PUBLIC_TAMBO_TOKEN=tambo_your_key_here");
    console.log("2. Make sure there are NO quotes around the API key");
    console.log("3. Restart your dev server after changing .env.local");
    console.log("4. Hard refresh your browser (Ctrl+Shift+R)");
    console.log("5. Check browser console for CORS errors");
    console.log("6. Verify your API key at https://tambo.co/dashboard");
  }

  console.log("\n=== End Diagnostics ===");
}

// Node.js test (for server-side testing)
if (typeof window === "undefined" && require.main === module) {
  testTamboApiKeyInBrowser().then(() => {
    console.log("\nTest complete!");
  });
}

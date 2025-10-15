"use client";

import {
  AlertCircle,
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { testTamboApiKey } from "@/lib/test-tambo-key";

export function TamboSetupHelp() {
  const [copied, setCopied] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null,
  );
  const [testMessage, setTestMessage] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black border-2 border-warning/50 p-6 space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-white/10 pb-4">
        <AlertCircle className="h-6 w-6 text-warning flex-shrink-0" />
        <div>
          <h3 className="text-white font-bold text-lg uppercase tracking-wider mb-1">
            Tambo API Key Required
          </h3>
          <p className="text-gray-400 text-sm">
            Configure your API key to enable the AI assistant
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center border-2 border-primary/50">
              1
            </div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Get Your API Key
            </h4>
          </div>
          <div className="ml-8 space-y-2">
            <p className="text-gray-400 text-sm">
              Sign up for a free account at Tambo and get your API key:
            </p>
            <a
              href="https://tambo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/20 px-4 py-2 text-primary hover:bg-white/10 transition-colors duration-200"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="font-bold text-sm">Visit tambo.co</span>
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center border-2 border-primary/50">
              2
            </div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Create .env.local File
            </h4>
          </div>
          <div className="ml-8 space-y-2">
            <p className="text-gray-400 text-sm">
              In your project root, create or edit{" "}
              <code className="bg-white/10 px-2 py-1 text-primary text-xs font-mono">
                .env.local
              </code>
            </p>
            <div className="bg-neutral-900 border border-white/20 p-3 relative group">
              <code className="text-success text-xs font-mono block">
                NEXT_PUBLIC_TAMBO_API_KEY=your_api_key_here
              </code>
              <button
                onClick={() =>
                  copyToClipboard("NEXT_PUBLIC_TAMBO_API_KEY=your_api_key_here")
                }
                className="absolute top-2 right-2 bg-white/5 border border-white/20 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center border-2 border-primary/50">
              3
            </div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Replace with Your Key
            </h4>
          </div>
          <div className="ml-8">
            <p className="text-gray-400 text-sm">
              Replace{" "}
              <code className="bg-white/10 px-2 py-1 text-warning text-xs font-mono">
                your_api_key_here
              </code>{" "}
              with your actual Tambo API key
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center border-2 border-primary/50">
              4
            </div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Restart Dev Server
            </h4>
          </div>
          <div className="ml-8 space-y-2">
            <p className="text-gray-400 text-sm">
              Stop and restart your development server:
            </p>
            <div className="bg-neutral-900 border border-white/20 p-3">
              <code className="text-primary text-xs font-mono block">
                npx pnpm run dev
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-warning/10 border border-warning/30 p-3 mt-4">
        <p className="text-warning text-xs font-mono">
          ⚠️ Important: Never commit .env.local to version control. It's already
          in your .gitignore
        </p>
      </div>

      {/* Help Link */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-gray-500 text-xs">
          Need help? Check the{" "}
          <a
            href="https://docs.tambo.co/getting-started/integrate"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline"
          >
            Tambo documentation
          </a>{" "}
          or see{" "}
          <code className="bg-white/10 px-2 py-1 text-primary">
            TAMBO_INTEGRATION.md
          </code>{" "}
          in your project root
        </p>
      </div>

      {/* Test API Key Button */}
      <div className="border-t border-white/10 pt-4">
        <button
          onClick={async () => {
            setTestingKey(true);
            setTestResult(null);
            setTestMessage("");

            try {
              const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY || "";
              const result = await testTamboApiKey(apiKey);

              setTestResult(result.success ? "success" : "error");
              setTestMessage(result.message);

              console.log("Tambo API Test Result:", result);
            } catch (err: any) {
              setTestResult("error");
              setTestMessage(err.message || "Test failed");
            } finally {
              setTestingKey(false);
            }
          }}
          disabled={testingKey}
          className="w-full bg-primary/20 border-2 border-primary/50 text-white px-4 py-3 hover:bg-primary/30 transition-colors duration-200 flex items-center justify-center gap-2 font-bold uppercase text-sm tracking-wider disabled:opacity-50"
        >
          {testingKey ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Test API Key
            </>
          )}
        </button>

        {testResult && (
          <div
            className={`mt-3 p-3 border-2 ${testResult === "success" ? "bg-success/10 border-success/50" : "bg-warning/10 border-warning/50"}`}
          >
            <div className="flex items-center gap-2">
              {testResult === "success" ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-warning" />
              )}
              <p
                className={`text-sm font-mono ${testResult === "success" ? "text-success" : "text-warning"}`}
              >
                {testMessage}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

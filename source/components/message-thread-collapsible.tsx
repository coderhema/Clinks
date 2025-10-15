"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Sparkles, AlertCircle } from "lucide-react";
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { TamboSetupHelp } from "./tambo-setup-help";

// Inner component that uses Tambo hooks
function TamboChat() {
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  try {
    const { thread } = useTamboThread();
    const {
      value,
      setValue,
      submit,
      isPending,
      isError,
      error: submitError,
    } = useTamboThreadInput();

    const messages = thread?.messages || [];

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!value.trim() || isPending) return;

      try {
        setError(null);
        await submit();
      } catch (err: any) {
        console.error("Error submitting message:", err);
        setError(
          "⚡ Failed to send message\n\nPlease check:\n1. Your API key in .env.local is correct\n2. The key has no quotes around it\n3. You restarted dev server after adding the key\n4. Check browser console for details",
        );
      }
    };

    // Update error from submit
    useEffect(() => {
      if (isError && submitError) {
        setError(
          submitError.message || "An error occurred while sending your message",
        );
      }
    }, [isError, submitError]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages.length]);

    return (
      <>
        {/* Messages */}
        <div className="relative flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-900/50">
          {error && (
            <div className="bg-warning/20 border-2 border-warning/50 p-4 mb-4 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-warning text-sm font-bold mb-1 uppercase tracking-wider">
                    Error
                  </p>
                  <p className="text-white text-xs font-mono whitespace-pre-wrap">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-warning hover:text-warning/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <div className="relative inline-block">
                <MessageSquare className="h-20 w-20 mx-auto mb-4 opacity-20" />
                <div className="absolute inset-0 blur-xl bg-primary/20" />
              </div>
              <p className="text-lg font-bold mb-2 text-white uppercase tracking-wider">
                AI Workflow Assistant
              </p>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Ask me to add nodes, connect workflows, or help with your AI
                pipeline
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 max-w-md mx-auto text-xs">
                <div className="bg-white/5 border border-white/10 p-3 text-left">
                  <span className="text-primary">•</span> "Add a text generator
                  node"
                </div>
                <div className="bg-white/5 border border-white/10 p-3 text-left">
                  <span className="text-primary">•</span> "Create an image
                  workflow"
                </div>
                <div className="bg-white/5 border border-white/10 p-3 text-left">
                  <span className="text-primary">•</span> "Connect nodes
                  together"
                </div>
                <div className="bg-white/5 border border-white/10 p-3 text-left">
                  <span className="text-primary">•</span> "Help me generate a
                  logo"
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[80%] border-2 p-4 relative group ${
                      message.role === "user"
                        ? "bg-primary/20 border-primary/50 text-white"
                        : "bg-white/5 border-white/20 text-gray-200"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    )}

                    <div className="relative">
                      {message.content && message.content[0]?.text && (
                        <p className="text-sm leading-relaxed font-mono">
                          {message.content[0].text}
                        </p>
                      )}
                      {message.renderedComponent && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          {message.renderedComponent}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isPending && (
                <div className="flex justify-start animate-in fade-in duration-200">
                  <div className="bg-white/5 border-2 border-white/20 p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="relative p-4 border-t-2 border-white/20 bg-black/80"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ask AI to help with your workflow..."
                className="w-full px-4 py-3 bg-neutral-900 border-2 border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-mono text-sm"
                disabled={isPending}
                autoFocus
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={isPending || !value.trim()}
              className="px-6 py-3 bg-primary text-white font-bold uppercase tracking-wider text-sm hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border-2 border-primary hover:shadow-lg hover:shadow-primary/50 disabled:hover:shadow-none relative group"
            >
              <span className="relative z-10">
                {isPending ? "Thinking..." : "Send"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </form>

        {/* Loading indicator in header when pending */}
        {isPending && (
          <div className="absolute top-4 right-16 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-75" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-150" />
          </div>
        )}
      </>
    );
  } catch (err) {
    console.error("Tambo initialization error:", err);
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <TamboSetupHelp />
      </div>
    );
  }
}

// Main component
export function MessageThreadCollapsible() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Check for API key on mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      setHasApiKey(false);
    } else {
      setHasApiKey(true);
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Chat Interface - Slides up from bottom */}
      {isOpen && (
        <div className="w-[700px] max-w-[calc(100vw-2rem)] mb-4 animate-in slide-in-from-bottom duration-300">
          <div className="bg-black border-2 border-white/20 shadow-2xl flex flex-col h-[600px] backdrop-blur-sm relative overflow-hidden">
            {/* Cyberpunk glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between p-4 border-b-2 border-white/20 bg-black/80">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <div className="absolute inset-0 blur-md bg-primary/50" />
                </div>
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                  AI Assistant
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200 hover:bg-white/5 p-2 border border-transparent hover:border-white/20"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - conditionally render Tambo or setup help */}
            {hasApiKey ? (
              <TamboChat />
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
                <TamboSetupHelp />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Button - Always at bottom center */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-primary text-white px-8 py-4 mb-6 shadow-2xl hover:bg-primary/90 transition-all duration-300 hover:shadow-primary/50 flex items-center gap-3 group border-2 border-primary/50 hover:border-primary overflow-hidden"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_100%] animate-gradient" />

        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 blur-xl bg-primary/50" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <MessageSquare className="h-5 w-5 transition-transform group-hover:scale-110 duration-300" />
          <span className="font-bold uppercase tracking-wider text-sm">
            {isOpen ? "Close AI" : "AI Assistant"}
          </span>
          {!hasApiKey && (
            <div className="bg-warning text-white text-xs font-bold px-2 py-1 flex items-center justify-center border-2 border-warning">
              SETUP
            </div>
          )}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/50" />
      </button>
    </div>
  );
}

"use client"

import { useState, useEffect } from "react"
import { X, Eye, EyeOff, Bell, Zap, Download, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("ai-provider")
  const [settings, setSettings] = useState({
    apiProvider: "groq",
    temperature: 0.7,
    maxTokens: 500,
    autoSave: true,
    gridSize: 20,
    snapToGrid: true,
    darkMode: true,
    previewMode: "auto",
    apiKeys: {
      openrouter: "",
      openai: "",
      groq: "",
    },
    execution: {
      timeout: 300, // seconds
      retryAttempts: 3,
      parallelExecution: false,
      autoRetryOnError: true,
    },
    export: {
      imageFormat: "png",
      imageQuality: 90,
      videoFormat: "mp4",
      audioFormat: "mp3",
      includeMetadata: true,
    },
    notifications: {
      workflowComplete: true,
      nodeErrors: true,
      soundEnabled: false,
      browserNotifications: true,
    },
    performance: {
      cacheResults: true,
      maxCacheSize: 100, // MB
      preloadModels: false,
      lowMemoryMode: false,
    },
    advanced: {
      customSystemPrompt: "",
      modelOverrides: {
        "text-input": "llama-3.1-70b-versatile",
        "image-gen": "dall-e-3",
        "video-gen": "runway-gen2",
        "audio-gen": "musicgen-large",
      },
      enableStreaming: true,
    },
  })

  const [showApiKeys, setShowApiKeys] = useState({
    openrouter: false,
    openai: false,
    groq: false,
  })

  useEffect(() => {
    const savedSettings = localStorage.getItem("workflow-settings")
    if (savedSettings) {
      setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }))
    }
  }, [])

  if (!isOpen) return null

  const handleSave = () => {
    localStorage.setItem("workflow-settings", JSON.stringify(settings))
    onClose()
  }

  const handleReset = () => {
    setSettings({
      apiProvider: "groq",
      temperature: 0.7,
      maxTokens: 500,
      autoSave: true,
      gridSize: 20,
      snapToGrid: true,
      darkMode: true,
      previewMode: "auto",
      apiKeys: {
        openrouter: "",
        openai: "",
        groq: "",
      },
      execution: {
        timeout: 300,
        retryAttempts: 3,
        parallelExecution: false,
        autoRetryOnError: true,
      },
      export: {
        imageFormat: "png",
        imageQuality: 90,
        videoFormat: "mp4",
        audioFormat: "mp3",
        includeMetadata: true,
      },
      notifications: {
        workflowComplete: true,
        nodeErrors: true,
        soundEnabled: false,
        browserNotifications: true,
      },
      performance: {
        cacheResults: true,
        maxCacheSize: 100,
        preloadModels: false,
        lowMemoryMode: false,
      },
      advanced: {
        customSystemPrompt: "",
        modelOverrides: {
          "text-input": "llama-3.1-70b-versatile",
          "image-gen": "dall-e-3",
          "video-gen": "runway-gen2",
          "audio-gen": "musicgen-large",
        },
        enableStreaming: true,
      },
    })
  }

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider as keyof typeof prev],
    }))
  }

  const tabs = [
    { id: "ai-provider", label: "AI Provider", icon: Cpu },
    { id: "execution", label: "Execution", icon: Zap },
    { id: "export", label: "Export", icon: Download },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "performance", label: "Performance", icon: Cpu },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/20 rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 bg-neutral-800 border-r border-white/20">
          <div className="p-4 border-b border-white/20">
            <h2 className="text-lg font-bold text-white">Settings</h2>
          </div>
          <div className="p-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h3 className="text-xl font-bold text-white">{tabs.find((tab) => tab.id === activeTab)?.label} Settings</h3>
            <Button onClick={onClose} className="bg-transparent hover:bg-white/10 text-white border-0 p-2" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "ai-provider" && (
              <div className="space-y-6">
                {/* AI Provider Settings */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Provider Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">API Provider</label>
                      <select
                        value={settings.apiProvider}
                        onChange={(e) => setSettings((prev) => ({ ...prev, apiProvider: e.target.value }))}
                        className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="groq">Groq (Connected)</option>
                        <option value="openrouter">OpenRouter (Bring Your Own Key)</option>
                        <option value="openai">OpenAI (Bring Your Own Key)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Temperature ({settings.temperature})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, temperature: Number.parseFloat(e.target.value) }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* API Keys */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">API Keys</h4>
                  <div className="space-y-4">
                    {/* OpenRouter API Key */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">OpenRouter API Key</label>
                      <div className="relative">
                        <input
                          type={showApiKeys.openrouter ? "text" : "password"}
                          value={settings.apiKeys.openrouter}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              apiKeys: { ...prev.apiKeys, openrouter: e.target.value },
                            }))
                          }
                          placeholder="sk-or-v1-..."
                          className="w-full bg-neutral-800 border border-white/20 text-white p-3 pr-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button
                          type="button"
                          onClick={() => toggleApiKeyVisibility("openrouter")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 text-gray-400 border-0 p-2"
                          size="sm"
                        >
                          {showApiKeys.openrouter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* OpenAI API Key */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">OpenAI API Key</label>
                      <div className="relative">
                        <input
                          type={showApiKeys.openai ? "text" : "password"}
                          value={settings.apiKeys.openai}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              apiKeys: { ...prev.apiKeys, openai: e.target.value },
                            }))
                          }
                          placeholder="sk-..."
                          className="w-full bg-neutral-800 border border-white/20 text-white p-3 pr-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button
                          type="button"
                          onClick={() => toggleApiKeyVisibility("openai")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 text-gray-400 border-0 p-2"
                          size="sm"
                        >
                          {showApiKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generation Settings */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Generation</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Tokens</label>
                      <input
                        type="number"
                        value={settings.maxTokens}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, maxTokens: Number.parseInt(e.target.value) }))
                        }
                        className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="50"
                        max="2000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Preview Mode</label>
                      <select
                        value={settings.previewMode}
                        onChange={(e) => setSettings((prev) => ({ ...prev, previewMode: e.target.value }))}
                        className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="auto">Auto</option>
                        <option value="manual">Manual</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "execution" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Workflow Execution</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Timeout ({settings.execution.timeout}s)
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="600"
                        step="30"
                        value={settings.execution.timeout}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            execution: { ...prev.execution, timeout: Number.parseInt(e.target.value) },
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Retry Attempts</label>
                      <input
                        type="number"
                        value={settings.execution.retryAttempts}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            execution: { ...prev.execution, retryAttempts: Number.parseInt(e.target.value) },
                          }))
                        }
                        className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="10"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.execution.parallelExecution}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            execution: { ...prev.execution, parallelExecution: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Enable Parallel Execution</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.execution.autoRetryOnError}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            execution: { ...prev.execution, autoRetryOnError: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Auto Retry on Error</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "export" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Export Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Image Format</label>
                      <select
                        value={settings.export.imageFormat}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            export: { ...prev.export, imageFormat: e.target.value },
                          }))
                        }
                        className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Image Quality</label>
                      <input
                        type="number"
                        value={settings.export.imageQuality}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            export: { ...prev.export, imageQuality: Number.parseInt(e.target.value) },
                          }))
                        }
                        className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Video Format</label>
                      <select
                        value={settings.export.videoFormat}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            export: { ...prev.export, videoFormat: e.target.value },
                          }))
                        }
                        className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="mp4">MP4</option>
                        <option value="mov">MOV</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Audio Format</label>
                      <select
                        value={settings.export.audioFormat}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            export: { ...prev.export, audioFormat: e.target.value },
                          }))
                        }
                        className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="mp3">MP3</option>
                        <option value="wav">WAV</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Notification Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.notifications.workflowComplete}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, workflowComplete: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Workflow Complete Notifications</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.notifications.nodeErrors}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, nodeErrors: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Node Error Notifications</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.notifications.soundEnabled}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, soundEnabled: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Sound Notifications</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.notifications.browserNotifications}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, browserNotifications: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Browser Notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Performance Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Cache Results</label>
                      <input
                        type="checkbox"
                        checked={settings.performance.cacheResults}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            performance: { ...prev.performance, cacheResults: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Cache Size ({settings.performance.maxCacheSize} MB)
                      </label>
                      <input
                        type="number"
                        value={settings.performance.maxCacheSize}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            performance: { ...prev.performance, maxCacheSize: Number.parseInt(e.target.value) },
                          }))
                        }
                        className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="10"
                        max="500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Preload Models</label>
                      <input
                        type="checkbox"
                        checked={settings.performance.preloadModels}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            performance: { ...prev.performance, preloadModels: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Low Memory Mode</label>
                      <input
                        type="checkbox"
                        checked={settings.performance.lowMemoryMode}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            performance: { ...prev.performance, lowMemoryMode: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "advanced" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Advanced Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Custom System Prompt</label>
                      <input
                        type="text"
                        value={settings.advanced.customSystemPrompt}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            advanced: { ...prev.advanced, customSystemPrompt: e.target.value },
                          }))
                        }
                        placeholder="Enter custom system prompt"
                        className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Model Overrides</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Text Input</label>
                        <select
                          value={settings.advanced.modelOverrides["text-input"]}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              advanced: {
                                ...prev.advanced,
                                modelOverrides: { ...prev.advanced.modelOverrides, "text-input": e.target.value },
                              },
                            }))
                          }
                          className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="llama-3.1-70b-versatile">Llama 3.1 70B Versatile</option>
                          <option value="gpt-4">GPT-4</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Image Gen</label>
                        <select
                          value={settings.advanced.modelOverrides["image-gen"]}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              advanced: {
                                ...prev.advanced,
                                modelOverrides: { ...prev.advanced.modelOverrides, "image-gen": e.target.value },
                              },
                            }))
                          }
                          className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="dall-e-3">DALL-E 3</option>
                          <option value="stable-diffusion">Stable Diffusion</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Video Gen</label>
                        <select
                          value={settings.advanced.modelOverrides["video-gen"]}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              advanced: {
                                ...prev.advanced,
                                modelOverrides: { ...prev.advanced.modelOverrides, "video-gen": e.target.value },
                              },
                            }))
                          }
                          className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="runway-gen2">Runway Gen2</option>
                          <option value="midjourney">Midjourney</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Audio Gen</label>
                        <select
                          value={settings.advanced.modelOverrides["audio-gen"]}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              advanced: {
                                ...prev.advanced,
                                modelOverrides: { ...prev.advanced.modelOverrides, "audio-gen": e.target.value },
                              },
                            }))
                          }
                          className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="musicgen-large">MusicGen Large</option>
                          <option value="waveglow">WaveGlow</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.advanced.enableStreaming}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            advanced: { ...prev.advanced, enableStreaming: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Enable Streaming</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

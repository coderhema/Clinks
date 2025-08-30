"use client"

import { useState } from "react"
import { X, Save, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    apiProvider: "groq",
    openrouterApiKey: "",
    geminiApiKey: "",
    temperature: 0.7,
    maxTokens: 500,
    autoSave: true,
    gridSize: 20,
    snapToGrid: true,
    darkMode: true,
    previewMode: "auto",
  })

  if (!isOpen) return null

  const handleSave = () => {
    localStorage.setItem("workflow-settings", JSON.stringify(settings))
    onClose()
  }

  const handleReset = () => {
    setSettings({
      apiProvider: "groq",
      openrouterApiKey: "",
      geminiApiKey: "",
      temperature: 0.7,
      maxTokens: 500,
      autoSave: true,
      gridSize: 20,
      snapToGrid: true,
      darkMode: true,
      previewMode: "auto",
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/20 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Workflow Settings</h2>
          <Button onClick={onClose} className="bg-transparent hover:bg-white/10 text-white border-0 p-2" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AI Provider Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">AI Provider</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Provider</label>
                <select
                  value={settings.apiProvider}
                  onChange={(e) => setSettings((prev) => ({ ...prev, apiProvider: e.target.value }))}
                  className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="groq">Groq (Connected)</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="openai" disabled>
                    OpenAI (Not Connected)
                  </option>
                  <option value="gemini">Gemini</option>
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
                  onChange={(e) => setSettings((prev) => ({ ...prev, temperature: Number.parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* OpenRouter API key input field */}
            {settings.apiProvider === "openrouter" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">OpenRouter API Key</label>
                <input
                  type="password"
                  value={settings.openrouterApiKey}
                  onChange={(e) => setSettings((prev) => ({ ...prev, openrouterApiKey: e.target.value }))}
                  placeholder="Enter your OpenRouter API key"
                  className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Get your API key from{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    openrouter.ai/keys
                  </a>
                </p>
              </div>
            )}

            {/* Gemini API key input field */}
            {settings.apiProvider === "gemini" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gemini API Key</label>
                <input
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings((prev) => ({ ...prev, geminiApiKey: e.target.value }))}
                  placeholder="Enter your Gemini API key"
                  className="w-full bg-neutral-800 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Get your API key from{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Generation Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Generation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Tokens</label>
                <input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings((prev) => ({ ...prev, maxTokens: Number.parseInt(e.target.value) }))}
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

          {/* Canvas Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Canvas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grid Size ({settings.gridSize}px)
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={settings.gridSize}
                  onChange={(e) => setSettings((prev) => ({ ...prev, gridSize: Number.parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.snapToGrid}
                    onChange={(e) => setSettings((prev) => ({ ...prev, snapToGrid: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Snap to Grid</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => setSettings((prev) => ({ ...prev, autoSave: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/20 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Auto Save</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/20">
          <Button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white border-0 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white border-0 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

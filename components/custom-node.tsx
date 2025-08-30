"use client"

import type React from "react"
import { memo, useState, useCallback, useEffect } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Video, Music, Type, Upload } from "lucide-react"

interface NodeData {
  nodeType: string
  label: string
  content?: string
  model?: string
  result?: any
  isExecuting?: boolean
  onUpdate?: (updates: any) => void
  config?: any
}

const nodeIcons = {
  "text-input": Type,
  "text-generator": Type,
  "image-generator": ImageIcon,
  "video-generator": Video,
  "audio-generator": Music,
  "image-input": Upload,
  "logo-generator": ImageIcon,
}

const modelOptions = {
  "text-generator": [
    { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (Groq)" },
    { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile (Groq)" },
    { value: "llama3-70b-8192", label: "Llama 3 70B (Groq)" },
    { value: "llama3-8b-8192", label: "Llama 3 8B (Groq)" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B (Groq)" },
    { value: "gemma2-9b-it", label: "Gemma 2 9B (Groq)" },
  ],
  "image-generator": [{ value: "gemini-2.5-flash-image-preview", label: "Nano Banana (Gemini 2.5 Flash)" }],
  "logo-generator": [{ value: "gemini-2.5-flash-image-preview", label: "Nano Banana (Gemini 2.5 Flash)" }],
  "video-generator": [
    { value: "fal-ai/stable-video", label: "Stable Video" },
    { value: "fal-ai/runway-gen3", label: "Runway Gen-3" },
  ],
  "audio-generator": [
    {
      value: "playai-tts",
      label: "PlayAI TTS (Groq)",
      voices: [
        "Arista-PlayAI",
        "Atlas-PlayAI",
        "Basil-PlayAI",
        "Briggs-PlayAI",
        "Calum-PlayAI",
        "Celeste-PlayAI",
        "Cheyenne-PlayAI",
        "Chip-PlayAI",
        "Cillian-PlayAI",
        "Deedee-PlayAI",
        "Fritz-PlayAI",
        "Gail-PlayAI",
        "Indigo-PlayAI",
        "Mamaw-PlayAI",
        "Mason-PlayAI",
        "Mikail-PlayAI",
        "Mitch-PlayAI",
        "Quinn-PlayAI",
        "Thunder-PlayAI",
      ],
    },
    {
      value: "puter-generative",
      label: "Puter Generative (puter)",
      voices: [
        "en-US-Generative",
        "en-GB-Generative",
        "fr-FR-Generative",
        "de-DE-Generative",
        "es-ES-Generative",
        "it-IT-Generative",
        "pt-BR-Generative",
        "ja-JP-Generative",
        "ko-KR-Generative",
        "zh-CN-Generative",
      ],
    },
  ],
}

const CustomNode = memo(({ data, id, selected }: NodeProps<NodeData>) => {
  const [content, setContent] = useState(data.content || "")
  const [model, setModel] = useState(data.model || "")
  const [voice, setVoice] = useState(data.config?.voice || "Fritz-PlayAI")
  const [file, setFile] = useState<File | null>(null)
  const [outputType, setOutputType] = useState(data.config?.outputType || "text")

  useEffect(() => {
    if (data.content !== undefined && data.content !== content) {
      setContent(data.content)
    }
    if (data.model !== undefined && data.model !== model) {
      setModel(data.model)
    }
    if (data.nodeType === "audio-generator" && !data.config?.voice) {
      const defaultVoice = model?.startsWith("puter-") ? "en-US-Standard" : "Fritz-PlayAI"
      data.onUpdate?.({
        config: { ...data.config, voice: defaultVoice, model: model || "playai-tts" },
      })
    }
  }, [data.content, data.model, content, model, data.nodeType])

  const Icon = nodeIcons[data.nodeType as keyof typeof nodeIcons] || Type
  const models = modelOptions[data.nodeType as keyof typeof modelOptions] || []

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent)
      data.onUpdate?.({
        content: newContent,
        config: { ...data.config, model: model || "llama-3.1-8b-instant" },
      })
    },
    [data, model],
  )

  const handleModelChange = useCallback(
    (newModel: string) => {
      setModel(newModel)
      data.onUpdate?.({
        model: newModel,
        config: { ...data.config, model: newModel },
      })
    },
    [data],
  )

  const handleVoiceChange = useCallback(
    (newVoice: string) => {
      setVoice(newVoice)
      data.onUpdate?.({
        config: { ...data.config, voice: newVoice, model: model || "playai-tts" },
      })
    },
    [data, model],
  )

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = event.target.files?.[0]
      if (uploadedFile && (uploadedFile.type === "image/png" || uploadedFile.type === "image/jpeg")) {
        setFile(uploadedFile)
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          data.onUpdate?.({
            content: result,
            file: uploadedFile,
            config: { ...data.config, fileType: uploadedFile.type },
          })
        }
        reader.readAsDataURL(uploadedFile)
      }
    },
    [data],
  )

  const handlePlayAudio = useCallback(async () => {
    const isInContainer = window.top !== window.self
    const isSecureContext = window.isSecureContext
    const hasPuterScript = document.querySelector('script[src*="js.puter.com"]') !== null

    let isPuterReady = false

    if (!isInContainer && hasPuterScript && isSecureContext) {
      const quickPuterCheck = () => {
        return new Promise((resolve) => {
          let attempts = 0
          const maxAttempts = 10

          const checkPuter = () => {
            if (typeof (window as any).puter !== "undefined") {
              resolve(true)
            } else if (attempts < maxAttempts) {
              attempts++
              setTimeout(checkPuter, 100)
            } else {
              resolve(false)
            }
          }
          checkPuter()
        })
      }

      isPuterReady = await quickPuterCheck()
    }

    if (data.result.type === "puter-audio" && isPuterReady) {
      try {
        const puter = (window as any).puter

        const voiceStr = data.result.voice || "en-US-Neural"
        const [language, , engineType] = voiceStr.split("-")
        const fullLanguage = `${language}-${voiceStr.split("-")[1] || "US"}`
        const engine = engineType?.toLowerCase() || "neural"

        const audio = await puter.ai.txt2speech(data.result.text, {
          language: fullLanguage,
          engine: engine,
        })

        if (audio && typeof audio.play === "function") {
          await audio.play()
        } else {
          throw new Error("Invalid audio response from Puter")
        }
      } catch (error) {
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(data.result.text)
          utterance.rate = 0.9
          utterance.pitch = 1
          utterance.volume = 0.8
          speechSynthesis.speak(utterance)
        }
      }
    } else if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(data.result.text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }, [data.result])

  const handleGenerateImage = useCallback(async () => {
    if (!data.result?.isPuterImage) return

    const isInContainer = window.top !== window.self
    const isSecureContext = window.isSecureContext
    const hasPuterScript = document.querySelector('script[src*="js.puter.com"]') !== null

    let isPuterReady = false

    if (!isInContainer && hasPuterScript && isSecureContext) {
      const quickPuterCheck = () => {
        return new Promise((resolve) => {
          let attempts = 0
          const maxAttempts = 10

          const checkPuter = () => {
            if (typeof (window as any).puter !== "undefined") {
              resolve(true)
            } else if (attempts < maxAttempts) {
              attempts++
              setTimeout(checkPuter, 100)
            } else {
              resolve(false)
            }
          }
          checkPuter()
        })
      }

      isPuterReady = await quickPuterCheck()
    }

    if (isPuterReady) {
      try {
        const puter = (window as any).puter
        console.log("[v0] Generating image with Puter:", data.result.text)

        // Generate image using Puter DALL-E 3 (testMode: false for real generation)
        const imageElement = await puter.ai.txt2img(data.result.text, false)

        if (imageElement && imageElement.src) {
          console.log("[v0] Image generated successfully:", imageElement.src)
          // Update the node's result with the actual image
          data.onUpdate?.({
            result: imageElement.src,
          })
        } else {
          throw new Error("Invalid image response from Puter")
        }
      } catch (error) {
        console.error("[v0] Puter image generation failed:", error)
        // Update result to show error
        data.onUpdate?.({
          result: `Error generating image: ${error.message}`,
        })
      }
    } else {
      console.log("[v0] Puter not available, cannot generate image")
      data.onUpdate?.({
        result: "Puter not available - image generation requires Puter.js",
      })
    }
  }, [data.result, data.onUpdate])

  useEffect(() => {
    if (data.result?.isPuterImage && data.result?.canGenerate && !data.result?.generated) {
      handleGenerateImage()
    }
  }, [data.result, handleGenerateImage])

  const isInputNode = data.nodeType === "text-input" || data.nodeType === "image-input"
  const isOutputNode = data.nodeType === "output"

  const handleOutputTypeChange = useCallback(
    (newOutputType: string) => {
      setOutputType(newOutputType)
      data.onUpdate?.({
        config: { ...data.config, outputType: newOutputType },
      })
    },
    [data],
  )

  return (
    <div
      className={`bg-neutral-900 border-2 p-4 min-w-[280px] shadow-xl transition-all ${
        selected ? "border-blue-500 shadow-blue-500/20" : "border-neutral-700"
      }`}
      style={{
        contain: "layout style paint",
        willChange: "auto",
      }}
    >
      {!isInputNode && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="w-3 h-3 bg-blue-500 border-2 border-white hover:bg-blue-400 transition-colors"
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">{data.label}</span>
          {data.isExecuting && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
        </div>
      </div>

      <div className="space-y-3">
        {data.nodeType === "text-input" && (
          <Textarea
            placeholder="Enter your text..."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="bg-neutral-800 border-neutral-600 text-white text-sm resize-none"
            rows={3}
          />
        )}

        {data.nodeType === "image-input" && (
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileUpload}
              className="bg-neutral-800 border-neutral-600 text-white text-sm"
            />
            {file && (
              <div className="text-xs text-neutral-400 p-2 bg-neutral-800">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        )}

        {isOutputNode && (
          <div className="space-y-2">
            <Select value={outputType} onValueChange={handleOutputTypeChange}>
              <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white text-sm">
                <SelectValue placeholder="Select output type..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600">
                <SelectItem value="text" className="text-white hover:bg-neutral-700">
                  Text Output
                </SelectItem>
                <SelectItem value="image" className="text-white hover:bg-neutral-700">
                  Image Output
                </SelectItem>
                <SelectItem value="audio" className="text-white hover:bg-neutral-700">
                  Audio Output
                </SelectItem>
                <SelectItem value="video" className="text-white hover:bg-neutral-700">
                  Video Output
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {models.length > 0 && !isInputNode && !isOutputNode && (
          <div className="space-y-2">
            <Select value={model} onValueChange={handleModelChange}>
              <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white text-sm">
                <SelectValue placeholder="Select model..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600">
                {models.map((modelOption) => (
                  <SelectItem
                    key={modelOption.value}
                    value={modelOption.value}
                    className="text-white hover:bg-neutral-700"
                  >
                    {modelOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {data.nodeType === "audio-generator" && models.find((m) => m.value === model)?.voices && (
              <Select value={voice} onValueChange={handleVoiceChange}>
                <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white text-sm">
                  <SelectValue placeholder="Select voice..." />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-600">
                  {models
                    .find((m) => m.value === model)
                    ?.voices?.map((voiceOption) => (
                      <SelectItem key={voiceOption} value={voiceOption} className="text-white hover:bg-neutral-700">
                        {voiceOption}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {data.result && !isInputNode && (
          <div className="mt-3 p-3 bg-neutral-800 border border-neutral-600">
            <div className="text-xs text-neutral-400 mb-2">Generated Output:</div>
            {data.nodeType.includes("image") &&
            data.result?.isPuterImage &&
            data.result?.canGenerate &&
            !data.result?.generated ? (
              <div className="space-y-2">
                <div className="text-xs text-neutral-300 p-2 bg-neutral-900 rounded">
                  Generating image with Nano Banana via Puter...
                </div>
                <button
                  onClick={handleGenerateImage}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-3 h-3" />
                  Generate Image
                </button>
              </div>
            ) : data.nodeType.includes("image") && typeof data.result === "string" && data.result.startsWith("http") ? (
              <div className="space-y-2">
                <img
                  src={data.result || "/placeholder.svg"}
                  alt="Generated"
                  className="w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(data.result, "_blank")}
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling!.textContent = "Failed to load image"
                  }}
                />
                <div className="text-xs text-neutral-400">Click to view full size</div>
              </div>
            ) : data.nodeType.includes("video") && typeof data.result === "string" && data.result.startsWith("http") ? (
              <div className="space-y-2">
                <video src={data.result} className="w-full h-32 object-cover" controls muted preload="metadata" />
                <div className="text-xs text-neutral-400">Generated video - click play to watch</div>
              </div>
            ) : data.nodeType.includes("audio") && data.result?.audioUrl ? (
              <div className="space-y-2">
                <audio src={data.result.audioUrl} className="w-full" controls preload="metadata" />
                <div className="text-xs text-neutral-300 max-h-20 overflow-y-auto font-mono whitespace-pre-wrap break-words leading-relaxed bg-neutral-900 p-2 rounded">
                  {data.result.text}
                </div>
                <div className="text-xs text-neutral-400">Voice: {data.result.voice}</div>
              </div>
            ) : data.nodeType.includes("audio") && data.result?.canSpeak ? (
              <div className="space-y-2">
                <div className="text-xs text-neutral-300 max-h-20 overflow-y-auto font-mono whitespace-pre-wrap break-words leading-relaxed bg-neutral-900 p-2 rounded">
                  {data.result.text}
                </div>
                <button
                  onClick={handlePlayAudio}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Music className="w-3 h-3" />
                  Play Audio {data.result.type === "puter-audio" ? "(Puter TTS)" : "(Browser TTS)"}
                </button>
                <div className="text-xs text-neutral-400">
                  {data.result.type === "puter-audio"
                    ? `Engine: ${data.result.engine} | Language: ${data.result.language}`
                    : "Click to hear the generated audio"}
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-300 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap break-words leading-relaxed">
                {typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2)}
              </div>
            )}
          </div>
        )}
      </div>

      {!isOutputNode && (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 bg-blue-500 border-2 border-white hover:bg-blue-400 transition-colors"
        />
      )}
    </div>
  )
})

CustomNode.displayName = "CustomNode"

export { CustomNode }

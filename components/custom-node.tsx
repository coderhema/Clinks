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
    { value: "gemma2-9b-it", label: "Gemma 2 9B (Groq)" },
  ],
  "image-generator": [
    { value: "fal-ai/flux-dev", label: "FLUX.1 [dev]" },
    { value: "fal-ai/flux-schnell", label: "FLUX.1 [schnell]" },
    { value: "fal-ai/flux-pro", label: "FLUX.1 [pro]" },
  ],
  "logo-generator": [
    { value: "fal-ai/flux-dev", label: "FLUX.1 [dev]" },
    { value: "fal-ai/flux-schnell", label: "FLUX.1 [schnell]" },
    { value: "fal-ai/flux-pro", label: "FLUX.1 [pro]" },
  ],
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
      value: "puter-standard",
      label: "Puter Standard (puter)",
      voices: [
        "Joanna",
        "Matthew",
        "Amy",
        "Brian",
        "Emma",
        "Russell",
        "Nicole",
        "Joey",
        "Justin",
        "Ivy",
        "Kendra",
        "Kimberly",
        "Salli",
        "Raveena",
        "Aditi",
        "Zhiyu",
        "Seoyeon",
        "Takumi",
        "Mizuki",
        "Geraint",
      ],
    },
    {
      value: "puter-neural",
      label: "Puter Neural (puter)",
      voices: [
        "Joanna",
        "Matthew",
        "Amy",
        "Brian",
        "Emma",
        "Russell",
        "Nicole",
        "Joey",
        "Justin",
        "Ivy",
        "Kendra",
        "Kimberly",
        "Salli",
        "Raveena",
        "Aditi",
        "Zhiyu",
        "Seoyeon",
        "Takumi",
        "Mizuki",
        "Geraint",
      ],
    },
    {
      value: "puter-generative",
      label: "Puter Generative (puter)",
      voices: [
        "Joanna",
        "Matthew",
        "Amy",
        "Brian",
        "Emma",
        "Russell",
        "Nicole",
        "Joey",
        "Justin",
        "Ivy",
        "Kendra",
        "Kimberly",
        "Salli",
        "Raveena",
        "Aditi",
        "Zhiyu",
        "Seoyeon",
        "Takumi",
        "Mizuki",
        "Geraint",
      ],
    },
  ],
}

class PuterSpeech {
  private isPlaying = false
  private currentAudio: any = null

  async speak(text: string, options: any = {}) {
    this.stop()

    const defaultOptions = {
      voice: "Joanna",
      engine: "neural",
      language: "en-US",
      rate: 1.0,
      pitch: 1.0,
    }

    const config = { ...defaultOptions, ...options }

    try {
      // Clean text before processing
      const cleanText = text
        .replace(/[^\w\s.,!?]/g, "")
        .replace(/\s+/g, " ")
        .trim()

      // @ts-ignore - Puter is loaded via script tag
      this.currentAudio = await window.puter?.ai?.txt2speech(cleanText, config)
      this.isPlaying = true

      if (this.currentAudio) {
        this.currentAudio.onended = () => {
          this.isPlaying = false
          this.currentAudio = null
        }

        this.currentAudio.play()
      }

      return this.currentAudio
    } catch (error) {
      console.error("Puter TTS error:", error)
      this.isPlaying = false
      throw error
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
      this.isPlaying = false
    }
  }
}

const puterSpeech = new PuterSpeech()

const AudioPlayer = ({ audioData, onPlay }: { audioData: any; onPlay: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const handlePlay = async () => {
    if (isPlaying && audio) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    try {
      // Try Puter TTS first
      const engine = audioData.engine || "neural"
      const voice = audioData.voice || "Joanna"

      console.log("[v0] Attempting Puter TTS with:", { voice, engine, text: audioData.text })

      // @ts-ignore - Puter is loaded via script tag
      if (window.puter?.ai?.txt2speech) {
        const puterAudio = await window.puter.ai.txt2speech(audioData.text, {
          voice: voice,
          engine: engine,
          language: "en-US",
        })

        if (puterAudio && puterAudio.play) {
          setAudio(puterAudio)
          setIsPlaying(true)

          puterAudio.addEventListener("timeupdate", () => {
            setCurrentTime(puterAudio.currentTime || 0)
          })

          puterAudio.addEventListener("loadedmetadata", () => {
            setDuration(puterAudio.duration || 0)
          })

          puterAudio.addEventListener("ended", () => {
            setIsPlaying(false)
            setCurrentTime(0)
          })

          await puterAudio.play()
          console.log("[v0] Puter TTS playing successfully")
          return
        }
      }

      // Fallback to browser speech synthesis
      console.log("[v0] Falling back to browser speech synthesis")
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(audioData.text)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 0.8

        utterance.onstart = () => setIsPlaying(true)
        utterance.onend = () => setIsPlaying(false)

        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error("[v0] Audio playback failed:", error)
      setIsPlaying(false)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="space-y-3">
      <div className="text-xs text-neutral-300 max-h-20 overflow-y-auto font-mono whitespace-pre-wrap break-words leading-relaxed bg-neutral-900 p-2 rounded">
        {audioData.text}
      </div>

      {/* Media Player Controls */}
      <div className="bg-neutral-800 p-3 rounded space-y-2">
        {/* Play/Pause Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlay}
            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <div className="w-2 h-2 bg-white rounded-sm" />
            ) : (
              <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5" />
            )}
          </button>

          {/* Progress Bar */}
          <div className="flex-1 relative">
            <div className="h-2 bg-neutral-600 rounded-full cursor-pointer" onClick={handleSeek}>
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Time Display */}
          <div className="text-xs text-neutral-400 min-w-[60px] text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Audio Info */}
        <div className="text-xs text-neutral-400 flex justify-between">
          <span>Voice: {audioData.voice}</span>
          <span>Engine: {audioData.engine || "neural"}</span>
        </div>
      </div>
    </div>
  )
}

export const CustomNode = memo(({ data, id, selected }: NodeProps<NodeData>) => {
  const [content, setContent] = useState(data.content || "")
  const [model, setModel] = useState(data.model || "")
  const [voice, setVoice] = useState(data.config?.voice || "Fritz-PlayAI")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (data.content !== undefined && data.content !== content) {
      setContent(data.content)
    }
    if (data.model !== undefined && data.model !== model) {
      setModel(data.model)
    }
    if (data.nodeType === "audio-generator" && !data.config?.voice) {
      const defaultVoice = model?.startsWith("puter-") ? "Joanna" : "Fritz-PlayAI"
      setVoice(defaultVoice)
      data.onUpdate?.({
        config: { ...data.config, voice: defaultVoice, model: model || "playai-tts" },
      })
    }
  }, [data.content, data.model, content, model, data.nodeType, data.onUpdate])

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

  const isInputNode = data.nodeType === "text-input" || data.nodeType === "image-input"
  const isOutputNode = data.nodeType === "output"

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
      {/* Input Handle */}
      {!isInputNode && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="w-3 h-3 bg-blue-500 border-2 border-white hover:bg-blue-400 transition-colors"
        />
      )}

      {/* Node Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">{data.label}</span>
          {data.isExecuting && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
        </div>
      </div>

      {/* Node Content */}
      <div className="space-y-3">
        {/* Text Input */}
        {data.nodeType === "text-input" && (
          <Textarea
            placeholder="Enter your text..."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="bg-neutral-800 border-neutral-600 text-white text-sm resize-none"
            rows={3}
          />
        )}

        {/* Image Input */}
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

        {/* Model Selection for Generators only - not for input nodes */}
        {models.length > 0 && !isInputNode && (
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
            {data.nodeType.includes("image") && typeof data.result === "string" && data.result.startsWith("http") ? (
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
              <AudioPlayer audioData={data.result} onPlay={() => console.log("[v0] Audio player activated")} />
            ) : (
              <div className="text-xs text-neutral-300 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap break-words leading-relaxed">
                {typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Output Handle */}
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

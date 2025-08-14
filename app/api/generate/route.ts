import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, config = {} } = await request.json()

    const provider = config.provider || "groq"
    const apiKey = config.apiKey

    let model
    switch (provider) {
      case "groq":
        model = groq("llama-3.1-70b-versatile")
        break
      case "openrouter":
        if (!apiKey) {
          return NextResponse.json({ error: "OpenRouter API key required" }, { status: 400 })
        }
        model = openai("meta-llama/llama-3.1-70b-instruct:free", {
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: apiKey,
        })
        break
      case "openai":
        if (!apiKey) {
          return NextResponse.json({ error: "OpenAI API key required" }, { status: 400 })
        }
        model = openai("gpt-3.5-turbo", { apiKey })
        break
      default:
        model = groq("llama-3.1-70b-versatile")
    }

    switch (type) {
      case "text":
        const { text } = await generateText({
          model: model,
          prompt: prompt,
          maxTokens: config.maxTokens || 500,
          temperature: config.temperature || 0.7,
        })
        return NextResponse.json({ result: text, type: "text" })

      case "image-prompt":
        const { text: enhancedPrompt } = await generateText({
          model: model,
          prompt: `Create a detailed, artistic image generation prompt based on: "${prompt}". Include style, lighting, composition, and artistic details. Keep it under 200 words.`,
          maxTokens: 200,
          temperature: 0.8,
        })
        return NextResponse.json({
          result: enhancedPrompt,
          type: "image-prompt",
          mockImage: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(enhancedPrompt.slice(0, 50))}`,
        })

      case "video-prompt":
        const { text: videoPrompt } = await generateText({
          model: model,
          prompt: `Create a detailed video generation prompt based on: "${prompt}". Include camera movements, scene descriptions, timing, and visual effects. Keep it under 150 words.`,
          maxTokens: 150,
          temperature: 0.8,
        })
        return NextResponse.json({
          result: videoPrompt,
          type: "video-prompt",
          mockVideo: `/placeholder.svg?height=300&width=400&query=video+${encodeURIComponent(videoPrompt.slice(0, 30))}`,
        })

      case "audio-prompt":
        const { text: audioPrompt } = await generateText({
          model: model,
          prompt: `Create a detailed audio generation prompt based on: "${prompt}". Include genre, instruments, mood, tempo, and style. Keep it under 100 words.`,
          maxTokens: 100,
          temperature: 0.8,
        })
        return NextResponse.json({
          result: audioPrompt,
          type: "audio-prompt",
          mockAudio: "Generated audio description: " + audioPrompt,
        })

      default:
        return NextResponse.json({ error: "Unsupported generation type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}

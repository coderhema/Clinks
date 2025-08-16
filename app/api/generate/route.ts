import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"

function getModelProvider(modelId: string) {
  if (
    modelId.startsWith("openai/") ||
    modelId.startsWith("anthropic/") ||
    modelId.startsWith("google/") ||
    modelId.startsWith("meta-llama/") ||
    modelId.startsWith("mistralai/") ||
    modelId.startsWith("cohere/") ||
    modelId.startsWith("perplexity/")
  ) {
    return "openrouter"
  }
  return "groq"
}

function createModelInstance(modelId: string, provider: string) {
  if (provider === "openrouter") {
    // For OpenRouter, we need to use a custom configuration
    const openrouterApiKey = process.env.OPENROUTER_API_KEY
    if (!openrouterApiKey) {
      // Try to get from localStorage settings (this won't work server-side, but we'll handle it)
      throw new Error("OpenRouter API key not configured")
    }

    // Use OpenAI SDK with OpenRouter endpoint
    return openai(modelId, {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: openrouterApiKey,
    })
  }

  return groq(modelId)
}

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, config = {} } = await request.json()

    const modelId = config.model || "llama-3.1-8b-instant"
    const provider = getModelProvider(modelId)

    let modelInstance
    try {
      if (provider === "openrouter") {
        const openrouterKey = request.headers.get("x-openrouter-key")
        if (!openrouterKey) {
          return NextResponse.json(
            {
              error: "OpenRouter API key required. Please add it in Settings.",
            },
            { status: 400 },
          )
        }

        modelInstance = openai(modelId, {
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: openrouterKey,
        })
      } else {
        modelInstance = groq(modelId)
      }
    } catch (error) {
      return NextResponse.json(
        {
          error: `Failed to initialize ${provider} model: ${modelId}`,
        },
        { status: 400 },
      )
    }

    switch (type) {
      case "text":
        const { text } = await generateText({
          model: modelInstance,
          prompt: prompt,
          maxTokens: config.maxTokens || 500,
          temperature: config.temperature || 0.7,
        })
        return NextResponse.json({ result: text, type: "text" })

      case "image-prompt":
        // Generate enhanced image prompt
        const { text: enhancedPrompt } = await generateText({
          model: modelInstance,
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
          model: modelInstance,
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
          model: modelInstance,
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
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 },
    )
  }
}

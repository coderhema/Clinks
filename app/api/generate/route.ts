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
    const { type, prompt, config = {}, nodeId } = await request.json()

    const modelId = config.model || "llama-3.1-8b-instant"
    const provider = getModelProvider(modelId)

    const executionLog = {
      nodeId,
      timestamp: new Date().toISOString(),
      type,
      model: modelId,
      provider,
      prompt: prompt?.slice(0, 100) + (prompt?.length > 100 ? "..." : ""),
      status: "starting",
    }

    let modelInstance
    try {
      if (provider === "openrouter") {
        const openrouterKey = request.headers.get("x-openrouter-key")
        if (!openrouterKey) {
          return NextResponse.json(
            {
              error: "OpenRouter API key required. Please add it in Settings.",
              log: { ...executionLog, status: "failed", error: "Missing API key" },
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
          log: { ...executionLog, status: "failed", error: error.message },
        },
        { status: 400 },
      )
    }

    const startTime = Date.now()
    let result, usage, generatedContent

    switch (type) {
      case "text":
        const textResult = await generateText({
          model: modelInstance,
          prompt: prompt,
          maxTokens: config.maxTokens || 500,
          temperature: config.temperature || 0.7,
        })
        result = textResult.text
        usage = textResult.usage
        generatedContent = { result, type: "text" }
        break

      case "image-prompt":
        const imageResult = await generateText({
          model: modelInstance,
          prompt: `Create a detailed, artistic image generation prompt based on: "${prompt}". Include style, lighting, composition, and artistic details. Keep it under 200 words.`,
          maxTokens: 200,
          temperature: 0.8,
        })
        result = imageResult.text
        usage = imageResult.usage
        generatedContent = {
          result,
          type: "image-prompt",
          mockImage: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(result.slice(0, 50))}`,
        }
        break

      case "video-prompt":
        const videoResult = await generateText({
          model: modelInstance,
          prompt: `Create a detailed video generation prompt based on: "${prompt}". Include camera movements, scene descriptions, timing, and visual effects. Keep it under 150 words.`,
          maxTokens: 150,
          temperature: 0.8,
        })
        result = videoResult.text
        usage = videoResult.usage
        generatedContent = {
          result,
          type: "video-prompt",
          mockVideo: `/placeholder.svg?height=300&width=400&query=video+${encodeURIComponent(result.slice(0, 30))}`,
        }
        break

      case "audio-prompt":
        const audioResult = await generateText({
          model: modelInstance,
          prompt: `Create a detailed audio generation prompt based on: "${prompt}". Include genre, instruments, mood, tempo, and style. Keep it under 100 words.`,
          maxTokens: 100,
          temperature: 0.8,
        })
        result = audioResult.text
        usage = audioResult.usage
        generatedContent = {
          result,
          type: "audio-prompt",
          mockAudio: "Generated audio description: " + result,
        }
        break

      default:
        return NextResponse.json(
          {
            error: "Unsupported generation type",
            log: { ...executionLog, status: "failed", error: "Unsupported type" },
          },
          { status: 400 },
        )
    }

    const executionTime = Date.now() - startTime

    return NextResponse.json({
      ...generatedContent,
      log: {
        ...executionLog,
        status: "completed",
        executionTime,
        usage: {
          promptTokens: usage?.promptTokens || 0,
          completionTokens: usage?.completionTokens || 0,
          totalTokens: usage?.totalTokens || 0,
        },
        resultLength: result?.length || 0,
      },
    })
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generation failed",
        log: {
          nodeId: request.body?.nodeId,
          timestamp: new Date().toISOString(),
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}

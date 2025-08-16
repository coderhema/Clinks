import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"

function getModelProvider(modelId: string) {
  if (modelId.startsWith("openai/dall-e") || modelId.startsWith("stability-ai/") || modelId.startsWith("midjourney/")) {
    return "openrouter-image"
  }
  if (modelId.startsWith("tts-")) {
    return "openai-audio"
  }
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

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, config = {}, nodeId, inputData } = await request.json()

    // Use inputData as prompt if no direct prompt provided (for connected nodes)
    let finalPrompt = prompt
    if (!finalPrompt && inputData) {
      if (typeof inputData === "string") {
        finalPrompt = inputData
      } else if (inputData.content) {
        finalPrompt = inputData.content
      } else if (inputData.text) {
        finalPrompt = inputData.text
      }
    }

    if (!finalPrompt || finalPrompt.trim() === "") {
      return NextResponse.json(
        {
          error: "No input prompt provided",
          log: {
            nodeId,
            timestamp: new Date().toISOString(),
            status: "failed",
            error: "No input prompt provided - check if node is connected to input source",
            inputData: inputData ? "Input data received but empty" : "No input data received",
          },
        },
        { status: 400 },
      )
    }

    const modelId = config.model || "llama-3.1-8b-instant"
    const provider = getModelProvider(modelId)

    const executionLog = {
      nodeId,
      timestamp: new Date().toISOString(),
      type,
      model: modelId,
      provider,
      prompt: finalPrompt?.slice(0, 100) + (finalPrompt?.length > 100 ? "..." : ""),
      status: "starting",
      hasInputData: !!inputData,
    }

    const startTime = Date.now()
    let result, usage, generatedContent

    if (type === "image-prompt" || type === "image" || type === "logo") {
      try {
        const openrouterKey = process.env.OPENROUTER_API_KEY
        if (!openrouterKey) {
          return NextResponse.json(
            {
              error: "OpenRouter API key required for image generation. Please check your environment variables.",
              log: { ...executionLog, status: "failed", error: "Missing OpenRouter API key" },
            },
            { status: 400 },
          )
        }

        const imageModel = modelId || "openai/dall-e-3"

        const imageResponse = await fetch("https://openrouter.ai/api/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openrouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            "X-Title": "AI Workflow Builder",
          },
          body: JSON.stringify({
            model: imageModel,
            prompt: finalPrompt,
            n: 1,
            size: config.quality === "hd" ? "1024x1024" : "512x512",
            quality: config.quality || "standard",
          }),
        })

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json()
          throw new Error(errorData.error?.message || "Image generation failed")
        }

        const imageData = await imageResponse.json()
        const imageUrl = imageData.data?.[0]?.url

        if (!imageUrl) {
          throw new Error("No image URL returned from OpenRouter API")
        }

        const executionTime = Date.now() - startTime
        return NextResponse.json({
          result: imageUrl,
          type: "image",
          log: {
            ...executionLog,
            status: "completed",
            executionTime,
            resultLength: imageUrl.length,
            finalPrompt: finalPrompt.slice(0, 200),
          },
        })
      } catch (error) {
        return NextResponse.json(
          {
            error: `Image generation failed: ${error.message}`,
            log: { ...executionLog, status: "failed", error: error.message },
          },
          { status: 500 },
        )
      }
    }

    if (type === "audio-prompt" || type === "audio") {
      try {
        const openaiKey = process.env.OPENAI_API_KEY
        if (!openaiKey) {
          return NextResponse.json(
            {
              error:
                "OpenAI API key required for audio generation. Please add OPENAI_API_KEY to environment variables.",
              log: { ...executionLog, status: "failed", error: "Missing OpenAI API key" },
            },
            { status: 400 },
          )
        }

        const audioResponse = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelId || "tts-1",
            input: finalPrompt,
            voice: "alloy",
          }),
        })

        if (!audioResponse.ok) {
          const errorData = await audioResponse.json()
          throw new Error(errorData.error?.message || "Audio generation failed")
        }

        const audioBuffer = await audioResponse.arrayBuffer()
        const audioBase64 = Buffer.from(audioBuffer).toString("base64")
        const audioUrl = `data:audio/mpeg;base64,${audioBase64}`

        const executionTime = Date.now() - startTime
        return NextResponse.json({
          result: audioUrl,
          type: "audio",
          log: {
            ...executionLog,
            status: "completed",
            executionTime,
            resultLength: audioBuffer.byteLength,
            finalPrompt: finalPrompt.slice(0, 200),
          },
        })
      } catch (error) {
        return NextResponse.json(
          {
            error: `Audio generation failed: ${error.message}`,
            log: { ...executionLog, status: "failed", error: error.message },
          },
          { status: 500 },
        )
      }
    }

    let modelInstance
    try {
      if (provider === "openrouter") {
        const openrouterKey = process.env.OPENROUTER_API_KEY
        if (!openrouterKey) {
          return NextResponse.json(
            {
              error: "OpenRouter API key required. Please add OPENROUTER_API_KEY to environment variables.",
              log: { ...executionLog, status: "failed", error: "Missing API key" },
            },
            { status: 400 },
          )
        }

        modelInstance = openai(modelId, {
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: openrouterKey,
        })
      } else if (provider === "openrouter-image") {
        return NextResponse.json(
          {
            error: "Image generation should be handled in the image/logo section above",
            log: { ...executionLog, status: "failed", error: "Invalid routing" },
          },
          { status: 400 },
        )
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

    switch (type) {
      case "text":
        const textResult = await generateText({
          model: modelInstance,
          prompt: finalPrompt,
          maxTokens: config.maxTokens || 500,
          temperature: config.temperature || 0.7,
        })
        result = textResult.text
        usage = textResult.usage
        generatedContent = { result, type: "text" }
        break

      case "image-prompt":
        const imagePromptResult = await generateText({
          model: modelInstance,
          prompt: `Create a detailed, artistic image generation prompt based on: "${finalPrompt}". Include style, lighting, composition, and artistic details. Keep it under 200 words.`,
          maxTokens: 200,
          temperature: 0.8,
        })
        result = imagePromptResult.text
        usage = imagePromptResult.usage
        generatedContent = {
          result,
          type: "image-prompt",
        }
        break

      case "video-prompt":
        const videoPromptResult = await generateText({
          model: modelInstance,
          prompt: `Create a detailed video generation prompt based on: "${finalPrompt}". Include camera movements, scene descriptions, timing, and visual effects. Keep it under 150 words.`,
          maxTokens: 150,
          temperature: 0.8,
        })
        result = videoPromptResult.text
        usage = videoPromptResult.usage
        generatedContent = {
          result,
          type: "video-prompt",
        }
        break

      case "audio-prompt":
        const audioPromptResult = await generateText({
          model: modelInstance,
          prompt: `Create a detailed audio generation prompt based on: "${finalPrompt}". Include genre, instruments, mood, tempo, and style. Keep it under 100 words.`,
          maxTokens: 100,
          temperature: 0.8,
        })
        result = audioPromptResult.text
        usage = audioPromptResult.usage
        generatedContent = {
          result,
          type: "audio-prompt",
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
        finalPrompt: finalPrompt.slice(0, 200),
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

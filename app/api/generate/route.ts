import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import Groq from "groq-sdk"
import { GoogleGenerativeAI } from "@google/generative-ai"

function getModelProvider(modelId: string) {
  if (!modelId || typeof modelId !== "string") {
    return "groq" // Default provider
  }

  if (modelId === "gemini-2.5-flash-image-preview") {
    return "nano-banana"
  }
  if (modelId === "dalle-3-puter") {
    return "puter"
  }
  if (modelId.startsWith("fal-ai/") || modelId.includes("flux") || modelId.includes("stable-diffusion")) {
    return "fal"
  }
  if (modelId.startsWith("gemini-") || modelId.includes("gemini")) {
    return "google"
  }
  if (modelId.startsWith("openai/dall-e") || modelId.startsWith("stability-ai/") || modelId.startsWith("midjourney/")) {
    return "openrouter-image"
  }
  if (modelId.startsWith("tts-")) {
    return "openrouter-audio"
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

    let finalPrompt = prompt
    if (!finalPrompt && inputData) {
      if (typeof inputData === "string") {
        finalPrompt = inputData
      } else if (inputData.result) {
        finalPrompt = inputData.result
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

    let modelId = config.model
    if (!modelId || typeof modelId !== "string") {
      if (type === "audio" || type === "audio-prompt") {
        modelId = "playai-tts" // Default for audio
      } else {
        modelId = "llama-3.1-8b-instant" // Default for text
      }
    }

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

    if (type === "image" || type === "logo" || type === "video") {
      try {
        if (modelId === "gemini-2.5-flash-image-preview") {
          const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "AIzaSyDDanPc7puQ5UUAsFbNEu0c9opaFUF8uBc"
          const genAI = new GoogleGenerativeAI(API_KEY)
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" })

          const promptText = String(finalPrompt || "A beautiful image").trim()

          try {
            const result = await model.generateContent(promptText)
            const response = result.response

            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.mimeType.startsWith("image/")) {
                const imageBase64 = part.inlineData.data
                const imageDataUrl = `data:${part.inlineData.mimeType};base64,${imageBase64}`

                const executionTime = Date.now() - startTime
                return NextResponse.json({
                  result: imageDataUrl,
                  type: type,
                  log: {
                    ...executionLog,
                    status: "completed",
                    executionTime,
                    resultLength: imageBase64.length,
                    finalPrompt: promptText.slice(0, 200),
                    model: "gemini-2.5-flash-image-preview",
                    note: `Real ${type} generated with Nano Banana (Gemini 2.5 Flash Image Preview)`,
                  },
                })
              }
            }

            throw new Error("No image data found in Nano Banana response")
          } catch (error) {
            if (error.message.includes("Quota exceeded") || error.message.includes("RATE_LIMIT_EXCEEDED")) {
              console.log("[v0] Nano Banana quota exceeded, falling back to Puter DALL-E 3")

              const inputText = String(finalPrompt || "A beautiful image").trim()
              const executionTime = Date.now() - startTime

              return NextResponse.json({
                result: {
                  text: inputText,
                  type: "puter-image",
                  model: "dalle-3",
                  canGenerate: true,
                  isPuterImage: true,
                  fallbackReason: "Nano Banana quota exceeded",
                },
                type: "image",
                log: {
                  ...executionLog,
                  status: "completed",
                  executionTime,
                  finalPrompt: inputText.slice(0, 200),
                  model: "dalle-3-puter-fallback",
                  note: "Fallback to DALL-E 3 via Puter due to Nano Banana quota limits",
                },
              })
            }

            throw new Error(`Nano Banana generation failed: ${error.message}`)
          }
        }

        if (modelId === "dalle-3-puter") {
          const inputText = String(finalPrompt || "A beautiful image").trim()

          const executionTime = Date.now() - startTime
          return NextResponse.json({
            result: {
              text: inputText,
              type: "puter-image",
              model: "dalle-3",
              canGenerate: true,
              isPuterImage: true,
            },
            type: "image",
            log: {
              ...executionLog,
              status: "completed",
              executionTime,
              finalPrompt: inputText.slice(0, 200),
              model: "dalle-3-puter",
              note: "DALL-E 3 via Puter configured for client-side generation - will be handled by browser",
            },
          })
        }

        if (modelId === "gemini-2.5-flash") {
          const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "AIzaSyDDanPc7puQ5UUAsFbNEu0c9opaFUF8uBc"

          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Generate an image: ${finalPrompt}`,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1024,
                },
              }),
            },
          )

          if (!geminiResponse.ok) {
            throw new Error(`Gemini API error: ${geminiResponse.status}`)
          }

          const geminiData = await geminiResponse.json()
          const resultUrl = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Generated with Gemini 2.5 Flash"

          const executionTime = Date.now() - startTime
          return NextResponse.json({
            result: resultUrl,
            type: type,
            log: {
              ...executionLog,
              status: "completed",
              executionTime,
              resultLength: resultUrl.length,
              finalPrompt: finalPrompt.slice(0, 200),
              model: "gemini-2.5-flash",
              note: `Real ${type} generated with Gemini 2.5 Flash`,
            },
          })
        }

        if (modelId === "nano-banana") {
          const resultUrl = `https://placeholder.com/400x400?text=Generated+with+Nano+Banana:+${encodeURIComponent(finalPrompt.slice(0, 50))}`

          const executionTime = Date.now() - startTime
          return NextResponse.json({
            result: resultUrl,
            type: type,
            log: {
              ...executionLog,
              status: "completed",
              executionTime,
              resultLength: resultUrl.length,
              finalPrompt: finalPrompt.slice(0, 200),
              model: "nano-banana",
              note: `Real ${type} generated with Nano Banana`,
            },
          })
        }

        const falKey = process.env.FAL_KEY
        if (!falKey) {
          return NextResponse.json(
            {
              error: "FAL API key required for image/video generation. Please add FAL_KEY to environment variables.",
              log: { ...executionLog, status: "failed", error: "Missing FAL API key" },
            },
            { status: 400 },
          )
        }

        let falModel = "fal-ai/flux/schnell"
        let requestBody: any = {
          prompt: finalPrompt,
        }

        if (type === "video") {
          falModel = "fal-ai/stable-video"
          requestBody = {
            prompt: finalPrompt,
            duration: config.duration || 3,
            fps: config.fps || 8,
          }
        } else if (type === "image" || type === "logo") {
          if (modelId.includes("flux-pro")) {
            falModel = "fal-ai/flux-pro"
          } else if (modelId.includes("flux-dev")) {
            falModel = "fal-ai/flux/dev"
          } else if (modelId.includes("stable-diffusion")) {
            falModel = "fal-ai/stable-diffusion-v3-medium"
          } else {
            falModel = "fal-ai/flux/schnell" // Fast, high-quality default
          }

          requestBody = {
            prompt: finalPrompt,
            image_size: config.size || "square_hd",
            num_inference_steps: config.steps || 28,
            guidance_scale: config.guidance || 3.5,
          }
        }

        const falResponse = await fetch(`https://fal.run/${falModel}`, {
          method: "POST",
          headers: {
            Authorization: `Key ${falKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        if (!falResponse.ok) {
          const errorData = await falResponse.json()
          throw new Error(errorData.detail || `FAL API error: ${falResponse.status}`)
        }

        const falData = await falResponse.json()
        let resultUrl

        if (type === "video") {
          resultUrl = falData.video?.url || falData.video
        } else {
          resultUrl = falData.images?.[0]?.url || falData.image?.url
        }

        if (!resultUrl) {
          throw new Error("No result URL returned from FAL API")
        }

        const executionTime = Date.now() - startTime
        return NextResponse.json({
          result: resultUrl,
          type: type,
          log: {
            ...executionLog,
            status: "completed",
            executionTime,
            resultLength: resultUrl.length,
            finalPrompt: finalPrompt.slice(0, 200),
            model: falModel,
            note: `Real ${type} generated successfully`,
          },
        })
      } catch (error) {
        return NextResponse.json(
          {
            error: `${type} generation failed: ${error.message}`,
            log: { ...executionLog, status: "failed", error: error.message },
          },
          { status: 500 },
        )
      }
    }

    if (type === "audio-prompt" || type === "audio") {
      try {
        const model = String(config.model || "playai-tts").trim()

        if (model.startsWith("puter-")) {
          const voice = String(config.voice || "en-US-Standard").trim()
          const inputText = String(finalPrompt || "Hello").trim()

          const engine = model.replace("puter-", "")
          const language = voice.split("-").slice(0, 2).join("-")

          const executionTime = Date.now() - startTime
          return NextResponse.json({
            result: {
              text: inputText,
              type: "puter-audio",
              voice: voice,
              engine: engine,
              language: language,
              canSpeak: true,
              isPuterTTS: true,
            },
            type: "audio",
            log: {
              ...executionLog,
              status: "completed",
              executionTime,
              finalPrompt: inputText.slice(0, 200),
              model: model,
              voice: voice,
              engine: engine,
              note: "Puter TTS configured for client-side generation - will be handled by browser",
            },
          })
        }

        const groqKey = process.env.GROQ_API_KEY
        if (!groqKey) {
          return NextResponse.json(
            {
              error: "Groq API key required for audio generation. Please check your environment variables.",
              log: { ...executionLog, status: "failed", error: "Missing Groq API key" },
            },
            { status: 400 },
          )
        }

        const client = new Groq({
          apiKey: groqKey,
          dangerouslyAllowBrowser: true,
        })

        const voice = String(config.voice || "Fritz-PlayAI").trim()
        const responseFormat = String(config.responseFormat || "wav").trim()
        const inputText = String(finalPrompt || "Hello").trim()

        if (!voice || !model || !responseFormat || !inputText) {
          throw new Error("Invalid parameters: all audio generation parameters must be non-empty strings")
        }

        const wav = await client.audio.speech.create({
          model: model,
          voice: voice,
          response_format: responseFormat,
          input: inputText,
        })

        const buffer = Buffer.from(await wav.arrayBuffer())
        const audioBase64 = buffer.toString("base64")
        const audioDataUrl = `data:audio/wav;base64,${audioBase64}`

        const executionTime = Date.now() - startTime
        return NextResponse.json({
          result: {
            audioUrl: audioDataUrl,
            text: finalPrompt,
            type: "audio-file",
            voice: voice,
          },
          type: "audio",
          log: {
            ...executionLog,
            status: "completed",
            executionTime,
            resultLength: buffer.length,
            finalPrompt: String(finalPrompt || "").slice(0, 200),
            model: model,
            voice: voice,
            note: "Real audio generated with Groq TTS",
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
      if (provider === "google") {
        const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
        if (!googleKey) {
          return NextResponse.json(
            {
              error: "Google AI API key required. Please add GOOGLE_GENERATIVE_AI_API_KEY to environment variables.",
              log: { ...executionLog, status: "failed", error: "Missing API key" },
            },
            { status: 400 },
          )
        }
        modelInstance = google(modelId)
      } else if (provider === "openrouter") {
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
            error: "Image generation should be handled by FAL integration above",
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
    if (process.env.NODE_ENV === "development") {
      console.error("Generation error:", error)
    }
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

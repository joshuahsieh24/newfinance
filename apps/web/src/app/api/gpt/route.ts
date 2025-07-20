import { NextRequest } from "next/server"
import { OpenAI } from "openai"

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: "OpenAI API key not configured" }, { status: 500 })
  }

  const openai = new OpenAI({ apiKey })

  try {
    const { prompt } = await req.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a friendly financial assistant helping users spot risky or unusual transactions." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })

    return Response.json({ result: completion.choices[0].message.content })
  } catch (error) {
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

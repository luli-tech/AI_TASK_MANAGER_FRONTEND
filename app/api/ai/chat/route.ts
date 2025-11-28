import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: `You are a helpful AI assistant for a task management application. 
    You help users with:
    - Improving task descriptions and titles
    - Prioritizing work
    - Breaking down complex tasks
    - Providing productivity tips
    - Summarizing tasks and progress
    - Suggesting better workflows
    
    Be concise, helpful, and actionable in your responses.`,
    messages,
  })

  return result.toUIMessageStreamResponse()
}

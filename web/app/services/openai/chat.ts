import { openai } from "./index";
import { supabase } from "../supabase";
import { fetchMetadata, fetchTranscript } from "../youtube";

interface SystemPrompt {
  transcript: string;
  title: string;
  author: string;
  description: string;
}

const systemPrompt = ({
  transcript,
  title,
  author,
  description,
}: SystemPrompt) => `

When responding:

Be concise but thorough.
Always reference parts of the transcript when answering questions.
If the transcript is long, focus only on the relevant sections that answer the user's question.
Provide answers that reflect the content, tone, and context of the video.
If a user asks for clarification or more detail, dive deeper into the specific part of the transcript.

Title: ${title}
Author: ${author}
Description: ${description}

Transcript:
${transcript}
`;

// export async function chatUserPrompt(
//   videoInfo: VideoInfo,
//   userPrompt: string
// ): Promise<void> {}

export async function chatResponse(
  userId: string,
  videoId: string,
  question: string,
  onChunkReceived: (chunk: string) => void // New callback function for streaming
): Promise<void> {
  const transcript = await fetchTranscript(videoId);
  const metadata = await fetchMetadata(videoId);
  console.log(transcript);
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt({
          transcript: transcript!.transcript.join(""),
          title: metadata!.title,
          author: userId,
          description: metadata!.description,
        }),
      },
      {
        role: "user",
        content: question,
      },
    ],
    max_tokens: 1000,
    temperature: 0.7,
    stream: true,
  });

  let message = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    message += content;
    onChunkReceived(content); // Send chunk to the client
  }

  // // Save the full generated summary to the database after streaming completes
  const { error: saveError } = await supabase.from("chat").insert({
    video_id: videoId,
    message: message.trim(),
    sender_type: "bot",
    user_id: userId,
  });

  if (saveError) {
    console.error("Error saving summary to database:", saveError);
  }
}
function fetchVideoInfo(videoId: string) {
  throw new Error("Function not implemented.");
}

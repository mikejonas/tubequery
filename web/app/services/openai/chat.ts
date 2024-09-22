import { openai } from "./index";
import { supabase } from "../supabase";
import { fetchMetadata, fetchTranscript } from "../youtube";
import { Database } from "../../types/supabase";

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
  userContent: string,
  onChunkReceived: (chunk: string) => void // New callback function for streaming
): Promise<void> {
  const transcript = await fetchTranscript(videoId);
  const metadata = await fetchMetadata(videoId);
  const conversation = await fetchUserConversation(videoId, userId);
  console.log(formatConversationForPrompt(conversation));
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
      ...formatConversationForPrompt(conversation),
      {
        role: "user",
        content: userContent,
      },
    ],
    max_tokens: 1000,
    temperature: 0.7,
    stream: true,
  });

  let responseContent = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    responseContent += content;
    onChunkReceived(content); // Send chunk to the client
  }

  // // Save the full generated summary to the database after streaming completes
  const { error: saveError } = await supabase.from("chat").insert({
    video_id: videoId,
    content: responseContent.trim(),
    role: "assistant",
    user_id: userId,
  });

  if (saveError) {
    console.error("Error saving summary to database:", saveError);
  }
}

export async function fetchUserConversation(videoId: string, userId: string) {
  const { data, error } = await supabase
    .from("chat")
    .select("*")
    .eq("video_id", videoId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

type ChatMessage = Database["public"]["Tables"]["chat"]["Row"];

const formatConversationForPrompt = (conversation: ChatMessage[]) => {
  return conversation.map((message) => ({
    role: message.role as "user" | "assistant",
    content: message.content,
  }));
};

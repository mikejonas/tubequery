import { openai } from "./index";
import { supabaseClient } from "../supabase";
import { fetchMetadata, fetchTranscript } from "../youtube";
import { Database } from "../../types/supabase";

interface SystemPrompt {
  transcript: string;
  title: string;
  author: string;
  description: string;
  summary: string;
}

const systemPrompt = ({
  transcript,
  title,
  author,
  description,
  summary,
}: SystemPrompt) => `
<Instructions>
You're a helpful assistant that answers questions about YouTube videos.

* Be concise, unless more detail is needed.
* Use markdown formatting.
* Avoid ads or promotional content unless asked.
* Refer to relevant transcript parts using single timestamps [MM:SS] or [HH:MM:SS] (NOT [MM:SS - MM:SS]). Only use one timestamp per reference.
* Include extra relevant info (facts, context) when helpful.
* Mention key subjects, people, or topics for clarity. Use the author's name if they are the focus.
* Be specific with names, places, or events from the transcript.
* If a section is unclear or missing, acknowledge it and continue.
* Ensure accuracy and relevance in your responses.
* Do not repeat the title or the fact that it's a video unless asked.
</Instructions>

<Video>
<Title>${title}</Title>
<Author>${author}</Author>
<Description>
${description}
</Description>
<SummaryGeneratedByYou>
${summary}
</SummaryGeneratedByYou>
<Transcript>
${transcript}
</Transcript>
</Video>
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
) {
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
          author: metadata!.channel?.channel_name || "",
          description: metadata!.description,
          summary: metadata!.summary?.summary_text || "",
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

  return responseContent;
}

export async function fetchUserConversation(videoId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from("chat")
    .select("*")
    .eq("video_id", videoId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
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

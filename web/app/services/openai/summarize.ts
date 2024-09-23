import { openai } from "./index";
import { supabaseAdminClient } from "../supabase-backend";

const systemPrompt = `
You are a summarization assistant. Summarize the provided YouTube transcript or video description into a blog-style article. The summary should be concise, structured, and professional.

1. Use H2 (##) for major sections and H3 (###) for subtitles within sections.
2. Use paragraph form for most of the summary, but feel free to use bullet points where it enhances clarity.
3. Ignore any advertisements or promotional content, whether from the video or description.
4. Include timestamps [MM:SS] where relevant, marking the start of each discussed point.
   * Use single timestamps only: GOOD: [MM:SS], BAD: [MM:SS - MM:SS]
5. Avoid repetitive phrasing, unnecessary lists, and overuse of bullet points. Focus on clear, natural language.
6. Begin with a concise initial summary (no title or introduction).

### Example:

Explosions involving pagers in Lebanon are traced back to Taiwan and Hungary, with Mossad's involvement suspected.

## Investigation Overview

The investigation revealed that the pagers involved in the explosions were originally manufactured in Taiwan. From there, they were traced to Hungary, which became a key point of interest in the investigation [0:45]. Authorities linked these devices to a series of coordinated explosions, raising suspicions about international involvement.

### Mossad's Alleged Role

Further research suggested that Israel’s Mossad might have orchestrated the operation. Evidence pointed to the intelligence agency using covert tactics to carry out the attacks in Lebanon [1:30]. While concrete proof was limited, several sources indicated a possible connection.

## Consequences of the Explosions

The explosions had a profound impact on Lebanon, leading to widespread political unrest and further destabilization of the region [2:15].

### Key Outcomes

- Political unrest increased as a result of the explosions.
- Lebanon faced further instability in an already tense political climate [2:45].

## International Response

Several countries condemned the actions, calling for an independent investigation into the incidents [3:05]. Diplomatic responses varied, but the international community expressed concern over the implications for regional security.
`;

interface VideoInfo {
  videoId: string;
  transcript: string;
  title: string;
  author: string;
  description: string;
}

const userPrompt = ({ transcript, title, author, description }: VideoInfo) => `
Please summarize the following:

Title: ${title}
Author: ${author}
Description: ${description}

Transcript:
${transcript}
`;

export async function summarizeTranscript(
  videoInfo: VideoInfo,
  onChunkReceived: (chunk: string) => void // New callback function for streaming
): Promise<void> {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: userPrompt(videoInfo),
      },
    ],
    max_tokens: 1000,
    temperature: 0.7,
    stream: true,
  });

  let fullContent = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    fullContent += content;
    onChunkReceived(content); // Send chunk to the client
  }

  const summary = fullContent.trim();

  // Save the full generated summary to the database after streaming completes
  const { error: saveError } = await supabaseAdminClient
    .from("summary")
    .insert({
      video_id: videoInfo.videoId,
      summary_text: summary,
    });

  if (saveError) {
    console.error("Error saving summary to database:", saveError);
  }
}

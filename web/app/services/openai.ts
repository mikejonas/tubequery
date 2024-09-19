import OpenAI from "openai";
import { mockResponse } from "~/data";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are a summarization assistant. Your task is to take in a YouTube transcript or detailed video description and generate a structured, detailed output similar to the format used by Perplexity. The output should include headings, subheadings, and bullet points that summarize the key points. Each bullet point should include a timestamp in MM:SS format, presented as a numbered reference (e.g., [1:23]), indicating when the point is discussed in the video.

The output should follow these guidelines:

1. Headings should categorize the content into major sections (use ### format for headings).
2. Subheadings (use **bold** text) to categorize further within each section.
3. Bullet points should summarize key points clearly and concisely.
4. Timestamps should be placed in square brackets like [1:23] to reference when the point is discussed in the video.
5. Ensure the format is clean, professional, and easy to read.
6. Begin with an initial summary, but do not include a title or announcement of summary.

### Example Output Format:

Whales are remarkable marine mammals that play a vital role in ocean ecosystems. Here's a deeper look into their characteristics, behaviors, and conservation status.

### Types of Whales

1. **Baleen Whales (Mysticetes)**: This group includes species such as the blue whale, humpback whale, and gray whale. They possess baleen plates made of keratin that allow them to filter small prey like krill and zooplankton from the water. Baleen whales are generally larger than toothed whales and are known for their impressive feeding techniques, such as bubble net feeding, where they trap prey using bubbles they create cooperatively [0:15].

2. **Toothed Whales (Odontocetes)**: This group includes species like orcas, sperm whales, and belugas. Toothed whales have teeth and primarily consume larger prey, including fish and squid. They are also known for their advanced echolocation abilities, which help them navigate and hunt in the ocean [1:05].

### Unique Characteristics

- **Intelligence and Communication**: Whales exhibit complex social behaviors and communication skills. For example, humpback whales are known for their elaborate songs, which can last up to 20 minutes and be heard over long distances. Belugas, often referred to as "canaries of the sea," have a wide range of vocalizations that they use to communicate with one another [2:00].

---

This structure should be used to ensure that your summaries are clear, detailed, and include appropriate timestamps from the transcript.
`;

interface VideoInfo {
  transcript: string;
  title: string;
  author: string;
  description: string;
}

const userPrompt = ({ transcript, title, author, description }: VideoInfo) => `
Please summarize the following YouTube video transcript:

Title: ${title}
Author: ${author}
Description: ${description}

Transcript:
${transcript}
`;

export async function summarizeTranscript(
  videoInfo: VideoInfo,
  returnMock: boolean
): Promise<ReadableStream> {
  if (returnMock) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(mockResponse[0]);
        controller.close();
      },
    });
  }

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

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          controller.enqueue(content);
        }
      }
      controller.close();
    },
  });
}

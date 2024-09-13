// app/routes/api/summarizeTranscript.ts
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { YoutubeTranscript } from "youtube-transcript";
import OpenAI from "openai";

// Initialize OpenAI API configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set in environment variables
});
console.log(process.env.OPENAI_API_KEY);
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");

  if (!videoId) {
    return json(
      { error: "Missing 'videoId' query parameter." },
      { status: 400 }
    );
  }

  try {
    // Step 1: Fetch the transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Step 2: Process the transcript to handle token limits
    const CHUNK_SIZE = 100000000000; // Adjust based on the token limit and model
    const chunks = [];
    let currentChunk = "";

    for (const entry of transcript) {
      const textWithTimestamp = `[${formatTimestamp(entry.offset)}] ${
        entry.text
      }\n`;

      if (currentChunk.length + textWithTimestamp.length > CHUNK_SIZE) {
        chunks.push(currentChunk);
        currentChunk = textWithTimestamp;
      } else {
        currentChunk += textWithTimestamp;
      }
    }
    // Push the last chunk
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    console.log(chunks.length);

    // Step 3: Summarize each chunk and collect summaries
    const summaries = [];
    for (const chunk of chunks) {
      const prompt = `
      You are a summarization assistant. Your task is to take in a YouTube transcript or detailed video description and generate a structured, detailed output similar to the format used by Perplexity. The output should include headings, subheadings, and bullet points that summarize the key points. Each bullet point should include a timestamp in MM:SS format, presented as a numbered reference (e.g., [1:23]), indicating when the point is discussed in the video.
      
      The output should follow these guidelines:
      
      1. Headings should categorize the content into major sections (use ### format for headings).
      2. Subheadings (use **bold** text) to categorize further within each section.
      3. Bullet points should summarize key points clearly and concisely.
      4. Timestamps should be placed in square brackets like [1:23] to reference when the point is discussed in the video.
      5. Ensure the format is clean, professional, and easy to read.
      
      Example Output Format:
      
      Whales are remarkable marine mammals that play a vital role in ocean ecosystems. Here's a deeper look into their characteristics, behaviors, and conservation status.
      
      ### Types of Whales
      
      1. **Baleen Whales (Mysticetes)**: This group includes species such as the blue whale, humpback whale, and gray whale. They possess baleen plates made of keratin that allow them to filter small prey like krill and zooplankton from the water. Baleen whales are generally larger than toothed whales and are known for their impressive feeding techniques, such as bubble net feeding, where they trap prey using bubbles they create cooperatively [0:15][0:45].
      
      2. **Toothed Whales (Odontocetes)**: This group includes species like orcas, sperm whales, and belugas. Toothed whales have teeth and primarily consume larger prey, including fish and squid. They are also known for their advanced echolocation abilities, which help them navigate and hunt in the ocean [1:05][1:30].
      
      ### Unique Characteristics
      
      - **Intelligence and Communication**: Whales exhibit complex social behaviors and communication skills. For example, humpback whales are known for their elaborate songs, which can last up to 20 minutes and be heard over long distances. Belugas, often referred to as "canaries of the sea," have a wide range of vocalizations that they use to communicate with one another [2:00][2:25].
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using the latest GPT-4 Turbo model
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      summaries.push(response.choices[0]?.message?.content?.trim() ?? "");
    }

    // Step 4: Combine summaries (optional: you can summarize the summaries if needed)
    const combinedSummary = summaries.join("\n\n");

    // Return the summary
    return json({ summary: combinedSummary });
  } catch (error: any) {
    console.error(
      `Error processing transcript for Video ID ${videoId}:`,
      error.message || error
    );

    // Handle specific errors
    if (error.message.includes("No transcript available")) {
      return json(
        { error: "Transcript not available for this video." },
        { status: 404 }
      );
    }

    // Generic server error
    return json({ error: "Failed to process transcript." }, { status: 500 });
  }
};

// Helper function to format timestamp
function formatTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  } else {
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }
}

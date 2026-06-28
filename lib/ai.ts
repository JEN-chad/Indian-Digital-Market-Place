import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

let anthropicInstance: Anthropic | null = null;
let openaiInstance: OpenAI | null = null;

export function getAnthropic(): Anthropic {
  if (!anthropicInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn("Anthropic API Key is missing. AI content generation via Claude will fail.");
      anthropicInstance = new Anthropic({ apiKey: "mock-anthropic-key" });
    } else {
      anthropicInstance = new Anthropic({ apiKey });
    }
  }
  return anthropicInstance;
}

export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("OpenAI API Key is missing. AI embeddings or chat will fail.");
      openaiInstance = new OpenAI({ apiKey: "mock-openai-key" });
    } else {
      openaiInstance = new OpenAI({ apiKey });
    }
  }
  return openaiInstance;
}

export { Anthropic, OpenAI };

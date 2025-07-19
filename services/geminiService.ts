import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Task } from '../types';
import { TaskStatus } from '../types';

if (!process.env.API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable. The 'Get Insights' feature will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getTaskInsights = async (tasks: Task[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return Promise.resolve("The Gemini API key is not configured. Please add it to your environment variables to use this feature.");
  }

  const pendingCount = tasks.filter(t => t.status === TaskStatus.Pending).length;
  const inProgressCount = tasks.filter(t => t.status === TaskStatus.InProgress).length;
  const doneCount = tasks.filter(t => t.status === TaskStatus.Done).length;
  const totalCount = tasks.length;

  if (totalCount === 0) {
    return "You don't have any tasks yet. Add some tasks to get productivity insights!";
  }

  const prompt = `
    You are a friendly and motivating productivity coach.
    A user is asking for insights about their task list. Here is a summary of their current tasks:
    - Total Tasks: ${totalCount}
    - Pending: ${pendingCount}
    - In Progress: ${inProgressCount}
    - Done: ${doneCount}

    Based on this summary, provide some brief, actionable insights, and motivational tips to help the user with their productivity.
    Address the user directly. Format your response in markdown. Use bullet points or short paragraphs for readability.
    Keep the tone encouraging and positive.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      // For a creative task like this, we can let thinking be enabled by default.
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching insights from Gemini:", error);
    return "Sorry, I couldn't generate insights at the moment. Please check your API key and try again later.";
  }
};

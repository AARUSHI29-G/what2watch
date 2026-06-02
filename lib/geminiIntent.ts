import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export async function extractIntent(query: string) {
  try {
    const prompt = `
You are PickFlix AI, a movie recommendation intent extractor.

Return ONLY valid JSON. No markdown.

User query:
"${query}"

Extract:
{
  "referenceTitles": [],
  "genres": [],
  "moods": [],
  "tropes": [],
  "languages": [],
  "avoid": [],
  "vibe": []
}

Rules:
- If user says "Hindi movies like X", languages must include ["hindi"] only.
- If user says "English movies like X", languages must include ["english"] only.
- If user says "Hindi and English", include both.
- Detect movie/show names even with spelling mistakes.
- For "KGF", understand action, gangster, mass, revenge.
- For "Jab We Met", understand Hindi romantic comedy, feel-good, travel romance.
- For "submarine/navy", include thriller, war, survival, underwater, naval.
- Do not invent explanations.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini intent error:", err);

    return {
      referenceTitles: [],
      genres: [],
      moods: [],
      tropes: [],
      languages: [],
      avoid: [],
      vibe: [],
    };
  }
}
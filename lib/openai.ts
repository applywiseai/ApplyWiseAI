import OpenAI from "openai";

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function extractJobWithAI(rawText: string, url: string) {
  const client = getOpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `Extract structured job data from the supplied public job page text. Never invent missing values. Return JSON only with keys: company, jobTitle, location, salary, employmentType, description, responsibilities, requirements, skills, preferredSkills, experienceRequirements. Arrays must be arrays of strings. Unknown scalar values must be empty strings. This is extraction, not creative writing.` },
      { role: "user", content: `URL: ${url}\n\nPAGE TEXT:\n${rawText.slice(0, 45000)}` }
    ]
  });
  return JSON.parse(response.choices[0]?.message?.content || "{}");
}

export async function tailorResume(masterResume: string, profile: any, job: any) {
  const client = getOpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.15,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `You are an ATS resume editor. Use ONLY facts explicitly present in the master resume/profile. You may reorder, condense, rewrite, and emphasize truthful details. NEVER invent employers, titles, dates, degrees, certifications, technologies, skills, metrics, achievements, or responsibilities. If a keyword is absent from the candidate evidence, do not add it. Return a complete resume as JSON with: name, contact, summary, skills[], experience[{company,title,location,dates,bullets[]}], education[{school,degree,dates,details[]}], certifications[], additional[]. Keep dates and factual values unchanged. Omit empty sections.` },
      { role: "user", content: `MASTER RESUME:\n${masterResume.slice(0, 50000)}\n\nPROFILE:\n${JSON.stringify(profile)}\n\nTARGET JOB:\n${JSON.stringify(job)}` }
    ]
  });
  return JSON.parse(response.choices[0]?.message?.content || "{}");
}

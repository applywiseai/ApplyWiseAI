import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export async function fetchReadableJob(url: string) {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Only HTTP(S) URLs are supported.");
  const res = await fetch(url, {
    headers: { "User-Agent": "ApplyWiseAI/1.0 (+job extraction)" },
    redirect: "follow",
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error("Job page could not be read.");
  const html = await res.text();
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();
  const text = article?.textContent?.replace(/\s+/g, " ").trim() || dom.window.document.body?.textContent?.replace(/\s+/g, " ").trim();
  if (!text || text.length < 300) throw new Error("Job page does not contain enough readable content.");
  return { title: article?.title || dom.window.document.title || "", rawText: text };
}

import { NextResponse } from "next/server";
import { getFallbackInsightReport, type InsightContext, type InsightReport } from "@/lib/insights";

export const runtime = "nodejs";

function isInsightContext(value: unknown): value is InsightContext {
  return Boolean(
    value &&
      typeof value === "object" &&
      "period" in value &&
      "kpis" in value &&
      "funnel" in value &&
      "topProducts" in value,
  );
}

function extractOutputText(response: unknown) {
  if (!response || typeof response !== "object") {
    return "";
  }

  const data = response as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        text?: string;
        type?: string;
      }>;
    }>;
  };

  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter((text): text is string => Boolean(text))
      .join("\n") ?? ""
  );
}

function parseReport(text: string, context: InsightContext): InsightReport {
  try {
    const parsed = JSON.parse(text) as Partial<InsightReport>;

    return {
      title: parsed.title || "E-commerce Analytics Report",
      summary: parsed.summary || getFallbackInsightReport(context).summary,
      insights: Array.isArray(parsed.insights) ? parsed.insights.map(String).slice(0, 6) : [],
      recommendedActions: Array.isArray(parsed.recommendedActions)
        ? parsed.recommendedActions.map(String).slice(0, 6)
        : [],
      anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies.map(String).slice(0, 6) : [],
    };
  } catch {
    return {
      ...getFallbackInsightReport(context),
      summary: text || getFallbackInsightReport(context).summary,
    };
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "OPENAI_API_KEY is missing. Add it to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { context?: unknown };

  if (!isInsightContext(body.context)) {
    return NextResponse.json({ error: "Invalid analytics context." }, { status: 400 });
  }

  const context = body.context;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "You are an e-commerce analytics analyst. Use only the provided metrics. Do not invent data. Return concise JSON only.",
        },
        {
          role: "user",
          content: `Create a simple executive analytics report from this JSON context. Return only JSON with this shape: {"title": string, "summary": string, "insights": string[], "recommendedActions": string[], "anomalies": string[]}.\n\n${JSON.stringify(context)}`,
        },
      ],
    }),
  });

  if (!openAiResponse.ok) {
    const errorText = await openAiResponse.text();
    return NextResponse.json(
      {
        error: `OpenAI request failed: ${errorText}`,
      },
      { status: openAiResponse.status },
    );
  }

  const openAiJson = (await openAiResponse.json()) as unknown;
  const report = parseReport(extractOutputText(openAiJson), context);

  return NextResponse.json({ report, model });
}

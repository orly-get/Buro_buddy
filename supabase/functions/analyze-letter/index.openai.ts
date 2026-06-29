// analyze-letter — OpenAI (direct) variant.
// To use: rename this file to index.ts (replacing the OpenRouter version) and
// set the OPENAI_API_KEY secret:  supabase secrets set OPENAI_API_KEY=sk-...
// Optionally override the model with OPENAI_MODEL (default: gpt-4o-mini).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { encodeBase64 } from "jsr:@std/encoding/base64";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalyzeRequest {
  file_url: string;
  mimeType: string;
  file_name?: string;
}

interface Task {
  description: string;
  due_date: string | null;
}

interface AnalyzeResponse {
  summary: string;
  tasks: Task[];
  category: string;
}

// gpt-4o-mini is low-cost and supports both image and PDF inputs + JSON output.
// Override without redeploying via the OPENAI_MODEL env var.
const DEFAULT_MODEL = "gpt-4o-mini";

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // Off by default so we never leak raw provider output / stack traces to callers.
  // Set ANALYZE_DEBUG=true to include a `detail` field while diagnosing.
  const debug = (Deno.env.get("ANALYZE_DEBUG") ?? "false") === "true";

  try {
    const body: AnalyzeRequest = await req.json();
    const { file_url, mimeType, file_name } = body;

    if (!file_url || !mimeType) {
      return jsonResponse({ error: "Missing file_url or mimeType field" }, 400);
    }

    const isPdf = mimeType === "application/pdf";
    const isImage = mimeType.startsWith("image/");
    if (!isPdf && !isImage) {
      return jsonResponse(
        { error: "Unsupported file type", stage: "validation", mimeType },
        400,
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "OPENAI_API_KEY not configured" }, 500);
    }

    const model = Deno.env.get("OPENAI_MODEL") ?? DEFAULT_MODEL;

    // 1. Download the file
    let arrayBuffer: ArrayBuffer;
    try {
      const fileResponse = await fetch(file_url);
      if (!fileResponse.ok) {
        return jsonResponse(
          { error: "Failed to fetch file", stage: "download", status: fileResponse.status, file_url },
          502,
        );
      }
      arrayBuffer = await fileResponse.arrayBuffer();
    } catch (e) {
      return jsonResponse(
        { error: "Failed to fetch file", stage: "download", detail: debug ? String(e) : undefined, file_url },
        502,
      );
    }

    // 2. Convert to Base64 data URI
    const dataUri = `data:${mimeType};base64,${encodeBase64(arrayBuffer)}`;

    // 3. Prompt
    const systemPrompt = `אתה עוזר וירטואלי שמתמחה בניתוח מכתבים בירוקרטיים רשמיים בעברית.
אנא קרא את המסמך המצורף.
נתח את המכתב והחזר JSON בלבד (ללא הסברים נוספים, ללא markdown) בפורמט הבא:
{
  "summary": "תקציר בעברית פשוטה של תוכן המכתב (עד 3 משפטים)",
  "tasks": [
    {
      "description": "תיאור הפעולה הנדרשת. אם אין, השאר מערך ריק.",
      "due_date": "YYYY-MM-DD או null אם אין תאריך"
    }
  ],
  "category": "אחת מ: ביטוח לאומי, מס הכנסה, עירייה, בנק, בריאות, חינוך, דואר, אחר"
}

הקפד על:
- סיכום ברור ופשוט להבנה בעברית.
- רשימת כל הפעולות הנדרשות עם תאריכים מדויקים כפי שמופיע במסמך.
- סיווג נכון של סוג המכתב.`;

    // OpenAI accepts images via image_url and PDFs via a "file" content part
    // with base64 file_data (gpt-4o / gpt-4o-mini parse PDFs natively).
    const fileContentPart = isPdf
      ? { type: "file", file: { filename: file_name ?? "document.pdf", file_data: dataUri } }
      : { type: "image_url", image_url: { url: dataUri } };

    const payload = {
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            fileContentPart,
          ],
        },
      ],
      response_format: { type: "json_object" },
    };

    // 4. Call OpenAI
    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      return jsonResponse(
        { error: "OpenAI request failed", stage: "openai_fetch", detail: debug ? String(e) : undefined },
        502,
      );
    }

    const rawText = await response.text();

    if (!response.ok) {
      console.error("OpenAI API error:", response.status, rawText);
      return jsonResponse(
        {
          error: "OpenAI API error",
          stage: "openai",
          status: response.status,
          model,
          detail: debug ? rawText.slice(0, 1500) : undefined,
        },
        502,
      );
    }

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      return jsonResponse(
        { error: "OpenAI returned non-JSON", stage: "openai_parse", detail: debug ? rawText.slice(0, 1500) : undefined },
        502,
      );
    }

    const generatedText: string | undefined = data?.choices?.[0]?.message?.content;
    if (!generatedText) {
      return jsonResponse(
        { error: "No content from AI", stage: "no_content", detail: debug ? JSON.stringify(data).slice(0, 1500) : undefined },
        502,
      );
    }

    // 5. Parse model output (strip ```json fences just in case)
    const cleaned = generatedText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", generatedText);
      return jsonResponse(
        { error: "Failed to parse AI response", stage: "result_parse", detail: debug ? generatedText.slice(0, 1500) : undefined },
        502,
      );
    }

    // 6. Normalize so a malformed model response can't break downstream inserts.
    const ALLOWED_CATEGORIES = [
      "ביטוח לאומי", "מס הכנסה", "עירייה", "בנק", "בריאות", "חינוך", "דואר", "אחר",
    ];
    const p = (parsed ?? {}) as Record<string, unknown>;
    const rawTasks = Array.isArray(p.tasks) ? p.tasks : [];
    const tasks: Task[] = rawTasks
      .map((t) => {
        const o = (t ?? {}) as Record<string, unknown>;
        const description = typeof o.description === "string" ? o.description.trim() : "";
        const due = typeof o.due_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.due_date)
          ? o.due_date
          : null;
        return { description, due_date: due };
      })
      .filter((t) => t.description.length > 0);

    const category = typeof p.category === "string" && ALLOWED_CATEGORIES.includes(p.category)
      ? p.category
      : "אחר";

    const result: AnalyzeResponse = {
      summary: typeof p.summary === "string" ? p.summary.trim() : "",
      tasks,
      category,
    };

    return jsonResponse(result, 200);
  } catch (error) {
    console.error("Edge function error:", error);
    return jsonResponse(
      {
        error: "Internal server error",
        detail: debug ? String((error as Error)?.stack ?? error) : undefined,
      },
      500,
    );
  }
});

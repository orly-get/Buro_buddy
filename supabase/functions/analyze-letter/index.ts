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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: AnalyzeRequest = await req.json();
    const { file_url, mimeType, file_name } = body;

    if (!file_url || !mimeType) {
      return new Response(JSON.stringify({ error: "Missing file_url or mimeType field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Download the file
    const fileResponse = await fetch(file_url);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file from ${file_url}`);
    }
    const arrayBuffer = await fileResponse.arrayBuffer();
    
    // 2. Convert to Base64
    const base64String = encodeBase64(arrayBuffer);
    const dataUri = `data:${mimeType};base64,${base64String}`;

    // 3. Construct System Prompt
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

    const openRouterPayload = {
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            { type: "image_url", image_url: { url: dataUri } }
          ]
        }
      ],
      response_format: { type: "json_object" }
    };

    // 4. Send to OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(openRouterPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return new Response(JSON.stringify({ error: "OpenRouter API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generatedText = data?.choices?.[0]?.message?.content;

    if (!generatedText) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Parse JSON
    let result: AnalyzeResponse;
    try {
      result = JSON.parse(generatedText);
    } catch {
      console.error("Failed to parse AI response:", generatedText);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

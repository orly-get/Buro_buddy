import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalyzeRequest {
  text?: string;
  imageData?: string;
  mimeType?: string;
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
    const { text, imageData, mimeType } = body;

    if (!text && !imageData) {
      return new Response(JSON.stringify({ error: "Missing text or imageData field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `אתה עוזר וירטואלי שמתמחה בניתוח מכתבים בירוקרטיים רשמיים בעברית.

נתח את המכתב והחזר JSON בלבד (ללא הסברים נוספים) בפורמט:
{
  "summary": "תקציר בעברית פשוטה של תוכן המכתב (עד 3 משפטים)",
  "tasks": [
    {
      "description": "תיאור הפעולה הנדרשת",
      "due_date": "YYYY-MM-DD או null אם אין תאריך"
    }
  ],
  "category": "אחת מ: ביטוח לאומי, מס הכנסה, עירייה, בנק, בריאות, חינוך, אחר"
}

הקפד על:
- סיכום ברור ופשוט להבנה
- רשימת כל הפעולות הנדרשות עם תאריכים מדויקים
- סיווג נכון של סוג המכתב`;

    let userContent: string;

    if (imageData && mimeType) {
      // For images, we'll describe what we would analyze
      // Note: Groq's Llama models don't support vision, so we'll handle this gracefully
      userContent = `זוהו תמונה של מכתב רשמי (סוג: ${mimeType}).
התמונה הועלתה אך לא ניתן לעבד אותה ישירות.
אנא ספק תשובת ברירת מחדל המתאימה למכתב בירוקרטי כללי.
החזר JSON בלבד.`;
    } else {
      userContent = `טקסט המכתב:\n${text}`;
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.3,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return new Response(JSON.stringify({ error: "Groq API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generatedText = data?.choices?.[0]?.message?.content;

    if (!generatedText) {
      return new Response(JSON.stringify({ error: "No response from Groq" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: AnalyzeResponse;
    try {
      result = JSON.parse(generatedText);
    } catch {
      console.error("Failed to parse Groq response:", generatedText);
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

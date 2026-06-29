# Core Logic Documentation

This document outlines the critical backend and AI integration logic for the Buro Buddy application that must **NOT** be touched or altered during the redesign process.

## 1. `src/lib/supabase.ts` (Supabase Client)
**What it does:** Initializes and exports the main `supabase` client instance for the application.
**Data Flow:**
- Pulls `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from environment variables (or falls back to hardcoded defaults).
- Creates the Supabase client instance using `@supabase/supabase-js`.
- Exports this instance so all other components and contexts can communicate with the Supabase backend.

## 2. `src/context/AuthContext.tsx` (Google Authentication)
**What it does:** Manages the global authentication state and provides Google sign-in/sign-out functionality.
**Data Flow:**
- Initializes state for `user`, `session`, and `loading`.
- On mount, calls `supabase.auth.getSession()` and subscribes to `supabase.auth.onAuthStateChange` to keep the user state synchronized with Supabase.
- `signInWithGoogle()`: Calls `supabase.auth.signInWithOAuth` specifically configured with the `'google'` provider and redirects back to `/auth/callback`.
- `signOut()`: Calls `supabase.auth.signOut()`.
- Provides these properties and functions to the rest of the app via `AuthContext.Provider`.

## 3. `supabase/functions/analyze-letter/index.ts` (AI Document Analysis)
**What it does:** A Supabase Edge Function (running on Deno) that takes an uploaded bureaucratic letter (image or PDF) and uses an AI vision model via the OpenRouter API to analyze it.
**Data Flow:**
- **Input:** Receives a POST request containing JSON with `file_url`, `mimeType`, and optional `file_name`.
- **Validation:** Accepts only image (`image/*`) or PDF (`application/pdf`) MIME types; anything else returns a 400.
- **Processing:**
  - Retrieves the `OPENROUTER_API_KEY` from the environment.
  - Downloads the file from `file_url` and converts it to a base64 `data:` URI.
  - Builds a Hebrew system prompt instructing the AI to act as an assistant specializing in Israeli bureaucratic letters and to return JSON only.
  - Sends a chat-completion request to `https://openrouter.ai/api/v1/chat/completions`.
    - **Model:** defaults to `openai/gpt-4o-mini` (OpenAI's low-cost vision model, billed through OpenRouter). Override with the `OPENROUTER_MODELS` env var (comma-separated, tried in order).
    - **Images** are sent as an `image_url` content part; **PDFs** are sent as a `file` content part and parsed by OpenRouter's `file-parser` plugin (engine `pdf-text` by default; set `PDF_ENGINE=mistral-ocr` for scanned PDFs).
    - Enforces a JSON object response format.
- **Output:** Returns a normalized JSON object containing:
  - `summary`: A short (up to 3-sentence) summary in plain Hebrew.
  - `tasks`: An array of tasks with `description` and `due_date` (`YYYY-MM-DD` or `null`).
  - `category`: One of the allowed categories (ביטוח לאומי, מס הכנסה, עירייה, בנק, בריאות, חינוך, דואר, אחר); anything else is coerced to `אחר`.
- **Error handling:** Returns structured errors with a `stage` field (`validation`, `download`, `openrouter`, `result_parse`, etc.) and an appropriate HTTP status. Raw upstream detail is included only when the `ANALYZE_DEBUG` env var is set to `"true"` (off by default to avoid leaking provider output).

## 4. `src/pages/UploadPage.tsx` (`handleUpload` function)
**What it does:** Orchestrates the entire file upload and AI analysis pipeline from the client side.
**Data Flow:**
1. **Storage:** Uploads the selected file (image or PDF) to the Supabase storage bucket named `letters` under the path `${user.id}/${Date.now()}.${fileExt}`.
2. **Public URL:** Retrieves the public URL of the uploaded file.
3. **Database (Init):** Inserts a new record into the `letters` table with the user's ID, the file URL, and a status of `'processing'`, returning the new letter's `id`.
4. **Edge Function Call:** 
   - Retrieves the current user's session token.
   - Sends a POST request to the `analyze-letter` Edge Function with the file context/type.
5. **Database (Update):** Upon a successful response from the Edge Function:
   - Inserts the generated summary into the `ai_summaries` table, linked to the `letter_id`.
   - Maps and inserts any generated tasks into the `tasks` table, linked to the `letter_id`.
   - Queries the `categories` table for the returned category name and updates the `letters` table with the corresponding `category_id`.
   - Sets the letter's `status` via `deriveCompletionStatus` (`src/lib/letterStatus.ts`): `'completed'` only when the letter has **no** tasks, otherwise `'pending'` ("needs handling"). A letter with tasks becomes `'completed'` only once the user checks off every task (handled in `LetterPage.toggleTask`).
   - **Note:** This status line was intentionally changed after this doc was first written, to decouple "analysis finished" from "letter handled." The rest of `handleUpload` is unchanged.
6. **Error Handling:** If the Edge Function fails, updates the letter status to `'failed'` and throws an error.
7. **Navigation:** Navigates the user to the specific letter's view page (`/letter/${letter.id}`).

import { NextResponse } from "next/server";

const HF_API_BASE = "https://mgdan-bone-metastasis-api.hf.space";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const message = formData.get("message") as string | null;

    if (!file && !message) {
      return NextResponse.json({ error: "No input provided." }, { status: 400 });
    }

    // ── IMAGE UPLOAD: /predict → /generate-report pipeline ──
    if (file) {
      // Step 1: Send the image to the prediction endpoint
      const predictFormData = new FormData();
      predictFormData.append("file", file);

      const predictRes = await fetch(`${HF_API_BASE}/predict`, {
        method: "POST",
        body: predictFormData,
      });

      if (!predictRes.ok) {
        const errorText = await predictRes.text().catch(() => "Unknown error");
        console.error("Predict API error:", predictRes.status, errorText);
        
        // Use friendly detector to catch quota issues in the error text
        const friendlyMessage = getFriendlyMessage(errorText.length > 5 ? errorText : `Inference Error: (Status: ${predictRes.status})`);
        
        return NextResponse.json(
          { message: friendlyMessage },
          { status: 200 }
        );
      }

      const predictionData = await predictRes.json();

      // Extract prediction metadata for the frontend to store in history
      const hasTumor = Boolean(predictionData.has_tumor);
      const confidence = typeof predictionData.classification_confidence === "number"
        ? predictionData.classification_confidence
        : null;
      const visualization = predictionData.visualization || null;

      // Step 2: Send prediction results to generate a detailed report
      try {
        const reportRes = await fetch(`${HF_API_BASE}/generate-report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(predictionData),
        });

        if (reportRes.ok) {
          const reportData = await reportRes.json();
          const rawReport = reportData.report || reportData.message || "";

          if (rawReport) {
            const cleanReport = stripHtml(rawReport);
            return NextResponse.json({
              message: cleanReport,
              metadata: { type: "scan", hasTumor, confidence, visualization },
            });
          }
        }
      } catch (reportError) {
        console.error("Report generation error:", reportError);
      }

      // Fallback: if report generation failed, return a clean prediction summary
      return NextResponse.json({
        message: formatPrediction(predictionData),
        metadata: { type: "scan", hasTumor, confidence, visualization },
      });
    }

    // ── TEXT MESSAGE: /chat endpoint ──
    if (message) {
      const chatRes = await fetch(`${HF_API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!chatRes.ok) {
        const errorText = await chatRes.text().catch(() => "Unknown error");
        console.error("Chat API error:", chatRes.status, errorText);
        return NextResponse.json(
          { message: "System Error: The AI inference engine could not process your request." },
          { status: 200 }
        );
      }

      const chatData = await chatRes.json();
      const rawReply = chatData.answer || chatData.response || chatData.reply || chatData.message || JSON.stringify(chatData);

      // Sanitize and return a friendly message if it's a technical error
      return NextResponse.json({ message: getFriendlyMessage(rawReply) });
    }

    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  } catch (error) {
    console.error("AI Backend Connection Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to the inference engine." },
      { status: 500 }
    );
  }
}

/**
 * Strips HTML tags and converts to clean readable plain text.
 */
function stripHtml(html: string): string {
  return html
    // Replace <br>, <br/>, <br /> with newlines
    .replace(/<br\s*\/?>/gi, "\n")
    // Replace closing block-level tags with newlines
    .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, "\n")
    // Replace <li> with bullet points
    .replace(/<li[^>]*>/gi, "• ")
    // Strip all remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Clean up excessive whitespace / blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Detects technical AI errors (like 429 Quota) and returns a human-friendly version.
 */
function getFriendlyMessage(rawMessage: string): string {
  const lower = rawMessage.toLowerCase();
  
  // Detect Google Gemini / Hugging Face Quota Errors
  if (
    lower.includes("429") || 
    lower.includes("resource_exhausted") || 
    lower.includes("quota exceeded") ||
    lower.includes("rate limit")
  ) {
    return "The AI engine is currently processing a high volume of requests. Please wait about 30 seconds and try again.";
  }

  // Detect general technical failures that return raw JSON
  if (lower.includes("error") && (rawMessage.includes("{") || lower.includes("status:"))) {
    // If it's a known inference error already handled by the frontend, keep it
    if (rawMessage.startsWith("Inference Error")) return rawMessage;
    return "System Error: The AI engine encountered an unexpected technical issue. Our team is investigating.";
  }

  return stripHtml(rawMessage);
}

/**
 * Formats the raw prediction data into a readable summary (fallback only).
 * Used only when /generate-report fails.
 */
function formatPrediction(data: Record<string, unknown>): string {
  const hasTumor = data.has_tumor;
  const confidence = data.classification_confidence ?? data.confidence ?? data.score;

  const lines: string[] = ["PRELIMINARY AI INFERENCE REPORT", ""];

  // Tumor detection result
  if (hasTumor !== undefined) {
    lines.push(`Result: ${hasTumor ? "⚠ Potential anomaly detected" : "✓ No anomaly detected"}`);
  }

  // Confidence score
  if (confidence !== undefined) {
    const pct = typeof confidence === "number"
      ? confidence <= 1 ? `${(confidence * 100).toFixed(1)}%` : `${confidence.toFixed(1)}%`
      : `${confidence}`;
    lines.push(`Confidence: ${pct}`);
  }

  // Detections count
  if (Array.isArray(data.detections)) {
    lines.push(`Detections: ${data.detections.length} region(s) identified`);
  }

  // Skip visualization (base64 image data) — not useful as text

  // Any other fields we haven't handled
  const skipKeys = new Set(["has_tumor", "classification_confidence", "confidence", "score", "detections", "visualization"]);
  for (const [key, value] of Object.entries(data)) {
    if (!skipKeys.has(key) && value !== null && value !== undefined) {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      lines.push(`${label}: ${typeof value === "object" ? JSON.stringify(value) : value}`);
    }
  }

  return lines.join("\n");
}

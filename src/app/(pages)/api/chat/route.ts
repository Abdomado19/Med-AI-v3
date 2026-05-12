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
        return NextResponse.json(
          { message: `Inference Error: The neural network could not process this image. (Status: ${predictRes.status})` },
          { status: 200 }
        );
      }

      const predictionData = await predictRes.json();

      // Extract prediction metadata for the frontend to store in history
      const hasTumor = Boolean(predictionData.has_tumor);
      const confidence = typeof predictionData.classification_confidence === "number"
        ? predictionData.classification_confidence
        : null;

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
              metadata: { type: "scan", hasTumor, confidence },
            });
          }
        }
      } catch (reportError) {
        console.error("Report generation error:", reportError);
      }

      // Fallback: if report generation failed, return a clean prediction summary
      return NextResponse.json({
        message: formatPrediction(predictionData),
        metadata: { type: "scan", hasTumor, confidence },
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

      // Strip any HTML the chat endpoint might return
      return NextResponse.json({ message: stripHtml(rawReply) });
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

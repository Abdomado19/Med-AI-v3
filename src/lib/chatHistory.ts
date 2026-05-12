/**
 * Shared utility for persisting scan/chat history in localStorage.
 * Keyed per-user (by email) to respect multi-account scenarios.
 */

export interface ScanRecord {
  id: string;
  date: string;
  imageDataUrl: string | null;
  aiReport: string;
  hasTumor: boolean;
  confidence: number | null;
  status: string;
  severity: "high" | "low";
}

const STORAGE_KEY_PREFIX = "med_ai_history_";

function getStorageKey(email: string): string {
  return `${STORAGE_KEY_PREFIX}${email}`;
}

/** Generate a short scan ID like "scn_a3f82b" */
function generateScanId(): string {
  const hex = Math.random().toString(16).slice(2, 8);
  return `scn_${hex}`;
}

/**
 * Convert a File to a base64 data URL for thumbnail storage.
 * Resizes to max 200px to keep localStorage usage reasonable.
 */
export function fileToThumbnailDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 200;
        let w = img.width;
        let h = img.height;
        if (w > h) { h = Math.round((h * MAX) / w); w = MAX; }
        else { w = Math.round((w * MAX) / h); h = MAX; }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/webp", 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Get all scan records for a user, newest first. */
export function getScanHistory(email: string): ScanRecord[] {
  try {
    const raw = localStorage.getItem(getStorageKey(email));
    if (!raw) return [];
    return JSON.parse(raw) as ScanRecord[];
  } catch {
    return [];
  }
}

/** Get a single scan record by ID for a given user. */
export function getScanById(email: string, scanId: string): ScanRecord | null {
  const history = getScanHistory(email);
  return history.find(r => r.id === scanId) ?? null;
}

/** Save a new scan record for a user (prepends to the front). */
export function saveScanRecord(
  email: string,
  data: {
    imageDataUrl: string | null;
    aiReport: string;
    hasTumor: boolean;
    confidence: number | null;
  }
): ScanRecord {
  const record: ScanRecord = {
    id: generateScanId(),
    date: new Date().toISOString(),
    imageDataUrl: data.imageDataUrl,
    aiReport: data.aiReport,
    hasTumor: data.hasTumor,
    confidence: data.confidence,
    status: data.hasTumor ? "Anomaly Detected" : "Normal",
    severity: data.hasTumor ? "high" : "low",
  };

  const existing = getScanHistory(email);
  const updated = [record, ...existing].slice(0, 50); // Keep max 50 records

  try {
    localStorage.setItem(getStorageKey(email), JSON.stringify(updated));
  } catch (e) {
    // If localStorage is full, remove oldest entries and retry
    const trimmed = updated.slice(0, 20);
    localStorage.setItem(getStorageKey(email), JSON.stringify(trimmed));
  }

  return record;
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UploadCloud, Scan, Activity, Loader2, Layers, AlertCircle, Send, Zap } from "lucide-react";
import { saveScanRecord, fileToThumbnailDataUrl, getScanById } from "@/lib/chatHistory";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string; type?: "image" }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [inputText, setInputText] = useState("");
  const [limitStatus, setLimitStatus] = useState<{ limitReached: boolean; timeLeftStr: string }>({
    limitReached: false,
    timeLeftStr: "",
  });
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Combine local storage flag with active session
  const hasEnterpriseAccess = isEnterprise && !!session;

  // Check for enterprise unlock
  useEffect(() => {
    const enterpriseStatus = localStorage.getItem("med_ai_enterprise");
    if (session?.user?.email && enterpriseStatus === session.user.email) {
      setIsEnterprise(true);
    } else {
      setIsEnterprise(false);
    }
  }, [session]);

  // Load a previous scan from profile page (?scan=<id>)
  useEffect(() => {
    const scanId = searchParams.get("scan");
    if (!scanId || !session?.user?.email) return;
    // Only load once (don't re-load if messages already exist from this scan)
    if (messages.length > 0) return;

    const record = getScanById(session.user.email, scanId);
    if (!record) return;

    const restored: { role: "user" | "ai"; text: string; type?: "image" }[] = [];

    // Restore the image if we have a thumbnail
    if (record.imageDataUrl) {
      restored.push({ role: "user", text: record.imageDataUrl, type: "image" });
    }

    // Restore the AI report
    restored.push({ role: "ai", text: record.aiReport });

    setMessages(restored);
  }, [searchParams, session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll limit status for basic users
  useEffect(() => {
    if (!session?.user?.email || hasEnterpriseAccess) {
      setLimitStatus({ limitReached: false, timeLeftStr: "" });
      return;
    }

    const checkLimit = () => {
      const status = getUploadLimitStatus(session.user.email!);
      setLimitStatus(status);
    };

    checkLimit();
    const interval = setInterval(checkLimit, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [session, hasEnterpriseAccess]);

  // Auto-scrolling disabled as per user request

  const handleUploadClick = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    // Prevent clicking if limit reached
    if (!hasEnterpriseAccess && limitStatus.limitReached) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check limit first
    if (!hasEnterpriseAccess && session?.user?.email) {
      const status = getUploadLimitStatus(session.user.email);
      if (status.limitReached) {
        alert("You have reached your daily upload limit of 1 scan per 24 hours.");
        event.target.value = ''; // Reset input
        return;
      }
    }

    event.target.value = ''; // Reset input
    setIsProcessing(true);
    
    // Add user message (image preview) immediately
    const tempUrl = URL.createObjectURL(file);
    setMessages((prev) => [...prev, { role: "user", text: tempUrl, type: "image" }]);

    try {
      // Generate a small thumbnail for history storage (in parallel with the API call)
      const thumbnailPromise = fileToThumbnailDataUrl(file);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/chat", { method: "POST", body: formData });
      
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "ai", text: "Inference Error: The neural network could not process this image matrix." }]);
      } else {
        const aiRes = await res.json();
        setMessages((prev) => [...prev, { role: "ai", text: aiRes.message }]);

        // If the AI returned a visualization heatmap, display it as a message
        if (aiRes.metadata?.visualization) {
          const visualizationUrl = `data:image/jpeg;base64,${aiRes.metadata.visualization}`;
          setMessages((prev) => [...prev, { role: "ai", text: visualizationUrl, type: "image" }]);
        }

        // Save to scan history for the profile page
        if (session?.user?.email && aiRes.metadata?.type === "scan") {
          const thumbnail = await thumbnailPromise.catch(() => null);
          // Prioritize the AI visualization for the history record
          const finalImage = aiRes.metadata.visualization 
            ? `data:image/jpeg;base64,${aiRes.metadata.visualization}` 
            : thumbnail;

          saveScanRecord(session.user.email, {
            imageDataUrl: finalImage,
            aiReport: aiRes.message,
            hasTumor: aiRes.metadata.hasTumor ?? false,
            confidence: aiRes.metadata.confidence ?? null,
          });

          // Enforce daily limit for basic users
          if (!hasEnterpriseAccess) {
            const now = Date.now();
            localStorage.setItem(`med_ai_last_upload_${session.user.email}`, now.toString());
            const newStatus = getUploadLimitStatus(session.user.email);
            setLimitStatus(newStatus);
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "System Error: Connection to the inference engine was lost." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("message", userMessage);

      const res = await fetch("/api/chat", { method: "POST", body: formData });
      
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "ai", text: "System Error: Connection to the inference engine was lost." }]);
      } else {
        const aiRes = await res.json();
        setMessages((prev) => [...prev, { role: "ai", text: aiRes.message }]);
      }
    } catch (error) {
       setMessages((prev) => [...prev, { role: "ai", text: "System Error: Could not reach the server." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-24 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-[oklch(0.45_0.18_240/0.05)] blur-[100px] pointer-events-none" />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto pb-40 px-[3vw] xl:px-[15vw] relative z-10 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        
        {messages.length === 0 ? (
          // --- Empty State ---
          <div className="h-full flex flex-col items-center justify-center animate-slide-up mt-20">
            <div className="relative w-24 h-24 rounded-3xl bg-card border border-white/10 flex items-center justify-center shadow-2xl mb-8 group">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl group-hover:bg-primary/30 transition-colors" />
              <Scan className="w-12 h-12 text-primary relative z-10 animate-pulse" />
              <div className="absolute inset-0 radar-sweep rounded-3xl opacity-50" />
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-3">
              {hasEnterpriseAccess ? "Enterprise Chat " : "Inference Engine "}<span className="text-primary">Ready</span>
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              {hasEnterpriseAccess 
                ? "Upload a standard high-resolution bone X-ray, or ask follow-up questions to the neural network."
                : limitStatus.limitReached
                  ? `You have reached your daily upload limit of 1 scan. Next upload will be available in ${limitStatus.timeLeftStr}. Upgrade to Enterprise to remove this limit.`
                  : "Upload a standard high-resolution bone X-ray to begin. The AI will analyze cortical irregularities and provide an instant preliminary report."}
            </p>
          </div>
        ) : (
          // --- Messages ---
          <div className="flex flex-col gap-8 max-w-4xl mx-auto py-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"} animate-slide-up`}>
                
                {/* AI Avatar */}
                {msg.role === "ai" && (
                  <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mr-4 shrink-0 mt-1 shadow-[0_0_15px_oklch(0.75_0.25_210/0.2)]">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                )}

                <div className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 ${
                  msg.role === "ai" 
                    ? "bg-card/80 backdrop-blur-md border border-white/10 text-foreground shadow-lg leading-relaxed" 
                    : "bg-primary/10 border border-primary/30 shadow-[0_0_20px_oklch(0.75_0.25_210/0.1)] p-2"
                }`}>
                  
                  {msg.type === "image" ? (
                    <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/5 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={msg.text} alt="X-Ray Upload" className="max-w-full h-auto object-cover max-h-[400px]" />
                      <div className="absolute inset-0 scan-line" />
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-xs font-mono text-primary">
                        <Activity className="w-3 h-3" /> ANALYZING IMAGE MATRIX
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-p:leading-relaxed max-w-none text-[15px]">
                      {msg.text.startsWith("Inference Error") || msg.text.startsWith("System Error") ? (
                        <div className="flex gap-3 text-destructive/90 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                          <AlertCircle className="w-5 h-5 shrink-0" />
                          <span>{msg.text}</span>
                        </div>
                      ) : (
                        <p className={msg.role === "user" ? "px-2 py-1" : "whitespace-pre-wrap"}>{msg.text}</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
            
            {/* Processing State indicator */}
            {isProcessing && (
               <div className="flex justify-start animate-slide-up">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mr-4 shrink-0 mt-1">
                    <Layers className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div className="bg-card/80 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-sm font-medium text-muted-foreground animate-pulse">Processing inference layers...</span>
                  </div>
               </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </main>

      {/* Bottom Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-background via-background/95 to-transparent z-20 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          
          <div className="relative group">
            {/* Outer glow */}
            <div className={`absolute -inset-1 rounded-2xl blur-md transition-all duration-500 opacity-50 ${hasEnterpriseAccess ? 'bg-gradient-to-r from-primary/50 to-primary/20 group-hover:from-primary/70' : 'bg-gradient-to-r from-primary/30 to-primary/10 group-hover:from-primary/50'}`} />
            
            {/* Glassmorphic Prompt Box */}
            <div className="relative bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-3 shadow-2xl transition-all duration-300">
              
              {!hasEnterpriseAccess ? (
                // --- BASIC MODE ---
                <div className="flex-1 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <p className={`${limitStatus.limitReached ? "text-destructive/90 animate-pulse" : "text-muted-foreground/70"} text-[15px] font-medium flex items-center gap-2 select-none`}>
                    {limitStatus.limitReached ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                        Daily limit reached. Next upload in <span className="font-semibold text-primary">{limitStatus.timeLeftStr}</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 opacity-50 shrink-0" />
                        Upload an X-Ray scan to begin analysis...
                      </>
                    )}
                  </p>
                  {limitStatus.limitReached && (
                    <Link href="/upgrade" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Upgrade to Enterprise
                    </Link>
                  )}
                </div>
              ) : (
                // --- ENTERPRISE MODE ---
                <form onSubmit={handleSendMessage} className="flex-1 flex items-center pl-4 pr-2 py-1">
                  <button type="button" onClick={handleUploadClick} title="Upload Scan" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5 mr-2">
                    <UploadCloud className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask the AI about the scan results..."
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-foreground text-[15px] placeholder:text-muted-foreground/50 h-10 w-full"
                    disabled={isProcessing}
                  />
                </form>
              )}

              {/* Action Button */}
              {hasEnterpriseAccess ? (
                 <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isProcessing}
                  className={`relative h-12 w-12 rounded-xl font-bold flex items-center justify-center transition-all duration-300 ${
                    !inputText.trim() || isProcessing
                      ? "bg-primary/20 text-primary-foreground/50 cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 btn-glow shadow-[0_0_20px_oklch(0.75_0.25_210/0.4)]"
                  }`}
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                </button>
              ) : (
                <button
                  onClick={handleUploadClick}
                  disabled={!session || isProcessing || limitStatus.limitReached}
                  className={`relative h-12 px-6 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${
                    !session || limitStatus.limitReached
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" 
                      : isProcessing
                        ? "bg-primary/50 text-primary-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 btn-glow shadow-[0_0_20px_oklch(0.75_0.25_210/0.4)]"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Scanning
                    </>
                  ) : limitStatus.limitReached ? (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      Locked
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5" />
                      {session ? "Upload Scan" : "Login Required"}
                    </>
                  )}
                </button>
              )}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground/60 mt-4 font-medium tracking-wide">
            Med.AI can make mistakes. Always verify critical clinical data.
          </p>
        </div>
      </div>

    </div>
  );
}

function getUploadLimitStatus(email: string): { limitReached: boolean; timeLeftStr: string } {
  if (typeof window === "undefined") {
    return { limitReached: false, timeLeftStr: "" };
  }
  const lastUploadStr = localStorage.getItem(`med_ai_last_upload_${email}`);
  if (!lastUploadStr) {
    return { limitReached: false, timeLeftStr: "" };
  }
  const lastUpload = parseInt(lastUploadStr, 10);
  if (isNaN(lastUpload)) {
    return { limitReached: false, timeLeftStr: "" };
  }
  
  const now = Date.now();
  const diff = now - lastUpload;
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  if (diff < twentyFourHours) {
    const remainingMs = twentyFourHours - diff;
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    let timeLeftStr = "";
    if (hours > 0) {
      timeLeftStr += `${hours}h `;
    }
    if (minutes > 0 || hours === 0) {
      timeLeftStr += `${minutes > 0 ? minutes : 1}m`;
    }
    
    return { limitReached: true, timeLeftStr };
  }
  
  return { limitReached: false, timeLeftStr: "" };
}

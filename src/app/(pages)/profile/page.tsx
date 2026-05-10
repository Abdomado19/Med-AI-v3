"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, ShieldCheck, Clock, FileText, Activity, AlertTriangle, Layers, Lock, Zap } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const enterpriseStatus = localStorage.getItem("med_ai_enterprise");
    if (session?.user?.email && enterpriseStatus === session.user.email) {
      setIsEnterprise(true);
    } else {
      setIsEnterprise(false);
    }
  }, [session]);

  // Protect route
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !isMounted || !session) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
           <Layers className="w-10 h-10 text-primary mb-4" />
           <p className="text-muted-foreground font-medium tracking-widest uppercase text-xs">Loading Profile...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // BACKEND & DATABASE TEAM: Fetch real user history here!
  // --------------------------------------------------------------------------
  // Example: const userHistory = await db.scans.findMany({ where: { userId: session.user.id } })
  //
  // For now, we use highly polished mock data to build out the UI.
  const mockHistory = [
    {
      id: "scn_992812",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      image: "/xray-ai.png", 
      status: "Anomaly Detected",
      severity: "high",
      report: "Analysis indicates a possible periosteal reaction and cortical destruction in the distal femur. Immediate clinical correlation and biopsy are strongly recommended to rule out osteosarcoma.",
    },
    {
      id: "scn_109283",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      image: "/xray-ai.png", 
      status: "Normal",
      severity: "low",
      report: "Cortical integrity appears entirely intact. No osteolytic lesions, fractures, or obvious signs of malignancy detected in this scan matrix.",
    },
    {
      id: "scn_001928",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks ago
      image: "/xray-ai.png",
      status: "Normal",
      severity: "low",
      report: "Medullary cavity shows normal radiodensity. No evidence of metastatic deposits or primary bone tumors.",
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 px-[3vw] xl:px-[7vw] bg-background relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className={`absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${isEnterprise ? 'bg-primary/10' : 'bg-primary/5'}`} />

      <div className="container mx-auto max-w-5xl relative z-10">
        
        <div className="mb-12 animate-slide-up flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Clinical <span className="text-primary">Profile</span></h1>
            <p className="text-muted-foreground">Manage your account and view past inference reports.</p>
          </div>
          
          {/* Dynamic Top Badge */}
          {isEnterprise ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary shadow-[0_0_15px_oklch(0.75_0.25_210/0.3)]">
              <Zap className="w-4 h-4 fill-primary" /> Enterprise Active
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-muted-foreground">
              Basic Tier
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: User Data */}
          <div className="lg:col-span-1 flex flex-col gap-6 animate-slide-up delay-100">
            
            {/* Profile Card */}
            <div className={`bento-card p-6 relative overflow-hidden transition-all duration-500 ${isEnterprise ? 'border-primary/50 shadow-[0_0_30px_oklch(0.75_0.25_210/0.1)]' : ''}`}>
              
              {isEnterprise && (
                 <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-colors ${isEnterprise ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-white/10'}`}>
                  <User className={`w-8 h-8 ${isEnterprise ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold truncate max-w-[200px]">
                    {(session.user as any)?.name || "Clinical User"}
                  </h2>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full w-max mt-1 border ${isEnterprise ? 'text-primary/90 bg-primary/10 border-primary/20' : 'text-muted-foreground bg-white/5 border-white/10'}`}>
                    <ShieldCheck className="w-3 h-3" />
                    Verified Physician
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 opacity-70" />
                  <span className="truncate">{session.user?.email || "No email provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Layers className={`w-4 h-4 ${isEnterprise ? 'text-primary' : 'opacity-70'}`} />
                  <span className={isEnterprise ? 'text-primary font-semibold' : ''}>
                    {isEnterprise ? 'Enterprise Inference License' : 'Basic Inference Access'}
                  </span>
                </div>
              </div>

              {!isEnterprise && (
                <div className="mt-6 pt-6 border-t border-white/10">
                   <Link href="/upgrade" className="w-full h-10 rounded-lg flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm transition-colors border border-primary/20">
                     <Zap className="w-4 h-4" /> Upgrade to Enterprise
                   </Link>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bento-card p-4 text-center flex flex-col items-center justify-center">
                  <Activity className={`w-5 h-5 mb-2 ${isEnterprise ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-2xl font-black">{isEnterprise ? '128' : '--'}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Scans</span>
               </div>
               <div className="bento-card p-4 text-center flex flex-col items-center justify-center">
                  <Clock className={`w-5 h-5 mb-2 ${isEnterprise ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-2xl font-black">{isEnterprise ? '12h' : '--'}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Uptime</span>
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Clinical History */}
          <div className="lg:col-span-2 flex flex-col gap-6 animate-slide-up delay-200">
             
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <FileText className="w-5 h-5 text-primary" />
                 Inference History
               </h3>
               <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full border border-white/10">
                 Last 30 Days
               </span>
             </div>

             <div className="flex flex-col gap-4 relative">
               
               {mockHistory.map((item, idx) => {
                 
                 // In Basic mode, lock everything after the first scan
                 const isLocked = !isEnterprise && idx > 0;

                 return (
                   <div key={item.id} className={`bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg relative group ${isLocked ? 'overflow-hidden' : 'hover:bg-card/60 transition-colors'}`}>
                     
                     <div className={`flex flex-col sm:flex-row gap-5 ${isLocked ? 'blur-md opacity-40 select-none pointer-events-none' : ''}`}>
                       
                       {/* Thumbnail */}
                       <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-black shrink-0 border border-white/5">
                          <Image 
                            src={item.image} 
                            alt={`Scan ${item.id}`}
                            fill
                            className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/70">{item.id}</span>
                       </div>

                       {/* Details */}
                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-xs text-muted-foreground mb-1 block">
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                                item.severity === "high" 
                                  ? "bg-destructive/10 text-destructive border-destructive/20" 
                                  : "bg-primary/10 text-primary border-primary/20"
                              }`}>
                                {item.severity === "high" ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                {item.status}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-foreground/80 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5 mt-3">
                            <span className="text-primary font-semibold text-xs uppercase tracking-wider block mb-1">AI Report</span>
                            {item.report}
                          </p>
                       </div>
                     </div>

                     {/* Lock Overlay */}
                     {isLocked && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px]">
                           <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-3">
                              <Lock className="w-5 h-5 text-muted-foreground" />
                           </div>
                           <p className="font-bold text-lg tracking-tight mb-1">History Locked</p>
                           <p className="text-sm text-muted-foreground mb-4">Enterprise License required to view older records.</p>
                           <Link href="/upgrade" className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-bold text-sm btn-glow shadow-[0_0_15px_oklch(0.75_0.25_210/0.4)] transition-transform hover:scale-105">
                             Upgrade Now
                           </Link>
                        </div>
                     )}

                   </div>
                 );
               })}

             </div>

             {isEnterprise && (
               <button className="w-full py-4 mt-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                 Load Older Scans
               </button>
             )}

          </div>

        </div>
      </div>
    </div>
  );
}
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, Activity, Zap, ShieldCheck, Microscope } from "lucide-react";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

async function Hero() {
  const session = await getServerSession(authOptions);

  return (
    <section className="relative min-h-screen pt-24 pb-16 flex items-center overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="ambient-glow top-0 left-[10%] -translate-y-1/2" />
      <div className="ambient-glow bottom-0 right-[10%] translate-y-1/2 bg-[oklch(0.60_0.25_250/0.1)]" />

      <div className="container mx-auto px-[3vw] xl:px-[7vw]">
        
        {/* Main Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            V2.0 Medical Engine Live
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            The Future of <br className="hidden md:block" />
            <span className="text-gradient">Bone Cancer Detection</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Med.AI deploys state-of-the-art neural networks to analyze X-ray scans with unprecedented accuracy. Giving oncologists the clarity they need, instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="btn-glow h-14 px-8 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/chat">
                Start Analysis Engine <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            {!session && (
              <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg font-semibold border-primary/50 text-foreground hover:bg-primary/10">
                <Link href="/register">Request Clinical Demo</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Bento Box Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Box 1: Large Image Showcase */}
          <div className="bento-card md:col-span-2 row-span-2 min-h-[400px] flex items-center justify-center animate-slide-up delay-100 group">
            <div className="absolute inset-0 z-0">
              {/* Note: Ensure xray-ai.png is generated in the public directory */}
              <Image 
                src="/xray-ai.png" 
                alt="AI X-ray Scan Interface" 
                fill 
                className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
            
            <div className="relative z-10 w-full h-full p-8 flex flex-col justify-end">
              <div className="bg-background/80 backdrop-blur-md border border-border p-4 rounded-2xl w-max">
                <div className="flex items-center gap-3 mb-1">
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="font-bold text-lg">Inference Complete</span>
                </div>
                <p className="text-sm text-muted-foreground">High confidence anomaly detection (99.8%)</p>
              </div>
            </div>
          </div>

          {/* Box 2: Stat */}
          <div className="bento-card p-8 flex flex-col justify-between animate-slide-up delay-200">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-4xl font-black text-foreground mb-2">&lt; 3s</h3>
              <p className="text-muted-foreground font-medium">Average processing time per complete X-ray scan array.</p>
            </div>
          </div>

          {/* Box 3: Feature */}
          <div className="bento-card p-8 flex flex-col justify-between animate-slide-up delay-300">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Micro-Precision</h3>
              <p className="text-muted-foreground font-medium text-sm">Identifies subtle cortical irregularities missed by the naked eye.</p>
            </div>
          </div>

        </div>

        {/* Trusted By Banner */}
        {/* <div className="mt-20 pt-10 border-t border-border/50 text-center animate-slide-up delay-300">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Designed to meet clinical standards</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2 font-black text-xl"><ShieldCheck className="w-6 h-6"/> HIPAA COMPLIANT</div>
             <div className="flex items-center gap-2 font-black text-xl"><ShieldCheck className="w-6 h-6"/> FDA CLEARANCE PATH</div>
             <div className="flex items-center gap-2 font-black text-xl"><ShieldCheck className="w-6 h-6"/> ISO 27001</div>
          </div>
        </div> */}

      </div>
    </section>
  );
}

export default Hero;
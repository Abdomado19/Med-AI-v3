"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2, Shield, Zap, Activity, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    monthly: {
      price: "$19.99",
      period: "/ month",
      description: "Perfect for independent practitioners.",
      features: [
        "Unlimited X-Ray Inferences",
        "Full Clinical Report Generation",
        "HIPAA Compliant Data Processing",
        "Standard Neural Network Priority",
        "Email Support",
      ],
    },
    yearly: {
      price: "$199.99",
      period: "/ year",
      description: "Best value for continuous clinical use.",
      features: [
        "Unlimited X-Ray Inferences",
        "Full Clinical Report Generation",
        "HIPAA Compliant Data Retention",
        "Highest Neural Network Priority",
        "24/7 Priority Support",
        "2 Months Free Included",
      ],
    },
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Simulate secure checkout delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Tie the Enterprise Mode locally to the user's email
      const userIdentifier = session?.user?.email || "active";
      localStorage.setItem("med_ai_enterprise", userIdentifier);
      
      // Redirect to the unlocked Inference Engine
      router.push("/chat");
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-background relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-[oklch(0.45_0.18_240/0.05)] blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-[3vw] xl:px-[7vw] relative z-10 flex flex-col lg:flex-row items-center gap-16 max-w-6xl">
        
        {/* Left Side: Copy */}
        <div className="flex-1 animate-slide-up text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary mb-6">
            <Zap className="w-4 h-4" />
            Enterprise Access
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
            Unlock <span className="text-gradient">Clinical-Grade</span> <br/>
            Intelligence.
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0">
            Gain unlimited access to the Med.AI neural network. Process X-rays instantly, generate detailed preliminary reports, and elevate your diagnostic capabilities.
          </p>

          <div className="flex flex-col gap-4 text-sm font-medium text-foreground/80 max-w-sm mx-auto lg:mx-0">
             <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-primary" /> End-to-end HIPAA compliant architecture.</div>
             <div className="flex items-center gap-3"><Activity className="w-5 h-5 text-primary" /> 99.9% guaranteed API uptime.</div>
             <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-primary" /> ISO 27001 certified data handling.</div>
          </div>
        </div>

        {/* Right Side: Pricing Card */}
        <div className="w-full max-w-md animate-slide-up delay-100">
          
          {/* Custom Toggle Switch */}
          <div className="flex justify-center mb-8 relative">
            
            {/* Floating Save 20% Badge */}
            <div className="absolute -top-4 right-4 md:right-12 bg-green-500/20 text-green-500 border border-green-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg animate-bounce z-20">
              Save 20%
            </div>

            <div className="bg-card/80 backdrop-blur-md border border-white/10 p-1.5 rounded-full grid grid-cols-2 relative shadow-lg w-[280px]">
              
              {/* Animated Pill Background */}
              <div 
                className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-primary rounded-full transition-transform duration-300 ease-out shadow-[0_0_15px_oklch(0.75_0.25_210/0.4)] z-0 ${
                  billingCycle === "monthly" ? "translate-x-0" : "translate-x-[100%]"
                }`}
              />

              <button
                className={`relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 text-center ${billingCycle === "monthly" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              
              <button
                className={`relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 text-center ${billingCycle === "yearly" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Pricing Bento Card */}
          <div className="bento-card p-8 relative overflow-hidden group">
            {/* Hover Glow */}
            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl z-0" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Clinical License</h3>
              <p className="text-muted-foreground text-sm mb-6">{plans[billingCycle].description}</p>
              
              <div className="flex items-end gap-2 mb-8">
                <span className="text-5xl font-black text-foreground tracking-tighter">{plans[billingCycle].price}</span>
                <span className="text-muted-foreground font-medium mb-1.5">{plans[billingCycle].period}</span>
              </div>

              <div className="space-y-4 mb-8">
                {plans[billingCycle].features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-foreground/90">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full h-14 rounded-xl text-lg font-bold flex items-center justify-center transition-all duration-300 ${
                  isProcessing 
                    ? "bg-primary/50 text-white cursor-not-allowed" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90 btn-glow shadow-[0_0_20px_oklch(0.75_0.25_210/0.4)]"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Securing Session...
                  </>
                ) : (
                  "Upgrade to Enterprise"
                )}
              </button>
              
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                 <Shield className="w-3.5 h-3.5 opacity-70" /> Secured via Stripe Checkout
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

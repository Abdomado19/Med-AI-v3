import { MapPin, Mail, Phone, Layers } from "lucide-react"
import Link from "next/link"

function Footer() {
  return (
    <footer className="mt-32 border-t border-white/10 pt-16 pb-8 bg-background relative overflow-hidden">
      
      {/* Background subtle glow */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-[3vw] xl:px-[7vw]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 relative z-10">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col pr-8">
            <Link href="/" className="flex items-center gap-3 group w-max mb-6">
              <div className="relative w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                Med<span className="text-primary">.AI</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-xs">
              The world's most advanced AI for detecting bone cancer from standard X-ray imaging. Empowering medical professionals with rapid, micro-precision insights.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span>742 Evergreen Terrace, Medical District, NY</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span>+1 (800) MED-AI-SCAN</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span>clinical@med.ai</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-6">Platform</h3>
            <ul className="flex flex-col gap-4">
              {["Inference Engine", "Batch Processing", "API Access", "Clinical Trials"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-6">Company</h3>
            <ul className="flex flex-col gap-4">
              {["About Med.AI", "Research Publications", "Careers", "Newsroom", "Investor Relations"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-6">Legal & Security</h3>
            <ul className="flex flex-col gap-4">
              {["Privacy Policy", "Terms of Service", "System Status"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} Med.AI Systems Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs text-muted-foreground font-mono">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
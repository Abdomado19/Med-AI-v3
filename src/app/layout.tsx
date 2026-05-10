
// @ts-ignore
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer/Footer";
import { Providers } from "@/components/Providers";
import type { ReactNode } from "react";




export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          <div className="container mx-auto px-[3vw] xl:px-[7vw]">
            <Toaster />
             
          {children}
       

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

"use client"

import { ShieldPlus } from 'lucide-react';
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

function UpgradeIcon({serverCartNum, cartId}: {serverCartNum: number, cartId: string}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (cartId) {
      localStorage.setItem("cartId", cartId)
    }
    
    // Check if the user has upgraded to Enterprise
    const enterpriseStatus = localStorage.getItem("med_ai_enterprise");
    if (session?.user?.email && enterpriseStatus === session.user.email) {
      setIsEnterprise(true);
    } else {
      setIsEnterprise(false);
    }
  }, [cartId, session, pathname]);

  // Prevent hydration mismatch by not rendering anything until mounted
  // Also wait for the session to finish loading so the icon doesn't flash
  // If they are enterprise, hide the icon entirely
  if (!isMounted || status === "loading" || isEnterprise) return null;

  return (
    <Link href="/upgrade" className="relative flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title="Upgrade to Enterprise">
      <ShieldPlus className="w-5 h-5" />
    </Link>
  );
}

export default UpgradeIcon;

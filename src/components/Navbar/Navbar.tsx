import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { UserIcon, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logout from "../Logout/Logout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import CartIcon from "../UpgradeIcon/UpgradeIcon";
import { CartRes } from "@/interfaces/CartInterfaces";

async function Navbar() {
  const session = await getServerSession(authOptions);
  let data: CartRes | null = null;

  if (session) {
    try {
      // TODO: Replace with your actual backend API URL
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce.routemisr.com";
      const response = await fetch(`${API_URL}/api/v1/cart`, {
        headers: { token: session?.token as string },
      });
      data = await response.json();
    } catch {
      data = null;
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/5 dark:border-white/5 py-4 px-[3vw] xl:px-[7vw] transition-all">
      <div className="container mx-auto flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
            <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
            <Layers className="relative z-10 w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            Med<span className="text-primary">.AI</span>
          </span>
        </Link>


        {/* Right: user + cart */}
        <div className="flex items-center gap-4">
          {session && (
            <div className="hidden sm:block hover:scale-105 transition-transform text-muted-foreground hover:text-primary">
               <CartIcon serverCartNum={data?.numOfCartItems || 0} cartId={data?.data?.cartOwner || ""} />
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 rounded-full border border-border bg-card hover:bg-primary/10 hover:border-primary/50 hover:text-primary flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm">
                <UserIcon className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-white/10 shadow-2xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Account</DropdownMenuLabel>
                {session ? (
                  <>
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer rounded-xl font-medium focus:bg-primary/10 focus:text-primary transition-colors">Profile</DropdownMenuItem>
                    </Link>
                    <Logout />
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <DropdownMenuItem className="cursor-pointer rounded-xl font-medium focus:bg-primary/10 focus:text-primary transition-colors">Login to Portal</DropdownMenuItem>
                    </Link>
                    <Link href="/register">
                      <DropdownMenuItem className="cursor-pointer rounded-xl font-medium focus:bg-primary/10 focus:text-primary transition-colors">Request Access</DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;

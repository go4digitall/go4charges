import { Link } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { Zap } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="h-6 w-6 text-primary" />
          <span>Go4charges</span>
        </Link>
        <CartDrawer />
      </div>
    </header>
  );
};

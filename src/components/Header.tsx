import { Link } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import logo from "@/assets/logo.png";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Go4charges" className="h-12 md:h-14 w-auto" />
        </Link>
        <CartDrawer />
      </div>
    </header>
  );
};

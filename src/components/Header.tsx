import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { Button } from "./ui/button";
import logo from "@/assets/logo.png";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-[72px] sm:top-[52px] z-40 w-full border-b border-border bg-background shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Go4charges" className="h-14 md:h-20 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("products")}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Products
          </button>
          <button
            onClick={() => scrollToSection("benefits")}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Benefits
          </button>
          <button
            onClick={() => scrollToSection("testimonials")}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Reviews
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            FAQ
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <CartDrawer />
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            <button
              onClick={() => scrollToSection("products")}
              className="text-left py-2 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection("benefits")}
              className="text-left py-2 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Benefits
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-left py-2 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-left py-2 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              FAQ
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

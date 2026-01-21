import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import paymentBadges from "@/assets/payment-badges.png";

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Go4charges" className="h-14 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground">
              Premium charging cables for all your devices. Fast, reliable, and built to last.
            </p>
            <p className="text-sm text-muted-foreground">
              <a href="mailto:contact@go4charges.com" className="hover:text-primary transition-colors">
                contact@go4charges.com
              </a>
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <a href="/#products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="/#benefits" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Benefits
                </a>
              </li>
              <li>
                <a href="/#testimonials" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Testimonials
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/#faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="mailto:contact@go4charges.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 space-y-4">
          <div className="flex justify-center">
            <img 
              src={paymentBadges} 
              alt="Secure payment methods: Visa, Mastercard, American Express, PayPal, Google Pay" 
              className="h-8 md:h-10 w-auto opacity-80"
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Go4charges. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

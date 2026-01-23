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
            <a 
              href="https://www.facebook.com/profile.php?id=61586942189757" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
              Facebook
            </a>
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

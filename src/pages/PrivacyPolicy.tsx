import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CountdownBanner } from "@/components/CountdownBanner";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <CountdownBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          Privacy <span className="text-gradient">Policy</span>
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              When you make a purchase or attempt to make a purchase through our site, we collect certain information from you, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Name and contact information (email address, phone number)</li>
              <li>Billing and shipping address</li>
              <li>Payment information (processed securely through Shopify Payments)</li>
              <li>Order history and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your order status</li>
              <li>Provide customer support</li>
              <li>Send promotional emails (with your consent)</li>
              <li>Improve our products and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We share your personal information with third parties only to help us process orders, fulfill shipments, 
              and provide our services. We use Shopify to power our online store. You can read more about how Shopify 
              uses your personal information at{" "}
              <a 
                href="https://www.shopify.com/legal/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Shopify's Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies to maintain your shopping cart, remember your preferences, and understand how you use our site. 
              You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information. All payment transactions 
              are encrypted using SSL technology. We do not store your credit card information on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground">
              For questions about this Privacy Policy or your personal data, please contact us at:{" "}
              <a 
                href="mailto:contact@go4charges.com" 
                className="text-primary hover:underline"
              >
                contact@go4charges.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CountdownBanner } from "@/components/CountdownBanner";

const TermsConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CountdownBanner />
      <div className="pt-[72px] sm:pt-[52px]">
        <Header />
      
        <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          Terms & <span className="text-gradient">Conditions</span>
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and placing an order with Go4Charges, you confirm that you are in agreement with and bound by 
              the terms of service contained in these Terms & Conditions. These terms apply to the entire website and 
              any email or other type of communication between you and Go4Charges.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Products</h2>
            <p className="text-muted-foreground">
              Go4Charges offers premium USB-C charging cables with fast charging capabilities up to 240W. All products are 
              subject to availability. We reserve the right to discontinue any product at any time. Product images are 
              for illustrative purposes; actual products may vary slightly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Pricing and Payment</h2>
            <p className="text-muted-foreground mb-4">
              All prices are displayed in USD and are subject to change without notice. We accept major credit cards, 
              PayPal, and other payment methods as displayed at checkout. Payment must be received in full before order 
              processing begins.
            </p>
            <p className="text-muted-foreground">
              We are not responsible for pricing errors. In case of a pricing error, we reserve the right to cancel your 
              order and refund the full amount paid.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Shipping</h2>
            <p className="text-muted-foreground">
              We ship internationally. Delivery times typically range from 7-14 business days depending on your location. 
              Shipping costs and estimated delivery times are calculated at checkout. Go4Charges is not responsible for 
              delays caused by customs, weather, or carrier issues.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Returns and Refunds</h2>
            <p className="text-muted-foreground">
              We offer a 30-day money-back guarantee on all products. If you are not satisfied with your purchase, you may 
              return the item(s) for a full refund within 30 days of delivery. Products must be unused and in their original 
              packaging. Please refer to our Shipping & Returns page for detailed instructions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Product Warranty</h2>
            <p className="text-muted-foreground">
              All Go4Charges products come with a manufacturer's warranty against defects in materials and workmanship. 
              This warranty does not cover damage resulting from misuse, abuse, or normal wear and tear.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Go4Charges shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              arising from your use of our products or services. Our total liability shall not exceed the amount paid for 
              the product in question.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on this website, including text, graphics, logos, and images, is the property of Go4Charges 
              and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create 
              derivative works without our express written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting 
              to our website. Your continued use of our services constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms & Conditions, please contact us at:{" "}
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
    </div>
  );
};

export default TermsConditions;

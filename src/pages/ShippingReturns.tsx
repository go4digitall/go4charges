import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CountdownBanner } from "@/components/CountdownBanner";
import { Truck, RefreshCw, Clock, Globe, Package, CheckCircle } from "lucide-react";

const ShippingReturns = () => {
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
          Shipping & <span className="text-gradient">Returns</span>
        </h1>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
            <div className="p-2 rounded-full bg-primary/10">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Free Shipping</p>
              <p className="text-sm text-muted-foreground">On all orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
            <div className="p-2 rounded-full bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">7-14 Business Days</p>
              <p className="text-sm text-muted-foreground">Delivery time</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
            <div className="p-2 rounded-full bg-primary/10">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">30-Day Returns</p>
              <p className="text-sm text-muted-foreground">Money-back guarantee</p>
            </div>
          </div>
        </div>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          {/* Shipping Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">Shipping Information</h2>
            </div>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Processing Time</h3>
            <p className="text-muted-foreground">
              Orders are processed within 1-2 business days. You will receive a confirmation email with tracking 
              information once your order has shipped.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">Delivery Times</h3>
            <p className="text-muted-foreground mb-4">
              We ship worldwide! Estimated delivery times after processing:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>United States:</strong> 7-10 business days</li>
              <li><strong>Canada:</strong> 8-12 business days</li>
              <li><strong>Europe:</strong> 10-14 business days</li>
              <li><strong>Australia:</strong> 10-14 business days</li>
              <li><strong>Rest of World:</strong> 12-18 business days</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Shipping Costs</h3>
            <p className="text-muted-foreground">
              We offer <strong>FREE standard shipping</strong> on all orders worldwide. Express shipping options 
              are available at checkout for an additional fee.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">Customs & Duties</h3>
            <p className="text-muted-foreground">
              For international orders, customs fees and import duties may apply depending on your country's 
              regulations. These fees are the responsibility of the customer and are not included in our 
              shipping costs.
            </p>
          </section>

          {/* Returns Section */}
          <section className="pt-8 border-t">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">Returns & Refunds</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">30-Day Money-Back Guarantee</h3>
            <p className="text-muted-foreground">
              We want you to be completely satisfied with your purchase. If you're not happy with your 
              Go4Charges product for any reason, you can return it within 30 days of delivery for a full refund.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">Return Conditions</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Items must be unused and in their original packaging</li>
              <li>Return request must be made within 30 days of delivery</li>
              <li>Original proof of purchase is required</li>
              <li>Return shipping costs are the responsibility of the customer (unless item is defective)</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">How to Initiate a Return</h3>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p>Email us at <a href="mailto:contact@go4charges.com" className="text-primary hover:underline">contact@go4charges.com</a> with your order number and reason for return</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p>We'll provide you with return instructions and a return authorization number</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p>Ship the item back to us using a trackable shipping method</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p>Once received and inspected, your refund will be processed within 5-7 business days</p>
              </div>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">Defective or Damaged Items</h3>
            <p className="text-muted-foreground">
              If you receive a defective or damaged product, please contact us immediately at{" "}
              <a href="mailto:contact@go4charges.com" className="text-primary hover:underline">contact@go4charges.com</a>. 
              We'll arrange for a replacement or full refund at no additional cost to you, including return shipping.
            </p>
          </section>

          {/* Contact Section */}
          <section className="pt-8 border-t">
            <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
            <p className="text-muted-foreground">
              If you have any questions about shipping or returns, please don't hesitate to contact us at{" "}
              <a href="mailto:contact@go4charges.com" className="text-primary hover:underline">contact@go4charges.com</a>. 
              We're here to help!
            </p>
          </section>
        </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ShippingReturns;

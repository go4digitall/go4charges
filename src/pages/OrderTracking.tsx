import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CountdownBanner } from "@/components/CountdownBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, CheckCircle, Clock, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OrderStatus {
  orderNumber: string;
  email: string;
  financialStatus: string;
  fulfillmentStatus: string | null;
  createdAt: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrierName?: string;
  lineItems: Array<{
    title: string;
    quantity: number;
  }>;
}

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrderStatus(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('track-order', {
        body: { orderNumber, email }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to track order');
      }

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
      } else {
        setOrderStatus(data);
        toast.success('Order found!');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string | null): number => {
    if (!status) return 1;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('delivered')) return 4;
    if (lowerStatus.includes('in_transit') || lowerStatus.includes('shipped') || lowerStatus.includes('fulfilled')) return 3;
    if (lowerStatus.includes('processing') || lowerStatus.includes('pending')) return 2;
    return 1;
  };

  const statusSteps = [
    { step: 1, label: 'Order Confirmed', icon: CheckCircle },
    { step: 2, label: 'Processing', icon: Clock },
    { step: 3, label: 'Shipped', icon: Truck },
    { step: 4, label: 'Delivered', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CountdownBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
          Track Your <span className="text-gradient">Order</span>
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Enter your order details below to check the status of your shipment.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Order Lookup
            </CardTitle>
            <CardDescription>
              Enter the order number from your confirmation email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="e.g., #1001 or 1001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email used for the order"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Track Order'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {orderStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Order #{orderStatus.orderNumber}</CardTitle>
              <CardDescription>
                Placed on {new Date(orderStatus.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Timeline */}
              <div className="relative">
                <div className="flex justify-between">
                  {statusSteps.map((item, index) => {
                    const currentStep = getStatusStep(orderStatus.fulfillmentStatus);
                    const isCompleted = item.step <= currentStep;
                    const isCurrent = item.step === currentStep;
                    const Icon = item.icon;
                    
                    return (
                      <div key={item.step} className="flex flex-col items-center relative z-10">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs mt-2 text-center ${
                          isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ 
                      width: `${((getStatusStep(orderStatus.fulfillmentStatus) - 1) / 3) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Order Items */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Items in this order:</h4>
                <ul className="space-y-2">
                  {orderStatus.lineItems.map((item, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.title}</span>
                      <span className="font-medium">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tracking Info */}
              {orderStatus.trackingNumber && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Tracking Information</h4>
                  <div className="space-y-2 text-sm">
                    {orderStatus.carrierName && (
                      <p className="text-muted-foreground">
                        Carrier: <span className="text-foreground">{orderStatus.carrierName}</span>
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      Tracking Number: <span className="text-foreground font-mono">{orderStatus.trackingNumber}</span>
                    </p>
                    {orderStatus.trackingUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        className="mt-2"
                      >
                        <a 
                          href={orderStatus.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Track with Carrier
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Status */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Payment Status:{" "}
                  <span className={`font-medium ${
                    orderStatus.financialStatus.toLowerCase() === 'paid' 
                      ? 'text-emerald-600' 
                      : 'text-amber-600'
                  }`}>
                    {orderStatus.financialStatus.charAt(0).toUpperCase() + orderStatus.financialStatus.slice(1)}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-12 text-center">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-muted-foreground text-sm">
            If you have any questions about your order, please contact us at{" "}
            <a 
              href="mailto:contact@go4charges.com" 
              className="text-primary hover:underline"
            >
              contact@go4charges.com
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;

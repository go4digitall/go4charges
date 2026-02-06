import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Gift, Zap, Check, Plug, Loader2 } from "lucide-react";
import wallChargerImage from "@/assets/wall-charger-240w.webp";
import { useCartStore } from "@/stores/cartStore";
import { trackAddToCart } from "@/lib/facebookPixel";
import { trackAnalyticsEvent } from "@/hooks/useAnalyticsTracking";

interface WallChargerUpsellProps {
  selectedBundleId: "single" | "duo" | "family";
  onAddToCart?: () => void;
}

// Wall Charger pricing based on bundle
const WALL_CHARGER_PRICING = {
  single: { price: 19.90, discount: 0, label: "$19.90", badge: null },
  duo: { price: 9.95, discount: 50, label: "$9.95", badge: "-50%" },
  family: { price: 0, discount: 100, label: "FREE", badge: "FREE" },
} as const;

// Wall Charger specs
const WALL_CHARGER_SPECS = [
  "240W Total Output Power",
  "5 Ports (3x USB-C PD + 2x USB-A QC3.0)",
  "GaN Technology - Compact & Cool",
  "Universal Compatibility",
];

export function WallChargerUpsell({ selectedBundleId, onAddToCart }: WallChargerUpsellProps) {
  const [isSelected, setIsSelected] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const pricing = WALL_CHARGER_PRICING[selectedBundleId];
  const isFree = selectedBundleId === "family";
  const isDiscounted = selectedBundleId === "duo";

  const handleAddCharger = async () => {
    if (!isSelected) return;
    
    setIsAdding(true);
    try {
      // Create a virtual product for the wall charger
      const wallChargerProduct = {
        node: {
          id: "wall-charger-240w",
          title: `Wall Charger 240W GaN${isFree ? " (FREE with Family Pack)" : isDiscounted ? " (-50% with Duo Pack)" : ""}`,
          description: "5-Port 240W GaN Wall Charger",
          handle: "wall-charger-240w",
          priceRange: {
            minVariantPrice: {
              amount: pricing.price.toString(),
              currencyCode: "USD",
            },
          },
          images: {
            edges: [
              {
                node: {
                  url: wallChargerImage,
                  altText: "Wall Charger 240W GaN",
                },
              },
            ],
          },
          variants: {
            edges: [
              {
                node: {
                  id: `wall-charger-240w-${selectedBundleId}`,
                  title: "Default",
                  price: {
                    amount: pricing.price.toString(),
                    currencyCode: "USD",
                  },
                  compareAtPrice: {
                    amount: "19.90",
                    currencyCode: "USD",
                  },
                  availableForSale: true,
                  selectedOptions: [] as { name: string; value: string }[],
                },
              },
            ],
          },
          options: [],
        },
      };

      await addItem({
        product: wallChargerProduct,
        variantId: `wall-charger-240w-${selectedBundleId}`,
        variantTitle: "Wall Charger 240W GaN",
        price: { amount: pricing.price.toString(), currencyCode: "USD" },
        quantity: 1,
        selectedOptions: [],
      });

      // Track
      trackAddToCart({
        content_name: "Wall Charger 240W GaN",
        content_ids: [`wall-charger-240w-${selectedBundleId}`],
        content_type: "product",
        value: pricing.price,
        currency: "USD",
      });

      trackAnalyticsEvent("add_to_cart", {
        product_name: "Wall Charger 240W GaN",
        bundle_type: selectedBundleId,
        price: pricing.price,
        variant_id: `wall-charger-240w-${selectedBundleId}`,
        source: "wall_charger_upsell",
      });

      onAddToCart?.();
    } catch (error) {
      console.error("Failed to add wall charger:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden ${
        isFree
          ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg shadow-emerald-500/20"
          : isDiscounted
          ? "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md shadow-amber-500/15"
          : "border-border bg-card hover:border-sky-300"
      }`}
    >
      {/* Top Badge */}
      {isFree && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold py-1.5 px-3 text-center flex items-center justify-center gap-1.5">
          <Gift className="h-3.5 w-3.5" />
          <span>INCLUDED FREE WITH FAMILY PACK!</span>
          <Gift className="h-3.5 w-3.5" />
        </div>
      )}
      {isDiscounted && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold py-1.5 px-3 text-center flex items-center justify-center gap-1.5">
          <Zap className="h-3.5 w-3.5" />
          <span>50% OFF WITH DUO PACK!</span>
          <Zap className="h-3.5 w-3.5" />
        </div>
      )}

      <div className={`p-4 ${isFree || isDiscounted ? "pt-10" : ""}`}>
        <div className="flex gap-4">
          {/* Image */}
          <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border border-border/50">
            <img
              src={wallChargerImage}
              alt="Wall Charger 240W GaN"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-bold text-sm md:text-base text-foreground">
                    Wall Charger 240W GaN
                  </h4>
                  {pricing.badge && (
                    <Badge
                      className={`text-xs ${
                        isFree
                          ? "bg-emerald-500 text-white animate-pulse"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {pricing.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  5 Ports • 3x USB-C PD + 2x USB-A QC3.0
                </p>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                {isFree ? (
                  <div>
                    <span className="text-lg font-bold text-emerald-600">FREE</span>
                    <p className="text-xs text-muted-foreground line-through">$19.90</p>
                  </div>
                ) : isDiscounted ? (
                  <div>
                    <span className="text-lg font-bold text-amber-600">$9.95</span>
                    <p className="text-xs text-muted-foreground line-through">$19.90</p>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-foreground">$19.90</span>
                )}
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-1 mb-3">
              {WALL_CHARGER_SPECS.map((spec, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{spec}</span>
                </div>
              ))}
            </div>

            {/* Add Button */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => setIsSelected(checked === true)}
                  className={`${isFree ? "border-emerald-500 data-[state=checked]:bg-emerald-500" : isDiscounted ? "border-amber-500 data-[state=checked]:bg-amber-500" : ""}`}
                />
                <span className="text-xs md:text-sm font-medium">
                  {isFree
                    ? "Yes, include my FREE charger!"
                    : isDiscounted
                    ? "Add charger at 50% OFF"
                    : "Add Wall Charger"}
                </span>
              </label>
              
              {isSelected && (
                <Button
                  size="sm"
                  onClick={handleAddCharger}
                  disabled={isAdding}
                  className={`${
                    isFree
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : isDiscounted
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-sky-500 hover:bg-sky-600"
                  } text-white`}
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plug className="h-3.5 w-3.5 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

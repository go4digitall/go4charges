import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Timer, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { BundleOption } from "@/hooks/useBundleProducts";

interface BundleSelectorProps {
  options: BundleOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

// Timer countdown to midnight
function useCountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      if (diff <= 0) return "00:00:00";

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

export function BundleSelector({
  options,
  selectedId,
  onSelect,
  isLoading,
}: BundleSelectorProps) {
  const timeLeft = useCountdownToMidnight();

  if (isLoading || options.length === 0) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-10 bg-muted rounded-lg" />
        <div className="h-20 bg-muted rounded-xl" />
        <div className="h-20 bg-muted rounded-xl" />
        <div className="h-20 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timer */}
      <div className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 px-4 rounded-lg font-semibold">
        <Timer className="h-4 w-4" />
        <span>Bundle deal expires in</span>
        <span className="font-mono font-bold">{timeLeft}</span>
      </div>

      {/* Radio Group */}
      <RadioGroup
        value={selectedId}
        onValueChange={(value) => {
          console.log(`[Click] BundleSelector option selected: ${value}`);
          onSelect(value);
        }}
        className="space-y-3"
      >
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const isFamily = option.id === "family";

          return (
            <label
              key={option.id}
              className={cn(
                "relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
                  ✓ SELECTED
                </div>
              )}

              <div className="flex items-start gap-3 w-full">
                {/* Radio button */}
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="mt-1 border-primary text-primary"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Name and badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {option.name}
                      </span>
                      {option.badges.map((badge, i) => (
                        <Badge
                          key={i}
                          className={cn(
                            "text-xs",
                            badge === "BEST VALUE"
                              ? "bg-primary text-primary-foreground border-0 animate-pulse"
                              : badge === "POPULAR"
                              ? "bg-secondary text-secondary-foreground border-0"
                              : badge.includes("%")
                              ? "bg-primary/80 text-primary-foreground border-0"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="text-lg font-bold text-foreground">
                        ${option.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Subtitle and compare price */}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">
                      {option.subtitle}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      was ${option.comparePrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Most Popular Choice indicator for Family */}
                  {isFamily && isSelected && (
                    <div className="flex items-center gap-1 mt-2 text-primary">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="text-sm font-medium">
                        Most Popular Choice
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}

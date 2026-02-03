import { cn } from "@/lib/utils";
import { CableType, CABLE_TYPE_INFO } from "@/hooks/useBundleProducts";

interface CableTypeSelectorProps {
  selectedType: CableType;
  onSelect: (type: CableType) => void;
  className?: string;
}

export function CableTypeSelector({
  selectedType,
  onSelect,
  className,
}: CableTypeSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-semibold text-foreground">
        Select your cable type:
      </label>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(CABLE_TYPE_INFO) as CableType[]).map((type) => {
          const info = CABLE_TYPE_INFO[type];
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              onClick={() => {
                console.log(`[Click] CableTypeSelector: ${type} selected`);
                onSelect(type);
              }}
              className={cn(
                "relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all duration-200",
                isSelected
                  ? "border-sky-500 bg-gradient-to-br from-sky-50 to-blue-50 shadow-md shadow-sky-500/20"
                  : "border-border bg-card hover:border-sky-300 hover:bg-sky-50/50"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ SELECTED
                </div>
              )}

              {/* Icon */}
              <span className="text-2xl mb-2">{info.icon}</span>

              {/* Label */}
              <span className="font-semibold text-foreground text-sm">
                {info.label}
              </span>

              {/* Compatibility */}
              <span className="text-xs text-muted-foreground mt-1 leading-tight">
                {info.compatibility}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

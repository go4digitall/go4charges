import { Star } from "lucide-react";
import type { FeaturedReview } from "./reviewData";

interface Props {
  review: FeaturedReview;
}

export const FeaturedReviewCard = ({ review }: Props) => (
  <div className="break-inside-avoid bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all duration-300 group">
    {review.image && (
      <div className="relative -mx-4 -mt-4 mb-3 overflow-hidden rounded-t-xl">
        <img
          src={review.image}
          alt={`${review.name}'s cable review`}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
    )}
    <div className="flex items-center gap-2.5 mb-2.5">
      <img
        src={review.avatar}
        alt={review.name}
        className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-xs truncate">{review.name}</p>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
          ))}
        </div>
      </div>
      <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">✓ Verified</span>
    </div>
    <p className="text-sm text-foreground leading-relaxed">"{review.text}"</p>
  </div>
);

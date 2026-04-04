import { useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import { featuredReviews, wallReviews } from "./testimonials/reviewData";
import { FeaturedReviewCard } from "./testimonials/FeaturedReviewCard";
import { WallReviewCard } from "./testimonials/WallReviewCard";

export const TestimonialsSection = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleWallReviews = showAll ? wallReviews : wallReviews.slice(0, 8);

  return (
    <section id="testimonials" className="pt-8 pb-12 md:py-20 px-4 bg-background scroll-mt-56 md:scroll-mt-36">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4 px-2">
            Loved By <span className="text-gradient">Thousands</span> Of Customers
          </h2>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Real stories from real customers who've upgraded their charging experience
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-5 h-5 bg-green-500 flex items-center justify-center">
                  <Star className="w-3 h-3 fill-white text-white" />
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold">4.9/5</span>
            <span className="text-sm text-muted-foreground">• 1,247 verified reviews</span>
          </div>
        </div>

        {/* Featured Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {featuredReviews.map((review, index) => (
            <FeaturedReviewCard key={index} review={review} />
          ))}
        </div>

        {/* Wall of Love — Masonry */}
        <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-6">
            💬 What Others Are Saying
          </h3>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {visibleWallReviews.map((review, index) => (
              <WallReviewCard key={index} review={review} />
            ))}
          </div>
        </div>

        {/* Show More */}
        {!showAll && (
          <div className="text-center">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border bg-card hover:bg-accent text-sm font-medium transition-colors"
            >
              Show More Reviews
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

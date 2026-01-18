import { Star, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Import real avatar images from AliExpress
import avatarLo from "@/assets/testimonials/avatar-L-o.avif";
import avatarNl from "@/assets/testimonials/avatar-n-l.avif";
import avatarPa from "@/assets/testimonials/avatar-P-a.avif";
import avatarSi from "@/assets/testimonials/avatar-s-i.avif";

const testimonials = [
  // Reviews with photos first
  {
    name: "P***a",
    date: "Jan 9, 2026",
    rating: 5,
    quote: "Super cables!",
    avatar: avatarPa,
    verified: true
  },
  {
    name: "n***l",
    date: "Jan 10, 2026",
    rating: 5,
    quote: "Everything is fine.",
    avatar: avatarNl,
    verified: true
  },
  {
    name: "s***i",
    date: "Jan 14, 2026",
    rating: 4,
    quote: "Good, thank you.",
    avatar: avatarSi,
    verified: true
  },
  {
    name: "L***o",
    date: "Jan 16, 2026",
    rating: 5,
    quote: "Amazing quality! Fast shipping too!",
    avatar: avatarLo,
    verified: true
  },
  // Reviews without photos
  {
    name: "Alex M.",
    rating: 5,
    quote: "Finally a cable that doesn't break after a month! The 90° design is genius.",
    avatarColor: "bg-blue-500",
    verified: false
  },
  {
    name: "Sarah K.",
    rating: 5,
    quote: "The fast charging is incredible. My MacBook Pro charges so fast now.",
    avatarColor: "bg-rose-500",
    verified: false
  },
  {
    name: "James L.",
    rating: 5,
    quote: "By far the best cable. The braided design feels premium.",
    avatarColor: "bg-emerald-500",
    verified: false
  },
  {
    name: "Emily R.",
    rating: 5,
    quote: "Bought one for myself and three more for my family!",
    avatarColor: "bg-purple-500",
    verified: false
  }
];

const quickReviews = [
  { name: "b***n", date: "Jan 3, 2026", color: "bg-red-400" },
  { name: "B***s", date: "Jan 8, 2026", color: "bg-blue-400" },
  { name: "w***r", date: "Jan 12, 2026", color: "bg-purple-400" },
  { name: "A***o", date: "Dec 29, 2025", color: "bg-teal-400" },
  { name: "G***i", date: "Dec 30, 2025", color: "bg-pink-400" },
  { name: "K***i", date: "Jan 4, 2026", color: "bg-indigo-400" },
  { name: "m***m", date: "Jan 12, 2026", color: "bg-green-500" },
];

// Trustpilot-style star component
const TrustpilotStar = ({ filled = true, size = "md" }: { filled?: boolean; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-3 h-3 md:w-4 md:h-4",
    md: "w-4 h-4 md:w-5 md:h-5",
    lg: "w-6 h-6 md:w-8 md:h-8"
  };
  const starSizeClasses = {
    sm: "w-2 h-2 md:w-2.5 md:h-2.5",
    md: "w-2.5 h-2.5 md:w-3 md:h-3",
    lg: "w-4 h-4 md:w-5 md:h-5"
  };
  
  return (
    <div className={`${sizeClasses[size]} ${filled ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center`}>
      <Star className={`${starSizeClasses[size]} ${filled ? 'fill-white text-white' : 'fill-gray-400 text-gray-400'}`} />
    </div>
  );
};

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="pt-8 pb-12 md:py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4 px-2">
            Loved By <span className="text-gradient">Thousands</span> Of Customers
          </h2>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Real stories from real customers who've upgraded their charging experience
          </p>
        </div>

        {/* Global Rating - Trustpilot style */}
        <div className="flex flex-col items-center justify-center mb-6 md:mb-10 p-4 md:p-6 bg-card/30 rounded-xl border border-border/30">
          <p className="text-sm text-muted-foreground mb-2">Excellent</p>
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <TrustpilotStar key={i} filled={true} size="lg" />
            ))}
          </div>
          <p className="text-sm md:text-base text-foreground font-medium">
            Based on <span className="font-bold">1,247 reviews</span>
          </p>
        </div>

        {/* Reviews Grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="hover-glow bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300"
            >
              <CardContent className="p-3 md:p-5">
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  {testimonial.avatar ? (
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-7 h-7 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-7 h-7 md:w-10 md:h-10 rounded-full ${testimonial.avatarColor} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-semibold text-xs md:text-sm">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-xs md:text-sm truncate">{testimonial.name}</h3>
                    {testimonial.verified && (
                      <span className="text-[10px] md:text-xs text-green-600 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 md:w-3 md:h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TrustpilotStar key={i} filled={i < testimonial.rating} size="sm" />
                  ))}
                </div>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-3">
                  "{testimonial.quote}"
                </p>
                {testimonial.date && (
                  <p className="text-[10px] md:text-xs text-muted-foreground/70 mt-2">{testimonial.date}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Reviews Carousel */}
        <div className="mt-8 md:mt-12 overflow-hidden">
          <p className="text-center text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">More verified purchases</p>
          <div className="relative flex overflow-hidden">
            <div className="flex shrink-0 animate-marquee gap-3 md:gap-4">
              {quickReviews.map((review, index) => (
                <div
                  key={`first-${index}`}
                  className="flex items-center gap-1.5 md:gap-2 bg-card/50 border border-border/50 rounded-full px-2.5 md:px-4 py-1.5 md:py-2 whitespace-nowrap"
                >
                  <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${review.color} flex items-center justify-center`}>
                    <span className="text-white font-semibold text-[10px] md:text-xs">
                      {review.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs md:text-sm text-foreground font-medium">{review.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TrustpilotStar key={i} filled={true} size="sm" />
                    ))}
                  </div>
                  <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-500" />
                </div>
              ))}
            </div>
            <div className="flex shrink-0 animate-marquee gap-3 md:gap-4 ml-3 md:ml-4">
              {quickReviews.map((review, index) => (
                <div
                  key={`second-${index}`}
                  className="flex items-center gap-1.5 md:gap-2 bg-card/50 border border-border/50 rounded-full px-2.5 md:px-4 py-1.5 md:py-2 whitespace-nowrap"
                >
                  <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${review.color} flex items-center justify-center`}>
                    <span className="text-white font-semibold text-[10px] md:text-xs">
                      {review.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs md:text-sm text-foreground font-medium">{review.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TrustpilotStar key={i} filled={true} size="sm" />
                    ))}
                  </div>
                  <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

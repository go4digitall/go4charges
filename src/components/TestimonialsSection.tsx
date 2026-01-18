import { Star, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Alex M.",
    rating: 5,
    quote: "Finally a cable that doesn't break after a month! The 90° design is genius - my old cables always broke at the bend. This one looks brand new after 6 months of daily use.",
    avatarColor: "bg-blue-500",
    verified: false
  },
  {
    name: "Sarah K.",
    rating: 5,
    quote: "The fast charging is incredible. My MacBook Pro charges so fast now. Worth every penny for the quality and speed.",
    avatarColor: "bg-rose-500",
    verified: false
  },
  {
    name: "P***a",
    date: "Jan 9, 2026",
    rating: 5,
    quote: "Super cables!",
    avatarColor: "bg-rose-400",
    verified: true
  },
  {
    name: "James L.",
    rating: 5,
    quote: "I've tried so many cables and this is by far the best. The braided design feels premium and the 90° angle is perfect for using my phone while charging.",
    avatarColor: "bg-green-500",
    verified: false
  },
  {
    name: "m***m",
    date: "Jan 12, 2026",
    rating: 5,
    quote: "Everything is fine.",
    avatarColor: "bg-green-400",
    verified: true
  },
  {
    name: "Emily R.",
    rating: 5,
    quote: "Bought one for myself and ended up buying three more for my family. Everyone loves them! Great quality and super fast charging.",
    avatarColor: "bg-purple-500",
    verified: false
  },
  {
    name: "s***i",
    date: "Jan 14, 2026",
    rating: 4,
    quote: "Good, thank you.",
    avatarColor: "bg-gray-400",
    verified: true
  },
  {
    name: "David C.",
    rating: 5,
    quote: "As someone who travels a lot, having a reliable cable is essential. The ChargeStand™ has been my go-to for months now. Highly recommend!",
    avatarColor: "bg-amber-500",
    verified: false
  },
  {
    name: "Michelle T.",
    rating: 5,
    quote: "The quality is amazing! I was skeptical at first but this cable exceeded all my expectations. Fast shipping too!",
    avatarColor: "bg-cyan-500",
    verified: false
  }
];

const quickReviews = [
  { name: "b***n", date: "Jan 3, 2026", color: "bg-red-400" },
  { name: "B***s", date: "Jan 8, 2026", color: "bg-blue-400" },
  { name: "n***l", date: "Jan 10, 2026", color: "bg-yellow-500" },
  { name: "w***r", date: "Jan 12, 2026", color: "bg-purple-400" },
  { name: "L***o", date: "Jan 16, 2026", color: "bg-orange-400" },
  { name: "A***o", date: "Dec 29, 2025", color: "bg-teal-400" },
  { name: "G***i", date: "Dec 30, 2025", color: "bg-pink-400" },
  { name: "K***i", date: "Jan 4, 2026", color: "bg-indigo-400" },
];

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="pt-8 pb-12 md:py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 px-2">
            Loved By <span className="text-gradient">Thousands</span> Of Customers
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Real stories from real customers who've upgraded their charging experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="hover-glow bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${testimonial.avatarColor} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-semibold text-sm">
                      {testimonial.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                        {Array.from({ length: 5 - testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-muted-foreground/30" />
                        ))}
                      </div>
                      {testimonial.date && (
                        <span className="text-xs text-muted-foreground">{testimonial.date}</span>
                      )}
                    </div>
                    {testimonial.verified && (
                      <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <Check className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Reviews Carousel */}
        <div className="mt-12 overflow-hidden">
          <p className="text-center text-sm text-muted-foreground mb-4">More verified purchases</p>
          <div className="relative flex overflow-hidden">
            <div className="flex shrink-0 animate-marquee gap-4">
              {quickReviews.map((review, index) => (
                <div
                  key={`first-${index}`}
                  className="flex items-center gap-2 bg-card/50 border border-border/50 rounded-full px-4 py-2 whitespace-nowrap"
                >
                  <div className={`w-6 h-6 rounded-full ${review.color} flex items-center justify-center`}>
                    <span className="text-white font-semibold text-xs">
                      {review.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-foreground font-medium">{review.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <Check className="w-3 h-3 text-green-500" />
                </div>
              ))}
            </div>
            <div className="flex shrink-0 animate-marquee gap-4 ml-4">
              {quickReviews.map((review, index) => (
                <div
                  key={`second-${index}`}
                  className="flex items-center gap-2 bg-card/50 border border-border/50 rounded-full px-4 py-2 whitespace-nowrap"
                >
                  <div className={`w-6 h-6 rounded-full ${review.color} flex items-center justify-center`}>
                    <span className="text-white font-semibold text-xs">
                      {review.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-foreground font-medium">{review.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <Check className="w-3 h-3 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
            Rated <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span className="text-amber-500 font-bold">4.9/5</span> by 
            <span className="text-primary font-semibold">1,000+</span> verified buyers
          </p>
        </div>
      </div>
    </section>
  );
};

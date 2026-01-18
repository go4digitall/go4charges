import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Alex M.",
    rating: 5,
    quote: "Finally a cable that doesn't break after a month! The 90° design is genius - my old cables always broke at the bend. This one looks brand new after 6 months of daily use."
  },
  {
    name: "Sarah K.",
    rating: 5,
    quote: "The fast charging is incredible. My MacBook Pro charges so fast now. Worth every penny for the quality and speed."
  },
  {
    name: "James L.",
    rating: 5,
    quote: "I've tried so many cables and this is by far the best. The braided design feels premium and the 90° angle is perfect for using my phone while charging."
  },
  {
    name: "Emily R.",
    rating: 5,
    quote: "Bought one for myself and ended up buying three more for my family. Everyone loves them! Great quality and super fast charging."
  },
  {
    name: "David C.",
    rating: 5,
    quote: "As someone who travels a lot, having a reliable cable is essential. The ChargeStand™ has been my go-to for months now. Highly recommend!"
  },
  {
    name: "Michelle T.",
    rating: 5,
    quote: "The quality is amazing! I was skeptical at first but this cable exceeded all my expectations. Fast shipping too!"
  }
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
                  <Quote className="w-8 h-8 text-primary/40 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground">
            Join <span className="text-primary font-semibold">1,000+</span> happy customers
          </p>
        </div>
      </div>
    </section>
  );
};

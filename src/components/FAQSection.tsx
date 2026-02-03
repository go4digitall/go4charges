import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What devices are compatible with the ChargeStand™?",
    answer: "We have two versions! The USB-C version (up to 240W) works with MacBooks, iPads, iPhones 15+, Samsung Galaxy, Nintendo Switch, and all USB-C devices. For older iPhones (5-14), iPads with Lightning port, and AirPods, we have our Lightning version (up to 30W). Same premium quality, same prices!"
  },
  {
    question: "What's the difference between USB-C and Lightning versions?",
    answer: "The USB-C version supports up to 240W power delivery for the fastest charging on modern devices. The Lightning version supports up to 30W, which is the maximum for Lightning devices. Both feature the same 90° angle design, braided nylon construction, and 1.5m length."
  },
  {
    question: "Why is the 90° angle design better?",
    answer: "The 90° angle design reduces cable stress at the connection point, preventing the common issue of cables breaking near the plug. It also makes it more comfortable to use your device while charging and keeps cables neater on your desk."
  },
  {
    question: "How fast is the charging?",
    answer: "With our USB-C version (up to 240W), you can charge a MacBook Pro from 0 to 50% in about 30 minutes. For the Lightning version (up to 30W), you'll get optimal fast charging for all compatible iPhones and iPads. It's currently the fastest charging available for each connector type."
  },
  {
    question: "What's included in the package?",
    answer: "Each ChargeStand™ cable comes with the premium braided cable (USB-C or Lightning), a protective carrying pouch, and our comprehensive warranty card. Everything you need for reliable charging on the go."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive an email with your tracking number and a direct link to track your package with the carrier. You can also check your order status anytime by clicking the link in your order confirmation email."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes! We offer FREE worldwide shipping on all orders. Orders typically arrive within 7-14 business days depending on your location. You'll receive tracking information once your order ships."
  },
  {
    question: "What if I'm not satisfied?",
    answer: "We offer a 30-day money-back guarantee. If you're not completely satisfied with your ChargeStand™ cable, return it for a full refund - no questions asked. Your satisfaction is our priority!"
  },
  {
    question: "How durable is the cable?",
    answer: "Our cables feature premium braided nylon construction with reinforced connectors. They're tested to withstand over 10,000 bend cycles, making them significantly more durable than standard cables."
  },
  {
    question: "Why is this Winter Clearance offer so good?",
    answer: "This is our Winter Clearance sale! We're offering up to 70% off on bundle packs to clear our winter stock. Single cables are 50% off, Duo Packs 65% off, and Family Packs 70% off. Stock is limited!"
  }
];

export const FAQSection = () => {
  return (
    <section id="faq" className="pt-8 pb-12 md:py-20 px-4 bg-section-alt scroll-mt-56 md:scroll-mt-36">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 px-2">
            <span className="text-gradient">Frequently Asked</span> Questions
          </h2>
          <p className="text-base md:text-xl text-muted-foreground px-4">
            Everything you need to know about the ChargeStand™
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-lg px-6 bg-card glow-border"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold text-lg">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

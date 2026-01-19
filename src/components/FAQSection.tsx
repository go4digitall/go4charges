import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What devices are compatible with the ChargeStand™?",
    answer: "The ChargeStand™ is universally compatible with all USB-C devices including MacBooks, iPads, iPhones 15+, Samsung Galaxy phones, Nintendo Switch, and most modern laptops and tablets. With up to 240W power delivery, it ensures fast charging for all your devices."
  },
  {
    question: "Why is the 90° angle design better?",
    answer: "The 90° angle design reduces cable stress at the connection point, preventing the common issue of cables breaking near the plug. It also makes it more comfortable to use your device while charging and keeps cables neater on your desk."
  },
  {
    question: "How fast is the charging?",
    answer: "With up to 240W power delivery (max), you can charge a MacBook Pro from 0 to 50% in about 30 minutes. For phones, you'll get hours of battery life in just minutes of charging. It's currently the fastest USB-C charging standard available."
  },
  {
    question: "What's included in the package?",
    answer: "Each ChargeStand™ cable comes with the premium braided USB-C cable, a protective carrying pouch, and our comprehensive warranty card. Everything you need for reliable charging on the go."
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
    question: "Why is this launch offer so good?",
    answer: "This is our launch sale! We're offering 50% off to introduce more customers to the ChargeStand™ experience. Stock is limited and the offer ends tonight!"
  }
];

export const FAQSection = () => {
  return (
    <section id="faq" className="pt-8 pb-12 md:py-20 px-4 bg-section-alt scroll-mt-40 md:scroll-mt-36">
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

import avatarLo from "@/assets/testimonials/avatar-L-o.avif";
import avatarNl from "@/assets/testimonials/avatar-n-l.avif";
import avatarPa from "@/assets/testimonials/avatar-P-a.avif";
import avatarSi from "@/assets/testimonials/avatar-s-i.avif";

import avatarReview1 from "@/assets/testimonials/avatar-review-1.avif";
import avatarReview2 from "@/assets/testimonials/avatar-review-2.avif";
import avatarReview3 from "@/assets/testimonials/avatar-review-3.avif";
import avatarReview4 from "@/assets/testimonials/avatar-review-4.avif";
import avatarReview5 from "@/assets/testimonials/avatar-review-5.avif";

import productReview1 from "@/assets/testimonials/product-review-1.avif";
import productReview2 from "@/assets/testimonials/product-review-2.avif";
import productReview3 from "@/assets/testimonials/product-review-3.avif";
import productReview4 from "@/assets/testimonials/product-review-4.avif";
import productReview5 from "@/assets/testimonials/product-review-5.avif";

export interface FeaturedReview {
  name: string;
  rating: number;
  text: string;
  avatar: string;
  image: string;
}

export interface WallReview {
  name: string;
  rating: number;
  text: string;
  avatar: string;
  image?: string;
}

export const featuredReviews: FeaturedReview[] = [
  {
    name: "M***k",
    rating: 5,
    text: "Incredible quality, charges super fast! I tested it with my MacBook Pro and iPhone simultaneously — both charging at full speed. The 90° angle is a game changer for using my phone while it charges. Highly recommend!",
    avatar: avatarReview1,
    image: productReview1,
  },
  {
    name: "R***n",
    rating: 5,
    text: "Premium feel, highly recommend! The braided cable feels indestructible. I've been using cheap cables for years and they always broke after a month. This one is on another level — worth every penny.",
    avatar: avatarReview3,
    image: productReview3,
  },
  {
    name: "T***a",
    rating: 5,
    text: "Perfect cable, love the 90° angle! I got the Family Pack and every single cable works flawlessly. My whole family is now equipped. The free charger that came with it is a great bonus too!",
    avatar: avatarReview2,
    image: productReview5,
  },
];

export const wallReviews: WallReview[] = [
  { name: "J***e", rating: 5, text: "Works perfectly with all my devices! iPhone, iPad, MacBook — everything charges fast.", avatar: avatarReview4, image: productReview2 },
  { name: "D***s", rating: 5, text: "Best cable ever, ordered more! Gave one to my brother and he loved it too.", avatar: avatarReview5, image: productReview4 },
  { name: "P***a", rating: 5, text: "Super cables! Fast delivery and great packaging. Very satisfied with the quality.", avatar: avatarPa },
  { name: "n***l", rating: 5, text: "Everything is fine. Cable works exactly as described, very solid build quality.", avatar: avatarNl },
  { name: "s***i", rating: 4, text: "Good, thank you. Does the job well, shipping was fast.", avatar: avatarSi },
  { name: "L***o", rating: 5, text: "Amazing quality! Fast shipping too! The 240W charging is insanely fast.", avatar: avatarLo },
  { name: "b***n", rating: 5, text: "Solid cable, charges my laptop quickly. Very happy with this purchase!", avatar: avatarReview1 },
  { name: "B***s", rating: 5, text: "Great value for the price. I got the 3-pack and all cables work perfectly.", avatar: avatarReview2 },
  { name: "w***r", rating: 5, text: "Perfect for my gaming setup. The 90° angle keeps things tidy behind my desk.", avatar: avatarReview3 },
  { name: "A***o", rating: 5, text: "Bought this for my wife's new phone, she loves it. Ordering another set!", avatar: avatarReview4 },
  { name: "G***i", rating: 5, text: "Top notch quality. You can feel the difference compared to regular cables.", avatar: avatarReview5 },
  { name: "K***i", rating: 5, text: "Fast charging is real! My phone goes from 0 to 80% in no time.", avatar: avatarPa },
];

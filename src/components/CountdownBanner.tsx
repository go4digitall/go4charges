import { useEffect, useState } from "react";

export const CountdownBanner = () => {
  const [endDate] = useState(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  });

  const calculateTimeLeft = () => {
    const difference = endDate.getTime() - new Date().getTime();
    if (difference > 0) {
      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToProducts = () => {
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-secondary text-white py-1.5 px-2 sm:py-2.5 sm:px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 text-center flex-wrap">
        <span className="font-bold text-[10px] sm:text-base">
          🔥 UP TO 70% OFF 🔥
        </span>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex gap-1 sm:gap-2">
            <div className="bg-white/20 backdrop-blur-sm px-1 sm:px-3 py-0.5 sm:py-1 rounded">
              <span className="font-bold text-xs sm:text-lg">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[8px] sm:text-xs ml-0.5">h</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-1 sm:px-3 py-0.5 sm:py-1 rounded">
              <span className="font-bold text-xs sm:text-lg">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[8px] sm:text-xs ml-0.5">m</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-1 sm:px-3 py-0.5 sm:py-1 rounded">
              <span className="font-bold text-xs sm:text-lg">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[8px] sm:text-xs ml-0.5">s</span>
            </div>
          </div>

          <button
            onClick={scrollToProducts}
            className="bg-amber-500 hover:bg-amber-600 text-white px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-md text-[9px] sm:text-sm font-semibold transition-colors whitespace-nowrap"
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};

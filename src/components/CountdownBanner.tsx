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
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm sm:text-base">
            🔥 UP TO 73% OFF – Crazy Prices – Limited Stock 🔥
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex gap-2">
            <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded">
              <span className="font-bold text-base sm:text-lg">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-xs ml-1">h</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded">
              <span className="font-bold text-base sm:text-lg">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-xs ml-1">m</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded">
              <span className="font-bold text-base sm:text-lg">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-xs ml-1">s</span>
            </div>
          </div>

          <button
            onClick={scrollToProducts}
            className="ml-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};

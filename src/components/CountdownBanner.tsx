import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const CountdownBanner = () => {
  const navigate = useNavigate();
  
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

  const goToFamilyBundle = () => {
    navigate("/product/chargestand-240w-90-fast-charging-cable?bundle=family");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground py-1.5 px-2 sm:py-2.5 sm:px-4 shadow-lg shadow-primary/20">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 text-center flex-nowrap">
        <span className="font-bold text-[10px] sm:text-base tracking-wide">
          ⚡ FLASH SALE — UP TO 70% OFF ⚡
        </span>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex gap-1 sm:gap-2">
            <div className="bg-primary-foreground/15 px-1 sm:px-3 py-0.5 sm:py-1 rounded">
              <span className="font-bold text-xs sm:text-lg font-mono">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[8px] sm:text-xs ml-0.5 opacity-70">h</span>
            </div>
            <div className="bg-primary-foreground/15 px-1 sm:px-3 py-0.5 sm:py-1 rounded">
              <span className="font-bold text-xs sm:text-lg font-mono">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[8px] sm:text-xs ml-0.5 opacity-70">m</span>
            </div>
            <div className="bg-primary-foreground/15 px-1 sm:px-3 py-0.5 sm:py-1 rounded">
              <span className="font-bold text-xs sm:text-lg font-mono">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[8px] sm:text-xs ml-0.5 opacity-70">s</span>
            </div>
          </div>

          <button
            onClick={goToFamilyBundle}
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-md text-[9px] sm:text-sm font-bold transition-colors whitespace-nowrap"
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};

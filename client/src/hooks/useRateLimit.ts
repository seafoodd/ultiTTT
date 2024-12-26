import { useState, useEffect } from "react";

const useRateLimit = () => {
  const [rateLimitTimeLeft, setRateLimitTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (rateLimitTimeLeft === null || rateLimitTimeLeft <= 0) {
      setRateLimitTimeLeft(null);
      return;
    }
    const timer = setInterval(() => {
      setRateLimitTimeLeft((prevTime) => (prevTime !== null ? prevTime - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitTimeLeft]);

  return { rateLimitTimeLeft, setRateLimitTimeLeft };
};

export default useRateLimit;
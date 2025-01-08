import { RateLimiterMemory } from "rate-limiter-flexible";

const bruteforceLimiter = new RateLimiterMemory({
  points: 10,
  duration: 30,
});
const floodingLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});
const globalRateLimiter = new RateLimiterMemory({
  points: 50, // TODO: replace with a lower number (like 20) when i fix the places with too many requests from the client
  duration: 1,
});

const preventBruteforce = async (ip) => {
  try {
    await bruteforceLimiter.consume(ip);
  } catch (rateLimiterRes) {
    return Math.ceil(rateLimiterRes.msBeforeNext / 1000);
  }
  return null;
};

const preventAccountFlooding = async (ip) => {
  try {
    await floodingLimiter.consume(ip);
  } catch (rateLimiterRes) {
    return Math.ceil(rateLimiterRes.msBeforeNext / 1000);
  }
  return null;
};

const rateLimitMiddleware = async (req, res, next) => {
  try {
    await globalRateLimiter.consume(req.ip);
    next();
  } catch (rateLimiterRes) {
    res.status(429).json({
      error: "Too many requests",
      retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000),
    });
  }
};

export { preventBruteforce, preventAccountFlooding, rateLimitMiddleware };

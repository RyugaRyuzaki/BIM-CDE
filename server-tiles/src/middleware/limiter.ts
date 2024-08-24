import rateLimit from "express-rate-limit";
export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    message:
      "Too many requests created from this IP, please try again after a minutes",
    result: false,
  },
  //@ts-ignore
  keyGenerator: (req) => req.ip,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

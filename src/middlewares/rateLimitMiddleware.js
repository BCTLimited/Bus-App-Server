import rateLimit from "express-rate-limit";

// Apply rate limiting middleware
const rateLimitMiddleware = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  handler: function (req, res, next) {
    // Set custom status code and message
    res.status(429).json({
      message: "Too many requests from this IP, please try again later",
    });
  },
});

export default rateLimitMiddleware;

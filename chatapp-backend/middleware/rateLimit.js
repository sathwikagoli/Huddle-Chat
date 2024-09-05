const rateLimit = require('express-rate-limit');

const chatRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many messages sent from this IP, please try again after a minute"
});

module.exports = chatRateLimiter;

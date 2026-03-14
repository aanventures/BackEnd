const jwt = require("jsonwebtoken");

exports.sendToken = (user, statusCode, res, message) => {
  // 1. Generate the JWT
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "your_secret_key",
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

  // 2. Define Cookie Options
  // 2. Define Cookie Options
  const options = {
    expires: new Date(
      Date.now() + (parseInt(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // On localhost, 'secure' must be false unless you have an SSL certificate
    secure: process.env.NODE_ENV === "production", 
    // On localhost (HTTP), use "lax". In production (HTTPS), use "none"
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/", // Ensure the cookie is available across all pages
  };

  // 3. Send Response with Cookie
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    // We send the user object for Redux, but the token stays in the cookie
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      avatar: user.avatar,
    },
    token
  });
};
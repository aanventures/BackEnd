const jwt = require("jsonwebtoken");

exports.sendToken = (user, statusCode, res, message) => {
  // 1. Generate the JWT
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "your_secret_key",
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

  // 2. Define Cookie Options
  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    expires: new Date(
      Date.now() + (Number(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents XSS attacks
    path: "/",
    secure: isProduction ? true : false, 
    sameSite: isProduction ? "none" : "lax",
  };

  // 3. Send Response
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      avatar: user.avatar,
    },
    // Keep this for debugging, but Redux should rely on the Cookie
    token 
  });
};
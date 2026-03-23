const jwt = require("jsonwebtoken");

exports.sendToken = (user, statusCode, res, message) => {
  // 1. Generate the JWT
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "your_secret_key",
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

  // 2. Define Cookie Options - Added fallback for COOKIE_EXPIRE
  const cookieDays = process.env.COOKIE_EXPIRE ? Number(process.env.COOKIE_EXPIRE) : 7;

  const options = {
    expires: new Date(
      Date.now() + cookieDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // If you are testing on Localhost (Chrome), secure must be false
    secure: process.env.NODE_ENV === "production", 
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", 
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
    token 
  });
};
const { expressjwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.JWT_SECRET;
  // const api = process.env.API;
  return expressjwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/api\/products(.*)/, method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] },
      { url: /\/api\/users(.*)/, method: ["GET", "POST", "PUT", "OPTIONS"] },
      "/api/users/signup",
      "/api/users/login",
      "/api/users/signup/admin/authenticate",
      "/api/users/login/resetPassword",
      "/api/products/orders/update/:id",
    ],
  });
}

async function isRevoked(req, payload, done) {
  try {
    //console.log("Payload received in isRevoked:", payload);
    return !payload.payload.isAdmin;
  } catch (error) {
    return true;
  }
}

module.exports = authJwt;

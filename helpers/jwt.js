const { expressjwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.SECRET;
  // const api = process.env.API;
  return expressjwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/api\/products(.*)/, method: ["GET", "POST", "OPTIONS"] },
      { url: /\/api\/users(.*)/, method: ["GET", "POST", "OPTIONS"] },
      "/api/users/signup",
      "/api/users/login",
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

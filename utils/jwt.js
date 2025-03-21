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
      {
        url: /^\/api\/products(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      { url: /^\/api\/users(.*)/, methods: ["GET", "POST", "PUT", "OPTIONS"] },
      { url: "/api/users/signup", methods: ["POST"] },
      { url: "/api/users/login", methods: ["POST"] },
      { url: "/api/users/signup/admin/authenticate", methods: ["POST"] },
      { url: "/api/users/login/resetPassword", methods: ["PUT"] },
      { url: "/api/products/orders/update/:id", methods: ["PUT"] },
      { url: "/api/products/category/fetch", methods: ["GET"] },
      { url: "/api/dashboard/fetch", methods: ["GET"] },
      { url: "/api/orders/verify_payment", methods: ["GET", "POST"] },
      { url: "/api/orders/place_order", methods: ["GET", "POST"] },
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

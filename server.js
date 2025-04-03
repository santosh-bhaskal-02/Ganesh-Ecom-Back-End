const express = require("express");
const cors = require("cors");
const env = require("dotenv");
const morgan = require("morgan");
const connectMongo = require("./config/config_mongoDB.js");
const connectCloudinary = require("./config/config_cloudinary.js");

//import routers
const routerProduct = require("./routes/router_product.js");
const routerSignup = require("./routes/router_signUp.js");
const routerLogin = require("./routes/router_login.js");
const routerProductLink = require("./utils/utils_cloudinary_upload.js");
const routerCategory = require("./routes/router_category.js");
const routerOrder = require("./routes/router_order.js");
const routerCart = require("./routes/router_cart.js");
const routerAdminLogin = require("./routes/router_adminLogin.js");
const routerDashboard = require("./routes/router_dashBoard.js");

//helpers
const authJwt = require("./utils/jwt.js");
const errorHandler = require("./middlewares/error_handler.js");

//env file
env.config();

const app = express();
const port = process.env.PORT;

//middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);

// connect to Database
connectMongo();

//connect to cloudinary
connectCloudinary();

//Routers
app.use("/api/products", routerProduct);
app.use("/api/products/product_link", routerProductLink);
app.use("/api/products/category", routerCategory);
app.use("/api/products/cart", routerCart);
app.use("/api/products/orders", routerOrder);
app.use("/api/users/signup", routerSignup);
app.use("/api/users/signup/admin", routerAdminLogin);
app.use("/api/users/login", routerLogin);
app.use("/api/dashboard", routerDashboard);

app.options("*", cors());

//server
app.listen(port, () => {
  console.log(`Server running on port - http://localhost:${port}`);
});

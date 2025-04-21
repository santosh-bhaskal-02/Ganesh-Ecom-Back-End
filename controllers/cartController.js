// controllers/cartController.js
const cartService = require("../services/cartService");

const allCarts = async (req, res) => {
  try {
    const carts = await cartService.allCarts();
    return res.status(200).json(carts);
  } catch (error) {
    const statusCode = error.message === "No orders placed" ? 404 : 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

const cartByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const cart = await cartService.cartByUserId(userId);
    return res.status(200).json(cart);
  } catch (error) {
    const statusCode = error.message === "Cart not found" ? 404 : 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { cartItem, user } = req.body;
    console.log(cartItem);
    const result = await cartService.addToCart(cartItem, user);
    res.status(result.status).json(result.response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { userId, productId, action } = req.body;
    const result = await cartService.updateCartItemQuantity(userId, productId, action);
    res.status(result.status).json(result.response);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    console.log(itemId);
    const updatedCart = await cartService.deleteCartItem(itemId);

    return res.status(200).json({
      success: true,
      message: "Item deleted from cart successfully!",
      updatedCart,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  allCarts,
  addToCart,
  updateCartItemQuantity,
  deleteCartItem,
  cartByUserId,
};

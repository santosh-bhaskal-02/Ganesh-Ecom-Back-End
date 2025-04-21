const Cart = require("../models/model_cart");
const CartItem = require("../models/model_cartItem");

const findAllCarts = async () => {
  return await Cart.find()
    .populate({
      path: "cartItems",
      populate: { path: "product" },
    })
    .populate("user", "name")
    .sort({ addedDate: -1 });
};

const findCartByUserId = (userId) => {
  return Cart.findOne({ user: userId })
    .populate({
      path: "cartItems",
      populate: { path: "product" },
    })
    .sort({ addedDate: -1 });
};

const updateCartItemQuantity = (cartItemId, incrementBy) => {
  return CartItem.findByIdAndUpdate(cartItemId, { quantity: incrementBy }, { new: true });
};

const incrementCartTotalPrice = (cartId, amount) => {
  return Cart.findByIdAndUpdate(cartId, { $inc: { totalPrice: amount } }, { new: true });
};

const createCartItem = (productId, quantity) => {
  const newItem = new CartItem({ product: productId, quantity });
  return newItem.save();
};

const createCart = (cartItems, totalPrice, userId) => {
  const cart = new Cart({
    cartItems,
    totalPrice,
    user: userId,
  });
  return cart.save();
};

const getCartItemById = (cartItemId) => {
  return CartItem.findById(cartItemId);
};

const incrementCartTotal = (userId, priceChange) => {
  return Cart.findOneAndUpdate(
    { user: userId },
    { $inc: { totalPrice: priceChange } },
    { new: true }
  );
};

const pullItemFromCart = async (itemId) => {
  return await Cart.findOneAndUpdate(
    { cartItems: itemId },
    { $pull: { cartItems: itemId } },
    { new: true }
  ).populate({
    path: "cartItems",
    populate: "product",
  });
};

const deleteCartItem = (cartItemId) => {
  return CartItem.findByIdAndDelete(cartItemId);
};

module.exports = {
  findAllCarts,
  findCartByUserId,
  updateCartItemQuantity,
  incrementCartTotalPrice,
  createCartItem,
  createCart,

  getCartItemById,

  incrementCartTotal,
  deleteCartItem,
  pullItemFromCart,
};

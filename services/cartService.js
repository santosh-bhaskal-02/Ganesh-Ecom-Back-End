// services/cartService.js
const CartRepository = require("../repositories/cartRepository");
const ProductRepository = require("../repositories/productRepository");

const allCarts = async () => {
  const carts = await CartRepository.findAllCarts();
  if (!carts || carts.length === 0) {
    throw new Error("No orders placed");
  }
  return carts;
};

const cartByUserId = async (userId) => {
  const cart = await CartRepository.findCartByUserId(userId);
  if (!cart) {
    throw new Error("Cart not found");
  }
  return cart;
};

const addToCart = async (cartItem, user) => {
  const product = await ProductRepository.productById(cartItem.productId);
  if (!product) {
    return {
      status: 404,
      response: { success: false, message: "Product not found" },
    };
  }

  // console.log("111", cartItem.quantity, product.stock);
  if (cartItem.quantity > product.stock) {
    return {
      status: 400,
      response: { success: false, message: "Requested quantity exceeds available stock" },
    };
  }

  const existingCart = await CartRepository.findCartByUserId(user);

  //console.log("111", existingCart);
  if (existingCart) {
    const index = existingCart.cartItems.findIndex(
      (item) => item.product.id == cartItem.productId
    );

    if (index !== -1) {
      const existingItem = existingCart.cartItems[index];
      const itemProduct = await existingItem.populate("product");

      const newQuantity = existingItem.quantity + cartItem.quantity;

      if (newQuantity > product.stock) {
        return {
          status: 400,
          response: { success: false, message: "Total quantity exceeds available stock" },
        };
      }

      await CartRepository.updateCartItemQuantity(existingItem._id, cartItem.quantity);
      await CartRepository.incrementCartTotalPrice(
        existingCart._id,
        itemProduct.product.price * cartItem.quantity
      );

      return {
        status: 200,
        response: { success: true, message: "quantity updated to cart" },
      };
    } else {
      const savedItem = await CartRepository.createCartItem(
        cartItem.productId,
        cartItem.quantity
      );
      if (!savedItem?._id) throw new Error("CartItem Ids not created");

      const savedProduct = await savedItem.populate("product");

      existingCart.cartItems.push(savedItem._id);
      await existingCart.save();
      await CartRepository.incrementCartTotalPrice(
        existingCart._id,
        savedProduct.product.price * cartItem.quantity
      );

      return {
        status: 200,
        response: { success: true, message: "item added to cart" },
      };
    }
  } else {
    const newItem = await CartRepository.createCartItem(
      cartItem.productId,
      cartItem.quantity
    );
    if (!newItem?._id) throw new Error("CartItem Ids not created");

    const populatedItem = await newItem.populate("product");
    const totalPrice = populatedItem.product.price * populatedItem.quantity;

    const newCart = await CartRepository.createCart([newItem._id], totalPrice, user);
    if (!newCart) {
      return { status: 422, response: { success: false, message: "item is not added" } };
    }

    return {
      status: 200,
      response: { success: true, message: "added to cart" },
    };
  }
};

const updateCartItemQuantity = async (userId, cartItemId, action) => {
  const cartItem = await CartRepository.getCartItemById(cartItemId);
  if (!cartItem) {
    return {
      status: 404,
      response: { success: false, message: "Cart item not found" },
    };
  }

  const product = await ProductRepository.productById(cartItem.product);
  if (!product) {
    return {
      status: 404,
      response: { success: false, message: "Product not found" },
    };
  }

  let quantity = cartItem.quantity;
  //console.log("130", quantity);
  let priceChange = 0;

  if (action === "increment") {
    if (quantity >= product.stock) {
      return {
        status: 400,
        response: { success: false, message: "Quantity exceeds stock limit" },
      };
    }
    quantity += 1;
    priceChange = product.price;
  } else if (action === "decrement") {
    if (quantity > 1) {
      quantity -= 1;
      priceChange = -product.price;
    } else {
      await CartRepository.deleteCartItem(cartItem._id);
      await CartRepository.pullItemFromCart(cartItem._id);

      return {
        status: 200,
        response: { success: true, message: "Item removed from cart" },
      };
    }
  } else {
    return {
      status: 400,
      response: { success: false, message: "Invalid action" },
    };
  }

  // console.log("162", quantity);

  const updatedCartItem = await CartRepository.updateCartItemQuantity(
    cartItem._id,
    quantity
  );

  const updatedCart = await CartRepository.incrementCartTotal(userId, priceChange);

  // console.log("172", updatedCartItem);
  // console.log("Before:", cartItem.quantity, "After:", updatedCartItem.quantity);

  return {
    status: 200,
    response: {
      success: true,
      message: "Cart item quantity updated",
      data: updatedCartItem,
      totalPrice: updatedCart.totalPrice,
    },
  };
};

const deleteCartItem = async (itemId) => {
  const deletedItem = await CartRepository.deleteCartItem(itemId);
  if (!deletedItem) throw new Error("Cart item not found");
  console.log(deletedItem);
  const updatedCart = await CartRepository.pullItemFromCart(itemId);
  if (!updatedCart) throw new Error("Cart not found");

  // Recalculate totalPrice
  console.log("updatedCart", updatedCart);
  const newTotalPrice = updatedCart.cartItems.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  updatedCart.totalPrice = newTotalPrice;
  await updatedCart.save();

  return updatedCart;
};

module.exports = {
  allCarts,
  addToCart,
  updateCartItemQuantity,
  deleteCartItem,
  cartByUserId,
};

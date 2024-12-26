const express = require("express");
const Cart = require("../models/model_cart");
const CartItem = require("../models/model_cartItem");
const router = express.Router();

router.get("/all", async (req, res) => {
  //console.log("Hii");
  try {
    const cartItems = await Cart.find()
      .populate({
        path: "cartItems",
        populate: { path: "product" },
      })
      .populate("user", "name")

      .sort({ addedDate: -1 });
    if (!cartItems) {
      return res
        .status(404)
        .json({ success: false, message: "no orders placed" });
    }
    return res.status(200).send(cartItems);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const cartItems = await Cart.findOne({ user: id })
      .populate("user", "name")
      .populate({
        path: "cartItems",
        populate: { path: "product" },
      })
      .sort({ addedDate: -1 });

    if (!cartItems) {
      return res
        .status(404)
        .json({ success: false, message: "cart not found" });
    }
    return res.status(200).json(cartItems);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/add_to_cart", async (req, res) => {
  try {
    const { cartItem, user } = req.body;
    //  console.log(user);

    const existCart = await Cart.findOne({ user: user }).populate(
      "cartItems",
      "product"
    );

    if (existCart) {
      const existIndex = await existCart.cartItems.findIndex(
        (item) => item.product == cartItem.productId
      );
      console.log(existIndex);

      if (existIndex !== -1) {
        const existItem = existCart.cartItems[existIndex];
        const itemProduct = await existItem.populate("product");
        //console.log(itemProduct.product.price);
        //console.log(itemProduct.product.price * cartItem.quantity);
        await CartItem.findByIdAndUpdate(existItem._id, {
          $inc: {
            quantity: cartItem.quantity,
          },
        });

        await Cart.findByIdAndUpdate(existCart._id, {
          $inc: {
            totalPrice: itemProduct.product.price * cartItem.quantity,
          },
        });

        return res
          .status(200)
          .json({ success: true, message: "quantity updated to cart" });
      } else {
        const cartItemId = new CartItem({
          product: cartItem.productId,
          quantity: cartItem.quantity,
        });

        const savedCartItem = await cartItemId.save();

        if (savedCartItem._id == null) {
          throw new Error("CartItem Ids not created");
        }
        const savedProduct = await savedCartItem.populate("product");

        await existCart.cartItems.push(savedCartItem._id);
        await existCart.save();
        await Cart.findOneAndUpdate(existCart._id, {
          $inc: {
            totalPrice: savedProduct.product.price * cartItem.quantity,
          },
        });
      }
      return res
        .status(200)
        .json({ success: true, message: "item updated to cart" });
    } else {
      const cartItemId = new CartItem({
        product: cartItem.productId,
        quantity: cartItem.quantity,
      });

      const savedCartItem = await cartItemId.save();

      if (savedCartItem._id == null) {
        throw new Error("CartItem Ids not created");
      }

      const Items = await savedCartItem.populate("product");

      let totalPrice = 0;

      totalPrice = Items.product.price * Items.quantity;

      console.log(totalPrice);
      // const price = totalPrice.reduce((a, b) => a + b, 0);

      //  console.log(price);

      const cart = new Cart({
        cartItems: savedCartItem._id,
        totalPrice: totalPrice,
        user: user,
      });

      const addCart = await cart.save();
      if (!addCart) {
        return res
          .status(422)
          .json({ success: false, message: "item is not added" });
      }
    }
    return res.status(200).json({ success: true, message: "added to cart" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const count = req.body.count;

    if (!count || typeof count !== "number") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid count value" });
    }

    const cartItem = await CartItem.findByIdAndUpdate(
      id,
      {
        $inc: {
          quantity: count,
        },
      },
      {
        new: true,
      }
    );

    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    if (cartItem.quantity < 1) {
      const updateItem = await CartItem.findByIdAndDelete(id);

      if (!updateItem) {
        return res
          .status(404)
          .json({ Success: false, message: "item not found..!" });
      }

      const updateCart = await Cart.findOneAndUpdate(
        { cartItems: id },
        {
          $pull: { cartItems: id },
        },
        { new: true }
      );

      if (!updateCart) {
        return res
          .status(404)
          .json({ Success: false, message: "item not found..!" });
      }
      return res.status(200).json({
        success: true,
        message: "Item removed from cart",
      });
    }

    return res.status(200).json({
      success: true,
      message: "CartItem quantity updated",
      data: cartItem,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    console.log(itemId);
    const response = await CartItem.findByIdAndDelete(itemId);
    if (!response) {
      return res
        .status(404)
        .json({ Success: false, message: "1item not found..!" });
    }

    const updateCart = await Cart.findOneAndUpdate(
      { cartItems: itemId },
      {
        $pull: { cartItems: itemId },
      },
      { new: true }
    );

    if (!updateCart) {
      return res
        .status(404)
        .json({ Success: false, message: "2item not found..!" });
    }

    return res
      .status(404)
      .json({ Success: true, message: "item is Deleted..!" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

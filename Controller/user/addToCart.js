import mongoose from "mongoose";
import CartModel from "../../Models/User/cart.js";
import user from "../../Models/User/UserDetailsModel.js";
import applyDiscounts, {
  normalizeCategoryTitle,
} from "../../Utils/User/activeOffer.js";
import Offer from "../../Models/Admin/offers.js";

export const getCartItems = async (req, res) => {
  try {
    const userId = req.session.UserId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID." });
    }

    const userCart = await CartModel.findOne({ userId });

    if (!userCart || !userCart.items.length) {
      return res
        .status(200)
        .json({ message: "Your cart is empty.", cartItems: [] });
    }

    const currentDate = new Date();
    const activeOffers = await Offer.find({
      status: "active",
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    const detailedCartItems = [];

    for (const item of userCart.items) {
      const { categoryId, productId, quantity, price } = item;

      const CategoryCollection = mongoose.connection.collection(categoryId);

      const product = await CategoryCollection.findOne({
        _id: new mongoose.Types.ObjectId(productId),
      });

      if (product) {
        const isBlocked = product.isblocked === true;

        if (!isBlocked) {
          const normalizedCategoryTitle = normalizeCategoryTitle(categoryId);
          const discountedProduct = applyDiscounts(
            product,
            normalizedCategoryTitle,
            activeOffers
          );

          detailedCartItems.push({
            categoryId,
            productId,
            quantity,
            price,
            productDetails: discountedProduct,
            offers: {
              productOffer: discountedProduct.productOffer || null,
              categoryOffer: discountedProduct.categoryOffer || null,
            },
            isBlocked,
          });
        }
      }
    }

    const totalDiscountedPrice = detailedCartItems.reduce(
      (total, item) =>
        total + item.productDetails.discountedPrice * item.quantity,
      0
    );

    res.status(200).json({
      message: "Cart items fetched successfully!",
      cartItems: detailedCartItems,
      totalPrice: userCart.totalPrice,
      totalDiscountedPrice,
    });
  } catch (error) {
    console.error("Error while getting cart items:", error);
    res.status(500).json({
      message: "An error occurred while fetching the cart items.",
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.session.UserId;
    const { quantity, price } = req.body;
    const { categoryId, productId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID." });
    }

    if (
      !categoryId ||
      !productId ||
      !quantity ||
      !price ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ message: "Invalid request data." });
    }

    const dynamicCollection = mongoose.connection.collection(categoryId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const product = await dynamicCollection.findOne({ _id: productObjectId });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const stockAvailable = product.Stock;

    if (stockAvailable < quantity) {
      return res.status(400).json({ message: "Insufficient stock available." });
    }

    const newStock = stockAvailable - quantity;

    // Update the stock in the product collection
    // await dynamicCollection.updateOne(
    //   { _id: productObjectId },
    //   { $set: { Stock: newStock } }
    // );

    let userCart = await CartModel.findOne({ userId });

    if (!userCart) {
      userCart = new CartModel({
        userId,
        items: [],
        totalPrice: 0,
      });
    }

    const existingItemIndex = userCart.items.findIndex(
      (item) =>
        item.categoryId === categoryId &&
        item.productId.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      userCart.items[existingItemIndex].quantity += quantity;
      userCart.items[existingItemIndex].price = price;
    } else {
      userCart.items.push({
        categoryId,
        productId,
        quantity,
        price,
      });
    }

    userCart.totalPrice = userCart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await userCart.save();

    res.status(200).json({
      message: "Item added to cart successfully!",
      cart: userCart,
    });
  } catch (error) {
    console.error("Error while adding to cart:", error);
    res.status(500).json({
      message: "An error occurred while adding the item to the cart.",
    });
  }
};

export const updateCartItems = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.UserId;

    if (quantity < 1 || quantity > 5) {
      return res
        .status(400)
        .json({ message: "Quantity must be between 1 and 5" });
    }

    const existingCartItem = await CartModel.findOne({
      userId: userId,
      "items.productId": productId,
    });

    if (!existingCartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const itemIndex = existingCartItem.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    const oldQuantity = existingCartItem.items[itemIndex].quantity;
    const quantityDifference = quantity - oldQuantity;

    const categoryId = existingCartItem.items[itemIndex]?.categoryId;

    if (!categoryId) {
      console.error("CategoryId not found in cart item");
      return res.status(404).json({ message: "CategoryId not found" });
    }

    const dynamicCollection = mongoose.connection.collection(categoryId);

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const productDetail = await dynamicCollection.findOne({
      _id: productObjectId,
    });

    if (!productDetail) {
      return res
        .status(404)
        .json({ message: "Product not found in the specified category" });
    }

    const oldStock = productDetail.Stock;


    const newStock = oldStock - quantityDifference;

    if (newStock < 0 && quantityDifference > 0) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

 
    existingCartItem.items[itemIndex].quantity = quantity;

    let totalPrice = 0;
    existingCartItem.items.forEach((item) => {
      totalPrice += item.quantity * item.price; 
    });

    existingCartItem.totalPrice = totalPrice;
    await existingCartItem.save();

  
    return res.status(200).json({
      message: "Cart updated successfully. Stock is valid.",
      updatedCartItem: existingCartItem,
      productDetail: productDetail,
      totalPrice: totalPrice,
    });
  } catch (error) {
    console.error("Error while updating the cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeCartItem = async (req, res) => {
  try {

    const productIdreq = req.body.itemId;
    const productId = new mongoose.Types.ObjectId(productIdreq);

  
    const cartItem = await CartModel.findOne({ "items.productId": productId });

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in the cart." });
    }

 
    const itemIndex = cartItem.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in the cart." });
    }

   
    const quantityToRestore = cartItem.items[itemIndex].quantity;

  
    const categoryId = cartItem.items[itemIndex].categoryId;

    if (!categoryId) {
      console.error("CategoryId not found in cart details");
      return res.status(404).json({ message: "CategoryId not found" });
    }

    const dynamicCollection = mongoose.connection.collection(categoryId);


    const productObjectId = new mongoose.Types.ObjectId(productId);

    const productDetail = await dynamicCollection.findOne({
      _id: productObjectId,
    });

    if (!productDetail) {
      return res
        .status(404)
        .json({ message: "Product not found in the specified category" });
    }

    
    const newStock = productDetail.Stock + quantityToRestore;


    await dynamicCollection.updateOne(
      { _id: productObjectId },
      { $set: { Stock: newStock } }
    );

    
    cartItem.items.splice(itemIndex, 1); 

  
    await cartItem.save();

  
    res
      .status(200)
      .json({ message: "Item removed from cart successfully.", cartItem });
  } catch (error) {
    console.error("Error while deleting the item from the cart:", error);
    res
      .status(500)
      .json({ message: "Failed to remove item from the cart.", error });
  }
};

export const getcartCheckout = async (req, res) => {
  try {
    res.render("User/cartCheckout.ejs");
  } catch (error) {
    console.log("error while getting cart checkout", error);
  }
};

export const cartItems = async (req, res) => {
  try {
  
    const userId = req.session.UserId;

  
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID." });
    }

   
    const userCart = await CartModel.findOne({ userId });

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return res
        .status(200)
        .json({ message: "Your cart is empty.", cartItems: [] });
    }

    // Fetch active offers
    const currentDate = new Date();
    const activeOffers = await Offer.find({
      status: "active",
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });


    const detailedCartItemsPromises = userCart.items.map(async (cartItem) => {
      const { categoryId, productId, quantity, price } = cartItem;

      
      const CategoryCollection = mongoose.connection.collection(categoryId);

    
      const product = await CategoryCollection.findOne({
        _id: new mongoose.Types.ObjectId(productId),
      });

      if (product) {
        const isBlocked = product.isblocked === true;

     
        if (!isBlocked) {
          const normalizedCategoryTitle = normalizeCategoryTitle(categoryId);
          const discountedProduct = applyDiscounts(
            product,
            normalizedCategoryTitle,
            activeOffers
          );

          return {
            categoryId,
            productId,
            quantity,
            price,
            productDetails: discountedProduct, 
            offers: {
              productOffer: discountedProduct.productOffer || null,
              categoryOffer: discountedProduct.categoryOffer || null,
            },
            isBlocked,
          };
        }
      }

      return null; 
    });


    const detailedCartItems = (
      await Promise.all(detailedCartItemsPromises)
    ).filter(Boolean);

   
    const totalDiscountedPrice = detailedCartItems.reduce(
      (total, item) =>
        total + item.productDetails.discountedPrice * item.quantity,
      0
    );

    res.status(200).json({
      message: "Cart items fetched successfully!",
      cartItems: detailedCartItems,
      totalPrice: userCart.totalPrice, 
      totalDiscountedPrice, 
    });
  } catch (error) {
    console.error("Error while getting cart items:", error);
    res.status(500).json({
      message: "An error occurred while fetching the cart items.",
    });
  }
};

export const getProductDetails = async (req, res) => {
  try {
    const { categoryId, productId } = req.params;

    const dynamicCollection = mongoose.connection.collection(categoryId);

  
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const productDetail = await dynamicCollection.findOne({
      _id: productObjectId,
    });

    if (!productDetail) {
      return res
        .status(404)
        .json({ message: "Product not found in the specified category" });
    }

    
    if (productDetail.isblocked) {
      return res
        .status(403)
        .json({ message: "This product is blocked and cannot be viewed." });
    }

    res.status(200).json({ productData: productDetail });
  } catch (error) {
    console.log("Error while getting product details:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while fetching the product details.",
      });
  }
};

export const getCartCollectionData = async (req, res) => {
  try {
    const userId = req.session.UserId;

    const cartData = await CartModel.find({ userId: userId });
    res.status(200).json({ cartData: cartData });
  } catch (error) {
    console.log("error while getting data from the cart collection");
  }
};

export const getCartDetailedPage = async (req, res) => {
  try {
    res.render("User/cartDetail.ejs");
  } catch (error) {
    console.log("error while getting cart detailed page");
  }
};

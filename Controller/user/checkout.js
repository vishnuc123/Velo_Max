import mongoose from "mongoose";
import Offer from "../../Models/Admin/offers.js";
import {
  fetchCategoryTitles,
  checkExistingCollections,
  fetchDocumentsFromCollection,
} from "../../Utils/User/product.js"; // Import the helper functions

export const load_buyNow = async (req, res) => {
  try {
    // Extract categoryId and productId from the request parameters
    const { categoryId, productId } = req.params;
    console.log(categoryId,productId);
    
    // Check if the category exists in the collection
    const existingCollectionNames = await checkExistingCollections();

    if (!existingCollectionNames.includes(categoryId)) {
      return res.status(404).json({ message: `Collection for category "${categoryId}" does not exist` });
    }

    // Fetch product details from the corresponding collection
    const productData = await fetchDocumentsFromCollection(categoryId, {
      _id: new mongoose.Types.ObjectId(productId),
    });

    if (!productData || productData.length === 0) {
      return res.status(404).json({ message: `Product with ID "${productId}" not found` });
    }

    // Fetch active offers
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

    const activeOffers = await Offer.find({
      $or: [
        {
          offerType: "product",
          productId: productId,
          status: "active",
          startDate: { $lte: endOfDay },
          endDate: { $gte: startOfDay },
        },
        {
          offerType: "category",
          category: categoryId, // Match transformed category name
          status: "active",
          startDate: { $lte: endOfDay },
          endDate: { $gte: startOfDay },
        },
      ],
    });

    console.log("Active Offers:", activeOffers);

    // Separate offers into category and product offers
    let categoryOffer = null;
    let productOffer = null;

    for (const offer of activeOffers) {
      if (offer.offerType === "category") {
        categoryOffer = {
          _id: offer._id,
          offerName: offer.offerName,
          offerType: offer.offerType,
          category: offer.category,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          status: offer.status,
          startDate: offer.startDate,
          endDate: offer.endDate,
        };
      }

      if (offer.offerType === "product") {
        productOffer = {
          _id: offer._id,
          offerName: offer.offerName,
          offerType: offer.offerType,
          productId: offer.productId,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          status: offer.status,
          startDate: offer.startDate,
          endDate: offer.endDate,
        };
      }
    }

    // Attach offers to the product data
    const responseData = {
      ...productData[0], // Access the first item since it returns an array
      productOffer: productOffer || null, // Attach product offer, if any
      categoryOffer: categoryOffer || null, // Attach category offer, if any
    };

    console.log("Product Data with Offers:", responseData);

    // Render the checkout page with the response data
    res.render("User/buycheckout", {
      productData: responseData,
    });
  } catch (error) {
    console.error("Error while getting buy now checkout:", error);
    res.status(500).send("Internal Server Error");
  }
};



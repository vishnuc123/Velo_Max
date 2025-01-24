import errorHandler from "../../Error-Reporter.js";
import mongoose from "mongoose";
import Offer from '../../Models/Admin/offers.js';
import { notifyClients } from "../../Utils/Admin/sse.js";


export const getOfferPage = async (req, res, next) => {
  try {
    res.render("Admin/offers.ejs");
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.q; // Get the search term from the query parameters
    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is required" });
    }

    // List of collections to exclude from the search
    const excludedCollections = [
      "addresses",
      "buynoworders",
      "carts",
      "categories",
      "coupon",
      "users",
      "wallets",
      "wishlists",
    ];

    // Get all collection names in the database
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const existingCollectionNames = collections.map((col) => col.name);

    const searchResults = {};

    for (const collectionName of existingCollectionNames) {
      // skip the collections in the standard collection
      if (excludedCollections.includes(collectionName)) continue;

      // Use regex to search for products matching the search term in relevant fields
      const regex = new RegExp(searchTerm, "i"); // 'i' for case-insensitive
      const documents = await mongoose.connection.db
        .collection(collectionName)
        .find({
          $or: [
            { productName: { $regex: regex } },
            { productDescription: { $regex: regex } },
          ],
        })
        .limit(10)
        .toArray(); // Limit results to top 10 for performance

      if (documents.length > 0) {
        searchResults[collectionName] = documents;
      }
    }

    res.json({ message: "success", searchResults });
  } catch (error) {
    console.log("Error while searching for products", error);
    res.status(500).json({ message: "Error while searching for products" });
  }
};

export const addOffer = async (req, res, next) => {
  try {
    const {
      offerName,
      offerType,
      category,
      productId,
      discountType,
      discountValue,
      productName,
      startDate,
      endDate,
    } = req.body;

    // Validate required fields
    if (
      !offerName ||
      !offerType ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (offerType === "product" && !productId) {
      return res.status(400).json({ message: "Please select a product." });
    }

    let transformedCategory = null;

    // Transform the category name if it's a category-based offer
    if (offerType === "category" && category) {
      transformedCategory = category.replace(/\s+/g, "_").toLowerCase(); // Replace spaces with underscores and convert to lowercase
    }

    // Create a new offer document
    const newOffer = new Offer({
      offerName,
      offerType,
      productName: productName || null,
      category: offerType === "category" ? transformedCategory : null,
      productId: offerType === "product" ? productId : null,
      discountType,
      discountValue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    // Save the offer to the database
    await newOffer.save();

    // Notify clients (if applicable)
    notifyClients("offerCreated");

    res.status(200).json({
      message: "Offer created successfully.",
      offer: newOffer,
    });
  } catch (error) {
    next(error); // Pass errors to the next error handler
  }
};



export const getofferDetails = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Pagination support
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));

    const offersDetails = await Offer.find({}, '-__v') // Exclude __v field
      .sort({ createdAt: -1 }) // Sort by newest
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    const totalOffers = await Offer.countDocuments();

    res.status(200).json({
      message: "success",
      offers: offersDetails,
      currentPage: parsedPage,
      totalPages: Math.ceil(totalOffers / parsedLimit),
    });
  } catch (error) {
    console.error("Error fetching offer details:", error);
    res.status(500).json({ message: "Failed to retrieve offer details", error: error.message });
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    const offerId = req.params.offerId;

    // Assuming you're using a database model called `Offer`
    const deletedOffer = await Offer.findByIdAndDelete(offerId); // MongoDB example with Mongoose

    if (!deletedOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    notifyClients('offerDeleted',offerId)

    res.status(200).json({ message: "Offer deleted successfully", offer: deletedOffer });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};

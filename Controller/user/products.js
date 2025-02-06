import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import cron from "node-cron";
import { fetchCategoryTitles, checkExistingCollections, fetchDocumentsFromCollection } from "../../Utils/User/product.js";
import Offer from "../../Models/Admin/offers.js";
import applyDiscounts from "../../Utils/User/activeOffer.js"


// Load product list page
export const Load_products = async (req, res) => {
  try {
    res.render("User/productList.ejs");
  } catch (error) {
    console.error("Error while loading products page:", error);
  }
};

// Load product details page
export const Load_productDetail = async (req, res) => {
  try {
    res.render("User/productDetail.ejs");
  } catch (error) {
    console.error("Error while loading productDetail page:", error);
  }
};

// Cron job to deactivate expired offers
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await Offer.updateMany(
      { endDate: { $lt: new Date() } },
      { $set: { status: "inactive" } }
    );
  } catch (error) {
    console.error("Error during cron job:", error);
  }
});



// Get all products with discounts and offer data applied
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const titles = await fetchCategoryTitles();
    const existingCollectionNames = await checkExistingCollections();
    const currentDate = new Date();

    const activeOffers = await Offer.find({
      status: "active",
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    const allDocuments = {};
    let totalProducts = 0;

    for (const title of titles) {
      if (existingCollectionNames.includes(title)) {
        const documents = await fetchDocumentsFromCollection(
          title,
          { isblocked: { $ne: true } },
          { skip: (parsedPage - 1) * parsedLimit, limit: parsedLimit }
        );

        const updatedProducts = documents.map((product) =>
          applyDiscounts(product, title, activeOffers)
        );

        allDocuments[title] = updatedProducts;
        totalProducts += updatedProducts.length;
      }
    }

    res.json({
      message: "success",
      allDocuments,
      totalProducts,
      currentPage: parsedPage,
      totalPages: Math.ceil(totalProducts / parsedLimit),
    });
  } catch (error) {
    console.error("Error while fetching products:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Filter products based on sortType and category
export const filterProducts = async (req, res) => {
  try {
    const { sortType, categoryName } = req.body;
    const titles = await fetchCategoryTitles();
    const existingCollectionNames = await checkExistingCollections();
    const currentDate = new Date();

    const activeOffers = await Offer.find({
      status: "active",
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    const categoriesToFetch = categoryName === "all" ? titles : [categoryName];
    let allProducts = [];

    for (const title of categoriesToFetch) {
      if (existingCollectionNames.includes(title)) {
        let sortCondition = {};
        switch (sortType) {
          case "price_low_high":
            sortCondition = { ListingPrice: 1 };
            break;
          case "price_high_low":
            sortCondition = { ListingPrice: -1 };
            break;
          case "new_arrivals":
            sortCondition = { arrivalDate: -1 };
            break;
        }

        const documents = await fetchDocumentsFromCollection(
          title,
          { isblocked: { $ne: true } },
          sortCondition
        );

        const updatedProducts = documents.map((product) =>
          applyDiscounts(product, title, activeOffers)
        );

        allProducts = [...allProducts, ...updatedProducts];
      }
    }

    if (allProducts.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({ message: "success", products: allProducts });
  } catch (error) {
    console.error("Error while filtering products:", error);
    res.status(500).json({ message: "Error while filtering products", error: error.message });
  }
};

// Search products by name
export const searchProducts = async (req, res) => {
  try {
    const searchInput = req.query.search;
    const titles = await fetchCategoryTitles();
    const existingCollectionNames = await checkExistingCollections();

    let allProducts = [];
    for (const title of titles) {
      if (existingCollectionNames.includes(title)) {
        const documents = await fetchDocumentsFromCollection(title, {
          productName: { $regex: searchInput, $options: "i" },
          isblocked: { $ne: true },
        });

        allProducts = [...allProducts, ...documents];
      }
    }

    if (allProducts.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.json(allProducts);
  } catch (error) {
    console.error("Error while searching products:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



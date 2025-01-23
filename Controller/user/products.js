import dotenv from "dotenv";
dotenv.config();
import { fetchCategoryTitles, checkExistingCollections, fetchDocumentsFromCollection } from "../../Utils/User/product.js";
import Offer from "../../Models/Admin/offers.js";
import cron from 'node-cron';

// Load product list page
export const Load_products = async (req, res) => {
  try {
    res.render("User/ProductList.ejs");
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
cron.schedule('0 0 * * *', async () => {
  try {
    const result = await Offer.updateMany(
      { endDate: { $lt: new Date() } },
      { $set: { status: 'inactive' } }
    );
    console.log('Expired offers deactivated:', result);
  } catch (error) {
    console.error('Error during cron job:', error);
  }
});

// Utility function to apply discounts and include offer details
const applyDiscounts = (product, title, activeOffers) => {
  console.log("----- Applying Discounts -----");
  console.log("Product:", product);
  console.log("Category Title:", title);
  console.log("Active Offers:", activeOffers);

  let finalPrice = product.ListingPrice;
  let discountedAmount = 0;

  let productOfferDetails = null;
  let categoryOfferDetails = null;

  // Normalize category name for comparison
  const normalizedTitle = title.trim().toLowerCase();

  // Find product-specific offer
  const productOffer = activeOffers.find(
    (offer) =>
      offer.offerType === "product" &&
      offer.productId?.toString() === product._id.toString()
  );

  // Find category-specific offer
  const categoryOffer = activeOffers.find(
    (offer) =>
      offer.offerType === "category" &&
      offer.category.trim().toLowerCase() === normalizedTitle
  );

  console.log("Product-Specific Offer:", productOffer);
  console.log("Category-Specific Offer:", categoryOffer);

  // Apply product-specific offer if found
  if (productOffer) {
    discountedAmount =
      productOffer.discountType === "percentage"
        ? (finalPrice * productOffer.discountValue) / 100
        : productOffer.discountValue;

    finalPrice -= discountedAmount;
    productOfferDetails = productOffer;
    console.log("Applied Product Offer. Discounted Amount:", discountedAmount, "Final Price:", finalPrice);
  }

  // Apply category-specific offer only if no product-specific offer exists
  if (!productOffer && categoryOffer) {
    discountedAmount =
      categoryOffer.discountType === "percentage"
        ? (finalPrice * categoryOffer.discountValue) / 100
        : categoryOffer.discountValue;

    finalPrice -= discountedAmount;
    categoryOfferDetails = categoryOffer;
    console.log("Applied Category Offer. Discounted Amount:", discountedAmount, "Final Price:", finalPrice);
  }

  // Ensure final price is not negative
  finalPrice = Math.max(finalPrice, 0);

  const result = {
    ...product,
    category: title,
    discountedPrice: finalPrice,
    discountedAmount,
    discountPercentage: (discountedAmount / product.ListingPrice) * 100 || 0,
    productOffer: productOfferDetails,
    categoryOffer: categoryOfferDetails,
  };

  console.log("Final Discounted Product Data:", result);
  console.log("----- End of Discount Calculation -----\n");

  return result;
};

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
      status: 'active',
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
      status: 'active',
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
      return res.status(404).json({ message: 'No products found' });
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
          productName: { $regex: searchInput, $options: 'i' },
          isblocked: { $ne: true }
        });

        allProducts = [...allProducts, ...documents];
      }
    }

    if (allProducts.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.json(allProducts);
  } catch (error) {
    console.error("Error while searching products:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

import dotenv from "dotenv";
dotenv.config();
import { fetchCategoryTitles, checkExistingCollections, fetchDocumentsFromCollection } from "../../Utils/User/product.js";
import Offer from "../../Models/Admin/offers.js";
import cron from 'node-cron';

export const Load_products = async (req, res) => {
  try {
    res.render("User/ProductList.ejs");
  } catch (error) {
    console.error("error while loading products page", error);
  }
};

export const Load_productDetail = async (req, res) => {
  try {
    res.render("User/productDetail.ejs");
  } catch (error) {
    console.error("error while loading productDetail page", error);
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

// Utility function to apply discounts
const applyDiscounts = (product, title, activeOffers) => {
  let finalPrice = product.ListingPrice;
  let discountedAmount = 0;

  // Product-specific offer
  const productOffer = activeOffers.find(
    (offer) => offer.offerType === "product" && offer.productId?.toString() === product._id.toString()
  );

  // Category-specific offer
  const categoryOffer = activeOffers.find(
    (offer) => offer.offerType === "category" && offer.category === title
  );

  // Apply product-specific offer (if any)
  if (productOffer) {
    if (productOffer.discountType === "percentage") {
      discountedAmount = (finalPrice * productOffer.discountValue) / 100;
    } else if (productOffer.discountType === "fixed") {
      discountedAmount = productOffer.discountValue;
    }
    finalPrice -= discountedAmount;
  }

  // Apply category-specific offer (if no product-specific offer exists)
  if (!productOffer && categoryOffer) {
    if (categoryOffer.discountType === "percentage") {
      discountedAmount = (finalPrice * categoryOffer.discountValue) / 100;
    } else if (categoryOffer.discountType === "fixed") {
      discountedAmount = categoryOffer.discountValue;
    }
    finalPrice -= discountedAmount;
  }

  // Ensure final price is not negative
  finalPrice = Math.max(finalPrice, 0);

  // Returning product with discount details
  return {
    ...product,
    category: title,
    discountedPrice: finalPrice,
    discountedAmount,
    discountPercentage: (discountedAmount / product.ListingPrice) * 100 || 0,
  };
};


// Get all products with discounts applied
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const titles = await fetchCategoryTitles();
    const existingCollectionNames = await checkExistingCollections();
    const currentDate = new Date();

    let allDocuments = {};
    let totalProducts = 0;

    // Fetch all active offers
    const activeOffers = await Offer.find({
      status: 'active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    for (const title of titles) {
      if (existingCollectionNames.includes(title)) {
        const documents = await fetchDocumentsFromCollection(
          title,
          { isblocked: { $ne: true } },
          { skip: (parsedPage - 1) * parsedLimit, limit: parsedLimit }
        );

        // Apply discounts to products
        const updatedProducts = documents.map((product) =>
          applyDiscounts(product, title, activeOffers)
        );

        allDocuments[title] = updatedProducts;
        totalProducts += updatedProducts.length;
      } else {
        console.warn(`No collection found for title: ${title}`);
      }
    }

    res.json({
      message: "success===>>",
      allDocuments,
      totalProducts,
      currentPage: parsedPage,
      totalPages: Math.ceil(totalProducts / parsedLimit),
    });
  } catch (error) {
    console.error("Error while getting data from the server", error);
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

    let allProducts = [];
    const categoriesToFetch = categoryName === "all" ? titles : [categoryName];

    // Fetch all active offers
    const activeOffers = await Offer.find({
      status: 'active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

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
          default:
            break;
        }

        const documents = await fetchDocumentsFromCollection(
          title,
          { isblocked: { $ne: true } },
          sortCondition
        );

        // Apply discounts to products
        const updatedProducts = documents.map((product) =>
          applyDiscounts(product, title, activeOffers)
        );

        allProducts = [...allProducts, ...updatedProducts];
      }
    }

    if (allProducts.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.status(200).json({ message: "success===>>", products: allProducts });
  } catch (error) {
    console.error("Error while filtering products:", error);
    res.status(500).json({ message: "Error while filtering products", error: error.message });
  }
};




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
    console.error("Error while getting searched product:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

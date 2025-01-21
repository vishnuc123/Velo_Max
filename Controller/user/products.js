import dotenv from "dotenv";
dotenv.config();
import { fetchCategoryTitles, checkExistingCollections, fetchDocumentsFromCollection } from "../../Utils/User/product.js";

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

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));

    const titles = await fetchCategoryTitles();
    const existingCollectionNames = await checkExistingCollections();

    const allDocuments = {};
    let totalProducts = 0;  // Track total products for pagination

    for (const title of titles) {
      if (existingCollectionNames.includes(title)) {
        const documents = await fetchDocumentsFromCollection(title, { 
          isblocked: { $ne: true } 
        }, { 
          skip: (parsedPage - 1) * parsedLimit,
          limit: parsedLimit
        });

        allDocuments[title] = documents;
        totalProducts += documents.length;
      } else {
        console.warn(`No collection found for title: ${title}`);
      }
    }

    res.json({ message: 'success===>>', allDocuments, totalProducts });
  } catch (error) {
    console.error("Error while getting data from the server", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const filterProducts = async (req, res) => {
  try {
    const { sortType, categoryName } = req.body;
    // console.log(req.body); // Log for debugging
    
    const titles = await fetchCategoryTitles();
    const existingCollectionNames = await checkExistingCollections();

    let allProducts = [];

    // If the categoryName is 'all', we'll fetch products from all categories
    const categoriesToFetch = categoryName === 'all' ? titles : [categoryName];

    for (const title of categoriesToFetch) {
      if (existingCollectionNames.includes(title)) {
        // Dynamically build the sort condition
        let sortCondition = {};

        switch (sortType) {
          case 'price_low_high':
            sortCondition = { ListingPrice: 1 }; // 1 for ascending order
            break;
          case 'price_high_low':
            sortCondition = { ListingPrice: -1 }; // -1 for descending order
            break;
          case 'new_arrivals':
            sortCondition = { arrivalDate: -1 }; // Sort by most recent arrival date
            break;
          default:
            sortCondition = {}; // No sorting if the type is invalid
            break;
        }

        // Fetch documents and apply sorting
        const documents = await fetchDocumentsFromCollection(title, { isblocked: { $ne: true } }, sortCondition);
        
        // Attach category to each product and add to the allProducts array
        documents.forEach(product => {
          product.category = title;
          allProducts.push(product);
        });
      }
    }

    res.status(200).json({ message: "success===>>", products: allProducts });
  } catch (error) {
    console.error("Error while sorting products:", error);
    res.status(500).json({ message: "Error while sorting products" });
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

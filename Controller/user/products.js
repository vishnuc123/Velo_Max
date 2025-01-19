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
    const titles = await fetchCategoryTitles();
    const existingCollectionNames = await checkExistingCollections();

    const allDocuments = {};
    for (const title of titles) {
      if (existingCollectionNames.includes(title)) {
        const documents = await fetchDocumentsFromCollection(title, { isblocked: { $ne: true } });
        allDocuments[title] = documents;
      } else {
        console.warn(`No collection found for title: ${title}`);
      }
    }

    res.json({ message: 'success===>>', allDocuments });
  } catch (error) {
    console.error("error while getting data from the server", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const filterProducts = async (req, res) => {
  try {
    const { sortType } = req.body;
    const titles = await fetchCategoryTitles();
    const existingCollectionNames = await checkExistingCollections();

    let allProducts = [];
    for (const title of titles) {
      if (existingCollectionNames.includes(title)) {
        const documents = await fetchDocumentsFromCollection(title, { isblocked: { $ne: true } });
        documents.forEach(product => {
          product.category = title;
          allProducts.push(product);
        });
      }
    }

    switch (sortType) {
      case 'price_low_high':
        allProducts.sort((a, b) => a.ListingPrice - b.ListingPrice);
        break;
      case 'price_high_low':
        allProducts.sort((a, b) => b.ListingPrice - a.ListingPrice);
        break;
      case 'new_arrivals':
        allProducts.sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate));
        break;
      default:
        break;
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

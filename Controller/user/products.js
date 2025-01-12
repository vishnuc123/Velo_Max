
import dotenv from "dotenv";
dotenv.config();
import Category from "../../Models/Admin/category.js";
import mongoose from "mongoose";



export const Load_products = async (req, res) => {
    try {
      // console.log(req.query);
      
      res.render("User/ProductList.ejs");
    } catch (error) {
      console.error("error while loading products page", error);
    }
  };
  
  export const Load_productDetail = async (req, res) => {
    try {
      // console.log(req.query.ProductId);
      res.render("User/productDetail.ejs");
    } catch (error) {
      console.log("error while loading productDetail page", error);
    }
  };



  export const getProducts = async (req, res) => {
    try {
      const data = await Category.find();
      const titles = data
        .filter(value => !value.isblocked) // Exclude blocked categories
        .map(value => value.categoryTitle);
      
      const transformedTitles = titles.map(val => val.replace(/\s+/g, "_").toLowerCase());
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      const existingCollectionNames = collections.map(col => col.name);
  
      const allDocuments = {};
  
      for (const title of transformedTitles) {
        if (existingCollectionNames.includes(title)) {
          // Fetch documents from the collection, excluding blocked products
          const documents = await mongoose.connection.db.collection(title).find({
            isblocked: { $ne: true } // Exclude blocked products
          }).toArray();
          
          allDocuments[title] = documents;
        } else {
          console.warn(`No collection found for title: ${title}`);
        }
      }
  
      // Log all documents fetched from the existing collections
      res.json({ message: 'success===>>', allDocuments });
    } catch (error) {
      console.log("error while getting data from the server", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  
  export const filterProducts = async (req, res) => {
    try {
        const { sortType } = req.body; // Extract the sortType from the request body

        // Fetch all categories
        const categories = await Category.find();
        const titles = categories.map(value => value.categoryTitle);
        const transformedTitles = titles.map(val => val.replace(/\s+/g, "_").toLowerCase());

        const collections = await mongoose.connection.db.listCollections().toArray();
        const existingCollectionNames = collections.map(col => col.name);

        let allProducts = [];

        // Fetch all products from existing collections, excluding blocked products
        for (const title of transformedTitles) {
            if (existingCollectionNames.includes(title)) {
                const documents = await mongoose.connection.db.collection(title).find({
                    isblocked: { $ne: true }  // Exclude blocked products (where isBlocked is true)
                }).toArray();

                // Add category name to each product
                documents.forEach(product => {
                  // console.log(title);
                  
                    product.category = title; // Add category to product
                    allProducts.push(product); // Push the product to the allProducts array
                });
            }
        }

        // Log the products for debugging
        // console.log(allProducts);

        // Sort the products based on the sortType
        switch (sortType) {
            case 'price_low_high':
                allProducts.sort((a, b) => a.ListingPrice - b.ListingPrice);
                break;
            case 'price_high_low':
                allProducts.sort((a, b) => b.ListingPrice - a.ListingPrice);
                break;
            case 'new_arrivals':
                allProducts.sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate)); // Assuming arrivalDate exists
                break;
            default:
                break; // No sorting for default
        }

        // Construct the response with all products listed, including category
        const response = {
            message: "success===>>",
            products: allProducts // Send all products with their category information
        };

        // Send the response
        res.status(200).json(response);
    } catch (error) {
        console.error("Error while sorting products:", error);
        res.status(500).json({ message: "Error while sorting products" });
    }
};


  

  export const searchProducts = async (req, res) => {
    try {
      // Fetch search input from query parameter

      const searchInput = req.query.search;
      console.log(searchInput);
      
      
      // Fetch all categories
      const categories = await Category.find({isblocked:false});
      const titles = categories.map(value => value.categoryTitle);
      const transformedTitles = titles.map(val => val.replace(/\s+/g, "_").toLowerCase());
  
      const collections = await mongoose.connection.db.listCollections().toArray();
      const existingCollectionNames = collections.map(col => col.name);
  
      let allProducts = [];
  
      // Fetch all documents from existing collections and search for matching products
      for (const title of transformedTitles) {
        if (existingCollectionNames.includes(title)) {
          const documents = await mongoose.connection.db.collection(title).find({
            productName: { $regex: searchInput, $options: 'i' }, // Search for matching product names
            isblocked: { $ne: true }  // Only retrieve products where isBlocked is not true
          }).toArray();
          
          
          allProducts = [...allProducts, ...documents];
        }
      }
  
      // Return the found products
      if (allProducts.length === 0) {
        return res.status(404).json({ message: 'No products found' });
      }
      // console.log(allProducts);
      
      res.json(allProducts);
  
    } catch (error) {
      console.log("Error while getting searched product:", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
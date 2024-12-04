
import dotenv from "dotenv";
dotenv.config();
import Category from "../../Models/Admin/category.js";
import mongoose from "mongoose";



export const Load_products = async (req, res) => {
    try {
      console.log(req.query);
      
      res.render("User/ProductList.ejs");
    } catch (error) {
      console.error("error while loading products page", error);
    }
  };
  
  export const Load_productDetail = async (req, res) => {
    try {
      console.log(req.query.ProductId);
      res.render("User/productDetail.ejs");
    } catch (error) {
      console.log("error while loading productDetail page", error);
    }
  };



  export const getProducts = async(req, res) => {
    try {
      const data = await Category.find();
      const titles = data.map(value => value.categoryTitle);
      const transformedTitles = titles.map(val => val.replace(/\s+/g, "_").toLowerCase());
      console.log(transformedTitles);
      const collections = await mongoose.connection.db.listCollections().toArray();
      const existingCollectionNames = collections.map(col => col.name);
  
  
  
      const allDocuments = {};
  
      for (const title of transformedTitles) {
       
        if (existingCollectionNames.includes(title)) {
          
          const documents = await mongoose.connection.db.collection(title).find().toArray();
          allDocuments[title] = documents; 
        } else {
          console.warn(`No collection found for title: ${title}`);
        }
      }
  
      // Log all documents fetched from the existing collections
      // console.log(allDocuments);
      
      res.json({ message:'success===>>',allDocuments});
    } catch (error) {
      console.log("error while getting data from the server",error);
      
    }
  }
  
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
  
      // Fetch all documents from existing collections
      for (const title of transformedTitles) {
        if (existingCollectionNames.includes(title)) {
          const documents = await mongoose.connection.db.collection(title).find().toArray();
          allProducts = [...allProducts, ...documents];
        }
      }
  
      // Sort the products based on the sortType
      let sortedProducts;
      switch (sortType) {
        case 'price_low_high':
          sortedProducts = allProducts.sort((a, b) => a.ListingPrice - b.ListingPrice);
          break;
        case 'price_high_low':
          sortedProducts = allProducts.sort((a, b) => b.ListingPrice - a.ListingPrice);
          break;
        case 'new_arrivals':
          sortedProducts = allProducts.sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate)); // Assuming arrivalDate exists
          break;
        default:
          sortedProducts = allProducts; // Default is unsorted or as-is
          break;
      }
  
      // Send the sorted products as the response
      res.status(200).json(sortedProducts);
    } catch (error) {
      console.error("Error while sorting products:", error);
      res.status(500).json({ message: "Error while sorting products" });
    }
  };
  
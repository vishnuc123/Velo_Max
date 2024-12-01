import dotenv from "dotenv";
dotenv.config();
import User from "../../Models/User/UserDetailsModel.js";
import Category from "../../Models/Admin/category.js";
import mongoose from "mongoose";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import prettier from "prettier";
import fs from "fs/promises";
import category from "../../Models/Admin/category.js";
import { title } from "process";

const __dirname = dirname(fileURLToPath(import.meta.url));










export const Load_Products = async (req, res) => {
    try {
      res.render("Admin/products.ejs");
    } catch (error) {
      console.log("error while loading products", error);
    }
  };
  
export const Add_Product = async (req, res) => {
    try {
      const categoryname = req.params.categoryId;
      const categoryId = categoryname.replace(/ /g, "_").toLowerCase();
  
      // console.log("Request Body:", req.body);
      // console.log("Request Files:", req.files); // Log files to verify structure
  
      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }
  
      const schemaPath = `../../Models/Admin/${categoryId}.js`;
  
      let ProductSchema;
      try {
        ProductSchema = (await import(schemaPath)).default;
  
        if (!(ProductSchema instanceof mongoose.Schema)) {
          throw new Error("Imported module is not a Mongoose schema.");
        }
      } catch (error) {
        console.error(
          `Schema not found or invalid for category: ${categoryId}`,
          error
        );
        return res
          .status(404)
          .json({
            message: `Schema not found or invalid for category: ${categoryId}`,
          });
      }
  
      // Create a model with the dynamically imported schema
      const ProductModel = mongoose.model(categoryId, ProductSchema);
  
      // Safely handle the cover image, checking for its existence
      let coverImageBase64 = null;
      if (req.files.coverImage && req.files.coverImage[0]) {
        coverImageBase64 = `data:image/jpeg;base64,${req.files.coverImage[0].buffer.toString('base64')}`;
      }
  
      // Collect all additional images that start with `additionalImage_`
      const additionalImagesBase64 = [];
      Object.keys(req.files).forEach((key) => {
        if (key.startsWith("additionalImage_") && req.files[key][0]) {
          additionalImagesBase64.push(`data:image/jpeg;base64,${req.files[key][0].buffer.toString('base64')}`);
        }
      });
  
      // Create product details ensuring required fields are provided
      const productDetails = {
        productName: req.body.productName,
        productDescription: req.body.productDescription,
        RegularPrice: req.body.productRegularPrice,
        ListingPrice: req.body.productListingPrice,
        Stock: req.body.productStock,
        Brand: req.body.productBrand,
        coverImage: coverImageBase64, // Store Base64 string of the cover image
        additionalImage: additionalImagesBase64, // Store array of Base64 strings for additional images
        ...req.body,
      };
  
      // Save product details to the dynamic collection
      const product = new ProductModel(productDetails);
      await product.save();
  
      res.status(201).json({ message: "Product created successfully" });
    } catch (error) {
      console.error("Error while sending data to the server:", error);
      res
        .status(400)
        .json({ message: "Error creating product", error: error.message });
    }
  };
  
  
  export const get_productslist = async (req, res) => {
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
      console.log("error while getting product details", error);
    }
  };
  
  
  export const editProduct = async (req,res) => {
    try {
      const productId = req.params.productId
      const categoryId = req.params.categoryId
      const updatedData = req.body
      const data = await Category.find({categoryTitle:categoryId});
  
      let coverImageBase64 = null;
      if (req.files.coverImage && req.files.coverImage[0]) {
        coverImageBase64 = `data:image/jpeg;base64,${req.files.coverImage[0].buffer.toString('base64')}`;
      }
  
      // Collect all additional images that start with `additionalImage_`
      const additionalImagesBase64 = [];
      Object.keys(req.files).forEach((key) => {
        if (key.startsWith("additionalImage_") && req.files[key][0]) {
          additionalImagesBase64.push(`data:image/jpeg;base64,${req.files[key][0].buffer.toString('base64')}`);
        }
      });
      
  
      const updateFields = {}
      if (coverImageBase64) {
        updateFields.coverImage = coverImageBase64; // Add coverImage field
      }
      
      if (additionalImagesBase64.length > 0) {
        updateFields.additionalImages = additionalImagesBase64; // Add additional images field
      }
      
      // Only include fields that are being updated
      const finalUpdateData = {
        ...updatedData, // Include any other fields to update (if provided)
        ...updateFields, // Include the image fields
      };
  
  
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      const existingCollectionNames = collections.map(col => col.name);
      
      if (!existingCollectionNames.includes(categoryId)) {
        return res.status(404).json({ message: `Collection for category "${category.categoryTitle}" does not exist` });
      }
  
      const result = await mongoose.connection.db
        .collection(categoryId)
        .findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(productId) }, // filter by productId
          { $set: finalUpdateData }, // update with provided data
          { returnOriginal: false } // return updated document
        );
        console.log(result);
        
      
      
          
      res.status(201).json({message:'success=====>>>'})
    } catch (error) {
      console.log('error while finding product in server',error);
      
    }
  }
  
  
  
  export const block_product = async (req,res) => {
    try {
  
      const categoryId = req.params.categoryId
      const productId = req.params.productId
      console.log(req.params.categoryId);
      console.log(req.params.productId);
      
  
       // Check if the collection exists
       const collections = await mongoose.connection.db.listCollections().toArray();
       const existingCollectionNames = collections.map(col => col.name);
   
       if (!existingCollectionNames.includes(categoryId)) {
         return res.status(404).json({ message: `Collection for category "${categoryId}" does not exist` });
       }
  
      const productCollection =  mongoose.connection.db.collection(categoryId)
      const productData = await productCollection.findOne({ _id: new mongoose.Types.ObjectId(productId) });
      // console.log(productData);
      
      
      if (!productData) {
        return res.status(404).json({ message: "Product not found" });
      }
       // Update the `isblocked` field to `true`
       const response = await productCollection.updateOne(
        { _id: new mongoose.Types.ObjectId(productId) },
        { $set: { isblocked: true } }
      );
      // console.log(productData);
      console.log("hai",response.isblocked);
      
  
      res.status(200).json({ message: "Product successfully blocked" });
  
      
      
    } catch (error) {
      console.log("error while blocking a product",error);
      
    }
  }
  
  
  
  export const unblock_product = async (req,res) => {
    try {
  
      const categoryId = req.params.categoryId
      const productId = req.params.productId
      console.log(req.params.categoryId);
      console.log(req.params.productId);
      
  
       // Check if the collection exists
       const collections = await mongoose.connection.db.listCollections().toArray();
       const existingCollectionNames = collections.map(col => col.name);
   
       if (!existingCollectionNames.includes(categoryId)) {
         return res.status(404).json({ message: `Collection for category "${categoryId}" does not exist` });
       }
  
      const productCollection =  mongoose.connection.db.collection(categoryId)
      const productData = await productCollection.findOne({ _id: new mongoose.Types.ObjectId(productId) });
      
      if (!productData) {
        return res.status(404).json({ message: "Product not found" });
      }
       // Update the `isblocked` field to `true`
       await productCollection.updateOne(
        { _id: new mongoose.Types.ObjectId(productId) },
        { $set: { isblocked: false } }
      );
      // console.log(productData);
      
  
      res.status(200).json({ message: "Product successfully blocked" });
  
      
    } catch (error) {
      console.log("error while blocking a product",error);
      
    }
  }
  
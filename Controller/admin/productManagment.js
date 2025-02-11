import dotenv from "dotenv";
dotenv.config();
import Category from "../../Models/Admin/category.js";
import mongoose from "mongoose";
import path from "path";
const __dirname = path.dirname(new URL(import.meta.url).pathname);

import category from "../../Models/Admin/category.js";
import { notifyClients } from "../../Utils/Admin/sse.js";

import fs from 'fs';
import gltfPipeline from 'gltf-pipeline';
const { processGltf } = gltfPipeline;










export const Load_Products = async (req, res) => {
    try {
      res.render("Admin/Products.ejs");
    } catch (error) {
      console.log("error while loading products", error);
    }
  };
  
  export const Add_Product = async (req, res) => {
    try {
    
  
      const categoryname = req.params.categoryId;
      const categoryId = categoryname.replace(/ /g, "_").toLowerCase();
  
      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }
  
      const schemaPath = path.resolve(__dirname, `../../Models/Admin/${categoryId}.js`);
  
      let ProductSchema;
      try {
        ProductSchema = (await import(schemaPath)).default;
  
        if (!(ProductSchema instanceof mongoose.model)) {
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
  
      // Create product details ensuring required fields are provided
      const productDetails = {
        productName: req.body.productName,
        productDescription: req.body.productDescription,
        categoryId: categoryId,
        RegularPrice: req.body.productRegularPrice,
        ListingPrice: req.body.productListingPrice,
        Stock: req.body.productStock,
        Brand: req.body.productBrand,
        coverImage: req.body.primaryImage, // Store primaryImage as coverImage
        additionalImage: JSON.parse(req.body.additionalImages || '[]'), // Parse additionalImages as an array
        threedModel: req.body.threedModel, // Directly store the 3D model URL
        ...req.body, // Spread any other additional fields into the productDetails object
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
  
      
      
      res.json({ message:'success===>>',allDocuments});
    } catch (error) {
      console.log("error while getting product details", error);
    }
  };
  
  
  export const editProduct = async (req, res) => {
    try {
      const productId = req.params.productId;
      const categoryId = req.params.categoryId;
      const updatedData = req.body;
  
      // Fetch the category data (for validation or other needs)
      const data = await Category.find({ categoryTitle: categoryId });
  
      // Prepare update fields for images
      const updateFields = {};
  
      // If cover image URL exists, include it in the update fields
      if (updatedData.coverImage) {
        updateFields.coverImage = updatedData.coverImage;
      }
  
      // If additional image URLs are provided, include them under the additionalImage field
      if (updatedData.additionalImages && updatedData.additionalImages.length > 0) {
        updateFields.additionalImage = updatedData.additionalImages;  // Save new additional images as `additionalImage`
      }
  
      // Ensure Stock is converted to a number if it's provided
      if (updatedData.Stock) {
        updatedData.Stock = Number(updatedData.Stock);
      }
  
      // Only include fields that are being updated
      const finalUpdateData = {
        ...updatedData,  // Include any other fields to update (if provided)
        ...updateFields, // Include the image fields (coverImage and additionalImage)
      };
  
      // Check if the category collection exists in the database
      const collections = await mongoose.connection.db.listCollections().toArray();
      const existingCollectionNames = collections.map(col => col.name);
  
      if (!existingCollectionNames.includes(categoryId)) {
        return res.status(404).json({ message: `Collection for category "${categoryId}" does not exist` });
      }
  
      // Perform the update operation on the product document
      const result = await mongoose.connection.db
        .collection(categoryId)
        .findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(productId) }, // filter by productId
          { $set: finalUpdateData }, // update with the provided data
          { returnOriginal: false } // return the updated document
        );
  
      // Notify clients about the product update (if required)
      notifyClients('updatedProduct', productId);
  
      res.status(201).json({ message: 'Product updated successfully.' });
    } catch (error) {
      console.log('Error while updating product:', error);
      res.status(500).json({ message: 'Error while updating the product.' });
    }
  };
  
  
  
  
  
  export const block_product = async (req,res) => {
    try {
  
      const categoryId = req.params.categoryId
      const productId = req.params.productId
   
      
  
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
       const response = await productCollection.updateOne(
        { _id: new mongoose.Types.ObjectId(productId) },
        { $set: { isblocked: true } }
      );
    
      
      notifyClients('productStatusBlocked', productId);

      res.status(200).json({ message: "Product successfully blocked" });
  
      
      
    } catch (error) {
      console.log("error while blocking a product",error);
      
    }
  }
  
  
  
  export const unblock_product = async (req,res) => {
    try {
  
      const categoryId = req.params.categoryId
      const productId = req.params.productId
    
      
  
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
      
      notifyClients('productStatusUnblocked', productId);
      notifyClients('reload')

      
  
      res.status(200).json({ message: "Product successfully blocked" });
  
      
    } catch (error) {
      console.log("error while blocking a product",error);
      
    }
  }
  
import mongoose from "mongoose";
import Category from "../../Models/Admin/category.js";

// Fetch all category titles and transform them
export const fetchCategoryTitles = async () => {
  const categories = await Category.find({ isblocked: false });
  return categories.map(cat => cat.categoryTitle.replace(/\s+/g, "_").toLowerCase());
};


// Check if a collection exists in the database
export const checkExistingCollections = async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  return collections.map(col => col.name);
};


// Fetch documents from a specific collection
export const fetchDocumentsFromCollection = async (collectionName, filter = {}) => {
  return await mongoose.connection.db.collection(collectionName).find(filter).toArray();
};

import dotenv from "dotenv";
dotenv.config();
import User from "../../Models/User/UserDetailsModel.js";
import user from "../../Models/User/UserDetailsModel.js";
import Category from "../../Models/Admin/category.js";
import mongoose from "mongoose";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import prettier from "prettier";
import fs from "fs/promises";
import category from "../../Models/Admin/category.js";


const __dirname = dirname(fileURLToPath(import.meta.url));

export const Load_Category = async (req, res) => {
  try {
    res.render("Admin/category.ejs");
  } catch (error) {
    console.log("error while loading category", error);
  }
};

// Function to add attributes to the schema
const addDynamicAttributes = (schema, attributeKey, attributeType) => {
  attributeKey.forEach((key, index) => {
    const type =
      attributeType[index] === "string"
        ? String
        : attributeType[index] === "number"
          ? Number
          : mongoose.Schema.Types.Mixed; // Default to Mixed for unknown types

    schema.add({ [key]: { type, required: false } });
  });
};

// function add a new category
export const Add_Category = async (req, res) => {
  try {
    const {
      categoryName,
      categoryDescription,
      categoryImage,
      attributeKey,
      attributeType,
    } = req.body;

    // Create a new category entry in the database
    const newCategory = new Category({
      categoryTitle: categoryName,
      categoryDescription,
      imageUrl: categoryImage,
      isblocked: false,
      attributes: attributeKey.map((key, index) => ({
        key,
        value: attributeType[index],
      })),
    });
    await newCategory.save();

    // Define a base schema and append dynamic attributes
    const dynamicSchemaDefinition = {
      productName: { type: String, required: true },
      productDescription: { type: String, required: true },
      coverImage: { type: String },
      additionalImage: [{ type: String }],
      RegularPrice: { type: Number },
      ListingPrice: { type: Number },
      Stock: { type: Number },
      Brand: { type: String },
      isblocked: { type: Boolean },
    };
    const dynamicSchema = new mongoose.Schema(dynamicSchemaDefinition);
    addDynamicAttributes(dynamicSchema, attributeKey, attributeType);

    // Generate the schema file content dynamically
    const newCategoryTitle = categoryName.replace(/\s+/g, "_").toLowerCase();
    console.log(newCategoryTitle);

    const modelFileContent = `
          import mongoose from 'mongoose';
  
        // Define the base schema with explicit types
        const ${newCategoryTitle}Schema = new mongoose.Schema({
          productName: { type: String, required: true },
          productDescription: { type: String, required: true },
          coverImage: { type: String },
          additionalImage: [{ type: String }],
          RegularPrice: { type: Number,required:true },
          ListingPrice: { type: Number,required: true },
          Stock: { type: Number },
          Brand: { type: String },
          isblocked: { type: Boolean, default:false },
          ${attributeKey
            .map(
              (key, index) =>
                `${key}: { type: ${
                  attributeType[index] === "string"
                    ? "String"
                    : attributeType[index] === "number"
                      ? "Number"
                      : "mongoose.Schema.Types.Mixed"
                }, required: false }`
            )
            .join(",\n")}
        });
  
        export default ${newCategoryTitle}Schema;
      `;

    // Format the file content and save it
    const formattedContent = await prettier.format(modelFileContent, {
      parser: "babel",
    });
    const modelFilePath = path.resolve(
      __dirname,
      `../../models/Admin/${newCategoryTitle}.js`
    );

    // Write the content to the new model file
    await fs.writeFile(modelFilePath, formattedContent);

    // Register the model with Mongoose and create an empty collection
    const DynamicModel = mongoose.model(newCategoryTitle, dynamicSchema);
    await DynamicModel.createCollection();

    res.json({
      message: `Empty collection ${newCategoryTitle} created successfully.`,
    });
  } catch (error) {
    console.log("Error while sending data to client", error);
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

export const Category_details = async (req, res) => {
  try {
    const data = await Category.find();
    // console.log(data);

    res.json({ data });
  } catch (error) {
    console.error("error while getting category details from database", error);
  }
};

export const get_formDetails = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const Categorydetails = await Category.findOne({
      categoryTitle: categoryId,
    });
    console.log(categoryId);
    
    const categoryAttributes = Categorydetails.attributes;

    // console.log(Categorydetails.attributes[0]);

    // console.log(Categorydetails.attributes)
    res.json({ message: "successfully received", categoryAttributes });
  } catch (error) {
    console.log("while getting data proper schema", error);
  }
};

export const Category_unblock = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    // console.log("unblock",categoryId);

    const categoryData = await category.findByIdAndUpdate(
      categoryId,
      { isblocked: false },
      { new: true }
    );

    res.status(201).json({ categoryData });
  } catch (error) {
    console.log("Error while updating unblock status", error);
    res.status(500).json({ message: "Error while updating unblock status" });
  }
};

export const Category_block = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    // console.log("block",categoryId);

    const categoryData = await category.findByIdAndUpdate(
      categoryId,
      { isblocked: true },
      { new: true }
    );

    res.status(201).json({ categoryData });
  } catch (error) {
    console.log("Error while updating block status", error);
    res.status(500).json({ message: "Error while updating block status" });
  }
};

export const editCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { title, description, image } = req.body;

  try {
    // Prepare the update data
    const updateData = {
      categoryTitle: title,
      categoryDescription: description,
      imageUrl:image,
    };


    // Update the category in the database using findOneAndUpdate
    const category = await Category.findOneAndUpdate(
      { _id: categoryId },  // Find by categoryId
      updateData,            // Apply updates
      { new: true }          // Return the updated category
    );

    // If no category found, return an error
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Send a success response with the updated category
    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const getEditCategory = async (req,res) => {
  try {
    const categoryId = req.params.categoryId
    const categoryDetails = await Category.find({_id:categoryId})
    if(!categoryDetails){
      console.log("category details is invalid");
    }


    res.status(201).json({categoryData:categoryDetails})
  } catch (error) {
    console.log("erroe while getting edit category details");
    
  }
}
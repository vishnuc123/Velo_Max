import dotenv from "dotenv";
dotenv.config();
import User from "../../Models/User/UserDetailsModel.js";
import Category from "../../Models/Admin/category.js";
import mongoose from "mongoose";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { addDynamicAttributes, formatAndSaveFile, constructSchemaContent } from "../../Utils/Admin/category.js";
import category from "../../Models/Admin/category.js";
import path from "path";
import { notifyClients } from "../../Utils/Admin/sse.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const Load_Category = async (req, res) => {
  try {
    res.render("Admin/category.ejs");
  } catch (error) {
    console.log("Error while loading category", error);
  }
};

// Function to add a new category
export const Add_Category = async (req, res) => {
  try {
    const {
      categoryName,
      categoryDescription,
      categoryImage,
      attributes,
    } = req.body;

  
    
    const checkCategoryExist = await Category.findOne({ categoryTitle: categoryName });
    if (checkCategoryExist) {
      return res.status(400).json('category already exists');
    }

    const newCategory = new Category({
      categoryTitle: categoryName,
      categoryDescription,
      imageUrl: categoryImage,
      isblocked: false,
      attributes: attributes.map((attribute) => ({
        key: attribute.key,
        value: attribute.type,
      })),
    });

    await newCategory.save();

    const dynamicSchema = new mongoose.Schema({
      productName: { type: String, required: true },
      productDescription: { type: String, required: true },
      categoryId: { type: String, default: categoryName },
      coverImage: { type: String },
      additionalImage: [{ type: String }],
      threedModel: { type: String },
      RegularPrice: { type: Number },
      ListingPrice: { type: Number },
      Stock: { type: Number },
      Brand: { type: String },
      isblocked: { type: Boolean },
    });
    
    // Dynamic attribute addition
    addDynamicAttributes(dynamicSchema, attributes.map(attr => attr.key), attributes.map(attr => attr.type));

    const newCategoryTitle = categoryName.replace(/\s+/g, "_").toLowerCase();
    const modelFileContent = constructSchemaContent(newCategoryTitle, attributes.map(attr => attr.key), attributes.map(attr => attr.type));

    const modelFilePath = path.resolve(
      __dirname,
      `/home/ubuntu/Velo_Max/models/Admin/${newCategoryTitle}.js`
    );

    await formatAndSaveFile(modelFileContent, modelFilePath);

    const DynamicModel = mongoose.model(newCategoryTitle, dynamicSchema);
    await DynamicModel.createCollection();

    res.json({
      message: `Empty collection ${newCategoryTitle} created successfully.`,
    });
  } catch (error) {
    console.log("Error while sending data to client", error);
    res.status(500).json({ message: "Error creating category", error: error.message });
  }
};


// Other functions remain unchanged...

export const Category_details = async (req, res) => {
  try {
    const data = await Category.find();

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
    
    const categoryAttributes = Categorydetails.attributes;

  
    res.json({ message: "successfully received", categoryAttributes });
  } catch (error) {
    console.log("while getting data proper schema", error);
  }
};

export const Category_unblock = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const categoryData = await Category.findByIdAndUpdate(
      categoryId,
      { isblocked: false },
      { new: true }
    );
    notifyClients('categoryStatusUnblocked')

    res.status(201).json({ categoryData });
  } catch (error) {
    console.log("Error while updating unblock status", error);
    res.status(500).json({ message: "Error while updating unblock status" });
  }
};

export const Category_block = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const categoryData = await Category.findByIdAndUpdate(
      categoryId,
      { isblocked: true },
      { new: true }
    );
    notifyClients('categoryStatusBlocked')

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


   
    const category = await Category.findOneAndUpdate(
      { _id: categoryId },  
      updateData,           
      { new: true }      
    );


    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

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
      res.status(404).json({message:"category details not valid"})
    }


    res.status(201).json({categoryData:categoryDetails})
  } catch (error) {
    console.log("erroe while getting edit category details");
    
  }
}
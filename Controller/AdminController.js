import dotenv from "dotenv";
dotenv.config();
import User from "../Models/User/UserDetailsModel.js";
import Category from "../Models/Admin/category.js";
import mongoose from "mongoose";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import prettier from "prettier";
import fs from "fs/promises";
import category from "../Models/Admin/category.js";
import { title } from "process";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Authentication
export const Load_Admin = async (req, res) => {
  res.render("Admin/AdminLogin.ejs");
};

export const Login_admin = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (
    process.env.credential_email == email &&
    process.env.credential_password === password
  ) {
    req.session.email = email;
    res.redirect("/dashboard");
  }
};
export const Load_dashboard = async (req, res) => {
  res.render("Admin/dashboard.ejs");
};

export const Logout_Admin = async (req, res) => {
  try {
    req.session.email = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
  }
};

export const Load_Ecommerce = async (req, res) => {
  try {
    res.render("Admin/ecommerse.ejs");
  } catch (error) {
    console.log(error);
  }
};

// menu-items

export const Load_UserManage = async (req, res) => {
  try {
    res.render("Admin/User-List.ejs");
  } catch (error) {
    console.log("error while fetching", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
export const send_data = async (req, res) => {
  try {
    const userData = await User.find();

    res.json(userData);
  } catch (error) {
    console.log(error);
  }
};

export const User_isActive = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    // Find user and update status in your database (e.g., MongoDB)
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User status updated successfully", user });
  } catch (error) {
    console.error("Error while finding user_id for isActive:", error);
    res.status(500).json({ message: "Error updating user status" });
  }
};

export const Load_Products = async (req, res) => {
  try {
    res.render("Admin/products.ejs");
  } catch (error) {
    console.log("error while loading products", error);
  }
};

export const Load_Category = async (req, res) => {
  try {
    res.render("Admin/category.ejs");
  } catch (error) {
    console.log("error while loading category", error);
  }
};

// Function to dynamically add attributes to the schema
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

// Main function to add a new category
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
      Stock: { type: Number },
      Brand: { type: String },
    };
    const dynamicSchema = new mongoose.Schema(dynamicSchemaDefinition);
    addDynamicAttributes(dynamicSchema, attributeKey, attributeType);

    // Generate the schema file content dynamically
    const newCategoryTitle = categoryName.replace(/\s+/g, "_").toLowerCase();
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

      export default ${newCategoryTitle};
    `;

    // Format the file content and save it
    const formattedContent = await prettier.format(modelFileContent, {
      parser: "babel",
    });
    const modelFilePath = path.resolve(
      __dirname,
      `../models/Admin/${newCategoryTitle}.js`
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

    const categoryAttributes = Categorydetails.attributes;

    // console.log(Categorydetails.attributes[0]);

    // console.log(Categorydetails.attributes)
    res.json({ message: "successfully received", categoryAttributes });
  } catch (error) {
    console.log("while getting data proper schema", error);
  }
};

export const Add_Product = async (req, res) => {
  try {
    const categoryname = req.params.categoryId;
    const categoryId = categoryname.replace(/ /g, "_").toLowerCase();

    // Log request body and files
    console.log("Request Body:", req.body);
    // console.log("Request Files:", req.files);

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const schemaPath = `../Models/Admin/${categoryId}.js`;

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

    // Create product details ensuring required fields are provided
    const productDetails = {
      productName:req.body.productName,
      productDescription:req.body.productDescription,
      RegularPrice:req.body.productRegularPrice,
      ListingPrice:req.body.productListingPrice,
      coverImage: req.files.coverImage[0]?.path, // Correctly access the cover image path
      additionalImage: [], // Initialize as an empty array
      ...req.body,
    };

    // Loop through additional images and add them to the product details
    for (let i = 0; i < 4; i++) {
      const additionalImageKey = `additionalImage_${i}`;
      if (req.files[additionalImageKey]) {
        productDetails.additionalImage.push(
          req.files[additionalImageKey][0]?.path
        ); // Store the path of each additional image
      }
    }

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
    const transformedTitles = titles.map(val => val.replace(/\s+/g, "_").toLowerCase()+'s');
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
    console.log(allDocuments);
    
    res.json({ message:true,allDocuments});
  } catch (error) {
    console.log("error while getting product details", error);
  }
};

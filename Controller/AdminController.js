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
import { log } from "console";
import { type } from "os";
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

export const Add_Category = async (req, res) => {
  try {
    const categoryTitle = req.body.categoryName;
    const categoryDescription = req.body.categoryDescription;
    const categoryImage = req.body.categoryImage;
    const attributeKey = req.body.attributeKey;
    const attributeType = req.body.attributeType;
    console.log(
      categoryTitle,
      categoryDescription,
      attributeKey,
      attributeType
    );

    const attributes = attributeKey.reduce((acc, key, index) => {
      if (index < attributeType.length) {
        acc[key] = attributeType[index];
      }
      return acc;
    }, {});

    console.log(attributes);
    const attributesArray = Object.entries(attributes).map(([key, value]) => ({
      key: key,
      value: value
    }));
console.log(attributesArray);


    const newCategory = new Category({
      categoryTitle: categoryTitle,
      categoryDescription: categoryDescription,
      imageUrl: categoryImage,
      attributes: attributesArray, // Use the dynamically generated attributes
    });

    await newCategory.save();


    const dynamicSchemaDefinition = {
      categoryTitle: { type: String, required: true },
      categoryDescription: { type: String, required: true },
      coverImage: { type: String },
      additionalImage: [{ type: String }],
      Brand: { type: String },
      Stock: { type: Number },
      ...Object.fromEntries(attributeKey.map((key, index) => [key, { type: mongoose.Schema.Types.Mixed, required: attributeType[index] === 'string' }])),
    };

    const dynamicSchema = new mongoose.Schema(dynamicSchemaDefinition)
    const newCategoryTitle = categoryTitle.replace(/\s+/g, '_').toLowerCase()
      console.log(newCategoryTitle);
      
      const modelFileContent = `
      import mongoose from 'mongoose';

      const ${newCategoryTitle}Schema = new mongoose.Schema(${JSON.stringify(dynamicSchemaDefinition, null, 2)});

      export default mongoose.model('${newCategoryTitle}', ${newCategoryTitle}Schema);
    `;
    const formattedContent = await prettier.format(modelFileContent, { parser: 'babel' });

    // Defining the path where the file will be saved
    const modelFilePath = path.resolve(__dirname, `../models/Admin/${newCategoryTitle}.js`);

    // Writing the formatted content to the file
     await fs.writeFile(modelFilePath, formattedContent, (err) => {
      if (err) {
        console.error('Error while writing new model file:', err);
        return res.status(500).json({ message: 'Error while writing model file', error: err.message });
      }

      console.log(`New model file created at ${modelFilePath}`);
    });

    // Register the model with the dynamic schema
const DynamicModel = mongoose.model(newCategoryTitle, dynamicSchema);

// Use the model to create an empty collection
await DynamicModel.createCollection() // This ensures the collection exists without adding data

res.json({ message: `Empty collection ${newCategoryTitle} created successfully.` });


  } catch (error) {
    console.log("error while sending data to client", error);
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



export const Add_Product = async (req,res) => {
  try {
    const productDetails = req.body

    console.log(productDetails)
    console.log(req.files)
    res.status(201).json({message:'successfully got the data'})
  } catch (error) {
    console.log('error while sending data to the server',error);
    
  }
}
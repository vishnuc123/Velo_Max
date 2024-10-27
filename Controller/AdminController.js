import dotenv from 'dotenv';
dotenv.config();
import User from '../Models/User/UserDetailsModel.js';
import category from '../Models/Admin/category.js';
import mongoose from 'mongoose';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import prettier from 'prettier'
import fs from 'fs/promises'
import { log } from 'console';
import { type } from 'os';
const __dirname = dirname(fileURLToPath(import.meta.url));




// Authentication
export const Load_Admin = async(req,res) => {
    res.render('Admin/AdminLogin.ejs')
}

export const Login_admin = async(req,res) => {
    const email = req.body.email
    const password = req.body.password
   if(process.env.credential_email == email && process.env.credential_password === password){
    req.session.email = email
    res.redirect('/dashboard')
   }
      
}
export const Load_dashboard = async(req,res) => {
    res.render('Admin/dashboard.ejs')
}


export const Logout_Admin = async (req,res) => {
    try {
        req.session.email = null
        res.redirect('/admin')
    } catch (error) {
        console.log(error)
    }
}

export const Load_Ecommerce = async (req,res)=> {
    try {
        res.render('Admin/ecommerse.ejs')        
    } catch (error) {
        console.log(error)
    }
}

// menu-items

export const Load_UserManage = async (req,res) => {
    try {
        res.render('Admin/User-List.ejs')
    } catch (error) {
        console.log("error while fetching",error)
        res.status(500).json({ error: 'Failed to fetch users' });    }
}
export const send_data = async (req,res) => {
    try {
        const userData = await User.find()

        res.json(userData)        
    } catch (error) {
        console.log(error)
    }
}

export const User_isActive = async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;

        // Find user and update status in your database (e.g., MongoDB)
        const user = await User.findByIdAndUpdate(userId, { isActive: status }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User status updated successfully', user });
    } catch (error) {
        console.error('Error while finding user_id for isActive:', error);
        res.status(500).json({ message: 'Error updating user status' });
    }
};


export const Load_Products = async (req,res) => {
    try {
        res.render('Admin/products.ejs')
    } catch (error) {
        console.log('error while loading products',error)
    }
}

export const Load_Category = async (req,res) => {
    try {
        
        res.render('Admin/category.ejs',)
    } catch (error) {
        console.log('error while loading category',error)
    }
}







export const Add_Category = async (req, res) => {
  try {
    // Extract data from request body
    const { categoryName, categoryDescription, croppedImageDataUrl, attributeKey, attributeType } = req.body;

    // Validate required fields
    if (!categoryName || typeof categoryDescription === 'undefined' || !croppedImageDataUrl) {
      return res.status(400).json({ message: 'categoryName, categoryDescription, and croppedImageDataUrl are required' });
    }

    const attributes = {};
    attributeKey.forEach((key, index) => {
      if (key && attributeType[index]) {
        // Determine the type of value
        let value;
        if (attributeType[index] === 'string') {
          value = typeof attributeType[index]; // Replace this with actual string value
        } else if (attributeType[index] === 'number') {
          value = typeof attributeType[index]; // Replace this with actual number value
        } else if (attributeType[index] === 'boolean') {
          value = typeof attributeType[index]; // Replace this with actual boolean value
        } else {
          value = null; // Handle unexpected types
        }

        // Add the attribute to the object with the actual value
        attributes[key] = value; // Use the key as the dynamic attribute name
      }
    });
    
    console.log(attributes);
   
    // Define the schema dynamically using the attribute keys
    const dynamicSchemaDefinition = {
      categoryTitle: { type: String, required: true },
      categoryDescription: { type: String, required: true },
      coverImage: { type: String },
      additionalImage: [{ type: String }],
      Brand: { type: String },
      Stock:{type:Number},
      ...Object.fromEntries(attributeKey.map((key) => [key, { type: mongoose.Schema.Types.Mixed, required: true }])), // Changed to Mixed type
    };
    
    // Create the Mongoose schema using the dynamic definition
    const DynamicCategorySchema = new mongoose.Schema(dynamicSchemaDefinition);
    
    // Write schema definition to a file for reference or reuse
    const modelFileContent = `
      import mongoose from 'mongoose';

      const ${categoryName.replace(/\s+/g, '_').toLowerCase()}Schema = new mongoose.Schema(${JSON.stringify(dynamicSchemaDefinition, null, 2)});

      export default mongoose.model('${categoryName.replace(/\s+/g, '_').toLowerCase()}', ${categoryName.replace(/\s+/g, '_').toLowerCase()}Schema);
    `;

    // Format the content using Prettier
    const formattedContent = await prettier.format(modelFileContent, { parser: 'babel' });

    // Defining the path where the file will be saved
    const modelFilePath = path.resolve(__dirname, `../models/Admin/${categoryName.replace(/\s+/g, '_').toLowerCase()}.js`);

    // Writing the formatted content to the file
    fs.writeFile(modelFilePath, formattedContent, (err) => {
      if (err) {
        console.error('Error while writing new model file:', err);
        return res.status(500).json({ message: 'Error while writing model file', error: err.message });
      }

      console.log(`New model file created at ${modelFilePath}`);
    });

    // Now, create the Category model to save the document in the Category collection
    const CategorySchema = new mongoose.Schema({
      categoryTitle: { type: String, required: true },
      categoryDescription: { type: String, required: true },
      imageUrl: { type: String },
      attributes: { type: mongoose.Schema.Types.Mixed, required: true }, // You can adjust the structure as needed
    });
    
    const Category = mongoose.model('Category', CategorySchema);

    // Create a new category document in the Category collection
    const newCategory = new Category({
      categoryTitle: categoryName,
      categoryDescription: categoryDescription,
      imageUrl: croppedImageDataUrl,
      attributes: attributes, // Spread the dynamically generated attributes into the new document
    });
    
    // Save the new category to the database
    await newCategory.save();


    // dynamic collection
    const DynamicModel = mongoose.model(categoryName.replace(/\s+/g, '_').toLowerCase(), DynamicCategorySchema);

    await new DynamicModel()
 
 
    // Respond with success message
    res.status(201).json({ success: true, message: 'Category added successfully!' });
  } catch (error) {
    console.error('Error while adding category:', error);
    res.status(500).json({ message: 'Error while adding category', error: error.message });
  }
};




export const Category_details = async (req,res) => {
    try {
        const data = await category.find()
        // console.log(data);
        
        res.json({data})
    } catch (error) {
        console.error('error while getting category details from database',error)
    }
}



export const get_formDetails = async (req,res) => {
  try {
    const categoryId = req.params.categoryId
    const Categorydetails = await category.findOne({categoryTitle:categoryId})
    console.log(Categorydetails);
    
    const categoryAttributes = Categorydetails.attributes[0]

    console.log(Categorydetails.attributes[0]);
    
  
    // console.log(Categorydetails.attributes)
    res.json({message: 'successfully received',categoryAttributes})
        
    
    

  } catch (error) {
    console.log('while getting data proper schema',error)
  }
}
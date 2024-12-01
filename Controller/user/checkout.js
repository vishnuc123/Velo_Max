import mongoose from "mongoose";
import User from "../../Models/User/UserDetailsModel.js";
import { Address } from "../../Models/User/userAddress.js";

export const load_buyNow = async (req, res) => {
    try {
        // Extract categoryId and productId from the request query parameters
        const { categoryId, productId } = req.params; // Assumes the URL will contain categoryId and productId as parameters
         // Check if the collection exists
       const collections = await mongoose.connection.db.listCollections().toArray();
       const existingCollectionNames = collections.map(col => col.name);
   
       if (!existingCollectionNames.includes(categoryId)) {
         return res.status(404).json({ message: `Collection for category "${categoryId}" does not exist` });
       }
  
      const productCollection =  mongoose.connection.db.collection(categoryId)
      const productData = await productCollection.findOne({ _id: new mongoose.Types.ObjectId(productId) });
    //   console.log(productData);
      

        // Render the checkout page and pass the product details
        res.render('User/buycheckout', {
            productData
        });

    } catch (error) {
        console.log("Error while getting buy now checkout:", error);
        res.status(500).send("Internal Server Error");
    }
};

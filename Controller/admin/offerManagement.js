import errorHandler from "../../Error-Reporter.js"
import mongoose from "mongoose"

export const getOfferPage = async (req,res,next) => {
    try {
        res.render('Admin/offers.ejs')
    } catch (error) {
        next(error)    }
}


export const searchProducts = async (req, res) => {
    try {
      const searchTerm = req.query.q; // Get the search term from the query parameters
      if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
      }
  
      // List of collections to exclude from the search
      const excludedCollections = [
        'addresses',
        'buynoworders',
        'carts',
        'categories',
        'coupon',
        'users',
        'wallets',
        'wishlists'
      ];
  
      // Get all collection names in the database
      const collections = await mongoose.connection.db.listCollections().toArray();
      const existingCollectionNames = collections.map(col => col.name);
  
      const searchResults = {};
  
      for (const collectionName of existingCollectionNames) {
        // skip the collections in the standard collection
        if (excludedCollections.includes(collectionName)) continue;
  
        // Use regex to search for products matching the search term in relevant fields
        const regex = new RegExp(searchTerm, 'i'); // 'i' for case-insensitive
        const documents = await mongoose.connection.db.collection(collectionName).find({
          $or: [
            { productName: { $regex: regex } },
            { productDescription: { $regex: regex } }
          ]
        }).limit(10).toArray(); // Limit results to top 10 for performance
  
        if (documents.length > 0) {
          searchResults[collectionName] = documents;
        }
      }
  
      res.json({ message: 'success', searchResults });
    } catch (error) {
      console.log("Error while searching for products", error);
      res.status(500).json({ message: 'Error while searching for products' });
    }
  };
  
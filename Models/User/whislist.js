import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      items: [{
        categoryId: { type: String, ref: 'Category', required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      }], 
});


const whislist = mongoose.model("wishlist", wishlistSchema);
export default whislist;

import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    categoryId: { type: String, ref: 'Category', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity:{type:Number,required:true,default:1},
    price:{type:Number,required:true,default:0}
  }],  
  totalPrice: {
    type: Number,
    required: true,
    default:0
  },
});

const CartModel = mongoose.model('Cart', CartSchema);
export default CartModel;




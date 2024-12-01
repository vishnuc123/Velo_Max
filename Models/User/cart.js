import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
  categoryId: { type: String, ref: 'Category', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity:{type:Number,required:true,default:1}
});

const CartModel = mongoose.model('Cart', CartSchema);
export default CartModel;

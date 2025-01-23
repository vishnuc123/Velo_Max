import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  offerName: { 
    type: String, 
    required: true 
  },
  offerType: { 
    type: String, 
    required: true, 
    enum: ['category', 'product'] 
  },
  category: { 
    type: String, 
    ref: 'Category', 
    required: function() {
      return this.offerType === 'category';
    } 
  },
  productName:{
    type:String,
    default:null,
  },
  productId: { 
    type: String, 
    required: function() {
      return this.offerType === 'product';
    }
  },
  discountType: { 
    type: String, 
    required: true, 
    enum: ['percentage', 'fixed'] // Restrict to 'percentage' or 'fixed'
  },
  discountValue: { 
    type: Number, 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;

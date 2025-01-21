import mongoose from "mongoose";
import { type } from "os";

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  walletStatus:{
    type:Boolean,
    default:false,
  },

  balance: {
    type: Number,
    default: 0,
  },
  walletHistory: [
    {
      transactionType: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      description: {
        type: String,
        required:true
      },
    },
  ],
});
const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet
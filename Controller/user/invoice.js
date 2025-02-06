import mongoose from "mongoose";
import Orders from "../../Models/User/Order.js";
import User from "../../Models/User/UserDetailsModel.js";
import { checkExistingCollections,fetchCategoryTitles,fetchDocumentsFromCollection } from "../../Utils/User/product.js";


export const getInvoice = async (req,res) => {
    try {
        // console.log(req.params);
        const orderIdstr = req.params.orderId;
        const orderId  = new mongoose.Types.ObjectId(orderIdstr)

        
        const OrderDetails = await Orders.findById(orderId)
        .populate('userId', 'firstname lastname email');
        console.log("orderdetails",OrderDetails);
        
        if(!OrderDetails){
            return res.status(404).json({message:"No order found with this id"});
        }

    if(!OrderDetails.orderStatus==="delivered"){
        return res.status(400).json({message:"Order is not delivered yet"});
    }
    // const userId = OrderDetails.userId;
    
    
    res.status(200).json({message:"Order found",OrderDetails});

        
        
    } catch (error) {
        console.log("error while getting data from the invoice",error);
        
    }
}
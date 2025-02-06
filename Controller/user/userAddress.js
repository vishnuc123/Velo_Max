import UserAddress from "../../Models/User/userAddress.js";


export const userAddress = async (req,res) => {
    try {
         const address = await UserAddress.find().populate("user");
    } catch (error) {
        console.log("error while getting userAddress");
        
    }
}
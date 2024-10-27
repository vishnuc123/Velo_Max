import mongoose from "mongoose";

const dynamicSchema = new mongoose.Schema({
  key:{
    type:String,
    required:true
  },
  value:{
    type:mongoose.Schema.Types.Mixed,
    required:true
  }
})



const CategoryBaseSchema = new mongoose.Schema({
  categoryTitle: {
    type: String,
    required: true,
  },
  categoryDescription:{
    type:String,
    required:true
  },
  imageUrl: { 
    type: String,
    required:true 
  },


  attributes:[dynamicSchema]
});



const category = mongoose.model('category',CategoryBaseSchema)

export default category

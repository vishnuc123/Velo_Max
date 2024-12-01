import mongoose from "mongoose";

// Define the base schema with explicit types
const city_bikesSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  isblocked: { type: Boolean, default: false },
  Frame: { type: String, required: false },
  Gears: { type: String, required: false },
  Tires: { type: String, required: false },
  Brakes: { type: String, required: false },
  Handlebars: { type: String, required: false },
  Suspension: { type: String, required: false },
  Accessories: { type: String, required: false },
  weight: { type: String, required: false },
  wheel: { type: String, required: false },
});

export default city_bikesSchema;

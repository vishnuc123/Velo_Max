import mongoose from "mongoose";

const city_bikesSchema = new mongoose.Schema({
  categoryTitle: {
    required: true,
  },
  categoryDescription: {
    required: true,
  },
  coverImage: {},
  additionalImage: [{}],
  Brand: {},
  Stock: {},
  mudguard: {
    required: true,
  },
  peddals: {
    required: false,
  },
  carrier: {
    required: false,
  },
});

export default mongoose.model("city_bikes", city_bikesSchema);

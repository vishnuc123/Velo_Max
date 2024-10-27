import mongoose from "mongoose";

const citybikesSchema = new mongoose.Schema({
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
  brake: {
    required: true,
  },
  lights: {
    required: true,
  },
});

export default mongoose.model("citybikes", citybikesSchema);

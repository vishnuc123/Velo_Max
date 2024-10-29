import mongoose from "mongoose";

const ebikeSchema = new mongoose.Schema({
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
  "brake ": {
    required: false,
  },
  lights: {
    required: false,
  },
});

export default mongoose.model("ebike", ebikeSchema);

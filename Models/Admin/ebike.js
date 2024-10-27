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
  sadsd: {
    required: true,
  },
  sdsd: {
    required: true,
  },
});

export default mongoose.model("ebike", ebikeSchema);

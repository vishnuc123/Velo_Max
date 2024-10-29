import mongoose from "mongoose";

const accesoriesSchema = new mongoose.Schema({
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
  handlebar: {
    required: false,
  },
  peddals: {
    required: false,
  },
});

export default mongoose.model("accesories", accesoriesSchema);

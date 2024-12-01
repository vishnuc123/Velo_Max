import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User ID
    ref: 'User',
    required: true,
  },
  label: { type: String, required: true }, // e.g., "Home" or "Office"
  address: { type: String, required: true },
  city: { type: String, required: true },
  pinCode: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
});

export const Address = mongoose.model('Address', addressSchema);

import mongoose from "mongoose";

export const getPaginatedRecords = async (Model, { page = 1, pageSize = 10, sortBy = 'orderDate', sortOrder = 'asc' }) => {
  const skip = (page - 1) * pageSize;
  const sortOrderValue = sortOrder === 'desc' ? -1 : 1;

  const records = await Model.find()
    .skip(skip)
    .limit(pageSize)
    .sort({ [sortBy]: sortOrderValue });

  const totalRecords = await Model.countDocuments();
  const totalPages = Math.ceil(totalRecords / pageSize);

  return { records, totalPages };
};


export const findRecordById = async (Model, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }
  return await Model.findById(id);
};


export const updateRecordById = async (Model, id, updateData) => {
  return await Model.findOneAndUpdate({ _id: id }, { $set: updateData }, { new: true });
};

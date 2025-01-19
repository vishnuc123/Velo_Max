import mongoose from "mongoose";

/**
 * Get paginated and sorted records from a model.
 * @param {Object} Model - Mongoose model to query.
 * @param {Object} options - Pagination and sorting options.
 * @returns {Object} - Paginated records and total pages.
 */
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

/**
 * Find a record by its ID.
 * @param {Object} Model - Mongoose model to query.
 * @param {string} id - ID of the record.
 * @returns {Object|null} - Found record or null if not found.
 */
export const findRecordById = async (Model, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }
  return await Model.findById(id);
};

/**
 * Update a record by its ID.
 * @param {Object} Model - Mongoose model to query.
 * @param {string} id - ID of the record.
 * @param {Object} updateData - Data to update.
 * @returns {Object|null} - Updated record or null if not found.
 */
export const updateRecordById = async (Model, id, updateData) => {
  return await Model.findOneAndUpdate({ _id: id }, { $set: updateData }, { new: true });
};

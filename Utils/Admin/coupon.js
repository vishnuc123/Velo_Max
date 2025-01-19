/**
 * Create a new record in the database.
 * @param {Object} Model - Mongoose model to use for creating the record.
 * @param {Object} data - Data to insert into the database.
 * @returns {Object} - The created record.
 */
export const createRecord = async (Model, data) => {
    const newRecord = new Model(data);
    return await newRecord.save();
  };
  
  /**
   * Retrieve all records from the database for a given model.
   * @param {Object} Model - Mongoose model to query.
   * @returns {Array} - List of records.
   */
  export const getAllRecords = async (Model) => {
    return await Model.find();
  };
  
  /**
   * Delete a record by its ID.
   * @param {Object} Model - Mongoose model to query.
   * @param {string} id - ID of the record to delete.
   * @returns {Object|null} - The deleted record or null if not found.
   */
  export const deleteRecordById = async (Model, id) => {
    return await Model.findByIdAndDelete(id);
  };
  
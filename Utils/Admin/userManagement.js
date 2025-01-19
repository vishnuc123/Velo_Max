import User from "../../Models/User/UserDetailsModel.js";

/**
 * Fetch all users from the database.
 * @returns {Array} - List of all users.
 */
export const fetchAllUsers = async () => {
  return await User.find();
};

/**
 * Update user status (isActive or isBlock).
 * @param {string} userId - ID of the user to update.
 * @param {Object} updateData - Data to update (e.g., { isActive: true }).
 * @returns {Object|null} - Updated user or null if not found.
 */
export const updateUserStatus = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

/**
 * Toggle the block status of a user.
 * @param {string} userId - ID of the user to toggle block status.
 * @param {boolean} blockStatus - New block status to set.
 * @returns {Object|null} - Updated user or null if not found.
 */
export const toggleUserBlockStatus = async (userId, blockStatus) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }
  user.isBlock = blockStatus;
  await user.save();
  return user;
};

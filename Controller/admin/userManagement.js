import {
  fetchAllUsers,
  updateUserStatus,
  toggleUserBlockStatus
} from "../../Utils/Admin/userManagement.js";

export const Load_UserManage = async (req, res) => {
  try {
    res.render("Admin/User-List.ejs");
  } catch (error) {
    console.log("Error while fetching", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const send_data = async (req, res) => {
  try {
    const userData = await fetchAllUsers();
    res.json(userData);
  } catch (error) {
    console.log("Error while sending user data", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

export const User_isActive = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    const user = await updateUserStatus(userId, { isActive: status });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User status updated successfully", user });
  } catch (error) {
    console.error("Error while updating user isActive status:", error);
    res.status(500).json({ message: "Error updating user status" });
  }
};

export const update_userBlock = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await toggleUserBlockStatus(userId, true);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User status updated', isBlocked: user.isBlock });
  } catch (error) {
    console.log('Error while blocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const update_userUnblock = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await toggleUserBlockStatus(userId, false);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User status updated', isBlocked: user.isBlock });
  } catch (error) {
    console.log('Error while unblocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

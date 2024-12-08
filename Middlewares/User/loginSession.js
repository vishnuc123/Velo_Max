
import User from "../../Models/User/UserDetailsModel.js";

export const session_handle = async (req, res, next) => {
    try {
        if (req.session.UserEmail || req.isAuthenticated()) {
            // Fetch the latest user data from the database
            const user = await User.findById(req.session.UserId);
            if (user && user.isBlock) {
                // Destroy session and redirect if the user is blocked
                req.session.destroy(() => {
                    res.redirect("/"); // Redirect to a "Blocked" page or show an appropriate message
                });
            } else {
                return next();
            }
        } else {
            res.redirect("/");
        }
    } catch (error) {
        console.log(error);
    }
};
export const landingPageSession = async (req, res, next) => {
    try {
        if (!req.session.UserEmail || !req.isAuthenticated()) {
            return next();
        }
        // Fetch the latest user data to verify block status
        const user = await User.findById(req.session.UserId);
        if (user && user.isBlock) {
            req.session.destroy(() => {
                res.redirect("/"); // Handle blocked user
            });
        } else {
            res.redirect("/User/dashboard");
        }
    } catch (error) {
        console.log(error);
    }
};


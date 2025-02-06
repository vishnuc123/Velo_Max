
import User from "../../Models/User/UserDetailsModel.js";

export const session_handle = async (req, res, next) => {
    try {
        if (req.session.UserEmail || req.isAuthenticated()) {
            const user = await User.findById(req.session.UserId);
            if (user && user.isBlock) {
                req.session.destroy(() => {
                    res.redirect("/"); 
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
        const user = await User.findById(req.session.UserId);
        if (user && user.isBlock) {
            req.session.destroy(() => {
                res.redirect("/"); 
            });
        } else {
            res.redirect("/User/dashboard");
        }
    } catch (error) {
        console.log(error);
    }
};


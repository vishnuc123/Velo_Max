export const session_handle = async (req,res,next)=>{
    try {
        if(req.session.UserEmail || req.isAuthenticated()){
            return next()
        }
        res.redirect("/")
    } catch (error) {
        console.log(error)
    }
}
export const landingPageSession = async (req,res,next)=>{
    try {
        if(!req.session.UserEmail || !req.isAuthenticated()){
            return next()
        }
        res.redirect("/User/dashboard")
    } catch (error) {
        console.log(error)
    }
}
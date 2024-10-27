export const session_handle = async (req,res,next)=>{
    try {
        if(req.session.email){
            return next()
        }
        res.redirect("/admin")
    } catch (error) {
        
    }
}
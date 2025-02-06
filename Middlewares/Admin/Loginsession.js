export const adminLoginSession = async(req,res,next) =>{
    try {
        if(req.session.email){
            return next()
        }
        res.redirect('/admin')
        
    } catch (error) {
        
    }
}
export const admindashboardSession = async(req,res,next) =>{
    try {
        if(req.session.email){
            return next()
        }
        res.redirect('/dashboard')
        
    } catch (error) {
        
    }
}
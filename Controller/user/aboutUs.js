
export const getAboutUs = async (req,res) => {
    try {
        res.render('User/aboutUs.ejs')
    } catch (error) {
        console.log("error while hgetting about us page",error);
        
    }
}
  
export const get_calculator = async (req,res) => {
    try {
      res.render('Admin/calculator.ejs')
    } catch (error) {
      console.log('error while getting calculator',error);
      
    }
    }

import errorHandler from "../../Error-Reporter.js"
import Orders from "../../Models/User/Order.js"

export const getSalesPage = async (req,res,next) => {
    try {
        res.render('Admin/sales.ejs')
    } catch (error) {
        next(error)
    }
}




export const getSalesDetails = async (req, res, next) => {
    try {
        const { startDate, endDate, dateRange, page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        let filter = {};

        if (startDate && endDate) {
            filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (dateRange === '1-day') {
            const today = new Date();
            filter.date = { $gte: new Date(today.setHours(0, 0, 0, 0)) };
        } else if (dateRange === '1-week') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            filter.date = { $gte: lastWeek };
        } else if (dateRange === '1-month') {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            filter.date = { $gte: lastMonth };
        }

        const orderDetails = await Orders.find(filter)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const totalSalesCount = orderDetails.reduce((acc, order) => acc + order.orderedItem.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);
        const totalPages = Math.ceil(await Orders.countDocuments(filter) / limitNumber);
        const totalOrderAmount = orderDetails.reduce((acc, order) => acc + order.totalPrice, 0);
        const totalDiscount = orderDetails.reduce((acc, order) => acc + order.totalDiscount, 0);

        res.status(200).json({
            totalSalesCount,
            totalPages,
            currentPage: pageNumber,
            totalOrderAmount,
            totalDiscount,
            salesData: orderDetails,
        });
    } catch (error) {
        next(error);
    }
};


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

        // Apply filtering based on date range
        if (startDate && endDate) {
            filter.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (dateRange === '1-day') {
            const today = new Date();
            filter.orderDate = { $gte: new Date(today.setHours(0, 0, 0, 0)), $lt: new Date(today.setHours(23, 59, 59, 999)) };
        } else if (dateRange === '1-week') {
            const firstDayOfWeek = new Date();
            firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
            const lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
            filter.orderDate = { $gte: firstDayOfWeek, $lte: lastDayOfWeek };
        } else if (dateRange === '1-month') {
            const firstDayOfMonth = new Date();
            firstDayOfMonth.setDate(1);  // First day of current month
            const lastDayOfMonth = new Date(firstDayOfMonth);
            lastDayOfMonth.setMonth(firstDayOfMonth.getMonth() + 1);
            lastDayOfMonth.setDate(0);  // Last day of current month
            filter.orderDate = { $gte: firstDayOfMonth, $lte: lastDayOfMonth };
        } else if (dateRange === '1-year') {
            const firstDayOfYear = new Date();
            firstDayOfYear.setMonth(0, 1);  // First day of current year
            const lastDayOfYear = new Date(firstDayOfYear);
            lastDayOfYear.setMonth(11, 31);  // Last day of current year
            filter.orderDate = { $gte: firstDayOfYear, $lte: lastDayOfYear };
        }

        // Fetch order details based on the filter
        const orderDetails = await Orders.find(filter)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        // Calculate summary totals
        const totalSalesCount = orderDetails.reduce((acc, order) => acc + order.orderedItem.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);
        const totalOrderAmount = orderDetails.reduce((acc, order) => acc + order.finalAmount, 0);
        const totalDiscount = orderDetails.reduce((acc, order) => acc + order.totalDiscount, 0);
        const totalOfferDiscount = orderDetails.reduce((acc, order) => acc + order.offerDiscount, 0);
        
        // Get total pages for pagination
        const totalPages = Math.ceil(await Orders.countDocuments(filter) / limitNumber);

        // Send the response with sales data
        res.status(200).json({
            totalSalesCount,
            totalPages,
            currentPage: pageNumber,
            totalOrderAmount,
            totalDiscount,
            totalOfferDiscount,
            salesData: orderDetails,
        });
    } catch (error) {
        next(error);
    }
};

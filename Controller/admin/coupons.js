import Coupon from "../../Models/Admin/coupon.js";
import { createRecord, getAllRecords, deleteRecordById } from "../../Utils/Admin/coupon.js";

export const getCouponsPage = async (req, res) => {
  try {
    res.render('Admin/coupon.ejs');
  } catch (error) {
    console.log("Error while getting coupon page", error);
  }
};

export const addCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountAmount,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      usageLimit,
      usageLimitPerUser,
    } = req.body;

    const newCouponData = {
      code,
      discountType,
      discountValue: discountAmount,
      minPurchaseAmount: minPrice,
      maxPurchaseAmount: maxPrice,
      startDate,
      endDate,
      usageLimit,
      usageLimitPerUser,
    };

    const newCoupon = await createRecord(Coupon, newCouponData);

    res.status(201).json({ message: 'Coupon created successfully!', coupon: newCoupon });
  } catch (error) {
    console.error("Error while submitting the coupon details", error);
    res.status(500).json({ message: 'Failed to create coupon. Please try again.' });
  }
};

export const getCouponsList = async (req, res) => {
  try {
    const coupons = await getAllRecords(Coupon);
    res.status(200).json({ coupons });
  } catch (error) {
    console.log("Error while getting coupons list", error);
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const coupondetails = await deleteRecordById(Coupon, couponId);
    res.status(200).json({ message: "Coupon deleted successfully", coupondetails });
  } catch (error) {
    console.log("Error while deleting the coupon", error);
  }
};

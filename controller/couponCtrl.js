const Coupon = require("../models/couponModel");
const validateMongodbID = require("../utils/validateMongodbID");
const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(async (req, res) => {
	try {
		const newCoupon = await Coupon.create(req.body);
		res.json(newCoupon);
	} catch (error) {
		throw new Error(error);
	}
});

const getallCoupon = asyncHandler(async (req, res) => {
	try {
		const coupons = await Coupon.find();
		res.json(coupons);
	} catch (error) {
		throw new Error(error);
	}
});

const updateCoupon = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbID(id);
	try {
		const updatecoupon = await Coupon.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		res.json(updatecoupon);
	} catch (error) {
		throw new Error(error);
	}
});

const deleteCoupon = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbID(id);
	try {
		const deletecoupon = await Coupon.findByIdAndDelete(id);
		res.json(deletecoupon);
	} catch (error) {
		throw new Error(error);
	}
});

module.exports = { createCoupon, getallCoupon, updateCoupon, deleteCoupon };

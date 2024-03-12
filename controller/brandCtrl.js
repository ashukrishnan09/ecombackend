const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbID");

const createBrand = asyncHandler(async (req, res) => {
	try {
		const newBrand = await Brand.create(req.body);
		res.json(newBrand);
	} catch (error) {
		throw new Error(error);
	}
});

const updateBrand = asyncHandler(async (req, res) => {
	const { id } = req.params;
	try {
		const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		res.json(updatedBrand);
	} catch (error) {
		throw new Error(error);
	}
});

const deleteBrand = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);
	try {
		const deletedBrand = await Brand.findByIdAndDelete(id);
		res.json(deletedBrand);
	} catch (error) {
		throw new Error(error);
	}
});

const getBrand = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);
	try {
		const gotBrand = await Brand.findById(id);
		res.json(gotBrand);
	} catch (error) {
		throw new Error(error);
	}
});

const getallBrand = asyncHandler(async (req, res) => {
	try {
		const findallBrand = await Brand.find();
		res.json(findallBrand);
	} catch (error) {
		throw new Error(error);
	}
});

module.exports = {
	createBrand,
	updateBrand,
	deleteBrand,
	getBrand,
	getallBrand,
};

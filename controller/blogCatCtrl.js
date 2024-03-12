const Category = require("../models/blogCatModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbID");

const createCategory = asyncHandler(async (req, res) => {
	try {
		const newCategory = await Category.create(req.body);
		res.json(newCategory);
	} catch (error) {
		throw new Error(error);
	}
});

const updateCategory = asyncHandler(async (req, res) => {
	const { id } = req.params;
	try {
		const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		res.json(updatedCategory);
	} catch (error) {
		throw new Error(error);
	}
});

const deleteCategory = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);
	try {
		const deletedCategory = await Category.findByIdAndDelete(id);
		res.json(deletedCategory);
	} catch (error) {
		throw new Error(error);
	}
});

const getCategory = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);
	try {
		const gotCategory = await Category.findById(id);
		res.json(gotCategory);
	} catch (error) {
		throw new Error(error);
	}
});

const getallCategory = asyncHandler(async (req, res) => {
	try {
		const findallCategory = await Category.find();
		res.json(findallCategory);
	} catch (error) {
		throw new Error(error);
	}
});

module.exports = {
	createCategory,
	updateCategory,
	deleteCategory,
	getCategory,
	getallCategory,
};

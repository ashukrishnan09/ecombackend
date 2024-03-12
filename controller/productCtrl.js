const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongodbId = require("../utils/validateMongodbID");
const cloudinaryUploadImg = require("../utils/cloudinary.js");
const fs = require("fs");
// create product
const createProduct = asyncHandler(async (req, res) => {
	try {
		if (req.body.title) {
			req.body.slug = slugify(req.body.title);
		}
		const newProduct = await Product.create(req.body);

		res.json(newProduct);
	} catch (error) {
		throw new Error(error);
	}
});

//update a product

const updateProduct = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);
	try {
		if (req.body.title) {
			req.body.slug = slugify(req.body.title);
		}
		const updateProducts = await Product.findOneAndUpdate(
			{ _id: id },
			req.body,
			{
				new: true,
			}
		);

		res.json(updateProducts);
	} catch (error) {
		throw new Error(error);
	}
});
// delete a product
const deleteProduct = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId;

	try {
		if (req.body.title) {
			req.body.slug = slugify(req.body.title);
		}
		const deleteProducts = await Product.findOneAndDelete(
			{ _id: id },
			req.body,
			{
				new: true,
			}
		);

		res.json(deleteProducts);
	} catch (error) {
		throw new Error(error);
	}
});

//get a product
const getaProduct = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);
	try {
		const findProduct = await Product.findById(id);
		res.json(findProduct);
	} catch (error) {
		throw new Error(error);
	}
});

// get all product
const getallProduct = asyncHandler(async (req, res) => {
	try {
		//filtering
		const queryObj = { ...req.query };
		const excludeFields = ["page", "sort", "limit", "fields"];
		excludeFields.forEach((el) => delete queryObj[el]);
		console.log(queryObj);
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
		console.log(JSON.parse(queryStr));
		let query = Product.find(JSON.parse(queryStr));
		//sorting

		if (req.query.sort) {
			const sortBy = req.query.sort.split(",").join(" ");
			query = query.sort("category brand");
		} else {
			query = query.sort("-createdAt");
		}

		//limiting the fields
		if (req.query.fields) {
			const fields = req.query.fields.split(",").join(" ");
			query = query.select(fields);
		} else {
			query = query.select("-__v");
		}

		//pagination
		const page = req.query.page;
		const limit = req.query.limit;
		const skip = (page - 1) * limit;
		query = query.skip(skip).limit(limit);
		if (req.query.page) {
			const productCount = await Product.countDocuments();
			if (skip >= productCount) throw new Error("This page does not exist");
		}
		console.log(page, limit, skip);

		const product = await query;
		res.json(product);
	} catch (error) {
		throw new Error(error);
	}
});

const addToWishlist = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	const { prodId } = req.body;

	try {
		const user = await User.findById(_id);
		const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
		if (alreadyadded) {
			let user = await User.findByIdAndUpdate(
				_id,
				{
					$pull: { wishlist: prodId },
				},
				{
					new: true,
				}
			);
			res.json(user);
		} else {
			let user = await User.findByIdAndUpdate(
				_id,
				{
					$push: { wishlist: prodId },
				},
				{
					new: true,
				}
			);
			res.json(user);
		}
	} catch (error) {
		throw new Error(error);
	}
});

const rating = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	const { star, prodId, comment } = req.body;
	try {
		const product = await Product.findById(prodId);

		let alreadyRated = product.rating.find(
			(userId) => userId.postedBy.toString() === _id.toString()
		);
		if (alreadyRated) {
			const updateRating = await Product.updateOne(
				{
					rating: { $elemMatch: alreadyRated },
				},
				{
					$set: { "rating.$.star": star, "rating.$.comment": comment },
				},
				{
					new: true,
				}
			);
			// res.json(updateRating);
		} else {
			const rateProduct = await Product.findByIdAndUpdate(
				prodId,
				{
					$push: { rating: { star: star, comment: comment, postedBy: _id } },
				},
				{
					new: true,
				}
			);
			// res.json(rateProduct);
		}
		const getallRatings = await Product.findById(prodId);
		let totalRating = getallRatings.rating.length;
		let ratingsum = getallRatings.rating
			.map((item) => item.star)
			.reduce((prev, curr) => prev + curr, 0);
		let actualRating = Math.round(ratingsum / totalRating);
		let finalprofuct = await Product.findByIdAndUpdate(
			prodId,
			{
				totalratings: actualRating,
			},
			{
				new: true,
			}
		);
		res.json(finalprofuct);
	} catch (error) {
		throw new Error(error);
	}
});

const uploadImages = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);
	try {
		const uploader = (path) => cloudinaryUploadImg(path, "images");
		const urls = [];
		const files = req.files;
		for (const file of files) {
			const { path } = file;
			const newpath = await uploader(path);
			urls.push(newpath);
			fs.unlinkSync(path);
		}
		const findproduct = await Product.findByIdAndUpdate(
			id,
			{
				images: urls.map((file) => {
					return file;
				}),
			},
			{
				new: true,
			}
		);
		res.json(findproduct);
	} catch (error) {
		throw new Error(error);
	}
});
module.exports = {
	createProduct,
	getaProduct,
	getallProduct,
	updateProduct,
	deleteProduct,
	addToWishlist,
	rating,
	uploadImages,
};

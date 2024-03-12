const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbID");
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs");
const createBlog = asyncHandler(async (req, res) => {
	try {
		const newBlog = await Blog.create(req.body);
		res.json({
			status: "Success",
			newBlog,
		});
	} catch (error) {
		throw new Error(error);
	}
});

const updateBlog = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);

	try {
		const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		res.json(updatedBlog);
	} catch (error) {
		throw new Error(error);
	}
});

const getBlog = asyncHandler(async (req, res) => {
	const { id } = req.params;

	try {
		const getBlog = await Blog.findById(id)
			.populate("likes")
			.populate("dislikes");
		const updateViews = await Blog.findByIdAndUpdate(
			id,
			{
				$inc: { numViews: 1 },
			},
			{ new: true }
		);
		res.json(getBlog);
	} catch (error) {
		throw new Error(error);
	}
});

const getAllBlog = asyncHandler(async (req, res) => {
	const { id } = req.params;
	try {
		const getblogs = await Blog.find();
		res.json(getblogs);
	} catch (error) {
		throw new Error(error);
	}
});

const deleteBlog = asyncHandler(async (req, res) => {
	const { id } = req.params;

	try {
		const deletedBlog = await Blog.findByIdAndDelete(id);
		res.json(deletedBlog);
	} catch (error) {
		throw new Error(error);
	}
});

const likeBlog = asyncHandler(async (req, res) => {
	const { blogId } = req.body;
	validateMongodbId(blogId);
	//Find the blog which you want to be liked
	const blog = await Blog.findById(blogId);
	//find the login user
	const loginUserID = req?.user?._id;
	//find the user liked the blog
	const isLiked = blog?.isLiked;
	//find the user has disliked the blog
	const alreadydisLiked = blog?.dislikes.find(
		(userId) => userId?.toString() === loginUserID.toString()
	);
	if (alreadydisLiked) {
		const blog = await Blog.findByIdAndUpdate(
			blogId,
			{
				$pull: { dislikes: loginUserID },
				isDisLiked: false,
			},
			{
				new: true,
			}
		);
		res.json(blog);
	}
	if (isLiked) {
		const blog = await Blog.findByIdAndUpdate(
			blogId,
			{
				$pull: { likes: loginUserID },
				isLiked: false,
			},
			{
				new: true,
			}
		);
		res.json(blog);
	} else {
		const blog = await Blog.findByIdAndUpdate(
			blogId,
			{
				$push: { likes: loginUserID },
				isLiked: true,
			},
			{
				new: true,
			}
		);
		res.json(blog);
	}
});

//dislike the blog code

const dislikeBlog = asyncHandler(async (req, res) => {
	const { blogId } = req.body;
	validateMongodbId(blogId);
	//Find the blog which you want to be liked
	const blog = await Blog.findById(blogId);
	//find the login user
	const loginUserID = req?.user?._id;
	//find the user liked the blog
	const isdisLiked = blog?.isDisLiked;
	//find the user has disliked the blog
	const alreadyLiked = blog?.likes.find(
		(userId) => userId?.toString() === loginUserID.toString()
	);
	if (alreadyLiked) {
		const blog = await Blog.findByIdAndUpdate(
			blogId,
			{
				$pull: { likes: loginUserID },
				isLiked: false,
			},
			{
				new: true,
			}
		);
		res.json(blog);
	}
	if (isdisLiked) {
		const blog = await Blog.findByIdAndUpdate(
			blogId,
			{
				$pull: { dislikes: loginUserID },
				isDisLiked: false,
			},
			{
				new: true,
			}
		);
		res.json(blog);
	} else {
		const blog = await Blog.findByIdAndUpdate(
			blogId,
			{
				$push: { dislikes: loginUserID },
				isDisLiked: true,
			},
			{
				new: true,
			}
		);
		res.json(blog);
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
		const findBlog = await Blog.findByIdAndUpdate(
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
		res.json(findBlog);
	} catch (error) {
		throw new Error(error);
	}
});

module.exports = {
	createBlog,
	updateBlog,
	getBlog,
	getAllBlog,
	deleteBlog,
	likeBlog,
	dislikeBlog,
	uploadImages,
};

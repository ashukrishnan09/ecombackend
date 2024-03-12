const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const { generateToken } = require("../config/jwtToken");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbID");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");
const uniqid = require("uniqid");

const createUser = asyncHandler(async (req, res) => {
	const email = req.body.email;
	const findUser = await User.findOne({ email: email });
	if (!findUser) {
		//create anew user
		const newUser = User.create(req.body);
		res.json(newUser);
	} else {
		//User already exist
		throw new Error("User Already Exists");
	}
});

const loginUserCtrl = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	//check if users or not
	const findUser = await User.findOne({ email });

	if (findUser && (await findUser.isPasswordMatched(password))) {
		const refreshToken = generateRefreshToken(findUser?._id);
		const updateUser = await User.findByIdAndUpdate(
			findUser.id,
			{ refreshToken: refreshToken },
			{ new: true }
		);
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			maxAge: 72 * 60 * 60 * 1000,
		});
		res.json({
			id: findUser?._id,
			firstname: findUser?.firstname,
			lastname: findUser?.lastname,
			email: findUser?.email,
			mobile: findUser?.mobile,
			token: generateToken(findUser?._id),
		});
	} else {
		throw new Error("Invalid Credencials");
	}
});

//handle the refresh of tokens

const handleRefreshToken = asyncHandler(async (req, res) => {
	const cookie = req.cookies;
	console.log(cookie);
	if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
	const refreshToken = cookie.refreshToken;
	console.log(refreshToken);
	const user = await User.findOne({ refreshToken });

	if (!user) throw new Error("No Refresh Token Present in DB or not matched");
	jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
		if (err || user.id !== decoded.id) {
			console.log(err);
		}
		const accessToken = generateToken(user?._id);
		res.json({ accessToken });
	});
});

//admin login

const adminLogin = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	//check if users or not
	const findAdmin = await User.findOne({ email });
	if (findAdmin.role !== "admin") throw new Error("Not Authorished");
	if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
		const refreshToken = generateRefreshToken(findAdmin?._id);
		const updateUser = await User.findByIdAndUpdate(
			findAdmin.id,
			{ refreshToken: refreshToken },
			{ new: true }
		);
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			maxAge: 72 * 60 * 60 * 1000,
		});
		res.json({
			id: findAdmin?._id,
			firstname: findAdmin?.firstname,
			lastname: findAdmin?.lastname,
			email: findAdmin?.email,
			mobile: findAdmin?.mobile,
			token: generateToken(findAdmin?._id),
		});
	} else {
		throw new Error("Invalid Credencials");
	}
});

//logout functionality

const logout = asyncHandler(async (req, res) => {
	const cookie = req.cookies;
	if (!cookie.refreshToken) throw new Error("No Refresh Token in Cookies");
	const refreshToken = cookie.refreshToken;
	const user = await User.findOne({ refreshToken });

	if (!user) {
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: true,
		});
		return res.sendStatus(204); // forbidden
	}
	await User.findOneAndUpdate({
		refreshToken: "",
	});
	res.clearCookie("refreshToken", {
		httpOnly: true,
		secure: true,
	});
	res.sendStatus(204);
});

//update a user

const updateUser = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongodbId(_id);
	try {
		const updatedUser = await User.findByIdAndUpdate(
			_id,
			{
				firstname: req?.body.firstname,
				lastname: req?.body.lastname,
				email: req?.body.email,
				mobile: req?.body.mobile,
			},
			{ new: true }
		);
		res.json(updatedUser);
	} catch (error) {
		throw new Error(error);
	}
});
//save user address
const userAddress = asyncHandler(async (req, res) => {
	const _id = req.user;
	validateMongodbId(_id);
	try {
		const updatedUser = await User.findByIdAndUpdate(
			_id,
			{
				address: req?.body.address,
			},
			{ new: true }
		);
		res.json(updatedUser);
	} catch (error) {
		throw new Error(error);
	}
});
//get all user

const getallUser = asyncHandler(async (req, res) => {
	try {
		const getUsers = await User.find();
		res.json(getUsers);
	} catch (error) {
		throw new Error(error);
	}
});

// get a single user

const getaUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);

	try {
		const getaUser = await User.findById(id);
		res.json(getaUser);
	} catch (error) {
		throw new Error(error);
	}
});

// delete a user

const deleteaUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);

	try {
		const deleteaUser = await User.findByIdAndDelete(id);
		res.json(deleteaUser);
	} catch (error) {
		throw new Error(error);
	}
});

const blockUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);
	try {
		const block = await User.findByIdAndUpdate(
			id,
			{
				isBlocked: true,
			},
			{
				new: true,
			}
		);
		res.json({ message: "user blocked" });
	} catch (error) {
		throw new Error(error);
	}
});

const unblockUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongodbId(id);
	try {
		const unblock = await User.findByIdAndUpdate(
			id,
			{
				isBlocked: false,
			},
			{
				new: true,
			}
		);
		res.json({ message: "user unblocked" });
	} catch (error) {
		throw new Error(error);
	}
});

const updatePassword = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	const { password } = req.body;
	validateMongodbId(_id);

	const user = await User.findById(_id);
	if (password) {
		user.password = password;
		const updatePassword = await user.save();
		res.json(updatePassword);
	} else {
		res.json(user);
	}
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });
	if (!user) throw new Error("user not found with this email");

	try {
		const token = await user.createPasswordResetToken();
		await user.save();
		const resetURL = `Hi ashu please follow this link to reset your password.This link is valid till 10 minutes from now.
		<a href='http://localhost:5000/api/user/reset-password/${token}'>click here</a>`;

		const data = {
			to: email,
			text: "hey user hahaha",
			subject: "forgot password link ",
			html: resetURL,
		};
		sendEmail(data);
		res.json(token);
	} catch (error) {
		throw new Error(error);
	}
});

const resetPassword = asyncHandler(async (req, res) => {
	const { password } = req.body;
	const { token } = req.params;
	const hashToken = crypto.createHash("sha256").update(token).digest("hex");
	const user = await User.findOne({
		passwordResetToken: hashToken,
		passwordResetExpires: { $gt: Date.now() },
	});
	if (!user) throw new Error("Token Expired, Please try again later ");
	user.password = password;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();
	res.json(user);
});

const getWowList = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongodbId(_id);

	try {
		const findUser = await User.findById(_id).populate("wishlist");
		res.json(findUser);
	} catch (error) {
		throw new Error(error);
	}
});

const userCart = asyncHandler(async (req, res) => {
	const { cart } = req.body;
	const { _id } = req.user;
	validateMongodbId(_id);
	try {
		let products = [];
		const user = await User.findById(_id);
		//check if user already have product in cart
		const alreadyExistCart = await Cart.findOne({ orderby: user._id });
		if (alreadyExistCart) {
			alreadyExistCart.remove();
		}
		for (let i = 0; i < cart.length; i++) {
			let object = {};
			object.product = cart[i]._id;
			object.count = cart[i].count;
			object.color = cart[i].count;

			let getPrice = await Product.findById(cart[i]._id).select("price").exec();

			object.price = getPrice.price;
			products.push(object);
		}
		let cartTotal = 0;
		for (let i = 0; i < products.length; i++) {
			cartTotal = cartTotal + products[i].price * products[i].count;
		}
		console.log(products, cartTotal);

		let newCart = await new Cart({
			products,
			cartTotal,
			orderby: user?._id,
		}).save();

		res.json(newCart);
	} catch (error) {
		throw new Error(error);
	}
});

const getUserCart = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongodbId(_id);
	try {
		const cart = await Cart.findOne({ orderby: _id }).populate(
			"products.product",
			"_id title price totalAfterDiscount"
		);
		res.json(cart);
	} catch (error) {
		throw new Error(error);
	}
});
// Empty cart for sure
const emptyCart = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongodbId(_id);
	try {
		const user = await User.findOne({ _id });
		const cart = await Cart.findOneAndDelete({ orderby: user._id });
		res.json(cart);
	} catch (error) {
		throw new Error(error);
	}
});

const applyCoupon = asyncHandler(async (req, res) => {
	const { coupon } = req.body;
	const { _id } = req.user;
	validateMongodbId(_id);
	const validCoupon = await Coupon.findOne({ name: coupon });
	if (validCoupon == null) {
		throw new Error("Invalid Coupon");
	}
	const user = await User.findOne({ _id });
	let { products, cartTotal } = await Cart.findOne({
		orderby: user._id,
	}).populate("products.product");
	let totalAfterDiscount = (
		cartTotal -
		(cartTotal * validCoupon.discount) / 100
	).toFixed(2);
	await Cart.findOneAndUpdate(
		{ orderby: user._id },
		{ totalAfterDiscount },
		{ new: true }
	);
	res.json(totalAfterDiscount);
});
//create order functionality
const creatOrder = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongodbId(_id);

	try {
		const { COD, couponApplied } = req.body;
		if (!COD) throw new Error("Create cash order failed");
		const user = await User.findById(_id);
		let userCart = await Cart.findOne({ orderby: user._id });
		let finalAmount = 0;
		if (couponApplied && userCart.totalAfterDiscount) {
			finalAmount = userCart.totalAfterDiscount * 100;
		} else {
			finalAmount = userCart.cartTotal * 100;
		}
		let newOrder = await new Order({
			products: userCart.products,
			paymentIntent: {
				id: uniqid(),
				method: "COD",
				amount: finalAmount,
				status: "Cash on Delivery",
				created: Date.now(),
				currency: "usd",
			},
			orderby: user._id,
			orderStatus: "Cash on Delivery",
		}).save();
		let update = userCart.products.map((item) => {
			return {
				updateOne: {
					filter: { _id: item.product._id },
					update: { $inc: { quantity: -item.count, sold: +item.count } },
				},
			};
		});
		const updated = await Product.bulkWrite(update, {});
		res.json({ message: "success" });
	} catch (error) {
		throw new Error(error);
	}
});

const getOrders = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongodbId(_id);
	try {
		const userorders = await Order.findOne({ orderby: _id })
			.populate("products.product")
			.exec();
		res.json(userorders);
	} catch (error) {
		throw new Error(error);
	}
});

const updateOrderStatus = asyncHandler(async (req, res) => {});
module.exports = {
	createUser,
	loginUserCtrl,
	getallUser,
	getaUser,
	deleteaUser,
	updateUser,
	blockUser,
	unblockUser,
	handleRefreshToken,
	logout,
	updatePassword,
	forgotPasswordToken,
	resetPassword,
	adminLogin,
	getWowList,
	userAddress,
	userCart,
	getUserCart,
	emptyCart,
	applyCoupon,
	creatOrder,
	getOrders,
	updateOrderStatus,
};

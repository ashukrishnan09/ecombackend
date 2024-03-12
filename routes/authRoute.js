const express = require("express");

const {
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
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatePassword);
router.post("/login", loginUserCtrl);
router.post("/admin-login", adminLogin);
router.post("/cart", authMiddleware, userCart);
router.post("/cart/applycoupon", authMiddleware, applyCoupon);
router.post("/cart/cash-order", authMiddleware, creatOrder);
router.get("/all-users", getallUser);
router.get("/get-orders", authMiddleware, getOrders);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/wishlist", authMiddleware, getWowList);
router.get("/cart", authMiddleware, getUserCart);
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteaUser);
router.put("/edit-user", authMiddleware, updateUser);
router.put("/save-address", authMiddleware, userAddress);
router.put("/blocked-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblocked-user/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;

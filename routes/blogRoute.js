const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
	createBlog,
	updateBlog,
	getBlog,
	getAllBlog,
	deleteBlog,
	likeBlog,
	dislikeBlog,
	uploadImages,
} = require("../controller/blogCtrl");

const { uploadPhoto, blogImgResize } = require("../middlewares/uploadImages");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBlog);
router.put(
	"/upload/:id",
	authMiddleware,
	isAdmin,
	uploadPhoto.array("image", 2),
	blogImgResize,
	uploadImages
);
router.put("/likes", authMiddleware, likeBlog);
router.put("/dislikes", authMiddleware, dislikeBlog);
router.put("/:id", authMiddleware, isAdmin, updateBlog);

router.get("/:id", getBlog);
router.get("/", getAllBlog);
router.delete("/:id", deleteBlog);

module.exports = router;

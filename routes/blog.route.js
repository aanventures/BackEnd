const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { getBlogBySlug, createBlog, getBlogById, getAllBlogs, updateBlog, deleteBlog, likeBlog, addComment, deleteComment } = require("../controllers/blog.controller")

// Configure Multer for temporary storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', verifyToken,isAdmin, upload.single('image'), createBlog);
router.get('/:slug', getBlogBySlug);

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Protected routes (Only logged-in users/admins)
router.put('/:id', verifyToken, upload.single('image'), updateBlog);
router.delete('/:id', verifyToken, deleteBlog);

// Interactions
router.post('/:id/like', verifyToken, likeBlog);
router.post('/:id/comment', verifyToken, addComment);
router.delete('/:id/comment/:commentId', verifyToken, deleteComment);

module.exports = router;
const express = require('express')
const router = express.Router()
const blogController = require('../controllers/blog.controller')

router.post('/', blogController.createBlog)
router.get('/', blogController.getAllBlogs)
router.get('/:id', blogController.getBlogById)
router.put('/:id', blogController.updateBlog)
router.delete('/:id', blogController.deleteBlog)

// interactions
router.post('/:id/like', blogController.likeBlog)
router.post('/:id/comment', blogController.addComment)
router.delete('/:id/comment/:commentId', blogController.deleteComment)

module.exports = router

const Blog = require('../models/blog.model')

// Create a new blog post
exports.createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body)
    res.status(201).json({ success: true, data: blog })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
    res.status(200).json({ success: true, count: blogs.length, data: blogs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Get single blog by id
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' })
    res.status(200).json({ success: true, data: blog })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Update blog by id
exports.updateBlog = async (req, res) => {
  try {
    const updates = req.body
    const blog = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' })
    res.status(200).json({ success: true, data: blog })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// Delete blog by id
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' })
    res.status(200).json({ success: true, message: 'Blog deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Like or unlike a blog
exports.likeBlog = async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' })

    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' })

    const index = blog.likes.findIndex((u) => u.toString() === userId)
    if (index === -1) {
      // add like
      blog.likes.push(userId)
      blog.likesCount = blog.likes.length
      await blog.save()
      return res.status(200).json({ success: true, message: 'Liked', likesCount: blog.likesCount })
    } else {
      // remove like (unlike)
      blog.likes.splice(index, 1)
      blog.likesCount = blog.likes.length
      await blog.save()
      return res.status(200).json({ success: true, message: 'Unliked', likesCount: blog.likesCount })
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Add a comment to a blog
exports.addComment = async (req, res) => {
  try {
    const { author, text } = req.body
    if (!author || !text) return res.status(400).json({ success: false, message: 'author and text are required' })

    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' })

    const comment = { author, text }
    blog.comments.push(comment)
    blog.commentsCount = blog.comments.length
    await blog.save()

    // return the newly added comment (last element)
    res.status(201).json({ success: true, data: blog.comments[blog.comments.length - 1] })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// Delete a comment from a blog
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' })

    const commentIndex = blog.comments.findIndex((c) => c._id.toString() === commentId)
    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }

    blog.comments.splice(commentIndex, 1)
    blog.commentsCount = blog.comments.length
    await blog.save()

    res.status(200).json({ success: true, message: 'Comment deleted', commentsCount: blog.commentsCount })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}


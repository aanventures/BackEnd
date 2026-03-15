const Blog = require('../models/blog.model')
const cloudinary = require('../config/cloudinary')

// Create a new Blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, description, image, author } = req.body;

    // 1. Basic validation
    if (!title || !content || !author) {
      return res.status(400).json({
        success: false,
        message: "Title, Content, and Author ID are required."
      });
    }

    let imageUrl = ""

    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: "blogs" },
        async (err, result) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message
            })
          }
        }
      )
    }

    imageUrl = result.secure_url
    // 2. Create the blog
    const blog = await Blog.create({
      title,
      content, 
      description,
      image: imageUrl,
      author 
    });

    res.status(201).json({
      success: true,
      message: "Blog published successfully!",
      data: blog
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all Blogs (with author details)
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name email')
      .sort('-createdAt');
      
    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Single Blog
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name');
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    
    res.status(200).json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Blog
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: blog });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete Blog
exports.deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Like / Unlike Blog
exports.likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const userId = req.body.userId; // In real apps, get this from req.user.id

    if (blog.likes.includes(userId)) {
      // Unlike
      blog.likes = blog.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      blog.likes.push(userId);
    }

    blog.likesCount = blog.likes.length;
    await blog.save();

    res.status(200).json({ success: true, likes: blog.likesCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const { author, text } = req.body;
    const blog = await Blog.findById(req.params.id);

    blog.comments.push({ author, text });
    blog.commentsCount = blog.comments.length;
    
    await blog.save();
    res.status(201).json({ success: true, data: blog.comments });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
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


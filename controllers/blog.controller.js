// Import the configured cloudinary instance directly
const cloudinary = require("../config/cloudinary");
const Blog = require("../models/blog.model");
const sharp = require("sharp");

exports.createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, status, isFeatured } = req.body;
    const userId = req.user?.id;

    if (!title || !content || !userId) {
      return res.status(400).json({
        success: false,
        message: "Title, Content, and User Authentication are required.",
      });
    }

    let blogData = {
      title,
      content,
      excerpt,
      author: userId,
      category,
      status: status || "published",
      home_page: isFeatured === "true" || isFeatured === true,
    };

    if (req.file) {
      try {
        const optimizedBuffer = await sharp(req.file.buffer)
          .resize(1600, null, {
            withoutEnlargement: true,
            fit: "inside",
          })
          .webp({ quality: 80 })
          .toBuffer();

        const uploadToCloudinary = (buffer) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "blogs",
                format: "webp",
                eager: [
                  {
                    width: 1200,
                    height: 800,
                    crop: "fill",
                    gravity: "auto",
                    quality: "auto",
                    format: "webp",
                  },
                  {
                    width: 800,
                    height: 600,
                    crop: "fill",
                    gravity: "auto",
                    quality: "auto",
                    format: "webp",
                  },
                  {
                    width: 450,
                    height: 300,
                    crop: "fill",
                    gravity: "auto",
                    quality: "auto",
                    format: "webp",
                  },
                ],
                eager_async: false,
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              },
            );
            uploadStream.end(buffer);
          });
        };

        const result = await uploadToCloudinary(optimizedBuffer);

        blogData.image = {
          public_id: result.public_id,
          url: result.secure_url,
          // 4. Optionally save responsive versions to the DB
          responsive_urls: result.eager.map((img) => img.secure_url),
        };
      } catch (imageError) {
        return res.status(500).json({
          success: false,
          message: "Image optimization failed: " + imageError.message,
        });
      }
    }

    const blog = await Blog.create(blogData);

    res.status(201).json({
      success: true,
      message: "Blog published successfully!",
      blog,
    });
  } catch (err) {
    console.error("Blog Creation Error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error: " + err.message,
    });
  }
};
// Get all Blogs (with author details)
exports.getAllBlogs = async (req, res) => {
  try {
    const queryObj = { ...req.query };

    const excludedFields = ['sort', 'page', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    const blogs = await Blog.find(queryObj)
      .populate("author", "name email")
      .sort(req.query.sort || "-createdAt");

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Single Blog
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name");
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    res.status(200).json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Single Blog by Slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // We use findOne because slugs are unique
    const blog = await Blog.findOne({ slug })
      .populate("author", "name")
      .populate("comments.author", "name");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (err) {
    console.error("Fetch Blog by Slug Error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error: " + err.message,
    });
  }
};

// update blog
exports.updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // 1. Handle Text Fields (Title, Content, etc.)
    const fieldsToUpdate = req.body;
    
    // Convert 'isFeatured' string from FormData back to Boolean
    if (fieldsToUpdate.isFeatured !== undefined) {
      blog.home_page = fieldsToUpdate.isFeatured === "true" || fieldsToUpdate.isFeatured === true;
    }

    Object.keys(fieldsToUpdate).forEach((key) => {
      // Don't overwrite the image object manually with strings from body
      if (key !== "image" && key !== "isFeatured") {
        blog[key] = fieldsToUpdate[key];
      }
    });

    // 2. Handle Image Update (If a new file is provided)
    if (req.file) {
      try {
        // Optimize new image with Sharp
        const optimizedBuffer = await sharp(req.file.buffer)
          .resize(1600, null, { withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: 80 }) 
          .toBuffer();

        // Upload to Cloudinary
        const uploadToCloudinary = (buffer) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "blogs", format: "webp" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            uploadStream.end(buffer);
          });
        };

        const result = await uploadToCloudinary(optimizedBuffer);

        // Optional: Delete the OLD image from Cloudinary to save space
        if (blog.image?.public_id) {
          await cloudinary.uploader.destroy(blog.image.public_id);
        }

        // Set new image data
        blog.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      } catch (imageError) {
        return res.status(500).json({ success: false, message: "Image update failed" });
      }
    }

    // 3. Save (This triggers the 'pre-save' slug logic)
    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog
    });
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
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
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
    const { commentId } = req.params;
    const blog = await Blog.findById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    const commentIndex = blog.comments.findIndex(
      (c) => c._id.toString() === commentId,
    );
    if (commentIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    blog.comments.splice(commentIndex, 1);
    blog.commentsCount = blog.comments.length;
    await blog.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Comment deleted",
        commentsCount: blog.commentsCount,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

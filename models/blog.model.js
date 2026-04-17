const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter blog title"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    content: {
      type: String,
      required: [true, "Please enter blog content"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Changed 'description' to 'excerpt' to match your frontend state
    excerpt: {
      type: String,
      // maxlength: [10, "Excerpt cannot exceed 500 characters"]
    },
    // Updated image to be an object and NOT required
    image: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    gallery: [
      {
        title: {
          type: String,
          trim: true,
          default: "",
        },
        public_id: {
          type: String,
          required: false,
          default: "manual_entry", // ✅ Fix
        },
        url: {
          type: String, 
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: ["travel", "hotels", "lifestyle", "news", "deals"],
    },
    status: {
      type: String,
      default: "published",
      enum: ["published", "draft"],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    home_page: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

blogSchema.pre("save", async function () {
  if (!this.isModified("title")) return;

  let generatedSlug = slugify(this.title, {
    lower: true,
    strict: true,
  });

  const slugExists = await this.constructor.findOne({ slug: generatedSlug });
  if (slugExists) {
    generatedSlug = `${generatedSlug}-${Math.floor(Math.random() * 1000)}`;
  }

  this.slug = generatedSlug;
});

module.exports = mongoose.model("Blog", blogSchema);

const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    slug: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("city", citySchema);

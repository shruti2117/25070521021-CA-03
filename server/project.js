
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {

    owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    },    
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Other",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);

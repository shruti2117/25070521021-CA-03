
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    projectTitle: {
      type: String,
      required: true,
    },
    applicantName: {
      type: String,
      default: "ProjectPulse User",
    },
    
    applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);

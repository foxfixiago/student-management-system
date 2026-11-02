
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      trim: true
    },

    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true
    },

    year: {
      type: Number,
      required: [true, "Year is required"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Student", studentSchema);

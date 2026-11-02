
const express = require("express");
const router = express.Router();

const Student = require("../models/Student");

// 1. CREATE a new student
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();

    res.status(201).json({
      message: "Student created successfully",
      student: savedStudent
    });

  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      message: error.code === 11000
        ? "Email or roll number already exists"
        : error.message
    });
  }
});

// 2. GET all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();

    res.status(200).json({
      count: students.length,
      students
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GET student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json(student);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. UPDATE student by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent
    });

  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      message: error.code === 11000
        ? "Email or roll number already exists"
        : error.message
    });
  }
});

// 5. DELETE student by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
      student: deletedStudent
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

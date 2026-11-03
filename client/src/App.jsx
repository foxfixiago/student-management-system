
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5001/api/students";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [deletingStudentId, setDeletingStudentId] = useState(null);

  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    rollNumber: "",
    branch: "",
    year: ""
  });

  // Reset form and edit mode
  const resetForm = () => {
    setFormData({
      studentName: "",
      email: "",
      rollNumber: "",
      branch: "",
      year: ""
    });

    setEditingStudentId(null);
    setError("");
    setSuccess("");
  };

  // FETCH ALL STUDENTS
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to fetch student records");
      }

      const data = await response.json();

      setStudents(data.students || []);
      setDbConnected(true);

    } catch (err) {
      console.error(err);
      setError("Could not connect to the backend.");
      setDbConnected(false);

    } finally {
      setLoading(false);
    }
  };

  // Fetch records when application loads
  useEffect(() => {
    fetchStudents();
  }, []);

  // HANDLE INPUT CHANGES
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // EDIT STUDENT
  const handleEditStudent = (student) => {
    setEditingStudentId(student._id);

    setFormData({
      studentName: student.studentName,
      email: student.email,
      rollNumber: student.rollNumber,
      branch: student.branch,
      year: String(student.year)
    });

    setError("");
    setSuccess("");
    setActivePage("Add Student");
  };

  // CREATE / UPDATE STUDENT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(editingStudentId);

      const url = isEditing
        ? `${API_URL}/${editingStudentId}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          ...formData,
          year: Number(formData.year)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Operation failed"
        );
      }

      resetForm();

      await fetchStudents();

      setSuccess(
        isEditing
          ? "Student updated successfully!"
          : "Student added successfully!"
      );

      setActivePage("Students");

    } catch (err) {
      console.error(err);
      setError(err.message);

    } finally {
      setSaving(false);
    }
  };

  // CANCEL FORM
  const handleCancel = () => {
    resetForm();
    setActivePage("Students");
  };

  // DELETE STUDENT
  const handleDeleteStudent = async (student) => {

    // Confirmation before deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.studentName}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingStudentId(student._id);
      setError("");
      setSuccess("");

      // Send DELETE request to backend
      const response = await fetch(
        `${API_URL}/${student._id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete student"
        );
      }

      // Refresh student records
      await fetchStudents();

      setSuccess(
        `${student.studentName} deleted successfully!`
      );

    } catch (err) {
      console.error(err);
      setError(err.message);

    } finally {
      setDeletingStudentId(null);
    }
  };

  // SEARCH STUDENTS
  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase();

    return (
      student.studentName?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.rollNumber?.toLowerCase().includes(query) ||
      student.branch?.toLowerCase().includes(query)
    );
  });

  // DASHBOARD STATISTICS
  const totalBranches = new Set(
    students.map((student) => student.branch)
  ).size;

  const totalYears = new Set(
    students.map((student) => student.year)
  ).size;

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Students", icon: "♙" },
    { name: "Add Student", icon: "＋" }
  ];

  return (
    <div className="app-container">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">S</div>

          <div>
            <h2>StudentHub</h2>
            <span>Management System</span>
          </div>
        </div>

        <p className="menu-heading">MAIN MENU</p>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => {
                if (activePage === "Add Student") {
                  resetForm();
                }

                setActivePage(item.name);
                setError("");
                setSuccess("");
              }}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">A</div>

            <div>
              <strong>Administrator</strong>
              <small>Admin Account</small>
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        <header className="topbar">

          <div>
            <h2>{activePage}</h2>
            <p>
              Welcome to your student management workspace.
            </p>
          </div>

          <div className="topbar-right">

            <span
              className="status-dot"
              style={{
                background: dbConnected ? "#20b981" : "#ef4444"
              }}
            ></span>

            <span>
              {dbConnected
                ? "Database Connected"
                : "Database Offline"}
            </span>

            <div className="top-avatar">A</div>

          </div>

        </header>

        <section className="dashboard-content">

          {/* ADD / EDIT STUDENT PAGE */}
          {activePage === "Add Student" ? (

            <>

              <div className="welcome-section">

                <div>
                  <h1>
                    {editingStudentId
                      ? "Edit Student"
                      : "Add New Student"}
                  </h1>

                  <p>
                    {editingStudentId
                      ? "Update the existing student information."
                      : "Enter student details to register a new record."}
                  </p>
                </div>

              </div>

              <section className="table-section student-form-section">

                <div className="table-header">

                  <div>
                    <h2>Student Information</h2>
                    <p>All fields are mandatory.</p>
                  </div>

                </div>

                <form
                  className="student-form"
                  onSubmit={handleSubmit}
                >

                  <div className="form-grid">

                    <div className="form-group">
                      <label>Student Name *</label>

                      <input
                        type="text"
                        name="studentName"
                        placeholder="Enter full name"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address *</label>

                      <input
                        type="email"
                        name="email"
                        placeholder="student@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Roll Number *</label>

                      <input
                        type="text"
                        name="rollNumber"
                        placeholder="Enter roll number"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Branch *</label>

                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select branch</option>
                        <option value="Computer Engineering">
                          Computer Engineering
                        </option>
                        <option value="Computer Science">
                          Computer Science
                        </option>
                        <option value="Information Technology">
                          Information Technology
                        </option>
                        <option value="Mechanical Engineering">
                          Mechanical Engineering
                        </option>
                        <option value="Electrical Engineering">
                          Electrical Engineering
                        </option>
                        <option value="Civil Engineering">
                          Civil Engineering
                        </option>
                        <option value="Electronics Engineering">
                          Electronics Engineering
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Academic Year *</label>

                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">
                          Select academic year
                        </option>
                        <option value="1">First Year</option>
                        <option value="2">Second Year</option>
                        <option value="3">Third Year</option>
                        <option value="4">Fourth Year</option>
                      </select>
                    </div>

                  </div>

                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}

                  <div className="form-actions">

                    <button
                      type="button"
                      className="cancel-button"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={saving}
                    >
                      {saving
                        ? "Please wait..."
                        : editingStudentId
                          ? "Update Student"
                          : "Save Student"}
                    </button>

                  </div>

                </form>

              </section>

            </>

          ) : (

            <>

              {/* DASHBOARD / STUDENTS HEADER */}
              <div className="welcome-section">

                <div>
                  <h1>
                    {activePage === "Dashboard"
                      ? "Dashboard Overview"
                      : "All Students"}
                  </h1>

                  <p>
                    Manage your student records efficiently
                    from one place.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    resetForm();
                    setActivePage("Add Student");
                  }}
                >
                  + Add New Student
                </button>

              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="error-message">
                  {error}

                  <button onClick={fetchStudents}>
                    Retry
                  </button>
                </div>
              )}

              {/* SUCCESS MESSAGE */}
              {success && (
                <div className="success-message">
                  {success}
                </div>
              )}

              {/* DASHBOARD STATISTICS */}
              {activePage === "Dashboard" && (

                <div className="stats-grid">

                  <div className="stat-card">
                    <div className="stat-icon purple">♙</div>
                    <p>Total Students</p>
                    <h2>{loading ? "..." : students.length}</h2>
                    <small>Registered students</small>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon blue">▤</div>
                    <p>Branches</p>
                    <h2>{loading ? "..." : totalBranches}</h2>
                    <small>Different branches</small>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon green">✓</div>
                    <p>Database Status</p>

                    <h2 className="online-text">
                      {loading
                        ? "Checking..."
                        : dbConnected
                          ? "Connected"
                          : "Offline"}
                    </h2>

                    <small>MongoDB Atlas</small>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon orange">⌁</div>
                    <p>Academic Years</p>
                    <h2>{loading ? "..." : totalYears}</h2>
                    <small>Years represented in records</small>
                  </div>

                </div>

              )}

              {/* STUDENT RECORDS TABLE */}
              <section className="table-section">

                <div className="table-header">

                  <div>
                    <h2>Student Records</h2>
                    <p>Live records retrieved from MongoDB.</p>
                  </div>

                  <input
                    type="text"
                    placeholder="Search students..."
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                </div>

                <div className="table-wrapper">

                  <table>

                    <thead>
                      <tr>
                        <th>STUDENT NAME</th>
                        <th>ROLL NUMBER</th>
                        <th>EMAIL ADDRESS</th>
                        <th>BRANCH</th>
                        <th>YEAR</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>

                      {loading ? (

                        <tr>
                          <td colSpan="6" className="empty-state">
                            Loading student records...
                          </td>
                        </tr>

                      ) : filteredStudents.length === 0 ? (

                        <tr>
                          <td colSpan="6" className="empty-state">

                            <div className="empty-icon">♙</div>

                            <h3>
                              {search
                                ? "No matching students found"
                                : "No students found"}
                            </h3>

                            <p>
                              {search
                                ? "Try another search."
                                : "Your student records will appear here."}
                            </p>

                            {!search && (
                              <button
                                className="primary-button"
                                onClick={() => {
                                  resetForm();
                                  setActivePage("Add Student");
                                }}
                              >
                                + Add Your First Student
                              </button>
                            )}

                          </td>
                        </tr>

                      ) : (

                        filteredStudents.map((student) => (

                          <tr key={student._id}>

                            <td>
                              <strong>{student.studentName}</strong>
                            </td>

                            <td>{student.rollNumber}</td>

                            <td>{student.email}</td>

                            <td>{student.branch}</td>

                            <td>{student.year}</td>

                            {/* BOTH EDIT AND DELETE BUTTONS */}
                            <td className="action-buttons">

                              {/* EXISTING EDIT BUTTON - PRESERVED */}
                              <button
                                type="button"
                                className="edit-button"
                                onClick={() =>
                                  handleEditStudent(student)
                                }
                              >
                                ✎ Edit
                              </button>

                              {/* NEW DELETE BUTTON */}
                              <button
                                type="button"
                                className="delete-button"
                                onClick={() =>
                                  handleDeleteStudent(student)
                                }
                                disabled={
                                  deletingStudentId === student._id
                                }
                              >
                                {deletingStudentId === student._id
                                  ? "Deleting..."
                                  : "✕ Delete"}
                              </button>

                            </td>

                          </tr>

                        ))

                      )}

                    </tbody>

                  </table>

                </div>

              </section>

            </>

          )}

          <footer>
            StudentHub © 2026 | Student Management System
          </footer>

        </section>

      </main>

    </div>
  );
}

export default App;

import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/students/";
const LOGIN_URL = "http://127.0.0.1:8000/api/login/";

function App() {
  // =========================
  // LOGIN
  // =========================

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");

    if (username.trim() === "" || password.trim() === "") {
      setLoginError("Username and password are required.");
      return;
    }

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError("Invalid username or password.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      setIsLoggedIn(true);
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error(error);
      setLoginError("Failed to connect to Django server.");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    setIsLoggedIn(false);
    setStudents([]);
    setShowStudents(false);
  };

  // =========================
  // STUDENT STATES
  // =========================

  const [showForm, setShowForm] = useState(false);
  const [showStudents, setShowStudents] = useState(false);

  const [students, setStudents] = useState([]);

  // Search and filters
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [student, setStudent] = useState({
    student_id: "",
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    department: "",
    year: "",
    course: "",
    address: "",
  });

  // =========================
  // DASHBOARD STATISTICS
  // =========================

  const totalStudents = students.length;

  const totalDepartments = new Set(
    students
      .map((student) => student.department.toLowerCase())
      .filter((department) => department !== "")
  ).size;

  const totalCourses = new Set(
    students
      .map((student) => student.course.toLowerCase())
      .filter((course) => course !== "")
  ).size;

  // =========================
  // HANDLE INPUT CHANGES
  // =========================

  const handleChange = (event) => {
    setStudent({
      ...student,
      [event.target.name]: event.target.value,
    });
  };

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setStudent({
      student_id: "",
      name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "",
      department: "",
      year: "",
      course: "",
      address: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // FORM VALIDATION
  // =========================

  const validateForm = () => {
    if (student.student_id.trim() === "") {
      alert("Student ID is required.");
      return false;
    }

    if (student.name.trim() === "") {
      alert("Student name is required.");
      return false;
    }

    if (!/^[A-Za-z ]+$/.test(student.name.trim())) {
      alert("Student name should contain only letters.");
      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        student.email.trim()
      )
    ) {
      alert("Please enter a valid email address.");
      return false;
    }

    if (!/^\d{10}$/.test(student.phone.trim())) {
      alert("Phone number must contain exactly 10 digits.");
      return false;
    }

    if (student.date_of_birth === "") {
      alert("Date of birth is required.");
      return false;
    }

    if (student.gender === "") {
      alert("Please select gender.");
      return false;
    }

    if (student.department.trim() === "") {
      alert("Department is required.");
      return false;
    }

    const year = Number(student.year);

    if (student.year === "" || year < 1 || year > 4) {
      alert("Year must be between 1 and 4.");
      return false;
    }

    if (student.course.trim() === "") {
      alert("Course is required.");
      return false;
    }

    if (student.address.trim() === "") {
      alert("Address is required.");
      return false;
    }

    return true;
  };

  // =========================
  // ADD / UPDATE STUDENT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let response;

      const token = localStorage.getItem("token");

      // EDIT
      if (editingId !== null) {
        response = await fetch(`${API_URL}${editingId}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(student),
        });
      }

      // ADD
      else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(student),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        console.log(data);
        alert(JSON.stringify(data));
        return;
      }

      // UPDATE
      if (editingId !== null) {
        setStudents(
          students.map((item) =>
            item.id === editingId ? data : item
          )
        );

        alert("Student updated successfully!");
      }

      // ADD
      else {
        setStudents([...students, data]);

        alert("Student saved successfully!");
      }

      clearForm();
    } catch (error) {
      console.error(error);
      alert("Failed to connect to Django server.");
    }
  };

  // =========================
  // VIEW STUDENTS
  // =========================

  const handleViewStudents = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Failed to load students.");
        return;
      }

      setStudents(data);
      setShowStudents(true);
    } catch (error) {
      console.error(error);
      alert("Failed to connect to Django server.");
    }
  };

  // =========================
  // EDIT STUDENT
  // =========================

  const editStudent = (student) => {
    setStudent({
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      department: student.department,
      year: student.year,
      course: student.course,
      address: student.address,
    });

    setEditingId(student.id);
    setShowForm(true);
  };

  // =========================
  // DELETE STUDENT
  // =========================

  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        alert("Failed to delete student.");
        return;
      }

      setStudents(
        students.filter(
          (student) => student.id !== id
        )
      );

      alert("Student deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to connect to Django server.");
    }
  };

  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      student.student_id
        .toLowerCase()
        .includes(searchText) ||
      student.name
        .toLowerCase()
        .includes(searchText) ||
      student.email
        .toLowerCase()
        .includes(searchText) ||
      student.department
        .toLowerCase()
        .includes(searchText);

    const matchesDepartment =
      departmentFilter === "" ||
      student.department.toLowerCase() ===
        departmentFilter.toLowerCase();

    const matchesCourse =
      courseFilter === "" ||
      student.course.toLowerCase() ===
        courseFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesCourse
    );
  });

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!isLoggedIn) {
    return (
      <div className="app">

        <h1>Student Management System</h1>

        <div className="form-container">

          <h2>Admin Login</h2>

          <form onSubmit={handleLogin}>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

            {loginError && (
              <p style={{ color: "red" }}>
                {loginError}
              </p>
            )}

            <button type="submit">
              Login
            </button>

          </form>

        </div>

      </div>
    );
  }

  // =========================
  // MAIN APPLICATION
  // =========================

  return (
    <div className="app">

      <h1>Student Management System</h1>

      <p>
        Welcome, {localStorage.getItem("username")}
      </p>

      <button onClick={handleLogout}>
        Logout
      </button>

      {/* DASHBOARD */}

      <div className="dashboard">

        <div className="dashboard-card">
          <h3>Total Students</h3>
          <p>{totalStudents}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Departments</h3>
          <p>{totalDepartments}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Courses</h3>
          <p>{totalCourses}</p>
        </div>

      </div>

      {/* MAIN BUTTONS */}

      <button
        onClick={() => {
          clearForm();
          setShowForm(true);
        }}
      >
        Add Student
      </button>

      <button onClick={handleViewStudents}>
        View Students
      </button>

      {/* FORM */}

      {showForm && (
        <div className="form-container">

          <h2>
            {editingId !== null
              ? "Edit Student"
              : "Add Student"}
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="student_id"
              placeholder="Student ID"
              value={student.student_id}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="name"
              placeholder="Student Name"
              value={student.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={student.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={student.phone}
              onChange={handleChange}
              required
            />

            <label>Date of Birth</label>

            <input
              type="date"
              name="date_of_birth"
              value={student.date_of_birth}
              onChange={handleChange}
              required
            />

            <select
              name="gender"
              value={student.gender}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={student.department}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="year"
              placeholder="Year (1-4)"
              value={student.year}
              onChange={handleChange}
              required
              min="1"
              max="4"
            />

            <input
              type="text"
              name="course"
              placeholder="Course"
              value={student.course}
              onChange={handleChange}
              required
            />

            <textarea
              name="address"
              placeholder="Address"
              value={student.address}
              onChange={handleChange}
              required
            />

            <br />

            <button type="submit">
              {editingId !== null
                ? "Update Student"
                : "Save Student"}
            </button>

            <button
              type="button"
              onClick={clearForm}
            >
              Cancel
            </button>

          </form>
        </div>
      )}

      {/* STUDENT LIST */}

      {showStudents && (
        <div className="student-list">

          <h2>Student List</h2>

          {/* Search */}

          <input
            type="text"
            placeholder="Search by ID, Name, Email or Department"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {/* Department Filter */}

          <select
            value={departmentFilter}
            onChange={(event) =>
              setDepartmentFilter(event.target.value)
            }
          >
            <option value="">
              All Departments
            </option>

            <option value="CSE">
              CSE
            </option>

            <option value="ECE">
              ECE
            </option>

            <option value="EEE">
              EEE
            </option>

            <option value="MECH">
              MECH
            </option>

            <option value="CIVIL">
              CIVIL
            </option>
          </select>

          {/* Course Filter */}

          <select
            value={courseFilter}
            onChange={(event) =>
              setCourseFilter(event.target.value)
            }
          >
            <option value="">
              All Courses
            </option>

            <option value="B.Tech">
              B.Tech
            </option>

            <option value="M.Tech">
              M.Tech
            </option>

            <option value="MCA">
              MCA
            </option>

            <option value="MBA">
              MBA
            </option>
          </select>

          {/* Student Table */}

          {filteredStudents.length === 0 ? (

            <p>
              No students found.
            </p>

          ) : (

            <table>

              <thead>

                <tr>
                  <th>S.No</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Course</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {filteredStudents.map(
                  (student, index) => (

                    <tr key={student.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {student.student_id}
                      </td>

                      <td>
                        {student.name}
                      </td>

                      <td>
                        {student.email}
                      </td>

                      <td>
                        {student.phone}
                      </td>

                      <td>
                        {student.date_of_birth}
                      </td>

                      <td>
                        {student.gender}
                      </td>

                      <td>
                        {student.department}
                      </td>

                      <td>
                        {student.year}
                      </td>

                      <td>
                        {student.course}
                      </td>

                      <td>
                        {student.address}
                      </td>

                      <td>

                        <button
                          onClick={() =>
                            editStudent(student)
                          }
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteStudent(student.id)
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>
      )}

    </div>
  );
}

export default App;
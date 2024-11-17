import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import './styles.css';


const App = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/admin-dashboard"
        element={token && role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/user-dashboard"
        element={token && role === "user" ? <UserDashboard /> : <Navigate to="/" />}
      />
    </Routes>
  );
};

export default App;

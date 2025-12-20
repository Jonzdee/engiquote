import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateQuotation from "./pages/CreateQuotation";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import DashboardLayout from "./layout/DashboardLayout";
import History from "./pages/History";
import Template from "./pages/Template";
import ProtectedRoute from "./layout/ProtectedRoute";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Welcome />} />

        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/createquotation" element={<CreateQuotation />} />
          <Route path="/quotationhistory" element={<History />} />
          <Route path="/browsetemplate" element={<Template />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notfound" element={<NotFound />} />
        </Route>

        {/* Catch-all route for unknown paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;

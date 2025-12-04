import React from 'react'
import { Routes, Route, Link, Router } from "react-router-dom";
import Dashboard from './pages/Dashboard'
import CreateQuotation from './pages/CreateQuotation';
import EditQuotation from './pages/EditQuotation';
import ViewQuotation from './pages/ViewQuotation';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Welcome from './pages/Welcome';

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/createquotation" element={<CreateQuotation />} />
      <Route path="/editquotation" element={<EditQuotation />} />
      <Route path="/viewquotation" element={<ViewQuotation />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notfound" element={<NotFound />} />
      <Route path="/" element={<Welcome />} />
    </Routes>
  );
}

export default App
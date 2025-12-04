import React from 'react'
import { Routes, Route } from "react-router-dom";
import Dashboard from './pages/Dashboard'
import CreateQuotation from './pages/CreateQuotation';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Welcome from './pages/Welcome';
import DashboardLayout from './layout/DashboardLayout';
import History from './pages/History';
import Template from './pages/Template';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/" element={<Welcome />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createquotation" element={<CreateQuotation />} />
        <Route path="/quotationhistory" element={<History />} />
        <Route path="/browsetemplate" element={<Template />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notfound" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App
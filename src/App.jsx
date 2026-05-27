import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import UserPortal from "./UserPortal";
import AdminPortal from "./AdminPortal";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing page — talent/recruiter split */}
        <Route path="/" element={<LandingPage />} />

        {/* User portal — handles both candidate & employer login internally */}
        {/* ?role=candidate or ?role=employer is read by UserPortal to pre-select the right tab */}
        <Route path="/portal" element={<UserPortal />} />

        {/* Stealth admin path */}
        <Route path="/admin-dashboard-login" element={<AdminPortal />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserPortal from "./UserPortal";
import AdminPortal from "./AdminPortal";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main domain loads directly into the User Portal */}
        <Route path="/" element={<UserPortal />} />

        {/* Secret stealth URL — only those who know the path can reach admin */}
        <Route path="/admin-dashboard-login" element={<AdminPortal />} />

        {/* Catch-all: unknown paths redirect back to the User Portal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

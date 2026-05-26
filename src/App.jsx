import { useState } from "react";
import UserPortal from "./UserPortal";
import AdminPortal from "./AdminPortal";

export default function App() {
  const [user, setUser] = useState(null); // Tracks who is logged in

  // If no one is logged in, show this simple entry screen
  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
        <h2>Welcome to TalentBridge</h2>
        <p>Select your portal gateway:</p>
        <button 
          onClick={() => setUser({ role: "user" })} 
          style={{ padding: "10px 20px", background: "#2563EB", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}
        >
          Enter User Portal
        </button>
        <button 
          onClick={() => setUser({ role: "admin" })} 
          style={{ marginLeft: 15, padding: "10px 20px", background: "#0A1628", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}
        >
          Enter Admin Portal
        </button>
      </div>
    );
  }

  // Route them to the correct file based on their selection
  return user.role === "admin" ? <AdminPortal /> : <UserPortal />;
}

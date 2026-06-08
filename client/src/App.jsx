import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ChatPage from "./pages/ChatPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const user = localStorage.getItem("chatUser");

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/" />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
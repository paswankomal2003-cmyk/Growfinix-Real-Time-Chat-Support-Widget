import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  Bot,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Download,
  Eye,
  Trash2,
  Moon,
  Sun,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const socket = io("http://localhost:5000");

function AdminDashboard() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    socket.emit("admin_join");

    socket.on("admin_history", (data) => {
      setMessages(data);
    });

    socket.on("admin_new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("admin_history");
      socket.off("admin_new_message");
    };
  }, []);

  const users = useMemo(() => {
    const uniqueUsers = {};

    messages.forEach((msg) => {
      if (msg.sender === "user") {
        uniqueUsers[msg.username] = {
          name: msg.username,
          email: `${msg.username?.toLowerCase() || "user"}@gmail.com`,
          status: "Online",
          joined: new Date().toLocaleDateString(),
          lastMessage: msg.text || msg.fileName || "File shared",
        };
      }
    });

    return Object.values(uniqueUsers);
  }, [messages]);

  const files = messages.filter((msg) => msg.type === "file");
  const userMessages = messages.filter((msg) => msg.sender === "user");
  const aiMessages = messages.filter((msg) => msg.sender === "ai");

  const questionStats = [
    { name: "Login Issue", value: userMessages.filter((m) => m.text?.toLowerCase().includes("login")).length || 2 },
    { name: "Pricing", value: userMessages.filter((m) => m.text?.toLowerCase().includes("price")).length || 1 },
    { name: "Contact", value: userMessages.filter((m) => m.text?.toLowerCase().includes("contact")).length || 1 },
    { name: "Error", value: userMessages.filter((m) => m.text?.toLowerCase().includes("error")).length || 1 },
  ];

  const chatChartData = [
    { name: "Users", count: users.length },
    { name: "Chats", count: userMessages.length },
    { name: "AI Replies", count: aiMessages.length },
    { name: "Files", count: files.length },
  ];

  const filteredMessages = messages.filter((msg) =>
    (msg.text || msg.fileName || msg.username || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const downloadReport = () => {
    const report = messages
      .map((msg) =>
        msg.type === "file"
          ? `${msg.username}: uploaded ${msg.fileName} (${msg.time})`
          : `${msg.username || msg.sender}: ${msg.text} (${msg.time})`
      )
      .join("\n");

    const blob = new Blob([report], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "admin-chat-report.txt";
    link.click();
  };

  const clearDashboard = () => {
    setMessages([]);
  };

  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Live Chats", icon: MessageCircle },
    { name: "Users", icon: Users },
    { name: "AI Analytics", icon: Bot },
    { name: "File Uploads", icon: FileText },
    { name: "Reports", icon: BarChart3 },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      
      {/* Sidebar */}
      <aside className="w-72 bg-[#0F172A] text-white p-6 hidden md:block">
        <h1 className="text-3xl font-bold mb-10">NexaChat</h1>

        <nav className="space-y-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                  activeMenu === item.name
                    ? "bg-blue-500"
                    : "hover:bg-slate-700"
                }`}
              >
                <Icon size={20} />
                {item.name}
              </button>
            );
          })}

          <button
            onClick={() => navigate("/chat")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500"
          >
            <LogOut size={20} />
            Back to Chat
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold">{activeMenu}</h2>
            <p className="text-gray-500">
              Monitor chats, users, files, reports, and AI support activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-xl border outline-none text-black"
              />
            </div>

            <button className="relative p-3 bg-white text-black rounded-xl shadow">
              <Bell />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {messages.length}
              </span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 bg-white text-black rounded-xl shadow"
            >
              {darkMode ? <Sun /> : <Moon />}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <StatCard title="Total Users" value={users.length} icon={<Users />} />
          <StatCard title="Active Chats" value={userMessages.length} icon={<MessageCircle />} />
          <StatCard title="AI Responses" value={aiMessages.length} icon={<Bot />} />
          <StatCard title="Files Shared" value={files.length} icon={<FileText />} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <Card title="Chat Analytics">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chatChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Top Asked Questions">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={questionStats}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {questionStats.map((_, index) => (
                    <Cell
                      key={index}
                      fill={["#3B82F6", "#22C55E", "#F97316", "#A855F7"][index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Live Chat Monitoring */}
        <Card title="Live Chat Monitoring">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-3">User</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Message</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td className="p-3 text-gray-500" colSpan="4">
                      No user chats yet.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 font-semibold">{user.name}</td>
                      <td className="p-3">
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                          {user.status}
                        </span>
                      </td>
                      <td className="p-3">{user.lastMessage}</td>
                      <td className="p-3">
                        <button className="px-3 py-2 bg-blue-500 text-white rounded-lg">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Messages + Users */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <Card title="Recent Messages">
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {filteredMessages.slice(-8).reverse().map((msg, index) => (
                <div key={index} className="border rounded-xl p-4">
                  <p className="font-bold">{msg.username || msg.sender}</p>
                  <p className="text-sm text-gray-500">{msg.time}</p>

                  {msg.type === "file" ? (
                    <p className="mt-2">Uploaded: {msg.fileName}</p>
                  ) : (
                    <p className="mt-2">{msg.text}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card title="User Management">
            <div className="space-y-3">
              {users.map((user, index) => (
                <div key={index} className="flex items-center justify-between border rounded-xl p-4">
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-100 text-blue-500 rounded-lg">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 bg-red-100 text-red-500 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* File Uploads + Tickets */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <Card title="File Upload Monitoring">
            <div className="space-y-4">
              {files.length === 0 ? (
                <p className="text-gray-500">No files uploaded yet.</p>
              ) : (
                files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between border rounded-xl p-4">
                    <div>
                      <p className="font-bold">{file.fileName}</p>
                      <p className="text-sm text-gray-500">{file.fileType}</p>
                    </div>

                    <a
                      href={file.fileData}
                      download={file.fileName}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      Download
                    </a>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="Support Tickets">
            <div className="grid grid-cols-3 gap-4">
              <Ticket title="Open" value={12} />
              <Ticket title="Resolved" value={48} />
              <Ticket title="Pending" value={4} />
            </div>

            <div className="mt-6 space-y-3">
              <p className="border p-3 rounded-xl">Login issue reported</p>
              <p className="border p-3 rounded-xl">Payment question received</p>
              <p className="border p-3 rounded-xl">File upload issue</p>
            </div>
          </Card>
        </div>

        {/* Reports + Settings */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <Card title="Reports">
            <p className="mb-4 text-gray-500">
              Download chat reports and admin activity logs.
            </p>

            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-xl"
            >
              <Download size={20} />
              Download Report
            </button>
          </Card>

          <Card title="Settings">
            <div className="space-y-4">
              <button
                onClick={clearDashboard}
                className="px-5 py-3 bg-red-500 text-white rounded-xl"
              >
                Clear Dashboard Data
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-5 py-3 bg-gray-800 text-white rounded-xl"
              >
                Toggle Theme
              </button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white text-black rounded-2xl shadow p-6 flex items-center justify-between">
      <div>
        <p className="text-gray-500">{title}</p>
        <h3 className="text-4xl font-bold mt-2">{value}</h3>
      </div>

      <div className="bg-blue-100 text-blue-500 p-4 rounded-xl">
        {icon}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white text-black rounded-2xl shadow p-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Ticket({ title, value }) {
  return (
    <div className="bg-blue-50 text-blue-600 rounded-xl p-4 text-center">
      <h4 className="text-2xl font-bold">{value}</h4>
      <p>{title}</p>
    </div>
  );
}

export default AdminDashboard;
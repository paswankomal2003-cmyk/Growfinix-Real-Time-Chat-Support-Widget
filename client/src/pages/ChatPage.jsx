import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Moon,
  Sun,
  Download,
  ShieldCheck,
  LogOut,
  Paperclip,
  Smile,
  Search,
  Lightbulb,
  Send,
  Plus,
} from "lucide-react";

const socket = io("http://localhost:5000");

function ChatPage() {
  const navigate = useNavigate();
  const user = localStorage.getItem("chatUser");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("chatMessages")) || []
  );
  const [typing, setTyping] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [online, setOnline] = useState(socket.connected);

  const bottomRef = useRef(null);
  const emojis = ["😀", "😂", "😍", "👍", "❤️", "🙏", "🔥", "✨", "😎", "🥳"];

  useEffect(() => {
    socket.on("connect", () => setOnline(true));
    socket.on("disconnect", () => setOnline(false));

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_typing", (name) => setTyping(`${name} is typing...`));
    socket.on("user_stop_typing", () => setTyping(""));
    socket.on("bot_typing", () => setBotTyping(true));
    socket.on("bot_stop_typing", () => setBotTyping(false));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("bot_typing");
      socket.off("bot_stop_typing");
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (customText) => {
    const textToSend = customText || message;
    if (!textToSend.trim()) return;

    socket.emit("send_message", {
      sender: "user",
      username: user,
      text: textToSend,
      type: "text",
      time: new Date().toLocaleTimeString(),
    });

    socket.emit("stop_typing");
    setMessage("");
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", user);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      socket.emit("send_message", {
        sender: "user",
        username: user,
        type: "file",
        fileName: file.name,
        fileType: file.type,
        fileData: reader.result,
        time: new Date().toLocaleTimeString(),
      });
    };

    reader.readAsDataURL(file);
  };

  const newChat = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };

  const downloadChat = () => {
    const text = messages
      .map((msg) =>
        msg.type === "file"
          ? `${msg.username}: Sent file ${msg.fileName} (${msg.time})`
          : `${msg.username || msg.sender}: ${msg.text} (${msg.time})`
      )
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chat-history.txt";
    link.click();
  };

  const logout = () => {
    localStorage.removeItem("chatUser");
    navigate("/");
  };

  const quickReplies = [
    "Hello",
    "Login issue",
    "Pricing",
    "Contact support",
    "I have an error",
  ];

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        darkMode ? "bg-gray-900" : "bg-blue-500"
      }`}
    >
      <div
        className={`w-[95%] max-w-[700px] h-[90vh] rounded-[30px] shadow-2xl flex flex-col overflow-hidden ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-10 py-5">
          <button
            onClick={newChat}
            title="New Chat"
            className="p-2 rounded-full hover:bg-gray-100 hover:text-blue-500"
          >
            <Plus size={24} />
          </button>

          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold">NexaChat</h1>
            <p className={online ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
              {online ? "Online" : "Offline"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Theme"
              className="p-2 rounded-full hover:bg-gray-100 hover:text-blue-500"
            >
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            <button
              onClick={downloadChat}
              title="Download Chat"
              className="p-2 rounded-full hover:bg-gray-100 hover:text-blue-500"
            >
              <Download size={22} />
            </button>

            <button
              onClick={() => navigate("/admin")}
              title="Admin Dashboard"
              className="p-2 rounded-full hover:bg-gray-100 hover:text-blue-500"
            >
              <ShieldCheck size={22} />
            </button>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-full hover:bg-gray-100 hover:text-red-500"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-10">
          {messages.length === 0 && (
            <div className="mt-12 md:mt-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold">
                What can I help with?
              </h2>

              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {quickReplies.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(item)}
                    className="px-4 py-2 border rounded-full text-sm hover:bg-blue-500 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl max-w-[85%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white ml-auto"
                    : darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-black"
                }`}
              >
                {msg.type === "file" ? (
                  msg.fileType?.startsWith("image") ? (
                    <img
                      src={msg.fileData}
                      alt={msg.fileName}
                      className="rounded-xl max-w-full"
                    />
                  ) : (
                    <a href={msg.fileData} download={msg.fileName} className="underline">
                      {msg.fileName}
                    </a>
                  )
                ) : (
                  <p>{msg.text}</p>
                )}

                <span className="text-xs opacity-70">{msg.time}</span>
              </div>
            ))}

            {typing && <p className="text-sm text-gray-500 italic">{typing}</p>}

            {botTyping && (
              <p className={darkMode ? "text-gray-300" : "text-gray-500"}>
                NexaChat is typing...
              </p>
            )}

            <div ref={bottomRef}></div>
          </div>
        </div>

        <div className="px-4 md:px-8 pb-5">
          {showEmoji && (
            <div className="mb-3 bg-white border rounded-xl p-3 flex gap-3 flex-wrap">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(message + emoji)}
                  className="text-2xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div
            className={`border shadow-xl rounded-[28px] p-4 ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-white"
            }`}
          >
            <input
              value={message}
              onChange={handleTyping}
              onBlur={() => socket.emit("stop_typing")}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Message..."
              className="w-full text-lg md:text-xl outline-none mb-4 bg-transparent"
            />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                <label
                  title="Attach File"
                  className="w-11 h-11 rounded-full border flex items-center justify-center cursor-pointer hover:bg-blue-500 hover:text-white"
                >
                  <Paperclip size={21} />
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>

                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  title="Emoji"
                  className="w-11 h-11 rounded-full border flex items-center justify-center hover:bg-blue-500 hover:text-white"
                >
                  <Smile size={21} />
                </button>

                <button
                  onClick={() => sendMessage("Search help")}
                  className="px-4 h-11 rounded-full border font-semibold flex items-center gap-2 hover:bg-blue-500 hover:text-white"
                >
                  <Search size={18} />
                  Search
                </button>

                <button
                  onClick={() => sendMessage("Explain this clearly")}
                  className="px-4 h-11 rounded-full border font-semibold flex items-center gap-2 hover:bg-blue-500 hover:text-white"
                >
                  <Lightbulb size={18} />
                  Reason
                </button>
              </div>

              <button
                onClick={() => sendMessage()}
                className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600"
              >
                <Send size={21} />
              </button>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-4 text-sm">
            NexaChat can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
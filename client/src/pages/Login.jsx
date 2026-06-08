import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const name = e.target.username.value;
    const password = e.target.password.value;

    if (!name || !password) {
      alert("Please enter username and password");
      return;
    }

    localStorage.setItem("chatUser", name);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-[850px] h-[430px] bg-white rounded-[28px] shadow-2xl flex overflow-hidden relative">
        
        <div className="w-1/2 bg-blue-500 text-white flex flex-col justify-center px-16 relative">
          <h1 className="text-2xl font-bold">Welcome to AI Support</h1>
          <div className="w-16 h-1 bg-white mt-4 mb-7"></div>

          <p className="text-sm leading-relaxed">
            Chat with our real-time AI support assistant. Get instant replies,
            typing status, and smooth live communication.
          </p>

          <button
            type="button"
            className="mt-8 w-32 py-3 border border-white rounded-full text-sm"
          >
            Know More
          </button>

          <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full flex items-center justify-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full"></div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col justify-center items-center px-16 relative">
          <h2 className="text-2xl font-bold text-gray-700">Signin</h2>
          <div className="w-10 h-1 bg-blue-500 mt-2 mb-10"></div>

          <form onSubmit={handleLogin} className="w-full space-y-8">
            <input
              name="username"
              placeholder="Enter Username ..."
              className="w-full border-b border-gray-300 py-2 outline-none text-sm"
            />

            <input
              name="password"
              type="password"
              placeholder="Enter Password ..."
              className="w-full border-b border-gray-300 py-2 outline-none text-sm"
            />

            <button className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg">
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
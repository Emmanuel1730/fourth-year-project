import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import logo from "../../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { accessToken, refreshToken, user } = res.data;

      // Enforce admin-only login
      if (user.role !== "ADMIN") {
        setErrorMsg("Access denied. Admins only.");
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/");

    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMsg("Invalid email or password.");
      } else {
        setErrorMsg("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2ea043]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#388bfd]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-[#1c2330] to-[#161b22] border-b border-[#21262d]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-[#2ea043] rounded-xl flex items-center justify-center overflow-hidden">
                <img src={logo} alt="EduLib Logo" />
              </div>
              <div>
                <h1 className="font-serif text-2xl text-[#e6edf3]">EduLib</h1>
                <p className="text-[#6e7681] text-xs uppercase tracking-wider">
                  Malawi · Admin
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-[#e6edf3] mt-4">
              Welcome Back
            </h2>
            <p className="text-[#8b949e] text-sm">
              Sign in to access the dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Error Message */}
            {errorMsg && (
              <div className="px-3 py-2 rounded-lg bg-[#3d1f1f] border border-[#f85149] text-[#f85149] text-sm text-center">
                {errorMsg}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs text-[#8b949e] uppercase mb-1 block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#388bfd]"
                placeholder="admin@edulib.mw"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-[#8b949e] uppercase mb-1 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-sm text-white pr-10 outline-none focus:border-[#388bfd]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-gray-400"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex justify-between text-sm">
              <label className="flex items-center gap-2 text-[#8b949e]">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                Remember me
              </label>

              <button
                type="button"
                className="text-[#388bfd]"
                onClick={() => alert("Password reset coming soon")}
              >
                Forgot password?
              </button>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2ea043] py-3 rounded-lg text-white font-semibold hover:bg-[#3fb950] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Footer */}
          <div className="px-8 py-4 bg-[#1c2330] border-t border-[#21262d] text-center text-xs text-[#6e7681]">
            © 2026 EduLib Malawi
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2ea043]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#388bfd]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden shadow-2xl">
          {/* Header with gradient */}
          <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-[#1c2330] to-[#161b22] border-b border-[#21262d]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-[#2ea043] rounded-xl flex items-center justify-center overflow-hidden">
                <img 
                  src={logo} 
                  alt="EduLib Logo" 
                   
                />
              </div>
              <div>
                <h1 className="font-serif text-2xl text-[#e6edf3]">EduLib</h1>
                <p className="text-[#6e7681] text-xs uppercase tracking-wider">Malawi · Admin</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-[#e6edf3] mt-4">Welcome Back</h2>
            <p className="text-[#8b949e] text-sm">Sign in to access the admin dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Email Field */}
            <div>
              <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5 block">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]">📧</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg pl-10 pr-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd]"
                  placeholder="admin@edulib.mw"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg pl-10 pr-10 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7681] hover:text-[#e6edf3] transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-[#21262d] bg-[#1c2330] text-[#2ea043] focus:ring-[#2ea043] focus:ring-offset-0 focus:ring-1"
                />
                <span className="text-sm text-[#8b949e] group-hover:text-[#e6edf3] transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset coming soon!')}
                className="text-sm text-[#388bfd] hover:underline transition-all"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#2ea043] text-white py-3 px-4 rounded-lg text-base font-semibold hover:bg-[#3fb950] transition-all duration-200 shadow-lg shadow-[#2ea043]/20"
            >
              Sign In
            </button>

            {/* Additional Links */}
            <p className="text-center text-[#6e7681] text-xs">
              By signing in, you agree to our{' '}
              <button className="text-[#388bfd] hover:underline transition-all">Terms</button>
              {' '}and{' '}
              <button className="text-[#388bfd] hover:underline transition-all">Privacy Policy</button>
            </p>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 bg-[#1c2330] border-t border-[#21262d]">
            <p className="text-center text-[#6e7681] text-xs">
              © 2026 EduLib Malawi. All rights reserved.
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1c2330] border border-[#21262d] rounded-full text-xs text-[#8b949e] hover:border-[#388bfd]/30 transition-all">
            <span className="w-2 h-2 bg-[#2ea043] rounded-full animate-pulse"></span>
            Secure Admin Access · SSL Encrypted
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
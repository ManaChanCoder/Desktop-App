import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo-white.png";
import { Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../db/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider();

  // Check if the user is already logged in when the component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, navigate to the dashboard
        navigate("/dashboard");
      }
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid username or password");
      toast.error("Invalid username or password. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Google login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="w-full h-screen">
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-2xl bg-white">
        <div className="w-[600px] h-[380px] flex flex-row">
          <div className="px-2 py-3 w-2/4 bg-[#a2292e]">
            <div className="flex flex-col text-white h-full ">
              <img
                src={Logo}
                alt="Logo"
                className="self-center mt-[50px] w-[200px] h-[150px]"
              />
              <span className="uppercase text-3xl font-bold text-center">
                petsville
              </span>
            </div>
          </div>
          <div className="w-2/4 px-2">
            <div className="w-full h-full flex flex-col justify-center gap-3">
              <form onSubmit={handleLogin} className="flex flex-col gap-1">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="outline-0 border text-base px-2 py-1 border-black border-solid mb-5"
                  required
                />
                <label htmlFor="password">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="outline-0 border text-base px-2 py-1 border-black border-solid"
                  required
                />
                {error && (
                  <p className="text-red-500 text-sm text-center mt-1">
                    {error}
                  </p>
                )}
              </form>
              <div className="flex flex-row justify-between items-center">
                <span className="text-sm flex flex-row gap-1">
                  <input
                    type="checkbox"
                    className="cursor-pointer place-items-center"
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />{" "}
                  Remember Me
                </span>
                <Link
                  to="/forgot-password"
                  className="text-blue-400 underline text-sm cursor-pointer"
                >
                  Forgot Password
                </Link>
              </div>
              <div className="w-full">
                <button
                  onClick={handleLogin}
                  className="bg-[#a2292e] rounded-xl active:bg-gray-200 text-white active:text-black w-full py-2 text-base"
                >
                  Login
                </button>
              </div>
              <div className="w-full mt-2">
                <button
                  onClick={handleGoogleLogin}
                  className=" text-[#073273] w-full py-2 text-base flex items-center justify-center gap-2"
                >
                  <img
                    src="https://img.icons8.com/color/16/000000/google-logo.png"
                    alt="Google icon"
                  />
                  Sign in with Google
                </button>
              </div>
              <div className="text-sm mt-2 text-center">
                <span>
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-[#073273] hover:underline"
                  >
                    Register
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toastify Container */}
      <ToastContainer className="absolute left-[2%]" />
    </div>
  );
};

export default Login;

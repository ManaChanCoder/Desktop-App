import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../db/firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to control password visibility
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please check your entries.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User registered successfully:", user);

      const userCollectionRef = collection(db, "users");
      await addDoc(userCollectionRef, {
        username,
        email,
      });

      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setEmail("");

      toast.success("Registration successful! Welcome aboard.");
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error(
        "Registration failed or Email is already Exist. Please try again later."
      );
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Google User signed in:", user);

      const userCollectionRef = collection(db, "users");
      await addDoc(userCollectionRef, {
        username: user.displayName || "Unnamed User",
        email: user.email,
      });

      toast.success("Google registration successful! Welcome aboard.");
      navigate("/");
    } catch (error) {
      console.error("Error during Google registration:", error);
      toast.error("Google registration failed. Please try again.");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-r from-[#eb3349] to-[#f45c43] flex flex-row justify-center items-center">
      <div className="flex flex-col gap-1 w-[40%] bg-white shadow-xl px-10 py-5 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="uppercase text-[22px] font-medium">
            Register Account
          </span>
          <Link to="..">
            <IoCloseOutline
              size={40}
              className="border-[1px] rounded-full bg-[#a2292e] text-white cursor-pointer"
            />
          </Link>
        </div>

        <form onSubmit={handleRegister} className="grid gap-2 mt-5">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border-[1px] border-gray-300 px-2 py-1 outline-none"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-[1px] border-gray-300 px-2 py-1 outline-none"
            required
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border-[1px] border-gray-300 px-2 py-1 outline-none"
            required
          />

          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-[1px] border-gray-300 px-2 py-1 outline-none"
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="cursor-pointer"
            />
            <label>Remember Me</label>
          </div>

          <button
            type="submit"
            className="bg-[#a2292e] active:bg-slate-200 text-white active:text-black rounded-md text-base py-2 my-3"
          >
            Register
          </button>
        </form>

        <button
          onClick={handleGoogleSignUp}
          className="text-[#073273] text-base py-2 my-3 flex items-center justify-center gap-2"
        >
          <img
            src="https://img.icons8.com/color/16/000000/google-logo.png"
            alt="Google icon"
          />
          Register with Google
        </button>
      </div>

      <ToastContainer className="absolute left-[2%]" />
    </div>
  );
};

export default Register;

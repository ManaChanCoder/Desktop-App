import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../db/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      // Use the imported and properly initialized `auth`
      await sendPasswordResetEmail(auth, email);
      toast.success(
        "A password reset email has been sent. Please check your inbox."
      );
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
      />
      <div className="bg-white text-white flex justify-center items-center flex-col w-full h-screen">
        <div className="w-[500px] bg-[#a2292e] flex flex-row justify-center h-auto py-5 px-10 rounded-lg">
          <div className="w-[75%] grid gap-3">
            <h1 className="text-center font-semibold text-3xl mb-3">
              Enter your email to reset Password
            </h1>

            <form onSubmit={handleReset} className="grid gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[1px] rounded-lg text-black border-gray-400 outline-none px-3 py-2 w-full"
                required
                placeholder="Email address..."
              />
              <button
                type="submit"
                className="w-full rounded-2xl py-2 bg-[#073273] active:bg-gray-200 text-white active:text-black text-base my-1"
              >
                Reset
              </button>
            </form>

            <div className="text-sm font-light">
              I have an account.{" "}
              <Link to=".." className="hover:underline hover:text-[#073273]">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

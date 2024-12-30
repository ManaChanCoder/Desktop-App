import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="w-full my-10 h-[500px] flex flex-col justify-center items-center col-span-1">
      <div className="px-10 py-5">
        <h1 className="text-3xl font-semibold capitalize text-center">
          page not found
        </h1>
        <span className="block text-lg font-light my-5 text-center">
          The page you are looking for cannot be found.
        </span>

        <div className="flex flex-row justify-center row-span-1">
          <Link
            to="/dashboard"
            className="text-lg font-bold uppercase px-10 py-2 border-[1px] border-solid border-[#c94238] hover:bg-[#c94238] hover:text-white rounded-lg"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

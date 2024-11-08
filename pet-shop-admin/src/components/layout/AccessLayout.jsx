import React from "react";
import { Outlet } from "react-router-dom";
import LeftSideBar from "../../pages/LeftSideBar";
import "../../shared/style/dashboard.css";

const AccessLayout = () => {
  return (
    <div className="w-full min-h-screen bg-teal-700">
      <div className="flex flex-row">
        {/* left box */}
        <LeftSideBar />
        {/*  */}
        {/* right box */}
        <Outlet />
      </div>
    </div>
  );
};

export default AccessLayout;

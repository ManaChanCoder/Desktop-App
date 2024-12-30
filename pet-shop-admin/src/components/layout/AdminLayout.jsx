import React from "react";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="bg-[#f2f2f2]">
      <Outlet />
    </div>
  );
};

export default AdminLayout;

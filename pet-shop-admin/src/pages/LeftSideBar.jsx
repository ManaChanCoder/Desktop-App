import React, { useState, useEffect } from "react";
import { AiOutlineProduct } from "react-icons/ai";
import { BsCartCheckFill } from "react-icons/bs";
import { MdDashboard, MdCategory, MdOutlineInventory } from "react-icons/md";
import { RiCheckboxMultipleLine } from "react-icons/ri";
import { IoIosNotifications } from "react-icons/io";
import Logo from "../assets/logo.png";
import { Link } from "react-router-dom";

const LeftSideBar = () => {
  const [activeItem, setActiveItem] = useState("dashboard");

  useEffect(() => {
    // Get the saved active item from localStorage
    const savedActiveItem = localStorage.getItem("activeItem");
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }
  }, []);

  const handleItemClick = (item) => {
    setActiveItem(item);
    localStorage.setItem("activeItem", item); // Save the active item to localStorage
  };

  return (
    <div className="w-[20%] p-5 overflow-hidden">
      <div className="flex flex-col justify-center gap-5">
        <div className="flex justify-center items-center w-full h-[150px]">
          <img
            src={Logo}
            alt="Logo"
            className="w-[80px] h-[80px] bg-white rounded-full"
          />
        </div>
      </div>
      <div className="flex flex-col gap-5 border-t border-white">
        <div
          onClick={() => handleItemClick("dashboard")}
          className={`flex flex-row gap-1 items-center mt-[100px] ml-5 cursor-pointer hover:scale-[1.05] select-none ${
            activeItem === "dashboard"
              ? "text-orange-500 scale-[1.05]"
              : "text-white"
          }`}
        >
          <MdDashboard size={20} />
          <Link to="/dashboard" className="capitalize text-lg">
            dashboard
          </Link>
        </div>
        <div
          onClick={() => handleItemClick("category")}
          className={`flex flex-row gap-1 items-center ml-5 cursor-pointer hover:scale-[1.05] select-none ${
            activeItem === "category"
              ? "text-orange-500 scale-[1.05]"
              : "text-white"
          }`}
        >
          <MdCategory size={20} />
          <Link to="/category" className="capitalize text-lg">
            Category
          </Link>
        </div>
        <div
          onClick={() => handleItemClick("products")}
          className={`flex flex-row gap-1 items-center ml-5 cursor-pointer hover:scale-[1.05] select-none ${
            activeItem === "products"
              ? "text-orange-500 scale-[1.05]"
              : "text-white"
          }`}
        >
          <AiOutlineProduct size={20} />
          <Link to="/product" className="capitalize text-lg">
            Products
          </Link>
        </div>
        <div
          onClick={() => handleItemClick("inventory")}
          className={`flex flex-row gap-1 items-center ml-5 cursor-pointer hover:scale-[1.05] select-none ${
            activeItem === "inventory"
              ? "text-orange-500 scale-[1.05]"
              : "text-white"
          }`}
        >
          <MdOutlineInventory size={20} />
          <Link to="/casher" className="capitalize text-lg">
            Cashier
          </Link>
        </div>
        <div
          onClick={() => handleItemClick("orders")}
          className={`flex flex-row gap-1 items-center ml-5 cursor-pointer hover:scale-[1.05] select-none ${
            activeItem === "orders"
              ? "text-orange-500 scale-[1.05]"
              : "text-white"
          }`}
        >
          <BsCartCheckFill size={20} />
          <Link to="/order" className="capitalize text-lg">
            Orders
          </Link>
        </div>
        <div
          onClick={() => handleItemClick("orderhistory")}
          className={`flex flex-row gap-1 items-center ml-5 cursor-pointer hover:scale-[1.05] select-none ${
            activeItem === "orderhistory"
              ? "text-orange-500 scale-[1.05]"
              : "text-white"
          }`}
        >
          <RiCheckboxMultipleLine size={20} />
          <Link to="/orderhistory" className="capitalize text-lg">
            Order History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;

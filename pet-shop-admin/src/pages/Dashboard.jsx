import React, { useState, useEffect } from "react";
import { MdOutlineInventory2 } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { BiCategoryAlt } from "react-icons/bi";
import { FaPeopleGroup } from "react-icons/fa6";
import SalesReport from "../shared/SalesReport";
import { db, auth } from "../db/firebase";
import {
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth"; // Import signOut from Firebase
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const Dashboard = () => {
  const [productImageCount, setProductImageCount] = useState(0);
  const [uniqueBrandCount, setUniqueBrandCount] = useState(0);
  const [visitorCount, setVisitorCount] = useState(0); // Reflects real-time visitor count
  const [currentTime, setCurrentTime] = useState(""); // State to hold current time

  const navigate = useNavigate(); // Hook for redirection

  useEffect(() => {
    // Listener for counting products with an `imageName` field
    const productCollectionRef = collection(db, "pet-food-pet-accessories");
    const unsubscribeProducts = onSnapshot(productCollectionRef, (snapshot) => {
      const productCount = snapshot.docs.filter(
        (doc) => doc.data().imageName
      ).length;
      setProductImageCount(productCount);
    });

    // Listener for counting unique brands in categories
    const categoryCollectionRef = collection(db, "pet-food-pet-accessories");
    const unsubscribeCategories = onSnapshot(
      categoryCollectionRef,
      (snapshot) => {
        const categories = new Set();
        snapshot.docs.forEach((doc) => {
          const brand = doc.data().brand;
          if (brand) categories.add(brand);
        });
        setUniqueBrandCount(categories.size);
      }
    );

    // Real-time listener for website visits
    const visitCollectionRef = collection(db, "visitors");
    const unsubscribeVisits = onSnapshot(visitCollectionRef, (snapshot) => {
      setVisitorCount(snapshot.size); // Count the number of visits
    });

    // Record a new visit on component mount
    const recordVisit = async () => {
      try {
        await addDoc(visitCollectionRef, {
          timestamp: serverTimestamp(), // optional field to track time
        });
      } catch (error) {
        console.error("Error recording visit:", error);
      }
    };
    recordVisit();

    // Set the current time and update it every second
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString()); // Update current time
    };
    const timeInterval = setInterval(updateTime, 1000); // Update every second

    // Clean up listeners on component unmount
    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeVisits();
      clearInterval(timeInterval); // Clear the time interval on unmount
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign out
      navigate("/"); // Redirect to login page after sign out
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="w-[80%] text-white px-5 py-7 flex flex-col gap-5 overflow-y-auto h-screen">
      <div className="w-full flex justify-between">
        <div className="">
          <span className="text-2xl font-bold">Dashboard</span>
        </div>
        <div className="flex gap-10">
          <span className="text-lg self-center">{currentTime}</span>
          <button
            onClick={handleLogout}
            className="text-base text-white bg-red-500 hover:bg-red-700 px-3 py-2 rounded-lg"
          >
            Log out
          </button>
        </div>
      </div>
      <div className="flex flex-col py-5 border-t gap-5 border-white w-full">
        <div className="flex flex-row justify-center gap-3">
          <div className="w-[320px] h-[130px] px-5 py-3 bg-sky-600 flex flex-col gap-10 ">
            <div className="flex flex-row justify-between">
              <span className="uppercase font-bold">products</span>
              <MdOutlineInventory2 size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold">{productImageCount}</span>
          </div>
          <div className="w-[320px] h-[130px] px-5 py-3 bg-orange-400 flex flex-col gap-10 ">
            <div className="flex flex-row justify-between">
              <span className="uppercase font-bold">Categories</span>
              <BiCategoryAlt size={24} className="text-white " />
            </div>
            <span className="text-2xl font-bold">{uniqueBrandCount}</span>
          </div>
          <div className="w-[320px] h-[130px] px-5 py-3 bg-green-700 flex flex-col gap-10 ">
            <div className="flex flex-row justify-between">
              <span className="uppercase font-bold">Analytics</span>
              <FaPeopleGroup size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold">{visitorCount}</span>
          </div>
        </div>
        <div className="">
          <SalesReport />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

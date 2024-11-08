import React, { useState, useEffect } from "react";
import { MdOutlineInventory2 } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { BiCategoryAlt } from "react-icons/bi";
import { FaPeopleGroup } from "react-icons/fa6";
import SalesReport from "../shared/SalesReport";
import { db } from "../db/firebase";
import { onSnapshot, collection } from "firebase/firestore";

const Dashboard = () => {
  const [productImageCount, setProductImageCount] = useState(0);
  const [uniqueBrandCount, setUniqueBrandCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(1500); // Example static count
  const [notificationCount, setNotificationCount] = useState(56); // Example static count

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
    const visitCollectionRef = collection(db, "website-visits");
    const unsubscribeVisits = onSnapshot(visitCollectionRef, (snapshot) => {
      setCustomerCount(snapshot.size); // Count the number of visits
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

    // Clean up listeners on component unmount
    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeVisits();
    };
  }, []);

  return (
    <div className="w-[80%] text-white px-5 py-7 flex flex-col gap-5 overflow-y-auto h-screen">
      <div className="w-full">
        <div className="">
          <span className="text-2xl font-bold">Dashboard</span>
        </div>
      </div>
      <div className="flex flex-col py-5 border-t gap-5 border-white w-full">
        <div className="flex flex-row justify-center gap-3">
          <div className="w-[220px] h-[130px] px-5 py-3 bg-sky-600 flex flex-col gap-10 ">
            <div className="flex flex-row justify-between">
              <span className="uppercase font-bold">products</span>
              <MdOutlineInventory2 size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold">{productImageCount}</span>
          </div>
          <div className="w-[220px] h-[130px] px-5 py-3 bg-orange-400 flex flex-col gap-10 ">
            <div className="flex flex-row justify-between">
              <span className="uppercase font-bold">Categories</span>
              <BiCategoryAlt size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold">{uniqueBrandCount}</span>
          </div>
          <div className="w-[220px] h-[130px] px-5 py-3 bg-green-700 flex flex-col gap-10 ">
            <div className="flex flex-row justify-between">
              <span className="uppercase font-bold">Customers</span>
              <FaPeopleGroup size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold">{customerCount}</span>
          </div>
          <div className="w-[220px] h-[130px] px-5 py-3 bg-red-600 flex flex-col gap-10 ">
            <div className="flex flex-row justify-between">
              <span className="uppercase font-bold">Notification</span>
              <IoIosNotifications size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold">56</span>
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

import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../db/firebase";
import { Link } from "react-router-dom";
import { GrDeliver } from "react-icons/gr";
import { FaBox, FaBoxOpen } from "react-icons/fa";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Manage = () => {
  const [orderShipped, setOrderShipped] = useState(0);
  const [orderDelivering, setOrderDelivering] = useState(0);
  const [orderDelivered, setOrderDelivered] = useState(0);

  const handleToastMessage = (message) => {
    toast(message);
  };

  const handleOrderShipped = async () => {
    const usersCollectionRef = collection(db, "users");

    // Fetch all users and their order data
    const usersSnapshot = await getDocs(usersCollectionRef);

    usersSnapshot.forEach(async (userDoc) => {
      const userId = userDoc.id;
      const ordersCollectionRef = collection(db, "users", userId, "orders");

      // Fetch all orders for the user
      const ordersSnapshot = await getDocs(ordersCollectionRef);

      // Prepare qty data for orderShipper
      const orders = [];
      let totalPrice = 0;
      ordersSnapshot.forEach((orderDoc) => {
        const orderData = orderDoc.data();
        const items = orderData.items || [];
        const barcode = orderData.barcode;
        const brand = orderData.brand;
        const category = orderData.category;
        const imageName = orderData.imageName;
        const imageUrl = orderData.imageUrl;
        const name = orderData.name;
        const price = orderData.price;

        items.forEach((item) => {
          orders.push({
            name: item.name,
            brand: item.brand,
            category: item.category,
            price: item.price || 0,
            qty: item.qty || 0,
            imageName: item.imageName,
            imageUrl: item.imageUrl,
            barcode: item.barcode,
          });
          totalPrice += item.price;
        });
      });

      let status = "Order is Shipped";

      // Transfer qty data to orderShipper collection for the user
      const orderShipperRef = doc(db, "users", userId, "orderShipped", userId);
      await setDoc(orderShipperRef, { orders, status, totalPrice });

      console.log(`Qty data transferred to orderShipper for user ${userId}`);
      console.log(orderShipped);
      handleToastMessage("Order is Shipped");
    });
  };

  const handleOrderDelivering = async () => {
    const usersCollectionRef = collection(db, "users");

    // Fetch all users and their order data
    const usersSnapshot = await getDocs(usersCollectionRef);

    usersSnapshot.forEach(async (userDoc) => {
      const userId = userDoc.id;
      const ordersCollectionRef = collection(
        db,
        "users",
        userId,
        "orderShipped"
      );

      // Fetch all orders for the user
      const ordersSnapshot = await getDocs(ordersCollectionRef);

      // Prepare qty data for orderShipper
      const orders = [];
      let totalPrice = 0;
      ordersSnapshot.forEach((orderDoc) => {
        const orderData = orderDoc.data();
        const items = orderData.orders || [];
        const barcode = orderData.barcode;
        const brand = orderData.brand;
        const category = orderData.category;
        const imageName = orderData.imageName;
        const imageUrl = orderData.imageUrl;
        const name = orderData.name;
        const price = orderData.price;

        items.forEach((item) => {
          orders.push({
            name: item.name,
            brand: item.brand,
            category: item.category,
            price: item.price || 0,
            qty: item.qty || 0,
            imageName: item.imageName,
            imageUrl: item.imageUrl,
            barcode: item.barcode,
          });
          totalPrice += item.price;
        });
      });

      // Transfer qty data to orderShipper collection for the user
      const orderShipperRef = doc(
        db,
        "users",
        userId,
        "orderDelivering",
        userId
      );

      let status = "Order is Delivering";

      await setDoc(orderShipperRef, { orders, status, totalPrice });
      const orderRef = collection(db, "users", userId, "orderShipped");
      const orderSnapshot = await getDocs(orderRef);
      orderSnapshot.forEach(async (ordersDoc) => {
        await deleteDoc(doc(db, "users", userId, "orderShipped", ordersDoc.id));
      });

      console.log(`Qty data transferred to orderShipper for user ${userId}`);
      handleToastMessage("Order is Delivering");
    });
  };

  const handleOrderDelivered = async () => {
    const usersCollectionRef = collection(db, "users");

    // Fetch all users and their order data
    const usersSnapshot = await getDocs(usersCollectionRef);

    usersSnapshot.forEach(async (userDoc) => {
      const userId = userDoc.id;
      const ordersCollectionRef = collection(
        db,
        "users",
        userId,
        "orderDelivering"
      );

      // Fetch all orders for the user
      const ordersSnapshot = await getDocs(ordersCollectionRef);

      // Prepare qty data for orderShipper
      const orders = [];
      let totalPrice = 0;
      ordersSnapshot.forEach((orderDoc) => {
        const orderData = orderDoc.data();
        const items = orderData.orders || [];
        const barcode = orderData.barcode;
        const brand = orderData.brand;
        const category = orderData.category;
        const imageName = orderData.imageName;
        const imageUrl = orderData.imageUrl;
        const name = orderData.name;
        const price = orderData.price;

        items.forEach((item) => {
          orders.push({
            name: item.name,
            brand: item.brand,
            category: item.category,
            price: item.price || 0,
            qty: item.qty || 0,
            imageName: item.imageName,
            imageUrl: item.imageUrl,
            barcode: item.barcode,
          });
          totalPrice += item.price;
        });
      });

      // Transfer qty data to orderShipper collection for the user
      const orderShipperRef = doc(
        db,
        "users",
        userId,
        "orderDelivered",
        userId
      );
      const transactionRef = doc(db, "transaction", userId);

      let status = "Order is Delivered";

      await setDoc(orderShipperRef, { orders, status, totalPrice });
      await setDoc(transactionRef, {
        totalPrice,
        timestamp: serverTimestamp(),
      });
      const orderRef = collection(db, "users", userId, "orderDelivering");
      const orderSnapshot = await getDocs(orderRef);
      orderSnapshot.forEach(async (ordersDoc) => {
        await deleteDoc(
          doc(db, "users", userId, "orderDelivering", ordersDoc.id)
        );
      });

      console.log(`Qty data transferred to orderShipper for user ${userId}`);
    });
  };

  return (
    <div className="w-[80%] px-5 py-7 relative">
      <ToastContainer className="absolute left-[47.5%] translate-x-[-47.5%]" />
      <div className="w-[45%] text-black absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-xl">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between">
            <button
              onClick={handleOrderShipped}
              className="w-[220px] h-[120px] p-5 bg-slate-900 active:bg-slate-700 flex justify-between items-center rounded-lg"
            >
              <span className="text-white text-2xl uppercase">
                Order Shipped
              </span>
              <FaBox
                className="p-2 bg-orange-200 text-slate-900 rounded-lg"
                size={50}
              />
            </button>

            <button
              onClick={handleOrderDelivering}
              className="w-[220px] h-[120px] p-5 bg-slate-900 active:bg-slate-700 flex justify-between items-center rounded-lg"
            >
              <span className="text-2xl uppercase text-white">
                Order Delivering
              </span>
              <GrDeliver
                className="p-2 bg-orange-200 text-slate-900 rounded-lg"
                size={50}
              />
            </button>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => {
                handleOrderDelivered();
                handleToastMessage("Order is Delivered");
              }}
              className="w-[220px] h-[120px] p-5 bg-slate-900 active:bg-slate-700 flex justify-between items-center rounded-lg"
            >
              <span className="text-white uppercase text-2xl">
                Order Delivered
              </span>
              <FaBoxOpen
                className="p-2 bg-orange-200 text-slate-900 rounded-lg"
                size={50}
              />
            </button>
            <Link
              to="/order"
              className="w-[220px] h-[120px] p-5 bg-slate-900 active:bg-slate-700 flex flex-row justify-between items-center rounded-lg"
            >
              <span className="text-2xl uppercase text-white pl-8">Back</span>
              <IoArrowBackCircleSharp
                className="p-2 bg-orange-200 text-slate-900 rounded-lg"
                size={50}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manage;

import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../db/firebase"; // Import Firestore instance
import { Link } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import { IoCloseSharp, IoSearchOutline } from "react-icons/io5";
import { BsCartXFill } from "react-icons/bs";
import { IoIosTimer } from "react-icons/io";
import { FaBox, FaBoxOpen } from "react-icons/fa";
import { GrDeliver, GrMoney } from "react-icons/gr";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Order = () => {
  const [profiles, setProfiles] = useState([]); // State to store profiles data
  const [loading, setLoading] = useState(true); // Loading state
  const [search, setSearch] = useState(""); // Search term state
  const [showEditContainer, setShowEditContainer] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const handleToastMessage = (message) => {
    toast(message);
  };

  useEffect(() => {
    const usersCollectionRef = collection(db, "users");

    const unsubscribeUsers = onSnapshot(
      usersCollectionRef,
      (usersSnapshot) => {
        console.log("Fetched users collection");

        const fetchProfiles = usersSnapshot.docs.map((userDoc) => {
          const userId = userDoc.id;

          const profileRef = doc(db, "users", userId, "profile", "details");

          return getDoc(profileRef)
            .then((profileSnapshot) => {
              if (!profileSnapshot.exists()) {
                console.log(`No profile document found for user ${userId}`);
                return null;
              }

              const profileData = profileSnapshot.data();

              const ordersCollectionRef = collection(
                db,
                "users",
                userId,
                "orders"
              );

              const ordersPromise = getDocs(ordersCollectionRef).then(
                (ordersSnapshots) => {
                  let totalPrice = 0;
                  let totalQuantity = 0;

                  ordersSnapshots.forEach((orderDoc) => {
                    const orderData = orderDoc.data();
                    const items = orderData.items || [];

                    items.forEach((item) => {
                      const itemTotal = (item.qty || 0) * (item.price || 0);
                      totalPrice += itemTotal;
                      totalQuantity += item.qty || 0;
                    });
                  });

                  return { totalPrice, totalQuantity };
                }
              );

              const orderShippedRef = doc(
                db,
                "users",
                userId,
                "orderShipped",
                userId
              );

              const orderShippedPromise = getDoc(orderShippedRef).then(
                (orderShippedSnapshot) => {
                  if (orderShippedSnapshot.exists()) {
                    const orderShippedData = orderShippedSnapshot.data();

                    let totalQty = 0;

                    if (orderShippedData.orders) {
                      orderShippedData.orders.forEach((order) => {
                        totalQty += order.qty || 0;
                      });
                    }

                    return {
                      status: orderShippedData.status || "No status",
                      totalPrice: orderShippedData.totalPrice || 0,
                      orders: orderShippedData.orders || [],
                      totalQty,
                    };
                  }
                  return { status: "No status", totalPrice: 0, orders: [] };
                }
              );

              const orderDeliveringRef = doc(
                db,
                "users",
                userId,
                "orderDelivering",
                userId
              );

              const orderDeliveringPromise = getDoc(orderDeliveringRef).then(
                (orderDeliveringSnapshot) => {
                  if (orderDeliveringSnapshot.exists()) {
                    const orderDeliveringData = orderDeliveringSnapshot.data();

                    let totalQty = 0;

                    if (orderDeliveringData.orders) {
                      orderDeliveringData.orders.forEach((order) => {
                        totalQty += order.qty || 0;
                      });
                    }

                    return {
                      status: orderDeliveringData.status || "No status",
                      totalPrice: orderDeliveringData.totalPrice || 0,
                      orders: orderDeliveringData.orders || [],
                      totalQty,
                    };
                  }
                  return { status: "No status", totalPrice: 0, orders: [] };
                }
              );

              const orderDeliveredRef = doc(
                db,
                "users",
                userId,
                "orderDelivered",
                userId
              );

              const orderDeliveredPromise = getDoc(orderDeliveredRef).then(
                (orderDeliveredSnapshot) => {
                  if (orderDeliveredSnapshot.exists()) {
                    const orderDeliveredData = orderDeliveredSnapshot.data();

                    let totalQty = 0;

                    if (orderDeliveredData.orders) {
                      orderDeliveredData.orders.forEach((order) => {
                        totalQty += order.qty || 0;
                      });
                    }

                    return {
                      status: orderDeliveredData.status || "No status",
                      totalPrice: orderDeliveredData.totalPrice || 0,
                      orders: orderDeliveredData.orders || [],
                      totalQty,
                    };
                  }
                  return { status: "No status", totalPrice: 0, orders: [] };
                }
              );

              return Promise.all([
                ordersPromise,
                orderShippedPromise,
                orderDeliveringPromise,
                orderDeliveredPromise,
              ]).then(
                ([
                  ordersData,
                  orderShippedData,
                  orderDeliveringData,
                  orderDeliveredData,
                ]) => ({
                  ...profileData,
                  userId,
                  totalPrice: ordersData.totalPrice,
                  totalQuantity: ordersData.totalQuantity,
                  orderShipped: orderShippedData,
                  orderDelivering: orderDeliveringData,
                  orderDelivered: orderDeliveredData,
                  address: profileData.address || "N/A",
                  firstName: profileData.firstName || "N/A",
                  lastName: profileData.lastName || "N/A",
                  contactNumber: profileData.contactNumber || "N/A",
                })
              );
            })
            .catch((err) => {
              console.log(`Error fetching profile for user ${userId}:`, err);
              return null;
            });
        });

        Promise.all(fetchProfiles).then((fetchedProfiles) => {
          const validProfiles = fetchedProfiles.filter(
            (profile) => profile !== null
          );
          setProfiles(validProfiles);
          setLoading(false);
        });
      },
      (error) => {
        console.error("Error accessing users collection:", error);
      }
    );

    return unsubscribeUsers;
  }, []);

  const handleDelete = async (userId) => {
    try {
      // Delete orders for the user
      const deleteCollectionDocs = async (collectionPath) => {
        const collectionRef = collection(db, "users", userId, collectionPath);
        const snapshot = await getDocs(collectionRef);
        const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      };

      // Delete documents in 'orders', 'orderShipped', 'orderDelivering', 'orderDelivered'
      await deleteCollectionDocs("orders");
      await deleteCollectionDocs("orderShipped");
      await deleteCollectionDocs("orderDelivering");
      await deleteCollectionDocs("orderDelivered");

      // Optionally delete the user's profile and the user document
      // const profileRef = doc(db, "users", userId, "profile", "details");
      // await deleteDoc(profileRef);
      // await deleteDoc(doc(db, "users", userId));

      // Update state to remove the user's profile from the UI
      setProfiles((prevProfiles) =>
        prevProfiles.filter((profile) => profile.userId !== userId)
      );

      console.log(`Successfully deleted all data for user ID: ${userId}`);
    } catch (error) {
      console.error(
        "Error deleting profile and associated collections:",
        error
      );
    }
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
  };

  const clearInput = () => {
    setSearch(""); // Clear search input
  };

  // Filtered profiles based on the search term
  const filteredProfiles = profiles.filter((profile) =>
    profile.lastName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleEdit = (userId) => {
    setEditingUserId(userId); // Track the user being edited
    setShowEditContainer((prev) => (editingUserId === userId ? !prev : true));
  };

  const handleOrderShipped = async (userId) => {
    try {
      // Reference to the user's orders collection
      const ordersCollectionRef = collection(db, "users", userId, "orders");
      const ordersSnapshot = await getDocs(ordersCollectionRef);

      // Check if orders exist for the user
      if (ordersSnapshot.empty) {
        console.log(`No orders found for user ID ${userId}.`);
        return;
      }

      // Prepare data for orderShipped
      const orders = [];
      let totalPrice = 0;

      ordersSnapshot.forEach((orderDoc) => {
        const orderData = orderDoc.data();
        const items = orderData.items || [];

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
          totalPrice += item.price * (item.qty || 1); // Multiply by quantity if available
        });
      });

      const status = "Order is Shipped";

      // Update orderShipped data for the user
      const orderShippedRef = doc(db, "users", userId, "orderShipped", userId);
      await setDoc(orderShippedRef, { orders, status, totalPrice });

      console.log(
        `Order shipment processed successfully for user ID: ${userId}`
      );
      handleToastMessage("Order is Shipped");
      window.location.reload();
    } catch (error) {
      console.error("Error processing order shipment:", error);
    }
  };

  const handleOrderDelivering = async (userId) => {
    try {
      // Reference to the user's orders collection
      const ordersCollectionRef = collection(
        db,
        "users",
        userId,
        "orderShipped"
      );
      const ordersSnapshot = await getDocs(ordersCollectionRef);

      // Check if orders exist for the user
      if (ordersSnapshot.empty) {
        handleToastMessage("No Orders Found from Shipped");
        return;
      }

      // Prepare data for orderShipped
      const orders = [];
      let totalPrice = 0;

      ordersSnapshot.forEach((orderDoc) => {
        const orderData = orderDoc.data();
        const items = orderData.orders || [];

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
          totalPrice += item.price * (item.qty || 1); // Multiply by quantity if available
        });
      });

      const status = "Order is Delivering";

      // Update orderShipped data for the user
      const orderShippedRef = doc(
        db,
        "users",
        userId,
        "orderDelivering",
        userId
      );
      await setDoc(orderShippedRef, { orders, status, totalPrice });
      const orderRef = collection(db, "users", userId, "orderShipped");
      const orderSnapshot = await getDocs(orderRef);
      orderSnapshot.forEach(async (ordersDoc) => {
        await deleteDoc(doc(db, "users", userId, "orderShipped", ordersDoc.id));
      });

      console.log(
        `Order shipment processed successfully for user ID: ${userId}`
      );
      handleToastMessage("Order is Delivering");
      window.location.reload();
    } catch (error) {
      console.error("Error processing order shipment:", error);
    }
  };

  const handleOrderDelivered = async (userId) => {
    try {
      // Reference to the user's orders collection
      const ordersCollectionRef = collection(
        db,
        "users",
        userId,
        "orderDelivering"
      );
      const ordersSnapshot = await getDocs(ordersCollectionRef);

      // Check if orders exist for the user
      if (ordersSnapshot.empty) {
        handleToastMessage("No Orders Found from Delivery");
        return;
      }

      // Prepare data for orderShipped
      const orders = [];
      let totalPrice = 0;

      ordersSnapshot.forEach((orderDoc) => {
        const orderData = orderDoc.data();
        const items = orderData.orders || [];

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
          totalPrice += item.price * (item.qty || 1); // Multiply by quantity if available
        });
      });

      const status = "Order is Delivered";

      // Update orderShipped data for the user
      const orderShippedRef = doc(
        db,
        "users",
        userId,
        "orderDelivered",
        userId
      );
      await setDoc(orderShippedRef, { orders, status, totalPrice });
      const orderRef = collection(db, "users", userId, "orderDelivering");
      const orderSnapshot = await getDocs(orderRef);
      orderSnapshot.forEach(async (ordersDoc) => {
        await deleteDoc(
          doc(db, "users", userId, "orderDelivering", ordersDoc.id)
        );
      });

      console.log(
        `Order shipment processed successfully for user ID: ${userId}`
      );
      handleToastMessage("Order is Delivered");
      window.location.reload();
    } catch (error) {
      console.error("Error processing order shipment:", error);
    }
  };

  return (
    <div className="w-[80%] text-white px-5 py-7 relative">
      <ToastContainer className="absolute left-[45%] translate-x-[-45%]" />
      <div className="flex flex-col gap-5">
        <div className="flex justify-between">
          <span className="text-2xl font-bold uppercase">Orders</span>
          <div className="flex items-center gap-2 bg-slate-300 text-black px-3 py-2 rounded-3xl">
            {search && (
              <IoCloseSharp
                size={24}
                onClick={clearInput}
                className="cursor-pointer"
              />
            )}
            <input
              type="text"
              value={search}
              onChange={handleInputChange}
              className="outline-none bg-transparent"
              placeholder="Search..."
            />
            <IoSearchOutline size={24} />
          </div>
        </div>

        {/* Order Status Cards */}
        <div className="flex flex-row gap-3 flex-wrap text-white">
          <div className="flex flex-row gap-3 flex-wrap text-white">
            <div className="flex flex-row gap-3 flex-wrap text-white">
              <div className="w-[320px] h-[120px] rounded-lg bg-slate-900 flex flex-row gap-2 items-center px-5 py-3">
                <div className="w-[80%] flex flex-col gap-5">
                  <div className="text-lg font-bold uppercase">
                    <span>Order Cancel</span>
                  </div>
                  <div className="">
                    <span className="text-3xl">0</span>
                  </div>
                </div>
                <div className="w-[20%]">
                  <BsCartXFill
                    size={40}
                    className="p-2 bg-orange-200 text-slate-900 rounded-lg"
                  />
                </div>
              </div>

              <div className="w-[320px] h-[120px] rounded-lg bg-slate-900 flex flex-row gap-2 items-center px-5 py-3">
                <div className="w-[80%] flex flex-col gap-5">
                  <div className="text-lg font-bold uppercase">
                    <span>Total Order</span>
                  </div>
                  <div className="">
                    <span className="text-3xl">
                      {loading ? (
                        <span>...</span>
                      ) : profiles.length > 0 ? (
                        <span>
                          {profiles.reduce(
                            (acc, profile) =>
                              acc + (profile.totalQuantity || 0),
                            0
                          )}
                        </span>
                      ) : (
                        <span>0</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="w-[20%]">
                  <IoIosTimer
                    size={40}
                    className="p-2 bg-orange-200 text-slate-900 rounded-lg"
                  />
                </div>
              </div>

              <div className="w-[320px] h-[120px] rounded-lg bg-slate-900 flex flex-row gap-2 items-center px-5 py-3">
                <div className="w-[80%] flex flex-col gap-5">
                  <div className="text-lg font-bold uppercase">
                    <span>Order Shipped</span>
                  </div>
                  <div className="">
                    <span className="text-3xl">
                      {loading ? (
                        <span>...</span>
                      ) : filteredProfiles.length > 0 ? (
                        // Compute the totalQty across all profiles
                        <span>
                          {filteredProfiles
                            .filter(
                              (profile) =>
                                profile.orderShipped &&
                                profile.orderShipped.orders &&
                                profile.orderShipped.orders.length > 0 &&
                                profile.orderShipped.totalQty
                            )
                            .reduce(
                              (total, profile) =>
                                total + profile.orderShipped.totalQty,
                              0
                            )}
                        </span>
                      ) : (
                        <span>0</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="w-[20%]">
                  <FaBox
                    size={40}
                    className="p-2 bg-orange-200 text-slate-900 rounded-lg"
                  />
                </div>
              </div>

              <div className="w-[320px] h-[120px] rounded-lg bg-slate-900 flex flex-row gap-2 items-center px-5 py-3">
                <div className="w-[80%] flex flex-col gap-5">
                  <div className="text-lg font-bold uppercase">
                    <span>Order Delivering</span>
                  </div>
                  <div className="">
                    <span className="text-3xl">
                      {loading ? (
                        <span>...</span>
                      ) : filteredProfiles.length > 0 ? (
                        // Compute the totalQty across all profiles
                        <span>
                          {filteredProfiles
                            .filter(
                              (profile) =>
                                profile.orderDelivering &&
                                profile.orderDelivering.orders &&
                                profile.orderDelivering.orders.length > 0 &&
                                profile.orderDelivering.totalQty
                            )
                            .reduce(
                              (total, profile) =>
                                total + profile.orderDelivering.totalQty,
                              0
                            )}
                        </span>
                      ) : (
                        <span>0</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="w-[20%]">
                  <GrDeliver
                    size={40}
                    className="p-2 bg-orange-200 text-slate-900 rounded-lg"
                  />
                </div>
              </div>

              <div className="w-[320px] h-[120px] rounded-lg bg-slate-900 flex flex-row gap-2 items-center px-5 py-3">
                <div className="w-[80%] flex flex-col gap-5">
                  <div className="text-lg font-bold uppercase">
                    <span>Order Delivered</span>
                  </div>
                  <div className="">
                    <span className="text-3xl">
                      {loading ? (
                        <span>...</span>
                      ) : filteredProfiles.length > 0 ? (
                        // Compute the totalQty across all profiles
                        <span>
                          {filteredProfiles
                            .filter(
                              (profile) =>
                                profile.orderDelivered &&
                                profile.orderDelivered.orders &&
                                profile.orderDelivered.orders.length > 0 &&
                                profile.orderDelivered.totalQty
                            )
                            .reduce(
                              (total, profile) =>
                                total + profile.orderDelivered.totalQty,
                              0
                            )}
                        </span>
                      ) : (
                        <span>0</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="w-[20%]">
                  <FaBoxOpen
                    size={40}
                    className="p-2 bg-orange-200 text-slate-900 rounded-lg"
                  />
                </div>
              </div>

              <div className="w-[320px] h-[120px] rounded-lg bg-slate-900 flex flex-row gap-2 items-center px-5 py-3">
                <div className="w-[80%] flex flex-col gap-5">
                  <div className="text-lg font-bold uppercase">
                    <span>Total Revenue</span>
                  </div>
                  <div className="">
                    <span className="text-3xl">
                      {loading ? (
                        <span>...</span>
                      ) : filteredProfiles.length > 0 ? (
                        // Compute the totalQty across all profiles
                        <span>
                          {filteredProfiles
                            .filter(
                              (profile) =>
                                profile.orderDelivered &&
                                profile.orderDelivered.orders &&
                                profile.orderDelivered.orders.length > 0 &&
                                profile.orderDelivered.totalQty
                            )
                            .reduce(
                              (total, profile) =>
                                total + profile.orderDelivered.totalPrice,

                              0
                            )}
                        </span>
                      ) : (
                        <span>0</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="w-[20%]">
                  <GrMoney
                    size={40}
                    className="p-2 bg-orange-200 text-slate-900 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-left bg-slate-700 rounded-lg overflow-hidden">
            <thead className="bg-slate-800 text-gray-300">
              <tr>
                <th className="px-4 py-2">Address</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Phone Number</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Items qty</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center">
                    Loading Orders...
                  </td>
                </tr>
              ) : filteredProfiles.length > 0 ? (
                filteredProfiles
                  .filter((profile) => profile.totalQuantity > 0)
                  .map((profile, index) => (
                    <tr key={index} className="border-b border-slate-600">
                      <td className="px-4 py-2">{profile.address}</td>
                      <td className="px-4 py-2">{`${profile.lastName} ${profile.firstName}`}</td>
                      <td className="px-4 py-2">{profile.contactNumber}</td>
                      <td className="px-4 py-2">
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(profile.totalPrice || 0)}
                      </td>
                      <td className="px-4 py-2">{profile.totalQuantity}</td>
                      <td className="px-4 py-2 text-yellow-500">
                        {profile.orderShipped?.status ===
                          "Order is Shipped" && (
                          <span className="text-yellow-500 text-sm uppercase">
                            {profile.orderShipped.status}
                          </span>
                        )}
                        {profile.orderDelivering?.status ===
                          "Order is Delivering" && (
                          <span className="text-yellow-500 text-sm uppercase">
                            {profile.orderDelivering.status}
                          </span>
                        )}
                        {profile.orderDelivered?.status ===
                          "Order is Delivered" && (
                          <span className="text-yellow-500 text-sm uppercase">
                            {profile.orderDelivered.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 flex gap-5 justify-center">
                        <CiEdit
                          size={24}
                          onClick={() => toggleEdit(profile.userId)}
                          className="active:text-orange-500 cursor-pointer"
                        />

                        {/* edit container */}
                        {editingUserId === profile.userId &&
                          showEditContainer && (
                            <div className="w-[96.5%] h-[255px] absolute top-[15.5%] left-5 bg-[#a2292e] rounded-lg">
                              <div className="text-black flex flex-col gap-5 mt-5">
                                <div className="flex justify-center gap-5">
                                  <button
                                    onClick={() =>
                                      handleOrderShipped(profile.userId)
                                    }
                                    className="w-[250px] h-[100px] px-5 flex justify-between items-center bg-white active:text-white active:bg-slate-900 rounded-lg"
                                  >
                                    <span className="text-xl uppercase font-semibold">
                                      Order Shipped
                                    </span>
                                    <FaBox
                                      size={50}
                                      className=" bg-gradient-to-r from-[#eb3349] to-[#f45c43] rounded-lg p-2"
                                    />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleOrderDelivering(profile.userId)
                                    }
                                    className="w-[250px] h-[100px] px-5 flex justify-between items-center bg-white active:text-white active:bg-slate-900 rounded-lg"
                                  >
                                    <span className="text-xl uppercase font-semibold">
                                      Order Delivering
                                    </span>
                                    <GrDeliver
                                      size={50}
                                      className=" bg-gradient-to-r from-[#eb3349] to-[#f45c43] rounded-lg p-2"
                                    />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleOrderDelivered(profile.userId)
                                    }
                                    className="w-[250px] h-[100px] px-5 flex justify-between items-center bg-white active:text-white active:bg-slate-900 rounded-lg"
                                  >
                                    <span className="text-xl uppercase font-semibold">
                                      Order Delivered
                                    </span>
                                    <FaBoxOpen
                                      size={50}
                                      className=" bg-gradient-to-r from-[#eb3349] to-[#f45c43] rounded-lg p-2"
                                    />
                                  </button>
                                </div>
                                <div className="flex justify-center gap-5">
                                  <Link
                                    to="/order"
                                    onClick={toggleEdit}
                                    className="w-[794px] h-[100px] px-5 flex justify-center items-center gap-5 bg-white active:text-white active:bg-slate-900 rounded-lg"
                                  >
                                    <span className="text-2xl uppercase font-semibold">
                                      Close
                                    </span>
                                    <IoCloseSharp
                                      size={50}
                                      className=" bg-gradient-to-r from-[#eb3349] to-[#f45c43] rounded-lg p-2"
                                    />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}
                        <button
                          onClick={() => handleDelete(profile.userId)}
                          className="text-red-600"
                          title="Delete Profile"
                        >
                          <MdDeleteForever size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center">
                    No Orders Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Order;

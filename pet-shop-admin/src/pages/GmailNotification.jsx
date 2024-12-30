import React, { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";

const GmailNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          "http://localhost:5174/gmail-notifications"
        );
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching Gmail notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredNotifications = notifications.filter((notification) =>
    notification.snippet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const notification = [
    {
      snippet: "Important Update: Your account settings have been changed.",
      from: "support@google.com",
      subject: "Account Settings Update",
      receivedTime: "2024-11-10 14:32",
    },
    {
      snippet: "Your order has been shipped! Track your package now.",
      from: "orders@amazon.com",
      subject: "Your Amazon Order",
      receivedTime: "2024-11-10 13:15",
    },
    {
      snippet: "You have a new message from John.",
      from: "john.doe@gmail.com",
      subject: "Meeting Tomorrow",
      receivedTime: "2024-11-10 12:45",
    },
    {
      snippet: "Your invoice for subscription renewal is ready.",
      from: "billing@spotify.com",
      subject: "Invoice for Subscription Renewal",
      receivedTime: "2024-11-09 17:22",
    },
  ];

  return (
    <div className="w-[80%] text-white px-5 py-7">
      <div className="flex flex-row justify-between items-center">
        <span className="text-2xl font-bold uppercase">Notification</span>
        <div className="flex justify-between">
          <div className="flex items-center gap-2 bg-slate-300 text-black px-3 py-2">
            <IoIosClose size={24} />
            <input
              type="text"
              className="outline-none bg-transparent"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <IoSearchOutline size={24} />
          </div>
        </div>
      </div>

      {/* view gmail look like */}
      <div className="mt-4 bg-black">
        
      </div>
    </div>
  );
};

export default GmailNotification;

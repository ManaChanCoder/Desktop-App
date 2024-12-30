import React from "react";
import AdminLayout from "./components/layout/AdminLayout";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFoundPage from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import AccessLayout from "./components/layout/AccessLayout";
import Dashboard from "./pages/Dashboard";
import Category from "./pages/Category";
import Product from "./pages/Product";
import MiniPOS from "./pages/MiniPOS";
import Order from "./pages/Order";
import OrderHistory from "./pages/OrderHistory";
import GmailNotification from "./pages/GmailNotification";
import Manage from "./pages/Manage";

const App = () => {
  return (
    <div>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<AccessLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/category" element={<Category />} />
          <Route path="/product" element={<Product />} />
          <Route path="/casher" element={<MiniPOS />} />
          <Route path="/order" element={<Order />} />
          <Route path="/orderhistory" element={<OrderHistory />} />
          <Route path="/notification" element={<GmailNotification />} />
          <Route path="/manage" element={<Manage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;

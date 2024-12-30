import React, { useState, useEffect } from "react";
import { db, storage } from "../db/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp, // fix import here
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { IoSearchOutline } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import loadingGif from "../assets/loading/barcode.gif";
import App from "../App";

const MiniPOS = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cash, setCash] = useState(0);
  const [exchange, setExchange] = useState(0);

  // Fetch and filter products based on search term or barcode
  const fetchProduct = async (term = "", isBarcode = false) => {
    setLoading(true);
    try {
      const lowercaseTerm = term.toLowerCase();
      const productQuery = isBarcode
        ? query(
            collection(db, "pet-food-pet-accessories"),
            where("barcode", "==", lowercaseTerm)
          )
        : collection(db, "pet-food-pet-accessories");

      const querySnapshot = await getDocs(productQuery);
      const productData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const imageRef = ref(
            storage,
            `images/pet-food-pet-accessories/${data.imageName}`
          );
          const imageUrl = await getDownloadURL(imageRef);
          return { id: doc.id, ...data, imageUrl };
        })
      );

      const filteredProducts = isBarcode
        ? productData
        : productData.filter((product) =>
            product.barcode.toLowerCase().includes(lowercaseTerm)
          );

      filteredProducts.forEach((product) => {
        const updatedProducts = [
          ...products,
          { ...product, uniqueKey: Date.now() },
        ];
        setProducts(updatedProducts);
        localStorage.setItem(
          "persistedProducts",
          JSON.stringify(updatedProducts)
        );
      });

      setSearchTerm("");
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const total = products.reduce((sum, product) => sum + product.price, 0);
    setTotalPrice(total);
  }, [products]);

  useEffect(() => {
    const persistedProducts = JSON.parse(
      localStorage.getItem("persistedProducts")
    );
    if (persistedProducts) {
      setProducts(persistedProducts);
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (searchTerm) {
      fetchProduct(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleBarcodeInput = (event) => {
      const scannedValue = event.key;
      setScannedBarcode((prev) => prev + scannedValue);

      if (event.key === "Enter") {
        event.preventDefault();
        fetchProduct(scannedBarcode.trim(), true);
        setScannedBarcode("");
      }
    };

    window.addEventListener("keydown", handleBarcodeInput);
    return () => window.removeEventListener("keydown", handleBarcodeInput);
  }, [scannedBarcode]);

  const removeFromTable = (uniqueKey) => {
    const updatedProducts = products.filter(
      (product) => product.uniqueKey !== uniqueKey
    );
    setProducts(updatedProducts);
    localStorage.setItem("persistedProducts", JSON.stringify(updatedProducts));
  };

  function formatPrice(price) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(price);
  }

  // Function to handle cash input change and update exchange value
  const handleCashChange = (e) => {
    const cashInput = parseFloat(e.target.value) || 0;
    setCash(cashInput);
    setExchange(cashInput - totalPrice);
  };

  useEffect(() => {
    if (cash) {
      setExchange(Number(cash) - totalPrice);
    } else {
      setExchange(null); // Set to null or empty if no cash input
    }
  }, [cash, totalPrice]);

  const handlePay = async () => {
    try {
      const transactionData = {
        totalPrice, // ensure totalPrice is correctly passed as number
        timestamp: serverTimestamp(), // Use serverTimestamp() here
      };

      await addDoc(collection(db, "transaction"), transactionData);
      setProducts([]); // Clear the table after transaction
      setCash(0);
      setExchange(0);
      localStorage.removeItem("persistedProducts");
      alert("Transaction completed successfully!");
    } catch (error) {
      console.error("Error completing transaction:", error);
      alert("Failed to complete transaction.");
    }
  };

  const printReceipt = async () => {
    const storeName = "Petsville";
    const phoneNumber = "Tel: [Your phone number]";
    const address =
      "Blk 4 Lot 10 Phase 7 Eastwood Greenview Subd Bgy, Rodriguez, Rizal";
    const thankYouMessage = "Thank You. Hope You Come Again!";
    const dateTime = new Date().toLocaleString();

    const receiptData = {
      storeName,
      phoneNumber,
      address,
      items: products.map((product) => ({
        name: product.name,
        price: product.price,
      })),
      totalPrice,
      cash,
      exchange,
      dateTime,
      thankYouMessage,
    };

    try {
      const response = await fetch("http://localhost:5174/print-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receiptData),
      });

      if (response.ok) {
        alert("Receipt printed successfully!");
      } else {
        console.error("Failed to print receipt:", await response.text());
        alert("Failed to print receipt.");
      }
    } catch (error) {
      console.error("Error connecting to the print server:", error);
      alert("Error connecting to the print server.");
    }
  };

  return (
    <div className="w-[80%] text-white px-5 py-7">
      <div className="flex flex-row justify-between items-center">
        <div>
          <span className="uppercase text-white text-2xl font-bold">
            Cashier
          </span>
        </div>
      </div>

      {loading && (
        <div className="absolute left-[50%] top-[0]">
          <img src={loadingGif} alt="loading..." />
        </div>
      )}

      <div className="mt-[80px] py-5 w-full max-h-[380px] h-[380px] bg-slate-100 rounded-md overflow-y-auto">
        <table className="w-full text-black">
          <thead>
            <tr>
              <th className="select-none">Image</th>
              <th className="select-none w-[50%]">Name</th>
              <th className="select-none">Brand</th>
              <th className="select-none">Category</th>
              <th className="select-none">Price</th>
              <th className="select-none">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.uniqueKey}>
                  <td className="select-none flex justify-center">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      width="50px"
                    />
                  </td>
                  <td className="text-center select-none">{product.name}</td>
                  <td className="text-center select-none">{product.brand}</td>
                  <td className="text-center select-none">
                    {product.category}
                  </td>
                  <td className="text-center select-none">
                    {formatPrice(product.price)}
                  </td>
                  <td>
                    <MdDeleteForever
                      size={24}
                      className="text-white ml-7 cursor-pointer rounded-full p-1 bg-red-600"
                      onClick={() => removeFromTable(product.uniqueKey)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center uppercase font-bold text-2xl absolute left-[50%] top-[47%] select-none"
                >
                  Scan to add product
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-row justify-between items-center bg-slate-100 mt-12 px-5 py-3 text-black ">
        <div className="flex flex-row gap-8">
          <div>Total: {formatPrice(totalPrice)}</div>
          <div className="flex gap-3">
            <span>Cash</span>
            <input
              type="number"
              className="outline-none bg-transparent border border-solid border-black text-black px-2 text-md"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              onPaste={(e) => e.preventDefault()} // Prevent paste
              placeholder="Enter cash"
            />
          </div>
          <div>
            <span>Exchange: {formatPrice(exchange)}</span>
          </div>
        </div>
        <div className="flex gap-10 ">
          <button
            onClick={handlePay}
            className="text-md font-bold uppercase px-2 w-[140px] py-2 rounded-md bg-orange-300 hover:bg-orange-500"
          >
            Pay
          </button>
          <button
            onClick={printReceipt}
            className="text-md font-bold uppercase absolute top-3 px-2 w-[140px] py-2 rounded-md bg-orange-300 hover:bg-orange-500"
          >
            Print receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPOS;

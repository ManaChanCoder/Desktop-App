import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore"; // Import setDoc for adding new products
import {
  ref,
  deleteObject,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../db/firebase";
import { IoSearchOutline } from "react-icons/io5";
import { FaBarcode } from "react-icons/fa6";
import { MdOutlinePictureAsPdf } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import { FaImage } from "react-icons/fa6";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import autoTable from "jspdf-autotable";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const Product = () => {
  const [product, setProduct] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingProduct, setAddingProduct] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [originalProduct, setOriginalProduct] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    stocks: "",
    createdBy: "",
    barcode: "",
    image: null,
    imageName: "",
  });
  const [isScannerActive, setIsScannerActive] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(
        collection(db, "pet-food-pet-accessories")
      );
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
      setProduct(productData);
      setFilteredProducts(productData);
      setCheckedItems(Array(productData.length).fill(false));
      setLoading(false);
    };

    fetchProduct();
  }, []);

  useEffect(() => {
    const results = product.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, product]);

  const handleMasterCheckboxChange = () => {
    setAllChecked(!allChecked);
    setCheckedItems(Array(product.length).fill(!allChecked));
  };

  const handleIndividualCheckboxChange = (index) => {
    const updatedCheckedItems = [...checkedItems];
    updatedCheckedItems[index] = !checkedItems[index];
    setCheckedItems(updatedCheckedItems);

    const allItemsChecked = updatedCheckedItems.every((item) => item);
    setAllChecked(allItemsChecked);
  };

  const handleDeleteAll = async () => {
    const selectedItems = product.filter((_, index) => checkedItems[index]);

    if (selectedItems.length === 0) {
      alert("Check those checkboxes please!");
      return;
    }

    const confirmation = window.confirm(
      "Are you sure you want to delete the selected products?"
    );
    if (!confirmation) return;

    try {
      await Promise.all(
        selectedItems.map(async (item) => {
          await deleteDoc(doc(db, "pet-food-pet-accessories", item.id));
          const imageRef = ref(
            storage,
            `images/pet-food-pet-accessories/${item.imageName}`
          );
          await deleteObject(imageRef);
        })
      );

      setProduct((prevProducts) =>
        prevProducts.filter((_, index) => !checkedItems[index])
      );
      setCheckedItems(Array(product.length).fill(false));
      setAllChecked(false);
      alert("Selected products have been deleted.");
    } catch (error) {
      console.error("Error deleting products: ", error);
      alert("An error occurred while deleting the products.");
    }
  };

  // Edit once icon is clicked
  const handleEditClick = (product) => {
    setEditProduct(product); // Set product to be edited
    setOriginalProduct(product); // Set original product for comparison
    setShowEditProduct(true); // Show edit form
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    // Check if changes were made
    if (JSON.stringify(editProduct) === JSON.stringify(originalProduct)) {
      alert("No changes to save.");
      return; // Exit if there are no changes
    }

    setLoading(true); // Show loading spinner or indicator while saving changes

    try {
      const docRef = doc(db, "pet-food-pet-accessories", editProduct.id);

      // Update product in Firestore
      await setDoc(docRef, editProduct, { merge: true });

      setProduct((prevProducts) =>
        prevProducts.map((prod) =>
          prod.id === editProduct.id ? { ...prod, ...editProduct } : prod
        )
      );

      alert("Product updated successfully!");
      setShowEditProduct(false); // Hide edit form
      setEditProduct(null); // Clear edit product
    } catch (error) {
      console.error("Error updating product: ", error);
      alert("An error occurred while updating the product.");
    } finally {
      setLoading(false); // Reset loading state after the operation completes
    }
  };

  //   sing delete if the icon is clicked
  const handleDeleteSingle = async (index, id, imageName) => {
    // Check if the corresponding checkbox is checked
    if (!checkedItems[index]) {
      alert("Please check the box before deleting the product!");
      return;
    }

    const confirmation = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmation) return;

    try {
      await deleteDoc(doc(db, "pet-food-pet-accessories", id));
      const imageRef = ref(
        storage,
        `images/pet-food-pet-accessories/${imageName}`
      );
      await deleteObject(imageRef);

      setProduct((prevProducts) =>
        prevProducts.filter((product) => product.id !== id)
      );
      alert("Product has been deleted.");
    } catch (error) {
      console.error("Error deleting product: ", error);
      alert("An error occurred while deleting the product.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct((prev) => ({
        ...prev,
        image: file,
        imageName: file.name, // Save the file name for upload
      }));
    }
  };

  // Detect barcode scanner input
  const handleBarcodeScan = (e) => {
    // Check if it's the barcode input field
    if (e.target.name === "barcode") {
      setNewProduct((prev) => ({
        ...prev,
        barcode: e.target.value, // Automatically update the barcode field
      }));
    }
  };

  //   make it real time
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "pet-food-pet-accessories"),
      async (snapshot) => {
        setLoading(true);
        const productData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const imageRef = ref(
              storage,
              `images/pet-food-pet-accessories/${data.imageName}`
            );
            const imageUrl = await getDownloadURL(imageRef);
            return { id: doc.id, ...data, imageUrl };
          })
        );
        setProduct(productData);
        setFilteredProducts(productData);
        setCheckedItems(Array(productData.length).fill(false));
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddingProduct(true);

    const { name, brand, category, price, stocks, image, barcode, imageName } =
      newProduct;
    if (
      !name ||
      !brand ||
      !category ||
      !price ||
      !stocks ||
      !image ||
      !barcode
    ) {
      alert("Please upload an image and fill all required fields.");
      setAddingProduct(false);
      return;
    }

    const imageRef = ref(
      storage,
      `images/pet-food-pet-accessories/${imageName}`
    );

    try {
      // Check if the image already exists in Storage
      await getDownloadURL(imageRef);
      alert("Product Already Exist");
      setAddingProduct(false);
      return;
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        // Image does not exist, proceed with the upload
        try {
          await uploadBytes(imageRef, image);

          const productData = {
            name,
            brand,
            category,
            price: parseFloat(price),
            stocks: parseInt(stocks, 10),
            createdBy: "Admin",
            imageName,
            barcode,
          };

          await setDoc(
            doc(collection(db, "pet-food-pet-accessories")),
            productData
          );

          setNewProduct({
            name: "",
            brand: "",
            category: "",
            price: "",
            stocks: "",
            createdBy: "",
            image: null,
            imageName: "",
            barcode: "",
          });
          setBarcode("");
          alert("Product added successfully!");
          setShowAddProduct(false);
        } catch (error) {
          console.error("Error adding product: ", error);
          alert("An error occurred while adding the product.");
        }
      } else {
        console.error("Error checking image existence: ", error);
        alert("An error occurred while checking for existing image.");
      }
    } finally {
      setAddingProduct(false);
    }
  };

  const toggleAddProductSection = () => {
    setShowAddProduct(!showAddProduct);
    setIsScannerActive(!showAddProduct); // Toggle scanner along with Add Product form
  };

  // Function to generate and download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableData = product.map((prod) => [
      prod.name,
      prod.price,
      prod.createdBy,
      prod.brand,
      prod.stocks,
    ]);

    // Add title
    doc.text("Product List", 14, 16);

    // Add a table
    autoTable(doc, {
      head: [["Product Name", "Price", "Created By", "Brand", "Stocks"]],
      body: tableData,
      startY: 20,
    });

    // Save the PDF
    doc.save("products.pdf");
  };

  useEffect(() => {
    // Activate the scanner only when adding a product
    if (showAddProduct) {
      setIsScannerActive(true); // Enable scanner when the add product section is shown
    } else {
      setIsScannerActive(false);
    }
  }, [showAddProduct]);

  // Function to download Barcodes Only PDF
  const handleDownloadBarcodesPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const barcodeWidth = 80;
    const barcodeHeight = 20;
    let currentY = 30;

    // Centered title
    doc.setFontSize(16);
    doc.text("Product Barcodes", pageWidth / 2, 16, { align: "center" });

    product.forEach((prod, index) => {
      const productName = prod.name || "Unknown Product";
      const productBarcode = prod.barcode || "Unknown Barcode";

      // Create barcode image with JsBarcode
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, productBarcode, {
        format: "CODE128",
        width: 2,
        height: 40,
      });
      const barcodeDataURL = canvas.toDataURL("image/png");

      // Center product name
      doc.setFontSize(12);
      const productNameLines = doc.splitTextToSize(
        `${index + 1}. ${productName}`,
        pageWidth - 40
      ); // Wrap long text
      doc.text(productNameLines, pageWidth / 2, currentY, { align: "center" });
      currentY += productNameLines.length * 6; // Adjust Y based on the number of lines

      // Center barcode image and add
      const barcodeXPosition = (pageWidth - barcodeWidth) / 2;
      doc.addImage(
        barcodeDataURL,
        "PNG",
        barcodeXPosition,
        currentY + 5,
        barcodeWidth,
        barcodeHeight
      );

      // Update Y position for the next entry
      currentY += barcodeHeight + 20;

      // Move to the next page if Y position exceeds page height
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    });

    // Save the PDF
    doc.save("product_barcodes.pdf");
  };

  // Barcode scanner callback to handle scanned barcode
  const handleBarcodeDetected = (err, result) => {
    if (result) {
      const detectedBarcode = result.text;

      // Update the newProduct state with the detected barcode
      setNewProduct((prev) => ({
        ...prev,
        barcode: detectedBarcode,
      }));

      // Update the searchTerm with the detected barcode
      setSearchTerm(detectedBarcode); // Automatically filter by barcode

      // Play sound to notify barcode detection
      const audio = new Audio("../shared/sounds/beep.mp3");
      audio.play();

      // Disable scanner after detection
      setIsScannerActive(false);
      alert(`Barcode detected: ${detectedBarcode}`);
    }
  };

  useEffect(() => {
    const results = product.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) // Added barcode filter
    );
    setFilteredProducts(results);
  }, [searchTerm, product]);

  const toggleScanner = () => {
    setIsScannerActive((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission
  };

  return (
    <div className="w-[80%] text-white px-5 py-7 relative">
      <div className="flex flex-col gap-5">
        <div className="flex flex-row justify-between items-center">
          <span className="uppercase text-white text-2xl font-bold">
            Product
          </span>
          <form
            onSubmit={handleSubmit}
            className="flex bg-slate-300 rounded-3xl px-3 py-2"
          >
            <input
              type="text"
              placeholder="Search..."
              className="w-[90%] text-black bg-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsScannerActive(true)} // Activate scanner when input is focused
              onBlur={() => setIsScannerActive(false)} // Deactivate scanner when input is blurred
            />
            <IoSearchOutline size={24} className="text-slate-600" />
          </form>
        </div>

        {/* add product */}
        {showAddProduct && (
          <div className="absolute top-[82%] left-[25%] translate-x-[-25%] translate-y-[-82%] w-[40%] h-[370px] bg-red-500 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100">
            <div className="flex flex-col gap-2 px-3 py-5">
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  className="text-black"
                  onChange={handleFileChange}
                />
                <div className="w-full h-[95px] flex flex-row justify-between gap-2">
                  <div className="w-[60%] bg-orange-500 border border-solid border-orange-500 flex items-center">
                    {/* display uploaded image or placeholder */}
                    {newProduct.image ? (
                      <img
                        src={URL.createObjectURL(newProduct.image)}
                        alt=""
                        className="h-[95px] w-full"
                      />
                    ) : (
                      <FaImage className="w-full h-full" />
                    )}
                  </div>
                  <div className="w-[40%] flex flex-col gap-5">
                    <button
                      className="w-[120px] text-white text-sm bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded-md"
                      onClick={handleAddProduct}
                    >
                      {addingProduct ? "Adding..." : "Create Product"}
                      {/* Show "Adding..." */}
                    </button>
                    <button
                      className="w-[120px] text-white text-sm bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md"
                      onClick={toggleAddProductSection}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <form
                  className="flex flex-col gap-2 text-black"
                  onSubmit={handleAddProduct}
                >
                  {/* add product section */}
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    className="w-full outline-none border border-solid border-black rounded-md px-2 placeholder-black"
                    placeholder="Product Name"
                  />
                  <input
                    type="text"
                    name="brand"
                    value={newProduct.brand}
                    onChange={handleInputChange}
                    className="w-full outline-none border border-solid border-black rounded-md px-2 placeholder-black"
                    placeholder="Product Brand"
                  />
                  <input
                    type="text"
                    name="category"
                    value={newProduct.category}
                    onChange={handleInputChange}
                    className="w-full outline-none border border-solid border-black rounded-md px-2 placeholder-black"
                    placeholder="Product Category"
                  />
                  <input
                    type="number"
                    name="price"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    className="w-full outline-none border border-solid border-black rounded-md px-2 placeholder-black"
                    placeholder="Product Price"
                  />
                  <input
                    type="number"
                    name="stocks"
                    value={newProduct.stocks}
                    onChange={handleInputChange}
                    className="w-full outline-none border border-solid border-black rounded-md px-2 placeholder-black"
                    placeholder="Stocks"
                  />
                  <input
                    type="text"
                    name="barcode"
                    value={newProduct.barcode}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        barcode: e.target.value,
                      }))
                    }
                    placeholder="Barcode"
                    className="w-full outline-none border border-solid border-black rounded-md px-2 placeholder-black"
                  />
                </form>
              </div>
            </div>
          </div>
        )}

        {/* edit product */}
        {showEditProduct && (
          <div className="absolute top-[82%] left-[25%] translate-x-[-25%] translate-y-[-82%] w-[40%] h-[380px] bg-blue-500 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100">
            <div className="flex flex-col gap-2 px-3 py-5">
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  className="text-black"
                  onChange={handleFileChange}
                />
                <div className="w-full h-[95px] flex flex-row justify-between gap-2">
                  <div className="w-[60%] bg-orange-500 border border-solid border-orange-500 flex items-center">
                    {/* Show current image or placeholder */}
                    {editProduct.imageUrl ? (
                      <img
                        src={editProduct.imageUrl}
                        alt=""
                        className="h-[95px] w-full"
                      />
                    ) : (
                      <FaImage className="w-full h-full" />
                    )}
                  </div>
                  <div className="w-[40%] flex flex-col gap-5">
                    <button
                      className="w-[120px] text-white text-sm bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded-md"
                      onClick={handleSaveEdit}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      className="w-[120px] text-white text-sm bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md"
                      onClick={() => setShowEditProduct(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <form
                  className="flex flex-col gap-2 text-black"
                  onSubmit={handleSaveEdit}
                >
                  <input
                    type="text"
                    name="name"
                    value={editProduct.name}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, name: e.target.value })
                    }
                    className="w-full outline-none border border-solid border-black rounded-md px-2 placeholder-black"
                    placeholder="Product Name"
                  />
                  <input
                    type="text"
                    name="brand"
                    value={editProduct.brand}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, brand: e.target.value })
                    }
                    className="w-full outline-none border border-solid border-black rounded-md px-2 placeholder-black"
                    placeholder="Product Brand"
                  />
                  <input
                    type="text"
                    name="category"
                    value={editProduct.category}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        category: e.target.value,
                      })
                    }
                    className="w-full outline-none border border-solid border-black rounded-md px-2 placeholder-black"
                    placeholder="Product Category"
                  />
                  <input
                    type="number"
                    name="price"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, price: e.target.value })
                    }
                    className="w-full outline-none border border-solid border-black rounded-md px-2 placeholder-black"
                    placeholder="Product Price"
                  />
                  <input
                    type="number"
                    name="stocks"
                    value={editProduct.stocks}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, stocks: e.target.value })
                    }
                    className="w-full outline-none border border-solid border-black rounded-md px-2 placeholder-black"
                    placeholder="Stocks"
                  />
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-h-[500px] bg-slate-100 rounded-md text-black mt-10 overflow-y-auto">
          <div className="flex justify-between px-10 py-5">
            <span className="font-bold text-md">All Products List</span>
            <div className="flex flex-row gap-5">
              <button
                onClick={toggleAddProductSection}
                className="text-sm text-white bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded-2xl"
              >
                Add Product
              </button>
              <button
                className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-2xl"
                onClick={handleDeleteAll}
              >
                Delete Product
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center text-black text-sm"
              >
                Download PDF
                <MdOutlinePictureAsPdf size={20} className="ml-1" />
              </button>
              <button
                onClick={handleDownloadBarcodesPDF}
                className="flex items-center text-black text-sm"
              >
                Download
                <FaBarcode size={20} className="ml-1" />
              </button>
            </div>
          </div>
          <hr />

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <span className="text-lg font-semibold text-gray-600">
                Loading products...
              </span>
            </div>
          ) : (
            <>
              <div className="w-full text-slate-600 font-semibold flex justify-between px-10 py-5">
                <div className="w-[40%] flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={handleMasterCheckboxChange}
                  />
                  <span>Product</span>
                </div>
                <span className="w-[16.66%]">Starting Price</span>
                <span className="w-[16.66%] text-center">Created by</span>
                <span className="w-[25%] text-center">Brand</span>
                <span className="w-[16.66%]">Product Stock</span>
                <span className="w-[15%] text-center">Action</span>
              </div>

              {filteredProducts.map((product, index) => (
                <div
                  key={product.id || index}
                  className="w-full flex justify-between items-center px-10 py-3 border-t"
                >
                  <div className="w-[40%] flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checkedItems[index]}
                      onChange={() => handleIndividualCheckboxChange(index)}
                    />
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-10 h-10"
                    />
                    <span>{product.name}</span>
                  </div>
                  <span className="w-[16.66%] text-center">
                    {product.price}
                  </span>
                  <span className="w-[16.66%] text-center">
                    {product.createdBy}
                  </span>
                  <span className="w-[25%] text-center">{product.brand}</span>
                  <span className="w-[16.66%] text-center">
                    {product.stocks}
                  </span>
                  <div className="flex justify-between gap-2 w-[15%]">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="p-2 text-orange-500 bg-gray-200 rounded-full"
                    >
                      <CiEdit size={18} />
                    </button>
                    <button
                      className="p-2 text-red-500 bg-gray-200 rounded-full"
                      onClick={() =>
                        handleDeleteSingle(index, product.id, product.imageName)
                      }
                    >
                      <MdDeleteForever size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;

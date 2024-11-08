import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../db/firebase";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlinePictureAsPdf } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const uniqueBrands = new Set();
      const querySnapshot = await getDocs(
        collection(db, "pet-food-pet-accessories")
      );
      const categoriesData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();

          if (uniqueBrands.has(data.brand)) return null;
          uniqueBrands.add(data.brand);

          const imageRef = ref(
            storage,
            `images/pet-food-pet-accessories/${data.imageName}`
          );
          const imageUrl = await getDownloadURL(imageRef);

          return { ...data, id: doc.id, imageUrl };
        })
      );

      const filteredCategories = categoriesData.filter(Boolean);
      setCategories(filteredCategories);
      setFilteredCategories(filteredCategories);
      setCheckedItems(Array(filteredCategories.length).fill(false));
      setLoading(false);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const results = categories.filter(
      (category) =>
        category.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.barcode === searchTerm
    );
    setFilteredCategories(results);
  }, [searchTerm, categories]);

  const handleMasterCheckboxChange = () => {
    setAllChecked(!allChecked);
    setCheckedItems(Array(filteredCategories.length).fill(!allChecked));
  };

  const handleIndividualCheckboxChange = (index) => {
    const updatedCheckedItems = [...checkedItems];
    updatedCheckedItems[index] = !checkedItems[index];
    setCheckedItems(updatedCheckedItems);

    const allItemsChecked = updatedCheckedItems.every((item) => item);
    setAllChecked(allItemsChecked);
  };

  const handleDeleteAll = async () => {
    // Check if all items are checked
    if (!allChecked) {
      alert("Please click all checkboxes to delete all categories.");
      return;
    }

    const selectedCategories = filteredCategories.filter(
      (_, index) => checkedItems[index]
    );

    const deletePromises = selectedCategories.map(async (category) => {
      const brandQuery = query(
        collection(db, "pet-food-pet-accessories"),
        where("brand", "==", category.brand)
      );
      const brandSnapshot = await getDocs(brandQuery);

      const deleteOperations = brandSnapshot.docs.map(async (doc) => {
        const imageData = doc.data();
        const imageRef = ref(
          storage,
          `images/pet-food-pet-accessories/${imageData.imageName}`
        );

        await deleteDoc(doc.ref);
        await deleteObject(imageRef);
      });

      await Promise.all(deleteOperations);
    });

    try {
      await Promise.all(deletePromises);
      alert("All selected categories and associated items have been deleted.");

      // Update state to reflect deletions
      setCategories(categories.filter((_, index) => !checkedItems[index]));
      setFilteredCategories(
        filteredCategories.filter((_, index) => !checkedItems[index])
      );

      // Reset checkboxes
      setCheckedItems(Array(filteredCategories.length).fill(false));
      setAllChecked(false);
    } catch (error) {
      console.error("Error deleting categories:", error);
      alert("An error occurred while deleting categories.");
    }
  };

  const handleIndividualDelete = async (category, index) => {
    // Check if the checkbox for this item is checked before proceeding
    if (!checkedItems[index]) {
      alert("Please click the checkbox before delete the category.");
      return; // Exit the function if the checkbox is not checked
    }

    if (
      window.confirm(
        `Are you sure you want to delete the category '${category.brand}' and all associated images and records?`
      )
    ) {
      try {
        // Step 1: Query Firestore for all items with the matching brand
        const brandQuery = query(
          collection(db, "pet-food-pet-accessories"),
          where("brand", "==", category.brand)
        );
        const brandSnapshot = await getDocs(brandQuery);

        // Step 2: Prepare deletion operations for each item
        const deleteOperations = brandSnapshot.docs.map(async (doc) => {
          const imageData = doc.data();

          // Reference to the image in Firebase Storage
          const imageRef = ref(
            storage,
            `images/pet-food-pet-accessories/${imageData.imageName}`
          );

          // Delete the document in Firestore and the associated image in Storage
          await deleteDoc(doc.ref);
          await deleteObject(imageRef);
        });

        // Execute all deletions
        await Promise.all(deleteOperations);

        // Notify user of successful deletion
        alert(
          `Category '${category.brand}' and all its records have been deleted.`
        );

        // Step 3: Update the state to reflect changes
        setCategories(
          categories.filter((item) => item.brand !== category.brand)
        );
        setFilteredCategories(
          filteredCategories.filter((item) => item.brand !== category.brand)
        );
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("An error occurred while deleting the category.");
      }
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableData = categories.map((prod) => [
      prod.name,
      prod.price,
      prod.createdBy,
      prod.brand,
      prod.stocks,
    ]);

    doc.text("Category List", 14, 16);

    autoTable(doc, {
      head: [["Product Name", "Price", "Created By", "Brand", "Stocks"]],
      body: tableData,
      startY: 20,
    });

    doc.save("categories.pdf");
  };

  const handleSearch = (e) => {
    // Prevent page refresh on form submission
    e.preventDefault();

    const results = categories.filter(
      (category) =>
        category.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.barcode == searchTerm
    );
    setFilteredCategories(results);
  };

  return (
    <div className="w-[80%] text-white px-5 py-7 ">
      <div className="flex flex-col gap-5">
        <div className="flex flex-row justify-between items-center">
          <span className="uppercase text-white text-2xl font-bold">
            Category
          </span>
          <form
            onSubmit={handleSearch}
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

        <div className="w-full max-h-[500px] bg-slate-100 rounded-md text-black mt-10 overflow-y-auto">
          <div className="flex justify-between px-10 py-5">
            <span className="font-bold text-md">All Categories List</span>
            <div className="flex flex-row gap-5">
              <button
                onClick={handleDeleteAll}
                className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-2xl"
              >
                Delete Category
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center text-black text-sm"
              >
                Download PDF
                <MdOutlinePictureAsPdf size={20} className="ml-1" />
              </button>
            </div>
          </div>
          <hr />

          {loading ? (
            <div className="flex justify-center items-center py-5">
              <span className="text-lg font-semibold text-gray-600">
                Loading categories...
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
                  <span>Categories</span>
                </div>
                <span className="w-[16.66%] text-center">Created by</span>
                <span className="w-[25%] text-center">Brand</span>
                <span className="w-[16.66%]">Product Stock</span>
                <span className="w-[15%] text-center">Action</span>
              </div>

              {filteredCategories.map((category, index) => (
                <div
                  key={category.id || index}
                  className="w-full flex justify-between items-center px-10 py-3 border-t"
                >
                  <div className="w-[40%] flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checkedItems[index]}
                      onChange={() => handleIndividualCheckboxChange(index)}
                    />
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-10 h-10"
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="w-[16.66%] text-center">
                    {category.createdBy}
                  </span>
                  <span className="w-[25%] text-center">{category.brand}</span>
                  <span className="w-[16.66%] text-center">
                    {category.stocks}
                  </span>
                  <div className="flex justify-center w-[15%]">
                    {/* single delete */}
                    <button
                      className="p-2 text-red-500 bg-gray-200 rounded-full"
                      onClick={() => handleIndividualDelete(category, index)}
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

export default Category;

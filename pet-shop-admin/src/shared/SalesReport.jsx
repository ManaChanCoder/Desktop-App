import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { db } from "../db/firebase"; // import your Firebase config
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const currentYear = new Date().getFullYear();

        // Fetch last year from Firestore or initialize if not present
        const yearDocRef = doc(db, "report", "lastYear");
        const yearDocSnap = await getDoc(yearDocRef);

        let lastYear = yearDocSnap.exists()
          ? yearDocSnap.data().year
          : currentYear;

        // If it's a new year, reset the sales data
        const isNewYear = currentYear !== lastYear;

        const monthlySales = {
          Jan: 0,
          Feb: 0,
          Mar: 0,
          Apr: 0,
          May: 0,
          Jun: 0,
          Jul: 0,
          Aug: 0,
          Sep: 0,
          Oct: 0,
          Nov: 0,
          Dec: 0,
        };

        if (isNewYear) {
          // Reset yearly data in Firestore
          await setDoc(yearDocRef, { year: currentYear });
          console.log("New year detected. Resetting monthly sales data.");
        } else {
          // Proceed to fetch existing sales data
          const transactionsRef = collection(db, "transaction");
          const q = query(transactionsRef, orderBy("timestamp"));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            const transaction = doc.data();
            const timestamp = transaction.timestamp;

            if (timestamp) {
              const date = timestamp.toDate();
              const transactionYear = date.getFullYear();

              // Only include transactions from the current year
              if (transactionYear === currentYear) {
                const month = date.toLocaleString("default", {
                  month: "short",
                });

                if (transaction.totalPrice && !isNaN(transaction.totalPrice)) {
                  monthlySales[month] += transaction.totalPrice;
                }
              }
            }
          });
        }

        const formattedData = Object.keys(monthlySales).map((month) => ({
          month,
          sales: monthlySales[month],
        }));

        setSalesData(formattedData);
      } catch (error) {
        console.error("Error fetching sales data: ", error);
      }
    };

    fetchSalesData();
  }, []);

  const downloadPDF = async () => {
    // Select only the content we want in the PDF
    const input = document.getElementById("sales-report-content");
    const pdf = new jsPDF("portrait");
    let yOffset = 20;

    try {
      // Add title
      pdf.setFontSize(16);
      pdf.text("Sales Report", pdf.internal.pageSize.width / 2, yOffset, {
        align: "center",
      });
      yOffset += 10;

      // Add monthly sales table
      const tableData = salesData.map(({ month, sales }) => [
        month,
        `Php ${sales.toLocaleString()}`,
      ]);
      pdf.autoTable({
        startY: yOffset,
        head: [["Month", "Sales"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [247, 215, 5] }, // Gold header color
        margin: { left: 40, right: 40 }, // Center table
      });

      // Calculate new Y offset after table
      yOffset = pdf.autoTable.previous.finalY + 10;

      // Render chart as an image
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 180; // Fit image within PDF width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        (pdf.internal.pageSize.width - imgWidth) / 2,
        yOffset,
        imgWidth,
        imgHeight
      );

      // Save the PDF
      pdf.save("Sales_Report.pdf");
    } catch (error) {
      console.error("Error generating PDF: ", error);
    }
  };

  return (
    <div>
      {/* Button outside the content */}
      <div className="flex justify-center gap-5">
        <h2 className="text-center text-xl font-bold uppercase">
          Sales Report
        </h2>
        <button
          className="text-sm bg-red-500 px-2 py-1 rounded-md active:bg-[#a2292e]"
          onClick={downloadPDF}
        >
          Download PDF
        </button>
      </div>

      {/* Content to include in the PDF */}
      <div id="sales-report-content" className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={salesData}
            margin={{ top: 20, right: 40, left: 20, bottom: 5 }}
            barSize={50}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fill: "#4caf50" }} tickMargin={10} />
            <YAxis tick={{ fill: "#4caf50" }} />
            <Tooltip wrapperStyle={{ color: "#4caf50" }} />
            <Legend wrapperStyle={{ color: "#4caf50" }} />
            <Bar dataKey="sales" fill="#f7d705" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesReport;

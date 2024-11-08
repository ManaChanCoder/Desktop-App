import React from "react";
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

// Sample data
const data = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "March", sales: 5000 },
  { month: "April", sales: 4000 },
  { month: "May", sales: 6000 },
  { month: "June", sales: 7000 },
  { month: "July", sales: 8000 },
  { month: "Aug", sales: 9000 },
  { month: "Sept", sales: 10000 },
  { month: "Oct", sales: 11000 },
  { month: "Nov", sales: 12000 },
  { month: "Dec", sales: 21000 },
];

const SalesReport = () => {
  return (
    <div className="w-full h-[400px]">
      <h2 className="text-center text-xl font-bold uppercase">Sales Report</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 40, left: 20, bottom: 5 }}
          barSize={20}
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
  );
};

export default SalesReport;

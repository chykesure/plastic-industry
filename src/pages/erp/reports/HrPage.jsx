import React, { useState } from "react";
import { Download, Users } from "lucide-react";

// -----------------------------
// Inline UI Components
// -----------------------------
const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-md border border-gray-700 bg-gray-800 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;

// -----------------------------
// HR Report Page
// -----------------------------
const HrPage = () => {
  const [employeeData] = useState([
    { id: 1, name: "John Doe", department: "Finance", status: "Active" },
    { id: 2, name: "Sarah Johnson", department: "HR", status: "On Leave" },
    { id: 3, name: "Michael Smith", department: "IT", status: "Active" },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-emerald-400">HR Report</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
          <Download className="w-4 h-4" /> Export HR
        </Button>
      </div>

      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Employee List</h3>
          <table className="min-w-full text-gray-300 border border-gray-700">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {employeeData.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">{emp.name}</td>
                  <td className="py-3 px-4">{emp.department}</td>
                  <td className="py-3 px-4">{emp.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HrPage;

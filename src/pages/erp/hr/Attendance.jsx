import React, { useState } from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

const Button = ({ children, className = "", ...props }) => (
  <button {...props} className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition ${className}`}>
    {children}
  </button>
);
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-md border border-gray-700 bg-gray-800 ${className}`}>{children}</div>
);
const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;

const Attendance = () => {
  const [attendance] = useState([
    { id: 1, name: "John Doe", date: "2025-10-20", status: "Present" },
    { id: 2, name: "Sarah Johnson", date: "2025-10-20", status: "Absent" },
  ]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold text-emerald-400">Attendance Tracker</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Mark Attendance
        </Button>
      </div>

      <Card>
        <CardContent>
          <table className="min-w-full text-sm text-gray-300">
            <thead className="border-b border-gray-700 text-gray-400 uppercase tracking-wide text-xs">
              <tr>
                <th className="py-3 text-left">Employee</th>
                <th className="py-3 text-left">Date</th>
                <th className="py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="py-3">{a.name}</td>
                  <td className="py-3">{a.date}</td>
                  <td className="py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        a.status === "Present"
                          ? "bg-emerald-700 text-emerald-200"
                          : "bg-red-700 text-red-200"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
export default Attendance;

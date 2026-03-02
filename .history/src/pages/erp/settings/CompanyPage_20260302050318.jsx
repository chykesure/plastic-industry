import React, { useState } from "react";
import { UploadCloud } from "lucide-react";

// -----------------------------
// Inline UI Components
// -----------------------------
const Button = ({ children, className = "", ...props }) => (
  <button {...props} className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition ${className}`}>
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-md border border-gray-700 bg-gray-800 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;

const CompanyPage = () => {
  const [storeInfo, setStoreInfo] = useState({
    name: "Grox Shopping Store",
    address: "123 Main St, Lagos",
    email: "contact@groxstore.com",
    phone: "08012345678",
    logo: null
  });

  const handleChange = (e) => setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value });
  const handleLogoChange = (e) => setStoreInfo({ ...storeInfo, logo: e.target.files[0] });

  const handleSave = () => {
    console.log("Store info saved:", storeInfo);
    alert("Store info saved successfully!");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-emerald-400 mb-6">Company / Store Information</h2>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <input name="name" placeholder="Store Name" value={storeInfo.name} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <input name="address" placeholder="Address" value={storeInfo.address} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <input name="email" placeholder="Email" value={storeInfo.email} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <input name="phone" placeholder="Phone" value={storeInfo.phone} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
                <UploadCloud className="w-5 h-5 text-gray-200" /> Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              {storeInfo.logo && <span className="text-gray-300">{storeInfo.logo.name}</span>}
            </div>

            <div className="flex justify-end mt-4">
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyPage;

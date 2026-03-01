import React, { useState, useEffect } from "react";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:8080/api/categories";

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        showMessage("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Add new category
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    if (categories.some((cat) => cat.name.toLowerCase() === newCategory.toLowerCase())) {
      showMessage("Category already exists!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories([...categories, data]);
        setNewCategory("");
        showMessage("Category added successfully!");
      } else {
        showMessage(data.message || "Failed to add category");
      }
    } catch (err) {
      console.error("Error adding category:", err);
      showMessage("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  // Edit category
  const handleEdit = (id, name) => {
    setEditId(id);
    setEditName(name);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;

    if (categories.some((cat) => cat.name.toLowerCase() === editName.toLowerCase() && cat._id !== editId)) {
      showMessage("Category already exists!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(categories.map((cat) => (cat._id === editId ? data : cat)));
        setEditId(null);
        setEditName("");
        showMessage("Category updated successfully!");
      } else {
        showMessage(data.message || "Failed to update category");
      }
    } catch (err) {
      console.error("Error updating category:", err);
      showMessage("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setCategories(categories.filter((cat) => cat._id !== id));
        showMessage(data.message || "Category deleted successfully");
      } else {
        showMessage(data.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      showMessage("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-9xl mx-auto bg-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-white">Product Categories</h2>
      <p className="text-gray-400 mb-6">Add, edit, or remove product categories.</p>

      {message && <div className="mb-4 p-2 bg-blue-600 text-white rounded">{message}</div>}
      {loading && <div className="mb-4 text-gray-200">Loading...</div>}

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category"
          className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 flex-1"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition" disabled={loading}>
          Add
        </button>
      </form>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category..."
          className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
        />
      </div>

      {/* Category Table */}
      <table className="w-full border border-gray-700 rounded-md text-gray-200">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left">Category Name</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat) => (
              <tr key={cat._id} className="border-t border-gray-700 hover:bg-gray-800 transition">
                <td className="px-4 py-2">
                  {editId === cat._id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="px-4 py-2 flex gap-2 justify-center">
                  {editId === cat._id ? (
                    <button onClick={handleSaveEdit} className="px-3 py-1 bg-green-600 rounded hover:bg-green-500" disabled={loading}>
                      Save
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(cat._id, cat.name)} className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-500" disabled={loading}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(cat._id)} className="px-3 py-1 bg-red-600 rounded hover:bg-red-500" disabled={loading}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center py-4 text-gray-500 italic">
                No categories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Categories;

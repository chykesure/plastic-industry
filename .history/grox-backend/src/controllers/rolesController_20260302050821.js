const Role = require("../models/Role");

// Create a new role
const createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    if (!name) return res.status(400).json({ message: "Role name is required" });

    const roleExists = await Role.findOne({ name });
    if (roleExists) return res.status(400).json({ message: "Role already exists" });

    const role = await Role.create({ name, permissions: permissions || [] });
    res.status(201).json({ message: "Role created", role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// List all roles
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update a role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    if (name) role.name = name;
    if (permissions) role.permissions = permissions;

    await role.save();
    res.json({ message: "Role updated", role });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    await role.remove();
    res.json({ message: "Role deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
};

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory User Database
let usersList = [
    {
        id: 1,
        role: "Farmer",
        name: "Ramesh Kumar",
        phone: "+919876543210",
        district: "South 24 Parganas"
    }
];

// In-Memory Produce Database
let produceList = [
    {
        id: 1,
        name: "Tomato",
        qty: 500,
        price: 30,
        quality: "Grade A",
        harvestDate: "2026-09-04",
        expiryDate: "2026-09-10",
        location: "South 24 Parganas",
        storage: "Cold Store",
        sellerPhone: "+919876543210"
    }
];

// --- AUTHENTICATION ROUTE ---
app.post('/api/login', (req, res) => {
    const { role, name, phone, district } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ success: false, message: "Name and Mobile Number are required." });
    }

    // Check if user already exists by phone
    let user = usersList.find(u => u.phone === phone);

    if (user) {
        // Update existing user profile info
        user.name = name;
        user.role = role;
        user.district = district || user.district;
    } else {
        // Register new user
        user = {
            id: Date.now(),
            role,
            name,
            phone,
            district: district || "Sonarpur"
        };
        usersList.push(user);
    }

    res.json({
        success: true,
        message: "Login successful",
        user: user
    });
});

// --- PRODUCE CRUD ROUTES ---

// GET: Retrieve all produce listings
app.get('/api/produce', (req, res) => {
    res.json({ success: true, data: produceList });
});

// POST: Add new produce listing linked to seller's phone
app.post('/api/produce', (req, res) => {
    const { name, qty, price, quality, harvestDate, expiryDate, location, storage, sellerPhone } = req.body;

    if (!name || !qty || !price) {
        return res.status(400).json({ success: false, message: "Name, quantity, and price are required." });
    }

    const newProduce = {
        id: Date.now(),
        name,
        qty: Number(qty),
        price: Number(price),
        quality,
        harvestDate,
        expiryDate,
        location,
        storage,
        sellerPhone: sellerPhone || null // Connects listing to user's phone number
    };

    produceList.push(newProduce);
    res.status(201).json({ success: true, message: "Produce added successfully!", data: newProduce });
});

// PUT: Update an existing produce listing
app.put('/api/produce/:id', (req, res) => {
    const produceId = parseInt(req.params.id);
    const index = produceList.findIndex(item => item.id === produceId);

    if (index !== -1) {
        produceList[index] = { 
            ...produceList[index], 
            ...req.body, 
            id: produceId // Prevent overwriting ID
        };
        res.json({ success: true, message: "Produce updated successfully!", data: produceList[index] });
    } else {
        res.status(404).json({ success: false, message: "Produce item not found." });
    }
});

// DELETE: Remove a produce listing
app.delete('/api/produce/:id', (req, res) => {
    const produceId = parseInt(req.params.id);
    const initialLength = produceList.length;
    produceList = produceList.filter(item => item.id !== produceId);

    if (produceList.length < initialLength) {
        res.json({ success: true, message: "Produce deleted successfully!" });
    } else {
        res.status(404).json({ success: false, message: "Produce item not found." });
    }
});

// Start Express Server
// At the bottom of server.js:
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
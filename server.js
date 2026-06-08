require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8082;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  if (password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized. Invalid admin password." });
  }
};

// ==========================================
// 1. Public API Endpoints
// ==========================================

// Get all directory occupants
app.get('/api/directory', async (req, res) => {
  try {
    const occupants = await prisma.occupant.findMany();
    // Sort logically from top floor to bottom
    const order = ["third", "second", "first", "ground", "shed1", "shed2"];
    occupants.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    res.json(occupants);
  } catch (error) {
    console.error("Error fetching directory:", error);
    res.status(500).json({ error: "Failed to fetch building directory data" });
  }
});

// Get all gallery images
app.get('/api/gallery', async (req, res) => {
  try {
    const images = await prisma.galleryImage.findMany();
    res.json(images);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.status(500).json({ error: "Failed to fetch gallery image data" });
  }
});

// Admin login verification
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, message: "Authentication successful" });
  } else {
    res.status(401).json({ success: false, error: "Invalid password" });
  }
});

// ==========================================
// 2. Protected Admin API Endpoints
// ==========================================

// Update occupant details (or vacancy status)
app.put('/api/directory/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { 
    isVacant, 
    isSplit,
    areaSft,
    tenantName, 
    tenantCategory, 
    tenantInitials, 
    tenantDescription, 
    tenantContact,
    floorImages
  } = req.body;

  try {
    const updated = await prisma.occupant.update({
      where: { id },
      data: {
        isVacant,
        isSplit,
        areaSft,
        tenantName,
        tenantCategory,
        tenantInitials,
        tenantDescription,
        tenantContact,
        floorImages
      }
    });
    res.json(updated);
  } catch (error) {
    console.error(`Error updating occupant ${id}:`, error);
    res.status(500).json({ error: "Failed to update occupant details" });
  }
});

// Update gallery image details
app.put('/api/gallery/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { title, description, url } = req.body;

  try {
    const updated = await prisma.galleryImage.update({
      where: { id },
      data: { title, description, url }
    });
    res.json(updated);
  } catch (error) {
    console.error(`Error updating gallery image ${id}:`, error);
    res.status(500).json({ error: "Failed to update gallery image" });
  }
});

// Add new gallery image
app.post('/api/gallery', adminAuth, async (req, res) => {
  const { title, description, url } = req.body;
  const id = "gal_" + Date.now();

  try {
    const newImage = await prisma.galleryImage.create({
      data: { id, title, description, url }
    });
    res.json(newImage);
  } catch (error) {
    console.error("Error creating gallery image:", error);
    res.status(500).json({ error: "Failed to add new gallery image" });
  }
});

// Delete gallery image
app.delete('/api/gallery/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await prisma.galleryImage.delete({
      where: { id }
    });
    res.json(deleted);
  } catch (error) {
    console.error(`Error deleting gallery image ${id}:`, error);
    res.status(500).json({ error: "Failed to delete gallery image" });
  }
});

// Get property about details
app.get('/api/property', async (req, res) => {
  try {
    const info = await prisma.propertyInfo.findUnique({
      where: { id: "about" }
    });
    res.json(info);
  } catch (error) {
    console.error("Error fetching property info:", error);
    res.status(500).json({ error: "Failed to fetch property details" });
  }
});

// Update property about details
app.put('/api/property', adminAuth, async (req, res) => {
  const {
    title,
    description1,
    description2,
    accessTitle,
    accessDetails,
    locationTitle,
    locationDetails,
    scheduleTitle,
    scheduleWeekdays,
    scheduleSunday,
    amenityTitle,
    amenity1,
    amenity2,
    amenity3,
    amenity4,
    contactEmail,
    contactPhones
  } = req.body;

  try {
    const updated = await prisma.propertyInfo.update({
      where: { id: "about" },
      data: {
        title,
        description1,
        description2,
        accessTitle,
        accessDetails,
        locationTitle,
        locationDetails,
        scheduleTitle,
        scheduleWeekdays,
        scheduleSunday,
        amenityTitle,
        amenity1,
        amenity2,
        amenity3,
        amenity4,
        contactEmail,
        contactPhones
      }
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating property details:", error);
    res.status(500).json({ error: "Failed to update property details" });
  }
});

// Fallback for SPA routing (serving index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Vishala Vista backend is running!`);
    console.log(`   Local URL:    http://localhost:${PORT}`);
    console.log(`   Network URL:  http://127.0.0.1:${PORT}`);
    console.log(`   Admin Panel:  http://localhost:${PORT}/admin.html\n`);
  });
}

module.exports = app;

const express = require('express');
const { PrismaClient } = require("@prisma/client");
const { userRoute } = require('./routes/userRoutes');
const prisma = new PrismaClient();
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(userRoute);

app.get("/", (req, res) => {
  res.send("Welcome to my project");
});
// Create a new user with a profile (one-to-one relationship)
app.post("/post", async (req, res) => {
  try {
    const { username, email, name, profileBio } = req.body;
    if (!username || !email || !name || !profileBio) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        name,
        profile: {
          create: {
            bio: profileBio,
          },
        },
      },
      include: { profile: true } // Include the profile in the response
    });

    return res.status(201).json({ message: "User and profile created successfully", data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something broke!" });
  }
});

// Get a user along with their profile
app.get("/posts", async (req, res) => {
  // const { id } = req.params;
  try {
    const user = await prisma.user.findMany({
      // where: { id: parseInt(id) },
      include: { profile: true }, // Fetch the related profile
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching user" });
  }
});

// Update a user's profile
app.put("/put", async (req, res) => {
  const { id } = req.params;
  const { username, email, name, profileBio } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username,
        email,
        name,
        profile: {
          update: {
            bio: profileBio, // Update the bio
          },
        },
      },
      include: { profile: true } // Include the updated profile in the response
    });

    return res.json({ message: "User and profile updated successfully", data: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating user" });
  }
});

// Delete a user and their profile
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(id) },
      include: { profile: true }, // Include the profile in the deletion
    });
    return res.json({ message: "User and profile deleted successfully", data: deletedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting user" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something broke!');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

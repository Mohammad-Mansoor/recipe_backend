import express from "express";

import { ENV } from "./config/env.js";
import "./config/db.js";
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
const app = express();
app.use(express.json());
const port = ENV.PORT;

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
  });
});

app.post("/api/favorites", async (req, res) => {
  try {
    const { servings, cookTime, image, title, recipeId, userId } = req.body;
    if (!userId || !recipeId || !title) {
      return res.status(400).json({
        error: "Missing Required Fields!",
      });
    }
    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();
    res.status(201).json({
      createdFavorite: newFavorite[0],
    });
  } catch (error) {
    console.log("Error adding favorite", error);
    res.status(500).json({
      error: "internal server error",
    });
  }
});
app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;
    if (!userId || !recipeId) {
      return res.status(400).json({
        error: "user ID or recipeID is not provided",
      });
    }

    await db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.recipeId, parseInt(recipeId))
        )
      );
    res.status(200).json({
      message: "Favorite Removed successfully",
    });
  } catch (error) {
    console.log("Error removing favorite", error);
    res.status(500).json({
      error: "internal server error",
    });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        error: "user ID is not provided",
      });
    }
    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));
    res.status(200).json({
      userFavorites,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "internal server error",
    });
  }
});
app.listen(port, () => {
  console.log("server is running on port", port);
});

import express from "express";
import Url from "../model/url.js";
import { nanoid } from "nanoid";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// CREATE SHORT URL (PROTECTED)
router.post("/shorten", protect, async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate URL
    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    let shortId;
    let exists = true;

    while (exists) {
      shortId = nanoid(7);
      exists = await Url.findOne({ shortId });
    }

    const url = await Url.create({
      originalUrl,
      shortId,
      userId: req.user._id,
    });

    res.json({
      _id: url._id,
      shortId: url.shortId,
      shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET ALL URLS FOR LOGGED IN USER (PROTECTED)
router.get("/my-urls", protect, async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    const urlsWithShortUrl = urls.map((url) => ({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortId: url.shortId,
      shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
    }));

    res.json(urlsWithShortUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE URL (PROTECTED)
router.delete("/:id", protect, async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Check if user owns this URL
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await Url.findByIdAndDelete(req.params.id);
    res.json({ message: "URL deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// REDIRECT SHORT URL (PUBLIC - NO AUTH REQUIRED)
router.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await Url.findOne({ shortId });
    if (!url) return res.status(404).json({ error: "Not found" });

    url.clicks++;
    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
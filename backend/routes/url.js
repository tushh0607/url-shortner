// import express from "express";
// import Url from "../model/url.js";
// import { nanoid } from "nanoid";

// const router = express.Router();

// // CREATE SHORT URL
// router.post("/shorten", async (req, res) => {
//   try {
//     const { originalUrl } = req.body;

//     if (!originalUrl) {
//       return res.status(400).json({ error: "URL is required" });
//     }

//     // Validate URL
//     try {
//       new URL(originalUrl);
//     } catch {
//       return res.status(400).json({ error: "Invalid URL" });
//     }

//     let shortId;
//     let exists = true;

//     while (exists) {
//       shortId = nanoid(7);
//       exists = await Url.findOne({ shortId });
//     }

//     const url = await Url.create({
//       originalUrl,
//       shortId,
//     });

//     res.json({
//       shortId: url.shortId,
//       shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // REDIRECT SHORT URL
// // router.get("/:shortId", async (req, res) => {
// //   try {
// //     const { shortId } = req.params;

// //     const url = await Url.findOne({ shortId });
// //     if (!url) return res.status(404).json({ error: "Not found" });

// //     url.clicks++;
// //     await url.save();

// //     res.redirect(url.originalUrl);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });

// router.get("/:shortId", async (req, res) => {
//   try {
//     const { shortId } = req.params;

//     const url = await Url.findOne({ shortId });
//     if (!url) {
//       return res.status(404).send("Short URL not found");
//     }

//     let redirectUrl = url.originalUrl.trim();

//     // Ensure proper protocol
//     if (
//       !redirectUrl.startsWith("http://") &&
//       !redirectUrl.startsWith("https://")
//     ) {
//       redirectUrl = "https://" + redirectUrl;
//     }

//     url.clicks += 1;
//     await url.save();

//     return res.redirect(redirectUrl);
//   } catch (err) {
//     console.error("REDIRECT ERROR:", err);
//     return res.status(500).send("Server error");
//   }
// });


// export default router;
import express from "express";
import Url from "../model/url.js";
import { nanoid } from "nanoid";

const router = express.Router();

/**
 * CREATE SHORT URL
 */
router.post("/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "URL is required" });
    }

    let shortId;
    let exists = true;

    while (exists) {
      shortId = nanoid(7);
      exists = await Url.findOne({ shortId });
    }

    const url = await Url.create({
      originalUrl: String(originalUrl).trim(),
      shortId,
    });

    res.json({
      shortId: url.shortId,
      shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
    });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * REDIRECT SHORT URL
 */
router.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await Url.findOne({ shortId });
    if (!url) {
      return res.status(404).send("Short URL not found");
    }

    let redirectUrl = url.originalUrl;

    // HARD SAFETY CHECKS
    if (!redirectUrl) {
      return res.status(400).send("Invalid original URL");
    }

    // If somehow stored wrongly (array / object)
    if (Array.isArray(redirectUrl)) {
      redirectUrl = redirectUrl[0];
    }

    redirectUrl = String(redirectUrl).trim();

    if (redirectUrl.length === 0) {
      return res.status(400).send("Invalid original URL");
    }

    // Ensure protocol
    if (
      !redirectUrl.startsWith("http://") &&
      !redirectUrl.startsWith("https://")
    ) {
      redirectUrl = "https://" + redirectUrl;
    }

    url.clicks += 1;
    await url.save();

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("REDIRECT ERROR:", err);
    return res.status(500).send("Server error");
  }
});


export default router;

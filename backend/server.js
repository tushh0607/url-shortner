// // const express = require("express");

// // if i have to import then i have to do type:"module in the package.json file"
// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import urlRoutes from "./routes/url.js";

// dotenv.config();
// const app = express();
// app.use(cors({
//         origin: process.env.FRONTEND_URL,
//         methods:["GET","POST"],
// }
// ));
// app.use(express.json());

// app.use("/",urlRoutes);

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// mongoose
// .connect(process.env.MONGO_URI)
// .then(()=>{
//     console.log("connected to mongodb");
//     app.listen(process.env.PORT,()=>{
//         console.log(`server running on port ${process.env.PORT}`);
//     })
// })
// .catch((err)=>{
//     console.log("error",err);
// })

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import urlRoutes from "./routes/url.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST"],
}));

app.use(express.json());
app.use("/", urlRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
  });

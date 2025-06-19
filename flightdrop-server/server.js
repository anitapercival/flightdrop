require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const flightsRouter = require("./routes/flights");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// Test route
app.get("/test", (req, res) => {
  res.send("Hello from backend!");
});

// Use flights routes
app.use("/flights", flightsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

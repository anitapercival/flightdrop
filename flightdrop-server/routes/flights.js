const express = require("express");
const router = express.Router();
const axios = require("axios");
const Flight = require("../models/Flight");
require("dotenv").config();

const USER = "johndoe";

// Get all flights for user
router.get("/", async (req, res) => {
  try {
    const flights = await Flight.find({ user: USER });
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flights" });
  }
});

// Get all flights using search parameters
router.get("/searchFlights", async (req, res) => {
  const {
    origin,
    destination,
    date,
    returnDate,
    adults = 1,
    sort = "BEST",
    pageNo = 1,
  } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({
      error: "Missing required query parameters: origin, destination, date",
    });
  }

  try {
    const options = {
      method: "GET",
      url: "https://booking-com21.p.rapidapi.com/api/v1/flights/searchFlights",
      params: {
        fromId: `${origin.toUpperCase()}.AIRPORT`,
        toId: `${destination.toUpperCase()}.AIRPORT`,
        departDate: date,
        ...(returnDate ? { returnDate } : {}),
        pageNo: pageNo.toString(),
        adults: adults.toString(),
        sort,
        cabinClass: "ECONOMY",
        currency_code: "GBP",
      },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "booking-com21.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
      });
      res.status(error.response.status).json({
        error: "API responded with an error",
        details: error.response.data,
      });
    } else if (error.request) {
      console.error("No response received from API");
      res.status(500).json({ error: "No response received from API" });
    } else {
      console.error("Request setup error:", error.message);
      res.status(500).json({ error: "Request error", message: error.message });
    }
  }
});

// Multi-leg flights search (return or multi-city)
router.get("/searchFlightsMulti", async (req, res) => {
  const {
    legs,
    adults = 1,
    children = "0",
    sort = "BEST",
    pageNo = 1,
    cabinClass = "ECONOMY",
    currency_code = "GBP",
  } = req.query;

  if (!legs) {
    return res
      .status(400)
      .json({ error: "Missing required query parameter: legs" });
  }

  let parsedLegs;
  try {
    parsedLegs = JSON.parse(legs);
    if (!Array.isArray(parsedLegs) || parsedLegs.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid legs format: must be a non-empty array" });
    }
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON for legs parameter" });
  }

  try {
    const options = {
      method: "GET",
      url: "https://booking-com21.p.rapidapi.com/api/v1/flights/searchFlightsMultiStops",
      params: {
        legs: JSON.stringify(parsedLegs),
        pageNo: pageNo.toString(),
        adults: adults.toString(),
        children: children.toString(),
        sort,
        cabinClass,
        currency_code,
      },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "booking-com21.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
      });
      res.status(error.response.status).json({
        error: "API responded with an error",
        details: error.response.data,
      });
    } else if (error.request) {
      console.error("No response received from API");
      res.status(500).json({ error: "No response received from API" });
    } else {
      console.error("Request setup error:", error.message);
      res.status(500).json({ error: "Request error", message: error.message });
    }
  }
});

// Add flight to user's list
router.post("/", async (req, res) => {
  try {
    const data = { ...req.body, user: USER };
    if (typeof data.notifications === "undefined") data.notifications = false;
    const newFlight = new Flight(data);
    await newFlight.save();
    res.status(201).json(newFlight);
  } catch (err) {
    res.status(400).json({ error: "Failed to add flight" });
  }
});

// Delete flight from user's list
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Flight.findOneAndDelete({
      _id: req.params.id,
      user: USER,
    });
    if (!deleted) return res.status(404).json({ error: "Flight not found" });
    res.json({ message: "Flight deleted" });
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
});

// Toggle notifications on a flight
router.put("/:id", async (req, res) => {
  try {
    const flight = await Flight.findOne({ _id: req.params.id, user: USER });
    if (!flight) return res.status(404).json({ error: "Flight not found" });
    flight.notifications = !flight.notifications;
    await flight.save();
    res.json(flight);
  } catch (err) {
    res.status(400).json({ error: "Failed to toggle notifications" });
  }
});

module.exports = router;

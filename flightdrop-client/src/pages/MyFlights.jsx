import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BellIcon as BellOnIcon,
  BellSlashIcon as BellOffIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

function generateFakeTrendData() {
  const days = 10;
  const basePrice = 100 + Math.random() * 100;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().slice(5, 10),
      price: Math.round(basePrice + (Math.random() * 20 - 10)),
    });
  }

  return data;
}

// Generate price suggestion based on trend slope
function getPriceSuggestion(trendData) {
  if (!trendData || trendData.length < 2) return "No sufficient data";

  // Use last 5 data points (or less if not enough)
  const recentPoints = trendData.slice(-5);

  // Calculate simple linear regression slope (price vs. time index)
  const n = recentPoints.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  recentPoints.forEach((point, i) => {
    const x = i;
    const y = point.price;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  // Threshold to avoid noise
  const threshold = 0.2;

  if (slope > threshold) {
    return "Buy now — prices likely to go up";
  } else if (slope < -threshold) {
    return "Wait — prices might drop";
  } else {
    return "Prices stable — no rush";
  }
}

export default function MyFlights() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [infoTooltipId, setInfoTooltipId] = useState(null);

  const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/flights`;

  useEffect(() => {
    async function fetchFlights() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(baseUrl);
        if (!res.ok) throw new Error("Failed to fetch flights");

        const data = await res.json();
        console.log(data);
        setFlights(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, []);

  const deleteFlight = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete flight");
      setFlights((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleNotifications = async (id) => {
    try {
      const currentFlight = flights.find((f) => f._id === id);
      if (!currentFlight) return;

      const updatedNotifications = !currentFlight.notifications;

      const res = await fetch(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: updatedNotifications }),
      });
      if (!res.ok) throw new Error("Failed to update notifications");

      const updated = await res.json();
      setFlights((prev) => prev.map((f) => (f._id === id ? updated : f)));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading flights...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h2 className="text-2xl font-semibold mb-6">My Flights</h2>

      {flights.length === 0 ? (
        <p className="text-gray-600">
          No saved flights. Add some to track prices!
        </p>
      ) : (
        <ul className="space-y-6">
          {flights.map((flight) => {
            const trendData = flight.trend?.length
              ? flight.trend
              : generateFakeTrendData();

            const suggestion = getPriceSuggestion(trendData);

            return (
              <li
                key={flight._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <p className="text-xl font-semibold">{flight.airline}</p>

                  <div className="flex flex-col sm:flex-col items-start sm:items-end space-y-3 min-w-[160px] pt-6">
                    <button
                      onClick={() => alert(`Booking flight ${flight.airline}`)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      Book Now
                    </button>

                    <div className="flex items-center space-x-2 cursor-pointer text-indigo-600 hover:text-indigo-900">
                      <button
                        onClick={() => toggleNotifications(flight._id)}
                        className="flex items-center gap-2 focus:outline-none"
                      >
                        {flight.notifications ? (
                          <BellOnIcon className="w-6 h-6" />
                        ) : (
                          <BellOffIcon className="w-6 h-6" />
                        )}
                        <span className="text-sm select-none">
                          Notifications {flight.notifications ? "On" : "Off"}
                        </span>
                      </button>

                      <div
                        className="relative flex items-center"
                        onMouseEnter={() => setInfoTooltipId(flight._id)}
                        onMouseLeave={() => setInfoTooltipId(null)}
                      >
                        <InformationCircleIcon
                          className="w-5 h-5"
                          aria-label="Turn notifications on to receive price change alerts"
                          tabIndex={0}
                        />
                        {infoTooltipId === flight._id && (
                          <div
                            className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-2 bg-indigo-600 text-white text-sm rounded shadow-lg"
                            role="tooltip"
                          >
                            Turn notifications on to receive price change alerts
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteFlight(flight._id)}
                      title="Delete flight"
                      className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-900 cursor-pointer"
                    >
                      <span className="text-sm">Delete Flight</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-grow max-w-[600px]">
                    <p className="mt-1 text-gray-700">
                      {flight.depart.from} → {flight.depart.to}
                    </p>
                    <p className="mt-1 text-gray-700">
                      Departure:{" "}
                      {new Date(flight.depart.time).toLocaleString() || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      Arrival:{" "}
                      {new Date(flight.depart.arrive).toLocaleString() || "N/A"}
                    </p>

                    {flight.return && (
                      <>
                        <hr className="my-4 border-t border-gray-300" />
                        <p className="mt-1 text-gray-700 font-semibold">
                          Return
                        </p>
                        <p className="mt-1 text-gray-700">
                          {flight.return.from} → {flight.return.to}
                        </p>
                        <p className="mt-1 text-gray-700">
                          Departure:{" "}
                          {new Date(flight.return.time).toLocaleString() ||
                            "N/A"}
                        </p>
                        <p className="text-gray-700">
                          Arrival:{" "}
                          {new Date(flight.return.arrive).toLocaleString() ||
                            "N/A"}
                        </p>
                      </>
                    )}

                    <p className="mt-2 font-bold text-indigo-600 text-lg">
                      Price: £{flight.price}
                    </p>

                    <p className="mt-1 italic text-indigo-700">{suggestion}</p>
                  </div>
                </div>

                <div className="mt-6 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: "#555" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#555" }}
                        axisLine={false}
                        tickLine={false}
                        domain={["dataMin - 10", "dataMax + 10"]}
                      />
                      <Tooltip
                        formatter={(value) => [`£${value}`, "Price"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

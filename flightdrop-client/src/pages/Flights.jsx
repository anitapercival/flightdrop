import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Flights() {
  const location = useLocation();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("cheapest");
  const [savingIds, setSavingIds] = useState([]);

  // Get query parameters from URL to search flights
  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      origin: params.get("origin"),
      destination: params.get("destination"),
      date: params.get("date"),
      returnDate: params.get("returnDate"),
    };
  };

  useEffect(() => {
    const { origin, destination, date, returnDate } = getQueryParams();

    if (!origin || !destination || !date) {
      setError("Missing required search parameters.");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      origin,
      destination,
      date,
      ...(returnDate ? { returnDate } : {}),
    });

    const fetchFlights = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
  `${API_BASE_URL}/flights/searchFlights?${params}`
);
        if (!res.ok) {
          throw new Error("Failed to fetch flight data.");
        }

        const data = await res.json();

        const flightOffers = data.data?.flightOffers || [];

        const mappedFlights = flightOffers.map((offer, idx) => {
          const segment = offer.segments?.[0];
          const leg = segment?.legs?.[0];

          const returnSegment = offer.segments?.[1];
          const returnLeg = returnSegment?.legs?.[0];

          const carrierData =
            leg?.carriersData?.[0] || segment?.carriersData?.[0] || null;

          const flightNumber = leg?.flightInfo?.flightNumber || "N/A";
          const carrierCode =
            leg?.flightInfo?.carrierInfo?.marketingCarrier || "N/A";

          const departureAirport = segment?.departureAirport?.code || "N/A";
          const arrivalAirport = segment?.arrivalAirport?.code || "N/A";
          const departureTime = segment?.departureTime || "N/A";
          const arrivalTime = segment?.arrivalTime || "N/A";

          let duration = null;
          if (departureTime && arrivalTime) {
            const durMs = new Date(arrivalTime) - new Date(departureTime);
            if (durMs > 0) {
              const hrs = Math.floor(durMs / 1000 / 60 / 60);
              const mins = Math.floor((durMs / 1000 / 60) % 60);
              duration = `${hrs}h ${mins}m`;
            }
          }

          const price = Number(offer.priceBreakdown.total.units) || 0;
          const currency = offer.priceBreakdown.total.currencyCode || "GBP";

          return {
            id: offer.id || idx,
            airlineName: carrierData?.name || carrierCode,
            airlineLogo: carrierData?.logo || null,
            flightNumber,
            carrierCode,
            departureAirport,
            arrivalAirport,
            departureTime,
            arrivalTime,
            duration,
            price,
            currency,
            returnSegment,
            returnLeg,
          };
        });

        const uniqueFlightsMap = new Map();
        mappedFlights.forEach((flight) => {
          const key = `${flight.carrierCode}_${flight.departureTime}`;
          const existing = uniqueFlightsMap.get(key);
          if (!existing || flight.price < existing.price) {
            uniqueFlightsMap.set(key, flight);
          }
        });

        const uniqueFlights = Array.from(uniqueFlightsMap.values());
        setFlights(uniqueFlights);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [location.search]);

  // Sort flights based on filtering
  const sortedFlights = [...flights].sort((a, b) => {
    if (sortOption === "cheapest") return a.price - b.price;
    if (sortOption === "fastest") {
      const durationA = new Date(a.arrivalTime) - new Date(a.departureTime);
      const durationB = new Date(b.arrivalTime) - new Date(b.departureTime);
      return durationA - durationB;
    }
    if (sortOption === "departure") {
      return new Date(a.departureTime) - new Date(b.departureTime);
    }
    return 0;
  });

  const saveFlight = async (flight) => {
    setSavingIds((ids) => [...ids, flight.id]);

    const trendData = generateTrendData(flight.price);

    const payload = {
      user: "johndoe", // TO DO - auth
      airline: flight.airlineName,
      price: flight.price,
      depart: {
        time: flight.departureTime,
        arrive: flight.arrivalTime,
        duration: flight.duration || null,
        from: flight.departureAirport,
        to: flight.arrivalAirport,
      },
      return: flight.returnLeg
        ? {
            time: flight.returnSegment?.departureTime || null,
            arrive: flight.returnSegment?.arrivalTime || null,
            duration: (() => {
              const dep = flight.returnSegment?.departureTime;
              const arr = flight.returnSegment?.arrivalTime;
              if (dep && arr) {
                const durMs = new Date(arr) - new Date(dep);
                if (durMs > 0) {
                  const hrs = Math.floor(durMs / 1000 / 60 / 60);
                  const mins = Math.floor((durMs / 1000 / 60) % 60);
                  return `${hrs}h ${mins}m`;
                }
              }
              return null;
            })(),
            from: flight.returnSegment?.departureAirport?.code || null,
            to: flight.returnSegment?.arrivalAirport?.code || null,
          }
        : {},
      trend: trendData,
      notifications: false,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/flights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save flight");

      navigate("/my-flights");
    } catch (err) {
      alert(`Error saving flight: ${err.message}`);
      setSavingIds((ids) => ids.filter((id) => id !== flight.id));
    }
  };

  if (loading) return <p className="text-center mt-10">Loading flights...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  // Generate sample trend data with current flight price
  // TO DO - use real trend data
  const generateTrendData = (currentPrice) => {
    const trend = [];
    const today = new Date();

    for (let i = 7; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      trend.push({
        date: date.toISOString().slice(0, 10),
        price: Math.round(currentPrice + (Math.random() * 20 - 10)),
      });
    }

    trend.push({
      date: today.toISOString().slice(0, 10),
      price: currentPrice,
    });

    return trend;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h2 className="text-2xl font-semibold mb-6">Available Flights</h2>

      <div className="mb-6 flex items-center gap-3">
        <label
          htmlFor="sort"
          className="font-medium text-gray-700 whitespace-nowrap"
        >
          Sort by:
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-indigo-500 text-indigo-700 rounded-md pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg fill='none' stroke='%234F46E5' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3e%3c/path%3e%3c/svg%3e")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "1em",
          }}
        >
          <option value="cheapest">Cheapest first</option>
          <option value="fastest">Fastest first</option>
          <option value="departure">Departure time</option>
        </select>
      </div>

      {sortedFlights.length === 0 ? (
        <p className="text-gray-600">No flights found for this route.</p>
      ) : (
        <ul className="space-y-6">
          {sortedFlights.map((flight) => (
            <li
              key={flight.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-grow max-w-[600px] flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    {flight.airlineLogo && (
                      <img
                        src={flight.airlineLogo}
                        alt={flight.airlineName}
                        className="h-12 w-auto"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-lg mb-1">
                        {flight.airlineName}
                      </p>
                      <p className="text-gray-600 text-sm mb-1">
                        Flight: {flight.carrierCode} {flight.flightNumber}
                      </p>
                      <p className="text-gray-600 text-sm mb-1">
                        {flight.departureAirport} → {flight.arrivalAirport}
                      </p>
                      <p className="text-sm text-gray-500">
                        Departure:{" "}
                        {new Date(flight.departureTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Arrival: {new Date(flight.arrivalTime).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {flight.returnSegment && (
                    <div className="flex items-center gap-4 border-t border-gray-200 pt-4">
                      <div className="w-12" />
                      <div>
                        <p className="font-semibold text-md mb-1">
                          Return Flight
                        </p>
                        <p className="text-gray-600 text-sm mb-1">
                          {flight.returnSegment.departureAirport.code} →{" "}
                          {flight.returnSegment.arrivalAirport.code}
                        </p>
                        <p className="text-sm text-gray-500">
                          Departure:{" "}
                          {new Date(
                            flight.returnSegment.departureTime
                          ).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Arrival:{" "}
                          {new Date(
                            flight.returnSegment.arrivalTime
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start md:items-end space-y-3 min-w-[180px]">
                  <p className="text-xl font-bold text-indigo-600">
                    £{flight.price}
                  </p>

                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm rounded transition cursor-pointer w-full md:w-auto">
                    Book Now
                  </button>

                  <button
                    disabled={savingIds.includes(flight.id)}
                    onClick={() => saveFlight(flight)}
                    className={`border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 text-sm rounded transition cursor-pointer w-full md:w-auto ${
                      savingIds.includes(flight.id)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {savingIds.includes(flight.id)
                      ? "Saving..."
                      : "Save & View Trends"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

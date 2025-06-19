import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange, Calendar } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import AutocompleteInput from "../components/AutocompleteInput";

import parisImg from "../assets/paris.jpg";
import romeImg from "../assets/rome.jpg";
import barcelonaImg from "../assets/barcelona.jpg";
import amsterdamImg from "../assets/amsterdam.jpg";
import berlinImg from "../assets/berlin.jpg";

const popularDestinations = [
  { city: "Paris", country: "France", image: parisImg },
  { city: "Rome", country: "Italy", image: romeImg },
  { city: "Barcelona", country: "Spain", image: barcelonaImg },
  { city: "Amsterdam", country: "Netherlands", image: amsterdamImg },
  { city: "Berlin", country: "Germany", image: berlinImg },
];

export default function Home() {
  const navigate = useNavigate();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState("oneway");
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(
        () => setToast({ show: false, message: "" }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle trip type change and adjust date range
  const handleTripTypeChange = (type) => {
    setTripType(type);
    if (type === "oneway") {
      setRange([
        {
          startDate: range[0].startDate,
          endDate: range[0].startDate,
          key: "selection",
        },
      ]);
    } else if (type === "return") {
      setRange((prevRange) => [
        {
          startDate: prevRange[0].startDate,
          endDate:
            prevRange[0].endDate >= prevRange[0].startDate
              ? prevRange[0].endDate
              : prevRange[0].startDate,
          key: "selection",
        },
      ]);
    }
  };

  const showValidationToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  // Regex to extract IATA code from input
  const airportPattern = /^[^(]+\s\(([A-Z]{3})\)$/;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!origin || !destination) {
      showValidationToast("Please fill in origin and destination.");
      return;
    }

    if (origin === destination) {
      showValidationToast(
        "Origin and destination airports cannot be the same."
      );
      return;
    }

    if (!airportPattern.test(origin) || !airportPattern.test(destination)) {
      showValidationToast("Please select valid airports from the dropdown.");
      return;
    }

    // Extract IATA codes
    const originCode = origin.match(airportPattern)[1];
    const destinationCode = destination.match(airportPattern)[1];

    const departDate = format(range[0].startDate, "yyyy-MM-dd");
    const returnDate =
      tripType === "return" ? format(range[0].endDate, "yyyy-MM-dd") : null;

    const params = new URLSearchParams({
      origin: originCode,
      destination: destinationCode,
      date: departDate,
      ...(returnDate ? { returnDate } : {}),
    });

    navigate(`/flights/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 flex flex-col items-center py-8 relative">
      {toast.show && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fadeInOut">
          {toast.message}
        </div>
      )}

      <div className="mb-8 max-w-xl text-center px-4">
        <h2 className="text-3xl font-semibold text-indigo-700 mb-3">
          Find the best flights, effortlessly.
        </h2>
        <p className="text-gray-600 text-lg">
          Search, compare, and book flights with real-time price trends and
          smart recommendations — all in one place.
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg py-4 px-6 mb-10 flex flex-col justify-center">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AutocompleteInput
            label="From"
            value={origin}
            onChange={setOrigin}
            placeholder="Start typing a city or airport"
          />
          <AutocompleteInput
            label="To"
            value={destination}
            onChange={setDestination}
            placeholder="Start typing a city or airport"
          />

          <div className="flex items-center space-x-4 text-gray-700">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="oneway"
                checked={tripType === "oneway"}
                onChange={() => handleTripTypeChange("oneway")}
                className="accent-indigo-600 cursor-pointer"
              />
              <span>One Way</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="return"
                checked={tripType === "return"}
                onChange={() => handleTripTypeChange("return")}
                className="accent-indigo-600 cursor-pointer"
              />
              <span>Return</span>
            </label>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Travel Dates
            </label>
            <input
              readOnly
              onClick={() => setShowCalendar(!showCalendar)}
              value={
                tripType === "return"
                  ? `${format(range[0].startDate, "MMM d")} - ${format(
                      range[0].endDate,
                      "MMM d, yyyy"
                    )}`
                  : `${format(range[0].startDate, "MMM d, yyyy")}`
              }
              className="w-full p-3 border border-gray-300 rounded cursor-pointer bg-white"
            />
            {showCalendar && (
              <div className="mt-2 w-full flex justify-center">
                <div className="scale-95 sm:scale-100 border border-gray-200 rounded-lg shadow-sm">
                  {tripType === "oneway" ? (
                    <Calendar
                      date={range[0].startDate}
                      onChange={(date) =>
                        setRange([
                          {
                            startDate: date,
                            endDate: date,
                            key: "selection",
                          },
                        ])
                      }
                      minDate={new Date()}
                      className="text-sm font-sans text-indigo-700"
                      color="#4F46E5"
                    />
                  ) : (
                    <DateRange
                      editableDateInputs
                      onChange={(item) => setRange([item.selection])}
                      moveRangeOnFirstSelection={false}
                      ranges={range}
                      minDate={new Date()}
                      rangeColors={["#4F46E5"]}
                      className="text-sm font-sans text-gray-800"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition cursor-pointer"
          >
            Search Flights
          </button>
        </form>
      </div>

      <section className="w-full max-w-5xl">
        <h3 className="text-2xl font-semibold text-indigo-700 mb-6 text-center">
          Popular Destinations
        </h3>
        <div className="flex space-x-6 overflow-x-auto px-2">
          {popularDestinations.map(({ city, country, image }) => (
            <div
              key={city}
              className="min-w-[200px] rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition"
              title={`${city}, ${country}`}
            >
              <img
                src={image}
                alt={`${city} skyline`}
                className="w-full h-36 object-cover"
                loading="lazy"
              />
              <div className="p-3 bg-white">
                <p className="text-lg font-medium">{city}</p>
                <p className="text-sm text-gray-600">{country}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

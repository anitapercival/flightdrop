import { useState } from "react";
import airports from "../data/airports.json";

export default function AutocompleteInput({
  label,
  value,
  onChange,
  placeholder,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e) => {
    const input = e.target.value;
    onChange(input);

    if (input.length >= 2) {
      const matches = airports.filter((airport) =>
        `${airport.City} ${airport.IATA} ${airport["Airport name"]}`
          .toLowerCase()
          .includes(input.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (airport) => {
    onChange(`${airport.City} (${airport.IATA})`);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <label className="block mb-1 font-medium">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label="Clear input"
          >
            &times;
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-60 overflow-auto">
          {suggestions.map((airport) => (
            <li
              key={airport.IATA}
              onClick={() => handleSelect(airport)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {airport.City} ({airport.IATA}) — {airport["Airport name"]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

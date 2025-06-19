import { useState, useRef, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          FlightDrop
        </Link>

        <div className="relative flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <User className="w-5 h-5 text-indigo-600" />
            <span className="text-indigo-700 font-medium">anitapercival</span>
          </div>

          <button
            className="cursor-pointer text-indigo-600 hover:text-violet-600 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-12 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
            >
              <Link
                to="/"
                className="block px-4 py-2 text-indigo-700 hover:bg-violet-100 hover:text-violet-700 cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                Search Flights
              </Link>
              <Link
                to="/my-flights"
                className="block px-4 py-2 text-indigo-700 hover:bg-violet-100 hover:text-violet-700 cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                My Flights
              </Link>

              <button
                className="w-full text-left px-4 py-2 text-indigo-700 hover:bg-violet-100 hover:text-violet-700 cursor-pointer"
                onClick={() => setMenuOpen(false)}
                type="button"
              >
                Account
              </button>
              <button
                className="w-full text-left px-4 py-2 text-indigo-700 hover:bg-violet-100 hover:text-violet-700 cursor-pointer"
                onClick={() => setMenuOpen(false)}
                type="button"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

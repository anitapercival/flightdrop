import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Flights from './pages/Flights';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MyFlights from './pages/MyFlights';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <main className="flex-grow overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/flights" element={<Flights />} />
            <Route path="/flights/search" element={<Flights />} />
            <Route path="/my-flights" element={<MyFlights />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

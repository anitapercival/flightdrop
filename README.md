# FlightDrop

---

## Problem Statement

Knowing the best time to book a flight is challenging because flight prices fluctuate unpredictably and travelers lack clear insights into these trends. Without reliable data or notifications, people often miss the opportunity to save money or end up paying more than necessary.

FlightDrop addresses this by combining real-time flight search with personalised price tracking, trend visualisation and smart notifications, helping users book flights at the optimal time.

---

## Live Demo

View the live project here: [FlightDrop Demo](https://flightdrop.vercel.app/)

![Untitled design (1)](https://github.com/user-attachments/assets/88dc9df5-60d5-48b9-9e6a-7d2c6d461ece)

---

## About This Project

Flight Finder is a full stack application built using the **MERN** stack with additional UI and API integrations:

- **Frontend:** React.js + Tailwind CSS for a responsive, fast, and clean UI
- **Backend:** Node.js + Express.js to build a robust RESTful API server
- **Database:** MongoDB for efficient data storage and retrieval
- **External APIs:** Integrated with a flight search API (via RapidAPI) for real-time flight data
- **Routing:** React Router for smooth client-side navigation
- **Date handling:** react-date-range & date-fns for user-friendly date selection and formatting
- **State management:** React hooks (`useState`, `useEffect`) to manage UI states and side effects
- **Responsive Design:** Fully mobile-friendly layout for seamless experience on all screen sizes
- **Environment:** dotenv for secure API key management
- **Deployment:** hosted on Vercel and Railway

---

## New Technologies Being Added in Development
To improve scalability, user experience, and performance, FlightDrop will incorporate:
- OAuth for seamless and secure user authentication
- Redis to cache flight search results and improve API response times
- Email alert system (using services like SendGrid or Nodemailer) to notify users instantly of flight price drops
- Comprehensive testing with Jest for unit tests and Cypress for end-to-end testing to ensure reliability and quality

---

## Key Features & Highlights

### Personalised Flight Tracking & Insights  
- Add flights to “My Flights” to monitor personalised selections  
- View price trends on graphs for each tracked flight  
- Set up notifications to get be alerted instantly when flight prices change  
- Receive smart suggestions advising whether to buy now or wait based on trends  

### User-Centric Flight Search  
- Search for flights with flexible options: one-way or return trips  
- Custome autcomplete of airport/city validation to ensure accurate searches  
- Real-time integration with the flight API providing live prices and availability  
- Date picker with single or range selection that adapts to trip type  

### Backend API & Data Persistence  
- Express.js API server serving search endpoints with detailed error handling  
- Secure environment variables to protect sensitive API keys  
- MongoDB models to save and manage user flight preferences and notifications  
- RESTful routes supporting create, read, update, and delete (CRUD) operations for flights  
- Detailed logging and error responses for debugging and robustness  

---

## Tech Stack

| Layer          | Technology           | Purpose                         |
| -------------- | -------------------- | ------------------------------- |
| Frontend       | React.js             | Component-based UI development  |
| Styling        | Tailwind CSS         | Utility-first CSS framework     |
| Backend        | Node.js & Express.js | API server & routing            |
| Database       | MongoDB              | Data storage and querying       |
| API Integration| RapidAPI Flight API  | Real-time flight data           |
| State & Dates  | React Hooks, date-fns, react-date-range | State management & date handling |
| Environment    | dotenv               | Secure management of secrets    |

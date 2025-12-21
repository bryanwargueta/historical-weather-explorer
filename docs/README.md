# Historical Weather Explorer

Live Demo: https://historical-weather-explorer.vercel.app/

## Overview

Historical Weather Explorer is a web app that allows users to search for historical weather data for any city. Users can view temperature, precipitation, and wind speed over a selected date range of their choosing. The app provides interactive charts using Chart.js and displays the searched location on a Leaflet map. All user searches are stored in a Supabase database for session history tracking.

### Features:

- Search historical weather by city or user location
- Interactive charts of weather variables (temperature, precipitation, and wind speed)
- Map display of searched location
- User search history saved in Supabase
- Responsive frontend design

### Target Browsers:

- Desktop browsers: Chrome, Firefox, Edge, Safari (latest versions)
- Mobile browsers: Safari on iOS, Chrome on Android

### Developer Manual

[Link to Developer Manual](#developer-manual)

## Developer Manual

### Installation

1. Clone the GitHub Repo

2. Install dependencies: npm install express dotenv @supabase/supabase-js
   Note: Recommended to install nodemon as well

3. Create .env file in the project root with Supabase url & anon key
   Note: Make sure to add .env to .gitignore to keep the keys private

4. Start the backend: npm run dev
   This will run the Node/Express server on http://localhost:3000

5. Open the frontend: Use preferred method (such as LiveServer) to open client/dashboard.html in your browser
   Note: Ensure the backend is running so that the API calls functions properly

6. Project is configured for Vercel deployment.
   The frontend is served from /client
   Backend handled via Express and /api/\* endpoints

7. No automated tests have been written
   Manual testing can be done via the dashboard by making searches, verifying chart rendering, and verifying Supabase records

8. API Reference

POST - /api/search - Stores a user search in Supabase. Request body should include: city, latitude, longitude, variable, date_start, date_end

GET - /api/health - returns {status: "ok"}. Used to check the servers health

9. Known bugs

- Mobile layout is not optimized
- Search history resets on browser refresh

10. Future roadmap

- Add persistent user accounts to store search history across sessions
- Add automated testing for API endpoints
- Add additional weather variables

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const API_URL = "https://api.elixirtrips.com/wp-json/wp/v2/hotels";

// Function to fetch all pages of data from the API
const fetchHotels = async () => {
  let hotels = [];
  let page = 1;
  let hasMoreData = true;

  console.log("Starting to fetch hotel data...");

  while (hasMoreData) {
    try {
      console.log(`Fetching page ${page}...`);
      const response = await axios.get(`${API_URL}?per_page=100&page=${page}`);
      
      if (response.data.length === 0) {
        console.log("No more data found. Ending fetch.");
        hasMoreData = false;
      } else {
        hotels = hotels.concat(response.data);
        console.log(`Fetched page ${page} with ${response.data.length} items.`);
        page += 1;
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      hasMoreData = false;
    }
  }

  console.log("Finished fetching hotel data.");
  return hotels;
};

// Endpoint to get hotels with filters
app.get('/api/hotels', async (req, res) => {
  const { destination, occupancy } = req.query;

  try {
    const hotels = await fetchHotels();

    // Check if any hotels were fetched
    if (hotels.length === 0) {
      console.log("No hotels found after fetch.");
    } else {
      console.log(`${hotels.length} hotels found.`);
    }

    // Filter by destination and occupancy
    const filteredHotels = hotels.filter((hotel) => {
      const matchesDestination = destination
        ? hotel.acf.destination === destination
        : true;
      const matchesOccupancy = occupancy
        ? hotel.acf.occupancy >= parseInt(occupancy)
        : true;
      return matchesDestination && matchesOccupancy;
    });

    res.json(filteredHotels);
  } catch (error) {
    console.error("Error in /api/hotels:", error.message);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();
const { exchangeForLongTermToken } = require('./passport');

const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use(cors()); // Enable CORS to allow requests from React frontend
const shortLivedToken = process.env.FB_ACCESS_TOKEN;  // Replace with actual token from OAuth process
console.log('Shortlive Token:'.shortLivedToken);

// Endpoint for searching Facebook Ads interests
app.post('/search', async (req, res) => {
  try{
    const locale = req.body.language || 'en_US';  // Get locale from frontend
    const page = req.body.page || 1;  // Get page from frontend
    const limit = req.body.limit || 10;  // Get limit from frontend
     // Calculate offset for pagination
     const offset = (page - 1) * limit;

     // Retrieve the long-term token from the session
    // const longTermToken = req.session.longTermToken;
    const query = req.body.query;
    const longTermToken = await exchangeForLongTermToken(shortLivedToken);
    
     if (!longTermToken) {
       return res.status(401).send('User is not authenticated or token has expired');
     }
    
    const url = `https://graph.facebook.com/v17.0/search?type=adinterest&q=${query}&access_token=${longTermToken}&limit=100&locale=${locale}&offset=${offset}`;
        const response = await axios.get(url);
        const interests = response.data.data;
        res.json(interests);
    } catch (error) {
      
        console.error('Error fetching data from Facebook API:', error);
        res.status(500).send('Error fetching data from Facebook');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


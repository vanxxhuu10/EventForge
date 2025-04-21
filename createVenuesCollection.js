const mongoose = require('mongoose');
const connectDB = require('./db');
const { Schema, model, connection } = mongoose; 
const venuesAllotedSchema = new Schema({
  date: { type: String, required: true },
  event_name: { type: String, required: true },
  club_name: { type: String, required: true },
  venue_alloted: { type: String, required: true },
  time_from: { type: String, required: true },
  time_to: { type: String, required: true }
});

const venuesPendingSchema = new Schema({
  date: { type: String, required: true },
  venue_pending: { type: String, required: true },
  reason: { type: String, required: true }
});

const allVenuesSchema = new Schema({
  venue_name: { type: String, required: true }
});

// Declare models
const VenuesAlloted = model('VenuesAlloted', venuesAllotedSchema);
const VenuesPending = model('VenuesPending', venuesPendingSchema);
const AllVenues = model('AllVenues', allVenuesSchema);

// Function to create collections and insert sample data
const createCollections = async () => {
  try {
    console.log('✅ Venues collections created in MongoDB');
  } catch (err) {
    console.error('❌ Error creating venue collections:', err.message);
  }
};

createCollections();
module.exports = {
  VenuesAlloted,
  VenuesPending,
  AllVenues
};

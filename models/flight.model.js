const mongoose = require('mongoose');

// 1. Flight Details Sub-Schema
const flightDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  aircraft_type: { type: String },
  duration_minutes: { type: Number },
  baggage: { type: String },
  stops: { type: String }
}, { _id: false });

// 2. Pricing Breakdown Sub-Schema
const pricingSchema = new mongoose.Schema({
  currency: { type: String, default: "INR" },
  per_adult_fare: { type: Number, required: true },
  total_group_fare: { type: Number, required: true },
  passenger_breakdown: {
    adults: { type: Number },
    children: { type: Number },
    infants: { type: Number }
  }
}, { _id: false });

// 3. Platform Links Sub-Schema
const platformSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  link: { type: String, required: true }
}, { _id: false });

// 4. MAIN SEARCH CACHE SCHEMA
const flightSearchSchema = new mongoose.Schema({
  // Search Metadata for finding the cache
  origin: { type: String, required: true, index: true },
  destination: { type: String, required: true, index: true },
  departureDate: { type: String, required: true },
  returnDate: { type: String, required: true },
  paxKey: { type: String, required: true }, // e.g., "A2-C1-I1"

  // The Array of Flights (This matches your JSON structure exactly)
  flights: [{
    flight_details: flightDetailsSchema,
    price_per_adult: { type: Number },
    tag: { type: String, default: null }, // "Cheapest", "Fastest", or null
    pricing: pricingSchema,
    platforms: [platformSchema]
  }],

  // Auto-delete after 3 hours (TTL Index)
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 10800 // 3 hours in seconds
  }
});

// Compound Index for lightning-fast lookups
flightSearchSchema.index({ origin: 1, destination: 1, departureDate: 1, returnDate: 1, paxKey: 1 });

const FlightSearch = mongoose.model('FlightSearch', flightSearchSchema);
module.exports = FlightSearch;
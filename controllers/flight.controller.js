/**
 * Tripaango Flight Search Controller
 * Uses Gemini 3 Flash for data extraction with code-side URL generation.
 */

// const injectDeepLinks = (flightData, searchParams) => {
//   const { origin, destination, departureDate, returnDate, passengers, cabinClass = "Economy" } = searchParams;

//   // 1. Cabin Class Mapping
//   const mmtCabin = cabinClass === "Business" ? "B" : (cabinClass === "Premium" ? "W" : "E");
//   const emtCabin = cabinClass === "Business" ? "2" : (cabinClass === "Premium" ? "1" : "0");
//   const indigoCabin = cabinClass === "Business" ? "Business" : "Economy";

//   // 2. Date formatting helper
//   const formatDate = (dateStr, separator = '/') => {
//     const [y, m, d] = dateStr.split('-');
//     return `${d}${separator}${m}${separator}${y}`;
//   };

//   const mmtDDate = formatDate(departureDate, '/');
//   const mmtRDate = formatDate(returnDate, '/');
//   const emtDDate = formatDate(departureDate, '-');
//   const emtRDate = formatDate(returnDate, '-');

//   const cityToIata = { "Bengaluru": "BLR", "Delhi": "DEL", "Mumbai": "BOM", "Goa": "GOX" };
//   const from = cityToIata[origin] || origin;
//   const to = cityToIata[destination] || destination;

//   const paxMMT = `A-${passengers.adults}_C-${passengers.children}_I-${passengers.infants}`;

//   if (flightData.flights && Array.isArray(flightData.flights)) {
//     flightData.flights = flightData.flights.map((flight) => {
//       const links = [
//         {
//           platform: "MakeMyTrip",
//           // Added &cabinClass=${mmtCabin}
//           link: `https://www.makemytrip.com/flight/search?itinerary=${from}-${to}-${mmtDDate}_${to}-${from}-${mmtRDate}&tripType=R&paxType=${paxMMT}&cabinClass=${mmtCabin}`
//         },
//         {
//           platform: "EaseMyTrip",
//           // EaseMyTrip uses a numeric class at the end of the search string usually
//           link: `https://www.easemytrip.com/flight-search/${from}-${to}-${emtDDate}/${to}-${from}-${emtRDate}/A-${passengers.adults}/C-${passengers.children}/I-${passengers.infants}?cls=${emtCabin}`
//         },
//         {
//           platform: "IndiGo",
//           link: `https://www.goindigo.in/booking/selectable?from=${from}&to=${to}&doj=${mmtDDate}&dor=${mmtRDate}&adults=${passengers.adults}&children=${passengers.children}&infants=${passengers.infants}&class=${indigoCabin}`
//         }
//       ];

//       if (flight.pricing_comparison && flight.pricing_comparison.platforms) {
//         flight.pricing_comparison.platforms = flight.pricing_comparison.platforms.map(p => {
//           const match = links.find(l => l.platform.toLowerCase().includes(p.platform.toLowerCase()));
//           return { ...p, link: match ? match.link : "#" };
//         });
//       }
//       return flight;
//     });
//   }

//   return flightData;
// };
// exports.searchFlights = async (req, res) => {
//   const { origin, destination, departureDate, returnDate, passengers } =
//     req.body;

//   const model = genAI.getGenerativeModel({
//     model: "gemini-2.5-flash",
//     // REFINED INSTRUCTION: Tell the AI exactly which platforms to look for
//     systemInstruction:
//       "You are the Tripaango Travel Engine. Extract flight data into JSON. ONLY compare prices for MakeMyTrip, EaseMyTrip, and IndiGo. Use realistic current market rates in INR.",
//   });

//   try {
//     const result = await model.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [
//             {
//               text: `Find round-trip flights from ${origin} to ${destination}. Depart: ${departureDate}, Return: ${returnDate}. Passengers: ${passengers.adults} adults, ${passengers.children} children.`,
//             },
//           ],
//         },
//       ],
//       generationConfig: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: "object",
//           properties: {
//             flights: {
//               // Changed from flight_details object to flights array
//               type: "array",
//               items: {
//                 type: "object",
//                 properties: {
//                   flight_details: {
//                     type: "object",
//                     properties: {
//                       name: { type: "string" },
//                       number: { type: "string" },
//                       aircraft_type: { type: "string" },
//                     },
//                   },
//                   schedule: {
//                     type: "object",
//                     properties: {
//                       departure_time: { type: "string" },
//                       arrival_time: { type: "string" },
//                     },
//                   },
//                   pricing_comparison: {
//                     type: "object",
//                     properties: {
//                       currency: { type: "string" },
//                       total_booking_price: { type: "number" },
//                       platforms: {
//                         type: "array",
//                         items: {
//                           type: "object",
//                           properties: {
//                             platform: { type: "string" },
//                             price: { type: "number" },
//                           },
//                         },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     const flightData = JSON.parse(result.response.text());
//     const finalData = injectDeepLinks(flightData, req.body);

//     res.status(200).json({ success: true, data: finalData });
//   } catch (error) {
//     console.error("Tripaango Error:", error);
//     res
//       .status(500)
//       .json({
//         success: false,
//         error: "Flight search engine timeout. Please try again.",
//       });
//   }
// };

// main();
// main();
// main();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const FlightSearch = require("../models/flight.model");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const processFlightData = (flightData, searchParams) => {
  const { origin, destination, departureDate, returnDate, passengers } = searchParams;

  const cityToIata = { 
    "bengaluru": "BLR", "bangalore": "BLR", 
    "delhi": "DEL", "new delhi": "DEL", 
    "patna": "PAT", "mumbai": "BOM" 
  };
  
  const from = cityToIata[origin.toLowerCase()] || origin;
  const to = cityToIata[destination.toLowerCase()] || destination;

  const formatDate = (dateStr, sep = '/') => {
    const [y, m, d] = dateStr.split('-');
    return `${d}${sep}${m}${sep}${y}`;
  };
  
  const mmtD = formatDate(departureDate, '/');
  const mmtR = formatDate(returnDate, '/');
  const paxMMT = `A-${passengers.adults}_C-${passengers.children}_I-${passengers.infants}`;

  if (flightData.flights && Array.isArray(flightData.flights)) {
    const prices = flightData.flights.map(f => f.price_per_adult);
    const durations = flightData.flights.map(f => f.flight_details.duration_minutes || 999);
    
    const minPrice = Math.min(...prices);
    const minDuration = Math.min(...durations);

    return flightData.flights.map((flight) => {
      const adultPrice = flight.price_per_adult; 
      const totalGroupPrice = (adultPrice * passengers.adults) + 
                              (adultPrice * 0.8 * passengers.children) + 
                              (2500 * passengers.infants);

      let tag = null;
      if (adultPrice === minPrice) tag = "Cheapest";
      else if ((flight.flight_details.duration_minutes || 999) === minDuration) tag = "Fastest";

      const allAvailableLinks = [
        {
          platform: "IndiGo",
          link: `https://www.goindigo.in/booking/selectable?from=${from}&to=${to}&doj=${mmtD}&dor=${mmtR}&adults=${passengers.adults}&children=${passengers.children}&infants=${passengers.infants}`
        },
        {
          platform: "Air India",
          link: `https://www.airindia.com/in/en/booking/select-flights.html?from=${from}&to=${to}&date=${mmtD}&pax=${passengers.adults}`
        },
        {
          platform: "SpiceJet",
          link: `https://www.spicejet.com/search?from=${from}&to=${to}&date=${mmtD}&adults=${passengers.adults}`
        }
      ];

      const dynamicLinks = [
        {
          platform: "MakeMyTrip",
          link: `https://www.makemytrip.com/flight/search?itinerary=${from}-${to}-${mmtD}_${to}-${from}-${mmtR}&tripType=R&paxType=${paxMMT}&cabinClass=E&forwardFlowRequired=true&intl=false&sTime=${Date.now()}`
        }
      ];

      const matchingAirline = allAvailableLinks.find(l => 
        flight.flight_details.name.toLowerCase().includes(l.platform.toLowerCase())
      );

      if (matchingAirline) dynamicLinks.push(matchingAirline);

      return {
        ...flight,
        tag: tag,
        pricing: {
          currency: "INR",
          per_adult_fare: adultPrice,
          total_group_fare: Math.round(totalGroupPrice),
          passenger_breakdown: { ...passengers }
        },
        platforms: dynamicLinks 
      };
    });
  }
  return [];
};

exports.searchFlights = async (req, res) => {
  const { origin, destination, departureDate, returnDate, passengers } = req.body;
  const paxKey = `A${passengers.adults}-C${passengers.children}-I${passengers.infants}`;

  try {
    // 1. CHECK DATABASE CACHE
    const existingSearch = await FlightSearch.findOne({
      origin: origin.toLowerCase(),
      destination: destination.toLowerCase(),
      departureDate,
      returnDate,
      paxKey
    }).lean();

    if (existingSearch) {
      return res.status(200).json({ success: true, data: existingSearch, source: "database" });
    }

    // 2. FETCH FROM AI
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-pro-preview",
      systemInstruction: `You are the Tripaango Travel Engine. Generate 10 realistic flight options. Price_per_adult is for ONE ADULT only. Include duration_minutes, baggage, and stops.`
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Search ${origin} to ${destination} ${departureDate} to ${returnDate}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            flights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  flight_details: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      number: { type: "string" },
                      aircraft_type: { type: "string" },
                      duration_minutes: { type: "number" }, 
                      baggage: { type: "string" },         
                      stops: { type: "string" }            
                    }
                  },
                  price_per_adult: { type: "number" }
                }
              }
            }
          }
        }
      }
    });

    const rawData = JSON.parse(result.response.text());
    const processedFlights = processFlightData(rawData, req.body);

    // 3. SAVE TO DATABASE
    const newSearch = await FlightSearch.create({
      origin: origin.toLowerCase(),
      destination: destination.toLowerCase(),
      departureDate,
      returnDate,
      paxKey,
      flights: processedFlights
    });

    res.status(200).json({ success: true, data: newSearch, source: "ai" });

  } catch (error) {
    console.error("Tripaango Error:", error);
    res.status(500).json({ success: false, error: "Search failed." });
  }
};
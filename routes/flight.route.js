const express =require("express")
const { searchFlights } = require("../controllers/flight.controller")
const router = express.Router()

router.post("/search",searchFlights)

module.exports = router;
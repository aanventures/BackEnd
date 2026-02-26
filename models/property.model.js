const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter property title"],
        maxLength: [100, "Property title cannot exceed 100 characters"],
        minLength: [4, "Property title should have more than 4 characters"]
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, "Please enter property description"],
        maxLength: [500, "Property description cannot exceed 500 characters"],
        minLength: [10, "Property description should have more than 10 characters"]
    },
    price: {
        type: Number,
        required: [true, "Please enter property price"],
    },
    location: {
        type: String,
        required: [true, "Please enter property location"],
    },
    propertyname: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true
    },
    amenities: [String],
    pictures: [
        {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            }
        }
    ],
    videos: [
        {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            }
        }
    ],
    maxGuest: {
        type: Number,
        default: 1
    },
    executiveName: {
        type: String,
        trim: true
    },
    executiveNumber: {
        type: String,
        trim: true
    },
    summary: {
        type: String,
        maxLength: [300, "Summary cannot exceed 300 characters"]
    },
    aboutSpace: {
        type: String,
        maxLength: [2000, "About space cannot exceed 2000 characters"]
    },
    houseRules: [String],
    thingsToKnow: [String],
    cancellationPolicy: {
        type: String,
        trim: true
    },
    bedrooms: {
        type: Number,
        default: 0
    },
    beds: {
        type: Number,
        default: 0
    },
    washrooms: {
        type: Number,
        default: 0
    },
    securityDeposit: {
        type: Number,
        default: 0
    },
    checkIn: {
        date: { type: Date },
        time: { type: String }
    },
    checkOut: {
        date: { type: Date },
        time: { type: String }
    },
    directionUrl: {
        type: String,
        trim: true
    },
    isLive: {
        type: Boolean,
        default: false
    },
    isHomePage: {
        type: Boolean,
        default: false
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, "Please select category for this property"],
        enum: {
            values: [
                "Apartment",
                "House",
                "Villa",
                "Studio",
                "Office"
            ],
            message: "Please select correct category for this property"
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
})

const Property = mongoose.model("Property", propertySchema)
module.exports = Property;
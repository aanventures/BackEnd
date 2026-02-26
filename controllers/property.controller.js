const Property = require('../models/property.model')

// Create a new property
exports.createProperty = async (req, res) => {
  try {
    const property = await Property.create(req.body)
    res.status(201).json({ success: true, data: property })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
    res.status(200).json({ success: true, count: properties.length, data: properties })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Get single property by id
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' })
    res.status(200).json({ success: true, data: property })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Update property by id
exports.updateProperty = async (req, res) => {
  try {
    const updates = req.body
    const property = await Property.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' })
    res.status(200).json({ success: true, data: property })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// Delete property by id
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id)
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' })
    res.status(200).json({ success: true, message: 'Property deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

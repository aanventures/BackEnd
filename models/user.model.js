const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter your name"],
        minLength: [8, "Password should have more than 8 characters"],
        select: false
    },
    mobile: {
        type: Number,
    },
    avatar: {
        public_id: {
            role: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next()
    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (err) {
        next(err)
    }
})

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model("User", userSchema)
module.exports = User;
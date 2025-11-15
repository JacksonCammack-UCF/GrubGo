import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    points: {
        type: Number,
        required: false,
        default: 0
    },
    cart:{
        type: Array,
        required: false,
        default: []
    },
    isEmailVerified: {
      type: Boolean,
      required: false,
      default: false,
    }
}, {
    timestamps: true // createdAt, updatedAt
});

const User = mongoose.model('User', userSchema);

export default User;
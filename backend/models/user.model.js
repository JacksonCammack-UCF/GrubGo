import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    username:{
        type:String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    cart:{
        type: Array,
        required: true
    }

}, {
    timestamps: true // createdAt, updatedAt
});

const User = mongoose.model('User', userSchema);

export default User;
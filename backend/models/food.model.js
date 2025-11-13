import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    inStock:{
        type: Boolean,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }
}, {
    timestamps: true // createdAt, updatedAt
});

const Food = mongoose.model('Food', foodSchema);

export default Food;
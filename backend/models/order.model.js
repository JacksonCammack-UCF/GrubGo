import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    items:{
        type: Array, 
        required: true
    },
    subtotal:{
        type: Number,
        required: true
    },
    tax:{
        type: Number,
        required: true
    },
    total:{
        type: Number,
        required: true
    },
    pointsEarned:{
        type: Number,
        required: true
    },
}, {
    timestamps: true // createdAt, updatedAt
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
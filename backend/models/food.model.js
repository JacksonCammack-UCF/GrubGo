import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    price:{
        type: Number,
        required: true
    },
    category:{
        type: String,
        required: true,
        trim: true
    },
    inStock:{
        type: Boolean,
        required: false,
        default: true
    },
    imageUrl: {
        type: String,
        required: false,
        default: function() {
            if (!this.name) return undefined;
            // Generate a simple slug based on the food name
            // E.g., "Spaghetti Bolognese" -> "spaghetti_bolognese"
            const slug = this.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
            
            // Default image path
            return `/images/menu/${slug}.jpg`;
        }
    }
}, {
    timestamps: true // createdAt, updatedAt
});

const Food = mongoose.model('Food', foodSchema);

export default Food;
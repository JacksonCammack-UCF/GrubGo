// backend/models/food.model.js
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
        default: true
    },
    imageUrl: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // createdAt, updatedAt
});

function generateSlugFromName(name) {
    // Generate a simple slug based on the food name
    // E.g., "Spaghetti Bolognese" -> "spaghetti_bolognese"
    if (!name) return "";
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

foodSchema.pre("save", function (next) {
  if (!this.imageUrl && this.name) {
    const slug = generateSlugFromName(this.name);
    if (slug) {
      this.imageUrl = `/images/menu/${slug}.jpg`;
    }
  }
  next();
});

const Food = mongoose.model('Food', foodSchema);

export default Food;
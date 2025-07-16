// models/Hotel.ts
import mongoose from 'mongoose';

export interface IHotel {
  _id?: string;
  name: string;
  city: string;
  location: string;
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;
  image: string;
  description: string;
  tags: string[];
  amenities: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const hotelSchema = new mongoose.Schema<IHotel>(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
      maxlength: [100, 'Hotel name cannot exceed 100 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      enum: ['Hanoi', 'Ho Chi Minh', 'Da Nang', 'Hoi An', 'Nha Trang', 'Phu Quoc', 'Sapa', 'Hue', 'Can Tho', 'Vung Tau']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    priceRange: {
      min: {
        type: Number,
        required: [true, 'Minimum price is required'],
        min: [0, 'Price cannot be negative']
      },
      max: {
        type: Number,
        required: [true, 'Maximum price is required'],
        min: [0, 'Price cannot be negative']
      }
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    image: {
      type: String,
    //   required: [true, 'Image URL is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    tags: [{
      type: String,
      enum: ['Budget', 'Luxury', 'Business-friendly', 'Family-friendly', 'Romantic', 'Boutique', 'Resort', 'City Center', 'Beach Front', 'Mountain View']
    }],
    amenities: [{
      type: String,
      trim: true
    }],
    contactInfo: {
      phone: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      website: {
        type: String,
        trim: true
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
hotelSchema.index({ city: 1, isActive: 1 });
hotelSchema.index({ rating: -1 });
hotelSchema.index({ 'priceRange.min': 1, 'priceRange.max': 1 });

// Virtual for formatted price range
hotelSchema.virtual('formattedPriceRange').get(function() {
  return `$${this.priceRange.min} - $${this.priceRange.max}`;
});

// Pre-save middleware to validate price range
hotelSchema.pre('save', function(next) {
  if (this.priceRange.min > this.priceRange.max) {
    next(new Error('Minimum price cannot be greater than maximum price'));
  }
  next();
});

const Hotel = mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', hotelSchema);

export default Hotel;

import mongoose from 'mongoose';

const categoryProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
  },
  { _id: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 70,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    products: {
      type: [categoryProductSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

categorySchema.index({ order: 1, createdAt: 1 });

export const Category = mongoose.model('Category', categorySchema);

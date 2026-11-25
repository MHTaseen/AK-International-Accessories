import mongoose from 'mongoose';

export const ALLOWED_FEATURE_ICONS = [
  'truck',
  'shield',
  'return',
  'headset',
  'star',
  'award',
  'gift',
  'zap',
  'lock',
  'tag',
  'phone',
  'package',
];

const featureBoxSchema = new mongoose.Schema(
  {
    slot: {
      type: Number,
      required: true,
      unique: true,
      min: 0,
      max: 3,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 40,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: 80,
    },
    icon: {
      type: String,
      required: true,
      enum: ALLOWED_FEATURE_ICONS,
      default: 'star',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const FeatureBox = mongoose.model('FeatureBox', featureBoxSchema);

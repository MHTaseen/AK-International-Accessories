import { Router } from 'express';
import mongoose from 'mongoose';
import { FeatureBox, ALLOWED_FEATURE_ICONS } from '../models/FeatureBox.js';
import { requireAdmin, adminWriteLimiter } from '../middleware/adminAuth.js';

const router = Router();

const DEFAULT_FEATURE_BOXES = [
  {
    slot: 0,
    icon: 'truck',
    title: 'Fast Delivery',
    subtitle: 'INSIDE DHAKA ৳80 • OUTSIDE ৳120',
  },
  {
    slot: 1,
    icon: 'shield',
    title: 'Secure Payment',
    subtitle: '100% SECURE TRANSACTION',
  },
  {
    slot: 2,
    icon: 'return',
    title: '7 Days Return',
    subtitle: 'EASY RETURN POLICY',
  },
  {
    slot: 3,
    icon: 'headset',
    title: '24/7 Support',
    subtitle: 'DEDICATED ASSISTANCE',
  },
];

// Development-only in-memory store when MongoDB is not connected
const devMemoryBoxes = DEFAULT_FEATURE_BOXES.map((box) => ({ ...box }));

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function sanitizeText(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function serializeBox(doc) {
  return {
    slot: doc.slot,
    icon: doc.icon,
    title: doc.title,
    subtitle: doc.subtitle || '',
  };
}

async function ensureDefaultDbBoxes() {
  const count = await FeatureBox.countDocuments();
  if (count === 0) {
    await FeatureBox.insertMany(DEFAULT_FEATURE_BOXES, { ordered: false }).catch(() => {});
  }
}

// Public: fetch the 4 feature boxes
router.get('/', async (_req, res, next) => {
  try {
    if (isDbConnected()) {
      await ensureDefaultDbBoxes();
      const boxes = await FeatureBox.find({}).sort({ slot: 1 }).lean();
      return res.status(200).json({ boxes: boxes.map(serializeBox) });
    }
    return res.status(200).json({ boxes: devMemoryBoxes.map(serializeBox) });
  } catch (err) {
    return next(err);
  }
});

// Admin: edit a specific feature box's title, subtitle, and icon
router.put('/:slot', adminWriteLimiter, requireAdmin, async (req, res, next) => {
  try {
    const slot = Number(req.params.slot);
    if (!Number.isInteger(slot) || slot < 0 || slot > 3) {
      return res.status(400).json({ error: 'Invalid box slot (must be 0 to 3).' });
    }

    const title = sanitizeText(req.body?.title);
    const subtitle = sanitizeText(req.body?.subtitle ?? '');
    const icon = typeof req.body?.icon === 'string' ? req.body.icon.trim() : '';

    if (title.length < 1 || title.length > 40) {
      return res.status(400).json({ error: 'Title must be between 1 and 40 characters.' });
    }
    if (subtitle.length > 80) {
      return res.status(400).json({ error: 'Subtitle must be at most 80 characters.' });
    }
    if (!ALLOWED_FEATURE_ICONS.includes(icon)) {
      return res.status(400).json({ error: 'Selected icon is not allowed.' });
    }

    if (isDbConnected()) {
      const updated = await FeatureBox.findOneAndUpdate(
        { slot },
        { $set: { title, subtitle, icon } },
        { new: true, upsert: true, runValidators: true }
      ).lean();
      return res.status(200).json({ box: serializeBox(updated) });
    }

    devMemoryBoxes[slot] = { slot, title, subtitle, icon };
    return res.status(200).json({ box: serializeBox(devMemoryBoxes[slot]) });
  } catch (err) {
    return next(err);
  }
});

export default router;

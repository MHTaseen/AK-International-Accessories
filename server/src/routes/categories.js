import { Router } from 'express';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { Category } from '../models/Category.js';
import { requireAdmin, adminWriteLimiter } from '../middleware/adminAuth.js';
import { validateCategoryName, toSlug } from '../utils/validators.js';

const router = Router();

// Development-only in-memory fallback when MongoDB is not connected yet
const devMemoryStore = [];

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function serializeCategory(doc) {
  return {
    id: String(doc._id || doc.id),
    name: doc.name,
    slug: doc.slug,
    order: doc.order ?? 0,
    products: Array.isArray(doc.products)
      ? doc.products.map((p) => ({
          id: String(p._id || p.id),
          name: p.name,
          slug: p.slug,
        }))
      : [],
  };
}

// Public: fetch all category buttons and their dropdown product lists
router.get('/', async (_req, res, next) => {
  try {
    if (isDbConnected()) {
      const categories = await Category.find({})
        .sort({ order: 1, createdAt: 1 })
        .lean();
      return res.status(200).json({ categories: categories.map(serializeCategory) });
    }
    return res.status(200).json({ categories: devMemoryStore.map(serializeCategory) });
  } catch (err) {
    return next(err);
  }
});

// Admin: verify admin privilege before unlocking admin UI controls
router.post('/verify-admin', adminWriteLimiter, requireAdmin, (_req, res) => {
  res.status(200).json({ admin: true });
});

// Admin: create a new category button (unlimited categories allowed)
router.post('/', adminWriteLimiter, requireAdmin, async (req, res, next) => {
  try {
    const check = validateCategoryName(req.body?.name);
    if (!check.valid) {
      return res.status(400).json({ error: check.error });
    }

    const slug = toSlug(check.name);
    if (!slug) {
      return res.status(400).json({ error: 'Category name must include letters or numbers.' });
    }

    if (isDbConnected()) {
      const existing = await Category.findOne({ slug }).lean();
      if (existing) {
        return res.status(409).json({ error: 'A category with this name already exists.' });
      }
      const count = await Category.countDocuments();
      const created = await Category.create({
        name: check.name,
        slug,
        order: count,
        products: [],
      });
      return res.status(201).json({ category: serializeCategory(created) });
    }

    if (devMemoryStore.some((c) => c.slug === slug)) {
      return res.status(409).json({ error: 'A category with this name already exists.' });
    }
    const created = {
      id: crypto.randomUUID(),
      name: check.name,
      slug,
      order: devMemoryStore.length,
      products: [],
    };
    devMemoryStore.push(created);
    return res.status(201).json({ category: serializeCategory(created) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'A category with this name already exists.' });
    }
    return next(err);
  }
});

// Admin: remove a category button
router.delete('/:id', adminWriteLimiter, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid category identifier.' });
      }
      const deleted = await Category.findByIdAndDelete(id).lean();
      if (!deleted) {
        return res.status(404).json({ error: 'Category not found.' });
      }
      return res.status(200).json({ deletedId: String(deleted._id) });
    }

    const idx = devMemoryStore.findIndex((c) => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    devMemoryStore.splice(idx, 1);
    return res.status(200).json({ deletedId: id });
  } catch (err) {
    return next(err);
  }
});

export default router;

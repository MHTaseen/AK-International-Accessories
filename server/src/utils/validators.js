const SAFE_CATEGORY_NAME_REGEX = /^[\p{L}\p{N}\s&\-/()+'.]+$/u;

export function sanitizeCategoryName(raw) {
  if (typeof raw !== 'string') return '';
  // Collapse whitespace, strip control characters
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateCategoryName(raw) {
  const name = sanitizeCategoryName(raw);
  if (name.length < 1 || name.length > 50) {
    return { valid: false, error: 'Category name must be between 1 and 50 characters.' };
  }
  if (!SAFE_CATEGORY_NAME_REGEX.test(name)) {
    return { valid: false, error: 'Category name contains invalid characters.' };
  }
  return { valid: true, name };
}

export function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

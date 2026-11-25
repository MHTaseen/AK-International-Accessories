import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import './CategoryNavbar.css';

const CategoryNavbar = memo(function CategoryNavbar() {
  const { isAdmin, adminKey, unlockAdmin, lockAdmin } = useAdmin();

  const [categories, setCategories] = useState([]);
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0 });

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [statusError, setStatusError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navRef = useRef(null);
  const closeTimerRef = useRef(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories', { credentials: 'same-origin' });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch {
      // Backend may be offline during isolated preview
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenCategoryId(null);
        setShowAdminModal(false);
        setShowAddForm(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenCategoryId(null);
        setShowAdminModal(false);
        setShowAddForm(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openDropdownForElement = (categoryId, element) => {
    clearCloseTimer();
    if (element) {
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const panelWidth = 240;
      const clampedLeft = Math.max(
        12,
        Math.min(rect.left, viewportWidth - panelWidth - 12)
      );
      setDropdownPos({ left: clampedLeft, top: rect.bottom + 8 });
    }
    setOpenCategoryId(categoryId);
  };

  const scheduleCloseDropdown = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenCategoryId(null);
    }, 150);
  };

  const handleCategoryClick = (categoryId, event) => {
    if (openCategoryId === categoryId) {
      setOpenCategoryId(null);
    } else {
      openDropdownForElement(categoryId, event.currentTarget);
    }
  };

  const handleVerifyAdmin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusError('');
    const result = await unlockAdmin(keyInput);
    setIsSubmitting(false);
    if (!result.ok) {
      setStatusError(result.error);
      return;
    }
    setKeyInput('');
    setShowAdminModal(false);
  };

  const handleLockAdmin = () => {
    lockAdmin();
    setShowAddForm(false);
    setStatusError('');
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setStatusError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setStatusError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        credentials: 'same-origin',
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusError(data.error || 'Could not create category.');
        return;
      }
      if (data.category) {
        setCategories((prev) => [...prev, data.category]);
      }
      setNewCategoryName('');
      setShowAddForm(false);
    } catch {
      setStatusError('Unable to reach server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId, event) => {
    event.stopPropagation();
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(categoryId)}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': adminKey },
        credentials: 'same-origin',
      });
      if (!res.ok) return;
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      if (openCategoryId === categoryId) {
        setOpenCategoryId(null);
      }
    } catch {
      // ignore network error
    }
  };

  const activeCategory = categories.find((c) => c.id === openCategoryId) || null;

  return (
    <nav
      ref={navRef}
      className="category-navbar"
      aria-label="Product categories"
    >
      <div className="category-navbar__inner">
        <div className="category-navbar__list" role="menubar">
          {categories.length === 0 ? (
            <span className="category-navbar__empty">
              {isAdmin
                ? 'No category buttons yet — click "+ Add Category" to create one.'
                : 'Categories coming soon'}
            </span>
          ) : (
            categories.map((category) => {
              const isOpen = openCategoryId === category.id;
              return (
                <div
                  key={category.id}
                  className="category-navbar__item"
                  onMouseEnter={(e) => openDropdownForElement(category.id, e.currentTarget)}
                  onMouseLeave={scheduleCloseDropdown}
                >
                  <button
                    type="button"
                    className={`category-navbar__btn${isOpen ? ' is-open' : ''}`}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    onClick={(e) => handleCategoryClick(category.id, e)}
                  >
                    <span>{category.name}</span>
                    <svg
                      className="category-navbar__chevron"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      className="category-navbar__remove-btn"
                      aria-label={`Remove ${category.name}`}
                      title={`Remove ${category.name}`}
                      onClick={(e) => handleDeleteCategory(category.id, e)}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="category-navbar__admin">
          {isAdmin ? (
            <>
              <button
                type="button"
                className="category-navbar__add-btn"
                onClick={() => {
                  setShowAddForm((prev) => !prev);
                  setStatusError('');
                }}
              >
                + Add Category
              </button>
              <button
                type="button"
                className="category-navbar__admin-btn is-unlocked"
                onClick={handleLockAdmin}
                title="Exit Admin Mode"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <span>Lock</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="category-navbar__admin-btn"
              onClick={() => {
                setShowAdminModal((prev) => !prev);
                setStatusError('');
              }}
              title="Admin Privilege"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3z" />
              </svg>
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>

      {activeCategory && (
        <div
          className="category-dropdown"
          role="menu"
          aria-label={`${activeCategory.name} products`}
          style={{ left: `${dropdownPos.left}px`, top: `${dropdownPos.top}px` }}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleCloseDropdown}
        >
          <div className="category-dropdown__header">{activeCategory.name}</div>
          {activeCategory.products.length === 0 ? (
            <div className="category-dropdown__empty">
              No products added under this category yet.
            </div>
          ) : (
            <ul className="category-dropdown__list">
              {activeCategory.products.map((product) => (
                <li key={product.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="category-dropdown__item"
                  >
                    {product.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showAdminModal && !isAdmin && (
        <form className="category-popover" onSubmit={handleVerifyAdmin}>
          <div className="category-popover__title">Admin Privilege</div>
          <input
            type="password"
            className="category-popover__input"
            placeholder="Enter Admin Key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            autoComplete="off"
            maxLength={128}
            autoFocus
          />
          {statusError && (
            <div className="category-popover__error" role="alert">
              {statusError}
            </div>
          )}
          <div className="category-popover__actions">
            <button
              type="button"
              className="category-popover__cancel"
              onClick={() => setShowAdminModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="category-popover__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Unlock'}
            </button>
          </div>
        </form>
      )}

      {showAddForm && isAdmin && (
        <form className="category-popover" onSubmit={handleCreateCategory}>
          <div className="category-popover__title">Create Category Button</div>
          <input
            type="text"
            className="category-popover__input"
            placeholder="e.g. Phone Cases, Chargers, Earbuds"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            autoComplete="off"
            maxLength={50}
            autoFocus
          />
          {statusError && (
            <div className="category-popover__error" role="alert">
              {statusError}
            </div>
          )}
          <div className="category-popover__actions">
            <button
              type="button"
              className="category-popover__cancel"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="category-popover__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Create'}
            </button>
          </div>
        </form>
      )}
    </nav>
  );
});

export default CategoryNavbar;

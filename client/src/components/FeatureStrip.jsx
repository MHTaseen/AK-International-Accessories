import { memo, useCallback, useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import './FeatureStrip.css';

const DEFAULT_BOXES = [
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

const ICON_OPTIONS = [
  { id: 'truck', label: 'Delivery' },
  { id: 'shield', label: 'Shield' },
  { id: 'return', label: 'Return' },
  { id: 'headset', label: 'Support' },
  { id: 'star', label: 'Quality' },
  { id: 'award', label: 'Warranty' },
  { id: 'gift', label: 'Offers' },
  { id: 'zap', label: 'Express' },
  { id: 'lock', label: 'Security' },
  { id: 'tag', label: 'Best Price' },
  { id: 'phone', label: 'Devices' },
  { id: 'package', label: 'Package' },
];

function FeatureIcon({ name, size = 22 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  switch (name) {
    case 'truck':
      return (
        <svg {...props}>
          <path d="M10 17h4V5H2v12h3" />
          <path d="M14 8h4l4 4v5h-3" />
          <circle cx="7.5" cy="17.5" r="2.5" />
          <circle cx="16.5" cy="17.5" r="2.5" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'return':
      return (
        <svg {...props}>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <path d="M8 16H3v5" />
        </svg>
      );
    case 'headset':
      return (
        <svg {...props}>
          <path d="M4 13a8 8 0 0 1 16 0" />
          <rect x="2" y="13" width="4" height="6" rx="2" />
          <rect x="18" y="13" width="4" height="6" rx="2" />
          <path d="M20 19v1a2 2 0 0 1-2 2h-4" />
        </svg>
      );
    case 'star':
      return (
        <svg {...props}>
          <polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.7 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2" />
        </svg>
      );
    case 'award':
      return (
        <svg {...props}>
          <circle cx="12" cy="8.5" r="5.5" />
          <path d="M8.5 13.5 7 22l5-2.8L17 22l-1.5-8.5" />
        </svg>
      );
    case 'gift':
      return (
        <svg {...props}>
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <path d="M12 8v13" />
          <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
          <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...props}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...props}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case 'tag':
      return (
        <svg {...props}>
          <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z" />
          <circle cx="7.5" cy="7.5" r="1.5" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...props}>
          <rect x="6" y="2" width="12" height="20" rx="2.5" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'package':
      return (
        <svg {...props}>
          <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
          <path d="M3 7l9 5 9-5" />
          <path d="M12 12v10" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

const FeatureStrip = memo(function FeatureStrip() {
  const { isAdmin, adminKey } = useAdmin();
  const [boxes, setBoxes] = useState(DEFAULT_BOXES);

  const [editingSlot, setEditingSlot] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editIcon, setEditIcon] = useState('truck');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadBoxes = useCallback(async () => {
    try {
      const res = await fetch('/api/feature-boxes', { credentials: 'same-origin' });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.boxes) && data.boxes.length === 4) {
        setBoxes(data.boxes);
      }
    } catch {
      // Fall back to default boxes if backend is unreachable
    }
  }, []);

  useEffect(() => {
    loadBoxes();
  }, [loadBoxes]);

  useEffect(() => {
    if (!isAdmin) {
      setEditingSlot(null);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (editingSlot === null) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setEditingSlot(null);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [editingSlot]);

  const openEditor = (box) => {
    setEditingSlot(box.slot);
    setEditTitle(box.title);
    setEditSubtitle(box.subtitle);
    setEditIcon(box.icon);
    setSaveError('');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setSaveError('Title is required.');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/feature-boxes/${editingSlot}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          title: trimmedTitle,
          subtitle: editSubtitle.trim(),
          icon: editIcon,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveError(data.error || 'Could not update box.');
        return;
      }
      if (data.box) {
        setBoxes((prev) =>
          prev.map((item) => (item.slot === data.box.slot ? data.box : item))
        );
      }
      setEditingSlot(null);
    } catch {
      setSaveError('Unable to reach server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="feature-strip" aria-label="Store highlights">
      <div className="feature-strip__grid">
        {boxes.map((box) => (
          <div key={box.slot} className="feature-box">
            <div className="feature-box__icon-tile">
              <FeatureIcon name={box.icon} size={22} />
            </div>

            <div className="feature-box__text">
              <h2 className="feature-box__title">{box.title}</h2>
              {box.subtitle && (
                <p className="feature-box__subtitle">{box.subtitle}</p>
              )}
            </div>

            {isAdmin && (
              <button
                type="button"
                className="feature-box__edit-btn"
                onClick={() => openEditor(box)}
                aria-label={`Edit ${box.title}`}
                title="Edit box text & icon"
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
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                <span>Edit</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {editingSlot !== null && isAdmin && (
        <div
          className="feature-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Edit highlight box"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingSlot(null);
          }}
        >
          <form className="feature-modal" onSubmit={handleSave}>
            <div className="feature-modal__header">
              <h3 className="feature-modal__title">Edit Highlight Box</h3>
              <button
                type="button"
                className="feature-modal__close"
                aria-label="Close editor"
                onClick={() => setEditingSlot(null)}
              >
                ×
              </button>
            </div>

            <div className="feature-modal__field">
              <label className="feature-modal__label" htmlFor="feature-title-input">
                Heading
              </label>
              <input
                id="feature-title-input"
                type="text"
                className="feature-modal__input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={40}
                autoComplete="off"
                required
              />
            </div>

            <div className="feature-modal__field">
              <label className="feature-modal__label" htmlFor="feature-subtitle-input">
                Subtitle
              </label>
              <input
                id="feature-subtitle-input"
                type="text"
                className="feature-modal__input"
                value={editSubtitle}
                onChange={(e) => setEditSubtitle(e.target.value)}
                maxLength={80}
                autoComplete="off"
              />
            </div>

            <div className="feature-modal__field">
              <span className="feature-modal__label">Select Icon</span>
              <div className="feature-modal__icons">
                {ICON_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`feature-modal__icon-choice${
                      editIcon === option.id ? ' is-selected' : ''
                    }`}
                    onClick={() => setEditIcon(option.id)}
                    title={option.label}
                    aria-label={option.label}
                  >
                    <FeatureIcon name={option.id} size={18} />
                  </button>
                ))}
              </div>
            </div>

            {saveError && (
              <div className="feature-modal__error" role="alert">
                {saveError}
              </div>
            )}

            <div className="feature-modal__actions">
              <button
                type="button"
                className="feature-modal__cancel"
                onClick={() => setEditingSlot(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="feature-modal__save"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
});

export default FeatureStrip;

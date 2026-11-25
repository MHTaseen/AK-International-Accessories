import { memo } from 'react';
import akLogo from '../assets/ak-logo.png';
import './Navbar.css';

const Navbar = memo(function Navbar() {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <header className="glass-navbar" role="banner">
      <div className="glass-navbar__inner">
        <a
          href="/"
          className="glass-navbar__brand"
          aria-label="AK iNTERNATIONAL Home"
        >
          <img
            src={akLogo}
            alt="AK iNTERNATIONAL Logo"
            className="glass-navbar__logo"
            width="50"
            height="50"
            decoding="async"
            fetchPriority="high"
          />

          <span className="glass-navbar__brand-name">
            AK <span className="glass-navbar__brand-i">i</span>NTERNATIONAL
          </span>
        </a>

        <form
          className="glass-navbar__search"
          role="search"
          aria-label="Product search"
          onSubmit={handleSubmit}
        >
          <span className="glass-navbar__search-icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7.5" />
              <path d="m20 20-3.8-3.8" />
            </svg>
          </span>

          <input
            type="search"
            name="q"
            className="glass-navbar__search-input"
            placeholder="Search phone accessories, models, brands..."
            aria-label="Search products"
            autoComplete="off"
            spellCheck="false"
            maxLength={120}
          />

          <button
            type="submit"
            className="glass-navbar__search-btn"
            aria-label="Submit search"
          >
            Search
          </button>
        </form>

        <nav className="glass-navbar__actions" aria-label="Primary actions">
          <button type="button" className="glass-navbar__action-btn">
            <svg
              className="glass-navbar__action-icon"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>Products</span>
          </button>

          <button type="button" className="glass-navbar__action-btn">
            <svg
              className="glass-navbar__action-icon"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
            </svg>
            <span>Register/ Sign In</span>
          </button>

          <button type="button" className="glass-navbar__action-btn">
            <svg
              className="glass-navbar__action-icon"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M2.5 3.5h3l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.45-1.15L21 7.5H6.5" />
            </svg>
            <span>Cart</span>
          </button>
        </nav>
      </div>
    </header>
  );
});

export default Navbar;

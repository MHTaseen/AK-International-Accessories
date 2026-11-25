import { memo } from 'react';
import './GlassShowcase.css';

const GlassShowcase = memo(function GlassShowcase() {
  return (
    <section className="glass-showcase" aria-label="Featured glass showcase">
      <div className="glass-showcase__grid">
        <div className="glass-panel glass-panel--primary" />
        <div className="glass-panel glass-panel--top-right" />
        <div className="glass-panel glass-panel--bottom-right" />
      </div>
    </section>
  );
});

export default GlassShowcase;

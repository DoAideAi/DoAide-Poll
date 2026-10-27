import { useEffect } from 'react';
import { DEFAULT_OG_IMAGE, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT, SITE_NAME } from '../routeMeta';

/**
 * Sets document <head> tags for SEO.
 * Cleans up on unmount so each page has unique meta.
 */
export default function useSEO({ title, description, canonical, ogType, jsonLd }) {
  useEffect(() => {
    // --- title ---
    const prevTitle = document.title;
    if (title) document.title = title;

    const tags = [];

    function setMeta(attr, key, content) {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      const existed = !!el;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute('content');
      el.setAttribute('content', content);
      tags.push({ el, attr, key, prev, existed });
    }

    // description
    setMeta('name', 'description', description);

    // canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    const canonicalExisted = !!canonicalEl;
    let prevCanonical = null;
    if (canonical) {
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      prevCanonical = canonicalEl.getAttribute('href');
      canonicalEl.setAttribute('href', canonical);
    }

    // Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', ogType || 'website');
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:image', DEFAULT_OG_IMAGE);
    setMeta('property', 'og:image:width', OG_IMAGE_WIDTH);
    setMeta('property', 'og:image:height', OG_IMAGE_HEIGHT);

    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', DEFAULT_OG_IMAGE);

    // JSON-LD
    let scriptEl = null;
    if (jsonLd) {
      scriptEl = document.createElement('script');
      scriptEl.setAttribute('type', 'application/ld+json');
      scriptEl.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }

    return () => {
      document.title = prevTitle;

      for (const { el, prev, existed } of tags) {
        if (!existed) {
          el.remove();
        } else if (prev !== null) {
          el.setAttribute('content', prev);
        }
      }

      if (canonicalEl) {
        if (!canonicalExisted) {
          canonicalEl.remove();
        } else if (prevCanonical !== null) {
          canonicalEl.setAttribute('href', prevCanonical);
        }
      }

      if (scriptEl) scriptEl.remove();
    };
  }, [title, description, canonical, ogType, jsonLd]);
}

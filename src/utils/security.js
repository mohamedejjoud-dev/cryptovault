/**
 * Security and sanitization utilities for CryptoVault.
 */

/**
 * Validates that a URL is strictly HTTP or HTTPS.
 * Rejects javascript:, data:, vbscript:, and relative malicious protocols.
 *
 * @param {string} url - The URL to validate.
 * @returns {string|null} Safe trimmed URL or null if invalid.
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  // Strictly enforce http:// or https:// protocol
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
};

/**
 * Strips all HTML tags and returns safe raw text content.
 * Prevents stored XSS from untrusted API descriptions.
 *
 * @param {string} html - HTML string to sanitize.
 * @returns {string} Sanitized plain text.
 */
export const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  try {
    if (typeof DOMParser !== 'undefined') {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    }
  } catch {
    // Fallback if DOMParser throws
  }
  // Regex fallback: strip all tags
  return html.replace(/<[^>]*>/g, '').trim();
};

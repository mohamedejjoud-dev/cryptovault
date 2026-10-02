/* eslint-disable no-script-url */
import { sanitizeUrl, stripHtml } from './security';

describe('security utilities', () => {
  describe('sanitizeUrl', () => {
    it('returns null for falsy or non-string values', () => {
      expect(sanitizeUrl(null)).toBeNull();
      expect(sanitizeUrl(undefined)).toBeNull();
      expect(sanitizeUrl('')).toBeNull();
      expect(sanitizeUrl(123)).toBeNull();
      expect(sanitizeUrl({})).toBeNull();
    });

    it('allows valid HTTPS and HTTP URLs', () => {
      expect(sanitizeUrl('https://bitcoin.org')).toBe('https://bitcoin.org');
      expect(sanitizeUrl('http://ethereum.org/en/')).toBe('http://ethereum.org/en/');
      expect(sanitizeUrl('  https://solana.com  ')).toBe('https://solana.com');
    });

    it('blocks dangerous URI schemes', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
      expect(sanitizeUrl('JAVASCRIPT:alert(document.cookie)')).toBeNull();
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
      expect(sanitizeUrl('vbscript:msgbox("XSS")')).toBeNull();
      expect(sanitizeUrl('file:///etc/passwd')).toBeNull();
    });

    it('blocks protocol-relative and relative URLs', () => {
      expect(sanitizeUrl('//malicious.com')).toBeNull();
      expect(sanitizeUrl('/login')).toBeNull();
      expect(sanitizeUrl('www.bitcoin.org')).toBeNull();
    });
  });

  describe('stripHtml', () => {
    it('returns empty string for null, undefined, or empty input', () => {
      expect(stripHtml(null)).toBe('');
      expect(stripHtml(undefined)).toBe('');
      expect(stripHtml('')).toBe('');
    });

    it('strips HTML tags and preserves plain text', () => {
      const html = '<p>Bitcoin is a <strong>decentralized</strong> cryptocurrency.</p>';
      expect(stripHtml(html)).toBe('Bitcoin is a decentralized cryptocurrency.');
    });

    it('neutralizes malicious script tags and event handlers', () => {
      const malicious = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">Hello';
      expect(stripHtml(malicious)).not.toContain('<script>');
      expect(stripHtml(malicious)).not.toContain('<img');
      expect(stripHtml(malicious)).toContain('Hello');
    });

    it('handles nested tags and links', () => {
      const complex = '<div><a href="https://example.com">Click <span>here</span></a> for info.</div>';
      expect(stripHtml(complex)).toBe('Click here for info.');
    });
  });
});

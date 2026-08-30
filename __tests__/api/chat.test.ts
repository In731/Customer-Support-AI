import { describe, it, expect } from 'vitest';
import { isOriginAllowed } from '@/lib/cors';

describe('Domain Whitelisting (CORS Firewall)', () => {
    it('should allow all requests if allowedDomains is empty (fallback mode)', () => {
        const allowedDomains: string[] = [];
        const requestOrigin = "http://malicious-website.com";
        const isAllowed = isOriginAllowed(requestOrigin, allowedDomains);
        expect(isAllowed).toBe(true);
    });

    it('should allow exact domain matches and authorized subdomains', () => {
        const allowedDomains = ["acme.com", "store.acme.com"];
        
        expect(isOriginAllowed("https://acme.com", allowedDomains)).toBe(true);
        expect(isOriginAllowed("https://store.acme.com", allowedDomains)).toBe(true);
        expect(isOriginAllowed("https://checkout.store.acme.com/pay", allowedDomains)).toBe(true);
    });

    it('should handle localhost for local development properly', () => {
        const allowedDomains = ["localhost:3000", "acme.com"];
        const requestOrigin = "http://localhost:3000";
        const isAllowed = isOriginAllowed(requestOrigin, allowedDomains);
        expect(isAllowed).toBe(true);
    });

    it('should BLOCK unauthorized competitor domains', () => {
        const allowedDomains = ["acme.com"];
        const requestOrigin = "https://evil-competitor.com/steal-chatbot";
        const isAllowed = isOriginAllowed(requestOrigin, allowedDomains);
        expect(isAllowed).toBe(false);
    });

    it('rejects a domain that merely contains the allowed domain as a substring', () => {
        expect(isOriginAllowed("https://evil-acme.com.attacker.net", ["acme.com"])).toBe(false);
    });

    it('should BLOCK substring and suffix injection attacks', () => {
        const allowed = ["acme.com"];
        
        // Suffix / Sibling domain injection
        expect(isOriginAllowed("https://evil-acme.com", allowed)).toBe(false);
        expect(isOriginAllowed("https://acme.com.attacker.net", allowed)).toBe(false);
        expect(isOriginAllowed("https://notacme.com", allowed)).toBe(false);

        // Path & Query parameter smuggling in Referer headers
        expect(isOriginAllowed("https://attacker.net?ref=acme.com", allowed)).toBe(false);
        expect(isOriginAllowed("https://attacker.net/acme.com", allowed)).toBe(false);
    });
});

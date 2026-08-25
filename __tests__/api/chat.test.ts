import { describe, it, expect } from 'vitest';

function checkDomainWhitelisting(requestOrigin: string, allowedDomains: string[]): boolean {
    if (!allowedDomains || allowedDomains.length === 0) return true; // Fallback mode
    return allowedDomains.some((domain) => requestOrigin.includes(domain));
}

describe('Domain Whitelisting (CORS Security)', () => {
    it('should allow all requests if allowedDomains is empty (fallback mode)', () => {
        const allowedDomains: string[] = [];
        const requestOrigin = "http://malicious-website.com";
        const isAllowed = checkDomainWhitelisting(requestOrigin, allowedDomains);
        expect(isAllowed).toBe(true);
    });

    it('should allow requests from whitelisted domains', () => {
        const allowedDomains = ["acme.com", "store.acme.com"];
        const requestOrigin = "https://store.acme.com/checkout";
        const isAllowed = checkDomainWhitelisting(requestOrigin, allowedDomains);
        expect(isAllowed).toBe(true);
    });

    it('should block requests from unauthorized domains', () => {
        const allowedDomains = ["acme.com"];
        const requestOrigin = "https://evil-competitor.com/steal-chatbot";
        const isAllowed = checkDomainWhitelisting(requestOrigin, allowedDomains);
        expect(isAllowed).toBe(false);
    });

    it('should handle localhost for local development properly', () => {
        const allowedDomains = ["localhost:3000", "acme.com"];
        const requestOrigin = "http://localhost:3000";
        const isAllowed = checkDomainWhitelisting(requestOrigin, allowedDomains);
        expect(isAllowed).toBe(true);
    });
});

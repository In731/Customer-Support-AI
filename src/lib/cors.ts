/**
 * Validates if a request origin/referer belongs to an allowed tenant domain.
 * Enforces strict hostname boundaries and prevents substring/suffix injection.
 */
export function isOriginAllowed(requestOrigin: string, allowedDomains: string[]): boolean {
    // Fallback/open mode: if tenant hasn't configured restrictions, allow all
    if (!allowedDomains || allowedDomains.length === 0) return true;
    if (!requestOrigin) return false;

    let host: string;
    try {
        // Ensure a valid protocol exists so URL parser succeeds on naked hosts
        const urlStr = requestOrigin.startsWith("http://") || requestOrigin.startsWith("https://")
            ? requestOrigin
            : `https://${requestOrigin}`;
            
        host = new URL(urlStr).host.toLowerCase(); // includes hostname + port (e.g. "localhost:3000")
    } catch {
        return false;
    }

    return allowedDomains.some((domain) => {
        if (!domain) return false;
        
        // Clean domain: strip protocol, trailing slashes, whitespace
        const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
        
        // Exact match (e.g., "acme.com" === "acme.com", "localhost:3000" === "localhost:3000")
        // OR authorized subdomain (e.g., "app.acme.com" ends with ".acme.com")
        return host === cleanDomain || host.endsWith(`.${cleanDomain}`);
    });
}

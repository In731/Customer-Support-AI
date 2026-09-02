import { describe, it, expect } from 'vitest';
import { verifyAdminPassword } from '@/lib/adminAuth';

describe('Admin Authentication & Passcode Protection', () => {
    it('should reject empty or undefined password', () => {
        expect(verifyAdminPassword("")).toBe(false);
    });

    it('should reject incorrect admin password', () => {
        expect(verifyAdminPassword("wrong_password_123")).toBe(false);
    });

    it('should accept valid admin password', () => {
        const expected = process.env.ADMIN_PASSWORD || "nexsupport_admin_2026";
        expect(verifyAdminPassword(expected)).toBe(true);
    });
});

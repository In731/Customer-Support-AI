'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import axios, { isAxiosError } from 'axios'

interface CompanyData {
    _id: string;
    ownerId: string;
    businessName?: string;
    supportEmail?: string;
    allowedDomains?: string[];
    createdAt?: string;
    documentCount: number;
    vectorChunkCount: number;
}

interface AdminKPIs {
    totalCompanies: number;
    totalDocuments: number;
    totalVectors: number;
    totalQueries: number;
    deflectedQueries: number;
    escalatedQueries: number;
    deflectionRate: number;
    totalUnansweredCount: number;
}

export default function AdminClient() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loadingLogin, setLoadingLogin] = useState(false);

    // Dashboard State
    const [kpis, setKpis] = useState<AdminKPIs | null>(null);
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchAdminStats = async () => {
        setLoadingData(true);
        try {
            const res = await axios.get("/api/admin/stats");
            setKpis(res.data.kpis);
            setCompanies(res.data.companies);
            setIsAuthenticated(true);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) {
                setIsAuthenticated(false);
            } else {
                console.error("Failed to load admin stats:", error);
            }
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setLoadingLogin(true);
        try {
            await axios.post("/api/admin/login", { password });
            setPassword("");
            setIsAuthenticated(true);
            await fetchAdminStats();
        } catch (error) {
            const msg = isAxiosError(error) ? error.response?.data?.error : "Invalid admin password";
            setLoginError(msg || "Invalid admin password");
        } finally {
            setLoadingLogin(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("/api/admin/logout");
            setIsAuthenticated(false);
            setKpis(null);
            setCompanies([]);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Filtered Companies
    const filteredCompanies = companies.filter((c) => {
        const query = searchQuery.toLowerCase();
        const name = (c.businessName || "").toLowerCase();
        const email = (c.supportEmail || "").toLowerCase();
        const id = (c.ownerId || "").toLowerCase();
        return name.includes(query) || email.includes(query) || id.includes(query);
    });

    // Loading State
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full" />
            </div>
        );
    }

    // Passcode Login State
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10"
                >
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-white font-bold text-xl">🛡️</span>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center tracking-tight text-white mb-1">NexSupport AI Team</h1>
                    <p className="text-sm text-center text-zinc-400 mb-8">Enter the master passcode to access platform operations.</p>

                    {loginError && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Admin Passcode</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loadingLogin}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
                        >
                            {loadingLogin ? "Authenticating..." : "Unlock Dashboard"}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // Authenticated Operations Dashboard
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white pb-20">
            {/* Ambient Background Gradient */}
            <div className="fixed top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-500/10 via-violet-500/5 to-transparent pointer-events-none" />

            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-800/80">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm">N</span>
                        </div>
                        <div>
                            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                                NexSupport <span className="text-indigo-400">Operations</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">Super Admin</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all shadow-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Overview</h1>
                        <p className="text-zinc-400 text-sm">Real-time health, vector capacity, and client onboarding metrics across NexSupport AI.</p>
                    </div>

                    <button
                        onClick={fetchAdminStats}
                        disabled={loadingData}
                        className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2"
                    >
                        <span className={loadingData ? "animate-spin" : ""}>🔄</span> Refresh Stats
                    </button>
                </div>

                {/* KPI Metrics Grid (6 Key Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* 1. Client Companies */}
                    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Client Companies</span>
                            <span className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-lg">🏢</span>
                        </div>
                        <div className="text-3xl font-extrabold text-white">{kpis?.totalCompanies ?? 0}</div>
                        <p className="text-xs text-zinc-500 mt-2">Active business accounts onboarded</p>
                    </div>

                    {/* 2. Hosted Documents */}
                    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hosted Documents</span>
                            <span className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg">📄</span>
                        </div>
                        <div className="text-3xl font-extrabold text-white">{kpis?.totalDocuments ?? 0}</div>
                        <p className="text-xs text-zinc-500 mt-2">PDF manuals & text knowledge sources</p>
                    </div>

                    {/* 3. Stored Vector Chunks */}
                    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Atlas Vector Chunks</span>
                            <span className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center text-lg">🧠</span>
                        </div>
                        <div className="text-3xl font-extrabold text-white">{kpis?.totalVectors ?? 0}</div>
                        <p className="text-xs text-zinc-500 mt-2">768-dim embeddings in MongoDB Atlas</p>
                    </div>

                    {/* 4. Total Platform AI Queries */}
                    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Platform Queries</span>
                            <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">💬</span>
                        </div>
                        <div className="text-3xl font-extrabold text-white">{kpis?.totalQueries ?? 0}</div>
                        <p className="text-xs text-zinc-500 mt-2">Processed customer support messages</p>
                    </div>

                    {/* 5. Global Deflection Rate */}
                    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Global Deflection Rate</span>
                            <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg">🎯</span>
                        </div>
                        <div className="text-3xl font-extrabold text-white">{kpis?.deflectionRate ?? 0}%</div>
                        <p className="text-xs text-zinc-500 mt-2">{kpis?.deflectedQueries ?? 0} resolved by AI / {kpis?.escalatedQueries ?? 0} escalated</p>
                    </div>

                    {/* 6. Unanswered Queries Count (Knowledge Gaps Count Only) */}
                    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Knowledge Gaps (Unanswered)</span>
                            <span className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-lg">❓</span>
                        </div>
                        <div className="text-3xl font-extrabold text-white">{kpis?.totalUnansweredCount ?? 0}</div>
                        <p className="text-xs text-zinc-500 mt-2">Total unresolved queries platform-wide</p>
                    </div>
                </div>

                {/* Client Companies Directory Table */}
                <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Onboarded Client Companies</h2>
                            <p className="text-xs text-zinc-400 mt-1">Directory of registered businesses and their active storage footprint.</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, or ID..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    {filteredCompanies.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                            <p className="text-sm">No companies found matching &ldquo;{searchQuery}&rdquo;</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-zinc-300">
                                <thead className="bg-zinc-950/60 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-800">
                                    <tr>
                                        <th className="py-3 px-4">Company Name</th>
                                        <th className="py-3 px-4">Support Email</th>
                                        <th className="py-3 px-4">Owner ID</th>
                                        <th className="py-3 px-4 text-center">Documents</th>
                                        <th className="py-3 px-4 text-center">Vector Chunks</th>
                                        <th className="py-3 px-4">Allowed Domains</th>
                                        <th className="py-3 px-4">Registered</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {filteredCompanies.map((c) => (
                                        <tr key={c._id} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="py-3.5 px-4 font-semibold text-white">
                                                {c.businessName || "Unnamed Business"}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-zinc-300">
                                                {c.supportEmail || "—"}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-zinc-400 max-w-[140px] truncate" title={c.ownerId}>
                                                {c.ownerId}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full font-semibold">
                                                    {c.documentCount}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="bg-violet-500/10 text-violet-400 px-2.5 py-1 rounded-full font-semibold">
                                                    {c.vectorChunkCount}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-zinc-400 max-w-[160px] truncate">
                                                {c.allowedDomains && c.allowedDomains.length > 0
                                                    ? c.allowedDomains.join(", ")
                                                    : "All Domains (*)"}
                                            </td>
                                            <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

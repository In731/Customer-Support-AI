'use client'
import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
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
            <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full" />
            </div>
        );
    }

    // Passcode Login State (Light / Website-Matching Theme)
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex items-center justify-center p-6 selection:bg-indigo-100 selection:text-indigo-900">
                <div className="fixed top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50/60 via-violet-50/30 to-transparent pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-zinc-200/80 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 relative z-10"
                >
                    <div className="flex items-center justify-center mb-6">
                        <img
                            src="/logo.png"
                            alt="NexSupport AI"
                            className="w-24 h-24 object-contain rounded-2xl shadow-lg shadow-indigo-500/10 ring-1 ring-zinc-200/60"
                        />
                    </div>

                    <h1 className="text-2xl font-bold text-center tracking-tight text-zinc-900 mb-1">NexSupport AI Team</h1>
                    <p className="text-sm text-center text-zinc-500 mb-8">Enter the master passcode to access platform operations.</p>

                    {loginError && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">Admin Passcode</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loadingLogin}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
                        >
                            {loadingLogin ? "Authenticating..." : "Unlock Dashboard"}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // Authenticated Operations Dashboard (Light / Website-Matching Theme)
    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900 pb-20">
            {/* Ambient Background Gradient */}
            <div className="fixed top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />

            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-zinc-200/50 shadow-sm shadow-zinc-200/20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="NexSupport AI Logo"
                            className="w-8 h-8 object-contain rounded-lg shadow-sm"
                        />
                        <div>
                            <div className="text-base font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                                NexSupport <span className="text-indigo-600">Operations</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200/60">Super Admin</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-xl bg-white border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-1">Platform Overview</h1>
                        <p className="text-zinc-500 text-sm">Real-time health, vector capacity, and client onboarding metrics across NexSupport AI.</p>
                    </div>

                    <button
                        onClick={fetchAdminStats}
                        disabled={loadingData}
                        className="self-start md:self-auto px-4 py-2 rounded-xl bg-white border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm flex items-center gap-2"
                    >
                        <span className={loadingData ? "animate-spin" : ""}>🔄</span> Refresh Stats
                    </button>
                </div>

                {/* KPI Metrics Grid (6 Key Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* 1. Client Companies */}
                    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Client Companies</span>
                            <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">🏢</span>
                        </div>
                        <div className="text-3xl font-extrabold text-zinc-900">{kpis?.totalCompanies ?? 0}</div>
                        <p className="text-xs text-zinc-500 mt-2">Active business accounts onboarded</p>
                    </div>

                    {/* 2. Hosted Documents */}
                    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Hosted Documents</span>
                            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">📄</span>
                        </div>
                        <div className="text-3xl font-extrabold text-zinc-900">{kpis?.totalDocuments ?? 0}</div>
                        <p className="text-xs text-zinc-500 mt-2">PDF manuals & text knowledge sources</p>
                    </div>

                    {/* 3. Stored Vector Chunks */}
                    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-violet-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Atlas Vector Chunks</span>
                            <span className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-lg">🧠</span>
                        </div>
                        <div className="text-3xl font-extrabold text-zinc-900">{kpis?.totalVectors ?? 0}</div>
                        <p className="text-xs text-zinc-500 mt-2">768-dim embeddings in MongoDB Atlas</p>
                    </div>

                    {/* 4. Total Platform AI Queries */}
                    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Platform Queries</span>
                            <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">💬</span>
                        </div>
                        <div className="text-3xl font-extrabold text-zinc-900">{kpis?.totalQueries ?? 0}</div>
                        <p className="text-xs text-zinc-500 mt-2">Processed customer support messages</p>
                    </div>

                    {/* 5. Global Deflection Rate */}
                    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Global Deflection Rate</span>
                            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">🎯</span>
                        </div>
                        <div className="text-3xl font-extrabold text-zinc-900">{kpis?.deflectionRate ?? 0}%</div>
                        <p className="text-xs text-zinc-500 mt-2">{kpis?.deflectedQueries ?? 0} resolved by AI / {kpis?.escalatedQueries ?? 0} escalated</p>
                    </div>

                    {/* 6. Unanswered Queries Count */}
                    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-rose-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Knowledge Gaps (Unanswered)</span>
                            <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg">❓</span>
                        </div>
                        <div className="text-3xl font-extrabold text-zinc-900">{kpis?.totalUnansweredCount ?? 0}</div>
                        <p className="text-xs text-zinc-500 mt-2">Total unresolved queries platform-wide</p>
                    </div>
                </div>

                {/* Client Companies Directory Table */}
                <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Onboarded Client Companies</h2>
                            <p className="text-xs text-zinc-500 mt-1">Directory of registered businesses and their active storage footprint.</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, or ID..."
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                        </div>
                    </div>

                    {filteredCompanies.length === 0 ? (
                        <div className="text-center py-12 text-zinc-400 border border-dashed border-zinc-200 rounded-2xl">
                            <p className="text-sm">No companies found matching &ldquo;{searchQuery}&rdquo;</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-zinc-700">
                                <thead className="bg-zinc-50 text-zinc-500 font-semibold uppercase tracking-wider border-b border-zinc-200">
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
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredCompanies.map((c) => (
                                        <tr key={c._id} className="hover:bg-zinc-50/60 transition-colors">
                                            <td className="py-3.5 px-4 font-semibold text-zinc-900">
                                                {c.businessName || "Unnamed Business"}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-zinc-600">
                                                {c.supportEmail || "—"}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-zinc-400 max-w-[140px] truncate" title={c.ownerId}>
                                                {c.ownerId}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="bg-blue-50 text-blue-700 border border-blue-200/50 px-2.5 py-0.5 rounded-full font-semibold">
                                                    {c.documentCount}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="bg-violet-50 text-violet-700 border border-violet-200/50 px-2.5 py-0.5 rounded-full font-semibold">
                                                    {c.vectorChunkCount}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-zinc-500 max-w-[160px] truncate">
                                                {c.allowedDomains && c.allowedDomains.length > 0
                                                    ? c.allowedDomains.join(", ")
                                                    : "All Domains (*)"}
                                            </td>
                                            <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
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

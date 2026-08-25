'use client'
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from 'next/navigation'
import axios from 'axios'

type UploadedDocument = {
    _id: string
    title: string
    fileName?: string
    status: "processing" | "embedded" | "failed"
    createdAt: string
    chunkCount: number
}

function DashboardClient({ ownerId }: { ownerId: string }) {
    const navigate = useRouter()
    const [businessName, setBusinessName] = useState("")
    const [supportEmail, setSupportEmail] = useState("")
    const [knowledge, setKnowledge] = useState("")
    const [primaryColor, setPrimaryColor] = useState("#000000")
    const [widgetIcon, setWidgetIcon] = useState("🤖")
    const [welcomeMessage, setWelcomeMessage] = useState("Hi! How can I help you today?")
    const [allowedDomains, setAllowedDomains] = useState("")
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [documents, setDocuments] = useState<UploadedDocument[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadingDoc, setUploadingDoc] = useState(false)
    const [uploadMsg, setUploadMsg] = useState("")
    const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)

    // Analytics State
    const [activeTab, setActiveTab] = useState<"settings" | "insights">("settings")
    const [metrics, setMetrics] = useState<any[]>([])
    const [unanswered, setUnanswered] = useState<any[]>([])
    const [loadingAnalytics, setLoadingAnalytics] = useState(false)

    const handleSettings = async () => {
        setLoading(true)
        try {
            const domainsArray = allowedDomains.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
            await axios.post("/api/settings", { 
                ownerId, businessName, supportEmail, knowledge, primaryColor, widgetIcon, welcomeMessage,
                allowedDomains: domainsArray
            })
            setLoading(false)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    useEffect(() => {
        if (ownerId) {
            const handleGetDetails = async () => {
                try {
                    const result = await axios.post("/api/settings/get", { ownerId })
                    setBusinessName(result.data.businessName || "")
                    setSupportEmail(result.data.supportEmail || "")
                    setKnowledge(result.data.knowledge || "")
                    setPrimaryColor(result.data.primaryColor || "#000000")
                    setWidgetIcon(result.data.widgetIcon || "🤖")
                    setWelcomeMessage(result.data.welcomeMessage || "Hi! How can I help you today?")
                    if (result.data.allowedDomains) {
                        setAllowedDomains(result.data.allowedDomains.join(", "))
                    }
                } catch (error) {
                    console.log(error)
                }
            }
            handleGetDetails()
            axios.get("/api/knowledge", { params: { tenantId: ownerId } })
                .then((result) => setDocuments(result.data))
                .catch((error) => console.log(error))
        }
    }, [ownerId])

    useEffect(() => {
        if (ownerId && activeTab === 'insights') {
            setLoadingAnalytics(true)
            axios.get("/api/analytics", { params: { tenantId: ownerId } })
                .then(res => {
                    setMetrics(res.data.metrics || [])
                    setUnanswered(res.data.unanswered || [])
                })
                .catch(err => console.log(err))
                .finally(() => setLoadingAnalytics(false))
        }
    }, [ownerId, activeTab])

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploadingDoc(true);
        setUploadMsg("");
        try {
            const formData = new FormData();
            files.forEach((file) => formData.append("files", file));
            formData.append("tenantId", ownerId);
            const res = await axios.post("/api/knowledge", formData);
            if (res.data.success) {
                setUploadMsg(res.data.message);
                setFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
                const documentsResult = await axios.get("/api/knowledge", { params: { tenantId: ownerId } });
                setDocuments(documentsResult.data);
            }
        } catch (error: any) {
            console.log(error);
            setUploadMsg(error.response?.data?.error || "Upload failed");
        }
        setUploadingDoc(false);
    }

    const handleDeleteDocument = async (document: UploadedDocument) => {
        const fileName = document.fileName || document.title;
        if (!window.confirm(`Remove ${fileName} and all of its knowledge chunks?`)) return;

        setDeletingDocumentId(document._id);
        setUploadMsg("");
        try {
            await axios.delete("/api/knowledge", { data: { documentId: document._id, tenantId: ownerId } });
            setDocuments((current) => current.filter((item) => item._id !== document._id));
            setUploadMsg(`${fileName} was removed from the knowledge base.`);
        } catch (error: any) {
            console.log(error);
            setUploadMsg(error.response?.data?.error || "Unable to remove document");
        } finally {
            setDeletingDocumentId(null);
        }
    }

    return (
        <div className='min-h-screen bg-zinc-50/50 text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900 pb-20'>
            {/* Minimal Background Effect */}
            <div className="fixed top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />

            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className='sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200/50 supports-[backdrop-filter]:bg-white/40 shadow-sm shadow-zinc-200/20'
            >
                <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
                    <div className='flex items-center gap-2.5 cursor-pointer group' onClick={() => navigate.push("/")}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md group-hover:shadow-indigo-500/20 transition-all group-hover:scale-105">
                           <span className="text-white font-bold text-lg">N</span>
                        </div>
                        <div className='text-xl font-bold tracking-tight'>NexSupport <span className='text-indigo-600'>AI</span></div>
                    </div>
                    <button 
                        className='px-5 py-2 rounded-xl bg-white border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm' 
                        onClick={() => navigate.push("/embed")}
                    >
                        Embed ChatBot
                    </button>
                </div>
            </motion.div>

            <div className='flex justify-center px-4 py-12 relative z-10'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className='w-full max-w-3xl'
                >
                    <div className='mb-8'>
                        <h1 className='text-3xl font-bold tracking-tight text-zinc-900'>Dashboard</h1>
                        <p className='text-zinc-500 mt-2 text-lg'>Manage your AI chatbot knowledge and monitor its performance.</p>
                    </div>

                    <div className='flex space-x-6 mb-8 border-b border-zinc-200'>
                        <button 
                            onClick={() => setActiveTab("settings")} 
                            className={`pb-3 text-lg font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Settings & Knowledge
                        </button>
                        <button 
                            onClick={() => setActiveTab("insights")} 
                            className={`pb-3 text-lg font-medium border-b-2 transition-colors ${activeTab === 'insights' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Insights & Analytics
                        </button>
                    </div>

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                        {/* Business Details Card */}
                        <div className='bg-white rounded-3xl shadow-sm shadow-zinc-200/50 border border-zinc-200 p-8'>
                            <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                Business Details
                            </h2>
                            <div className='space-y-5'>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Business Name</label>
                                    <input 
                                        type="text" 
                                        className='w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-zinc-50/50 focus:bg-white' 
                                        placeholder='e.g. Acme Corp' 
                                        value={businessName} 
                                        onChange={(e) => setBusinessName(e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Support Email</label>
                                    <input 
                                        type="email" 
                                        className='w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-zinc-50/50 focus:bg-white' 
                                        placeholder='support@example.com' 
                                        value={supportEmail} 
                                        onChange={(e) => setSupportEmail(e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Allowed Domains (CORS Firewall)</label>
                                    <input 
                                        type="text" 
                                        className='w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-zinc-50/50 focus:bg-white' 
                                        placeholder='example.com, my-store.net (Leave empty to allow all)' 
                                        value={allowedDomains} 
                                        onChange={(e) => setAllowedDomains(e.target.value)} 
                                    />
                                    <p className="text-xs text-zinc-500 mt-2">Only these websites will be allowed to use your chatbot. Separate multiple domains with commas.</p>
                                </div>
                            </div>
                        </div>

                        {/* Widget Appearance Card */}
                        <div className='bg-white rounded-3xl shadow-sm shadow-zinc-200/50 border border-zinc-200 p-8'>
                            <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                                Widget Appearance
                            </h2>
                            <div className='space-y-5'>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Primary Brand Color</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="color" 
                                            className='w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent' 
                                            value={primaryColor} 
                                            onChange={(e) => setPrimaryColor(e.target.value)} 
                                        />
                                        <input 
                                            type="text"
                                            className='w-32 rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-zinc-50/50' 
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-2 gap-5'>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Widget Icon (Emoji)</label>
                                        <input 
                                            type="text" 
                                            maxLength={2}
                                            className='w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-zinc-50/50 focus:bg-white text-center text-xl' 
                                            placeholder='🤖' 
                                            value={widgetIcon} 
                                            onChange={(e) => setWidgetIcon(e.target.value)} 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Welcome Message</label>
                                        <input 
                                            type="text" 
                                            className='w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-zinc-50/50 focus:bg-white' 
                                            placeholder='Hi! How can I help you today?' 
                                            value={welcomeMessage} 
                                            onChange={(e) => setWelcomeMessage(e.target.value)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Knowledge Base Card */}
                        <div className='bg-white rounded-3xl shadow-sm shadow-zinc-200/50 border border-zinc-200 p-8'>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className='text-xl font-semibold flex items-center gap-2'>
                                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                        Knowledge Base
                                    </h2>
                                    <p className='text-sm text-zinc-500 mt-1'>Add plain text FAQs, policies, and operating hours.</p>
                                </div>
                            </div>
                            <div className='space-y-4'>
                                <textarea 
                                    className='w-full h-56 rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-zinc-50/50 focus:bg-white resize-y' 
                                    placeholder={`Example:
• Refund policy: 7 days return available
• Delivery time: 3–5 working days
• Cash on Delivery available
• Support hours: Mon-Fri 9AM-5PM`} 
                                    onChange={(e) => setKnowledge(e.target.value)} 
                                    value={knowledge} 
                                />
                            </div>
                        </div>

                        {/* Document Upload Card */}
                        <div className='bg-white rounded-3xl shadow-sm shadow-zinc-200/50 border border-zinc-200 p-8'>
                            <div className="mb-6">
                                <h2 className='text-xl font-semibold flex items-center gap-2'>
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    Advanced Knowledge Documents
                                </h2>
                                    <p className='text-sm text-zinc-500 mt-1'>Upload one or more PDFs or text files. Every document remains available to the chatbot.</p>
                            </div>
                            <div className='relative rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center hover:bg-zinc-50 hover:border-indigo-300 transition-colors group'>
                                <input 
                                    type="file" 
                                    accept=".pdf,.txt" 
                                    multiple
                                    ref={fileInputRef}
                                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10' 
                                />
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <div className="text-sm font-medium text-zinc-700">
                                        {files.length > 0 ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Click or drag files to upload"}
                                    </div>
                                    <div className="text-xs text-zinc-500">Supports PDF and TXT up to 10MB</div>
                                </div>
                            </div>
                            
                            <div className="mt-5 flex items-center gap-4">
                                <button
                                    disabled={uploadingDoc || files.length === 0}
                                    onClick={handleUpload}
                                    className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-zinc-900/10"
                                >
                                    {uploadingDoc ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    )}
                                    {uploadingDoc ? "Processing..." : "Upload & Train"}
                                </button>
                                {uploadMsg && (
                                    <motion.p 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`text-sm font-medium ${uploadMsg.includes("failed") ? "text-red-500" : "text-emerald-600"}`}
                                    >
                                        {uploadMsg}
                                    </motion.p>
                                )}
                            </div>

                            {documents.length > 0 && (
                                <div className="mt-7 border-t border-zinc-100 pt-6">
                                    <h3 className="text-sm font-semibold text-zinc-800">Uploaded documents</h3>
                                    <div className="mt-3 space-y-2">
                                        {documents.map((document) => (
                                            <div key={document._id} className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-zinc-800">{document.fileName || document.title}</p>
                                                    <p className="text-xs text-zinc-500">{document.chunkCount} knowledge chunk{document.chunkCount === 1 ? "" : "s"}</p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${document.status === "embedded" ? "bg-emerald-50 text-emerald-700" : document.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                                                        {document.status}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteDocument(document)}
                                                        disabled={deletingDocumentId === document._id}
                                                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {deletingDocumentId === document._id ? "Removing..." : "Remove"}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className='flex items-center gap-5 pt-4'>
                            <button
                                disabled={loading}
                                onClick={handleSettings}
                                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
                            >
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                                ) : null}
                                {loading ? "Saving Changes..." : "Save All Settings"}
                            </button>
                            
                            <AnimatePresence>
                                {saved && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, x: -10 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, x: -10 }}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-sm font-medium shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Settings saved successfully
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            <div className='grid grid-cols-3 gap-6'>
                                <div className='bg-white p-6 rounded-3xl shadow-sm border border-zinc-200'>
                                    <div className='text-sm text-zinc-500 font-medium mb-1'>Total Queries (30d)</div>
                                    <div className='text-3xl font-bold text-zinc-900'>{metrics.reduce((acc, curr) => acc + curr.totalQueries, 0)}</div>
                                </div>
                                <div className='bg-white p-6 rounded-3xl shadow-sm border border-zinc-200'>
                                    <div className='text-sm text-zinc-500 font-medium mb-1'>Deflected</div>
                                    <div className='text-3xl font-bold text-emerald-600'>{metrics.reduce((acc, curr) => acc + curr.deflectedQueries, 0)}</div>
                                </div>
                                <div className='bg-white p-6 rounded-3xl shadow-sm border border-zinc-200'>
                                    <div className='text-sm text-zinc-500 font-medium mb-1'>Unanswered</div>
                                    <div className='text-3xl font-bold text-amber-500'>{metrics.reduce((acc, curr) => acc + curr.escalatedQueries, 0)}</div>
                                </div>
                            </div>

                            <div className='bg-white rounded-3xl shadow-sm border border-zinc-200 p-8 mt-6'>
                                <h2 className='text-xl font-semibold mb-2 flex items-center gap-2'>
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Knowledge Gaps
                                </h2>
                                <p className='text-sm text-zinc-500 mb-6'>These are questions your customers asked recently that the bot couldn't answer. Add information covering these topics to your Knowledge Base.</p>
                                
                                {loadingAnalytics ? (
                                    <div className="flex justify-center p-8">
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full" />
                                    </div>
                                ) : unanswered.length === 0 ? (
                                    <div className='text-center p-12 text-zinc-500 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200'>
                                        <div className="text-4xl mb-3">🎉</div>
                                        <div className="font-medium text-zinc-700">No unanswered questions!</div>
                                        <div className="text-sm mt-1">Your knowledge base is performing perfectly.</div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {unanswered.map((u, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                                                <span className="font-medium text-zinc-800 text-sm">"{u.question}"</span>
                                                <span className="text-xs font-medium text-zinc-400 bg-white px-2 py-1 rounded-md border border-zinc-100">{new Date(u.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default DashboardClient

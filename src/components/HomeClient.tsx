'use client'
import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import axios from 'axios'
import { useRouter } from 'next/navigation'

function HomeClient({ email }: { email: string }) {
    const [loading, setLoading] = useState(false)
    const handleLogin = () => {
        setLoading(true)
        window.location.href = "/api/auth/login"
    }
    const firstLetter = email ? email[0].toUpperCase() : ""
    const [open, setOpen] = useState(false)
    const popupRef = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node))
                setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])
    
    const navigate = useRouter()
    const features = [
        {
            title: "Plug & Play",
            desc: "Add the chatbot to your site with a single script tag. No complex setup.",
            icon: "⚡"
        },
        {
            title: "Admin Controlled",
            desc: "You control exactly what the AI knows and answers from your dashboard.",
            icon: "⚙️"
        },
        {
            title: "Always Online",
            desc: "Your customers get instant, accurate support 24/7 without delays.",
            icon: "🌐"
        }
    ]
    
    const handleLogOut = async () => {
        try {
            await axios.get("/api/auth/logout")
            window.location.href = "/"
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='min-h-screen bg-white text-zinc-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900'>
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-[120px]" />
            </div>

            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className='fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-zinc-200/50 supports-[backdrop-filter]:bg-white/40'
            >
                <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
                    <div className='flex items-center gap-2.5 cursor-pointer'>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                           <span className="text-white font-bold text-lg">N</span>
                        </div>
                        <div className='text-xl font-bold tracking-tight'>NexSupport <span className='text-indigo-600'>AI</span></div>
                    </div>
                    {email ? (
                        <div className='relative' ref={popupRef}>
                            <button className='w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 text-white flex items-center justify-center font-semibold hover:shadow-lg hover:shadow-zinc-500/20 transition-all hover:scale-105 active:scale-95 ring-2 ring-transparent hover:ring-zinc-200'
                                onClick={() => setOpen(!open)}
                            >
                                {firstLetter}
                            </button>
                            <AnimatePresence>
                                {open && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className='absolute right-0 mt-3 w-48 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden py-2 z-50'
                                    >
                                        <div className="px-4 py-2 border-b border-zinc-100 mb-1">
                                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Account</p>
                                            <p className="text-sm font-medium text-zinc-900 truncate">{email}</p>
                                        </div>
                                        <button className='w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600 transition-colors' onClick={() => navigate.push("/dashboard")}>
                                            Dashboard
                                        </button>
                                        <button className='w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors' onClick={handleLogOut}>
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button
                            className='px-6 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-zinc-900/20'
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                            ) : null}
                            {loading ? "Loading..." : "Login"}
                        </button>
                    )}
                </div>
            </motion.div>

            <section className='pt-40 pb-32 px-6 relative'>
                <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center'>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            v1.0 Now Live
                        </div>
                        <h1 className='text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight'>
                            AI Support <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                Built for Growth
                            </span>
                        </h1>
                        <p className='mt-6 text-xl text-zinc-600 leading-relaxed'>
                            Add a powerful AI chatbot to your website in minutes.
                            Let your customers get instant answers using your own business knowledge.
                        </p>
                        <div className='mt-10 flex flex-wrap gap-4'>
                            {email ? (
                                <button className='px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:shadow-xl hover:shadow-indigo-500/25 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60' onClick={() => navigate.push("/dashboard")}>
                                    Go to Dashboard
                                </button>
                            ) : (
                                <button className='px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:shadow-xl hover:shadow-indigo-500/25 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60'
                                    onClick={handleLogin}
                                >
                                    Get Started Free
                                </button>
                            )}

                            <a href='#features' className='px-8 py-4 rounded-2xl bg-white border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-all hover:-translate-y-0.5'>
                                Learn More
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        transition={{ duration: 1, delay: 0.2, type: "spring", bounce: 0.4 }}
                        className="relative lg:ml-auto w-full max-w-[500px]"
                        style={{ perspective: 1000 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-3xl transform rotate-3 scale-105 blur-lg" />
                        <div className='relative rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 p-6 sm:p-8 overflow-hidden group hover:shadow-indigo-500/10 transition-shadow duration-500'>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
                            <div className='flex items-center justify-between mb-6'>
                                <div className='flex items-center gap-3'>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                                        <span className="text-white text-sm">AI</span>
                                    </div>
                                    <div>
                                        <div className='text-sm font-semibold text-zinc-900'>NexSupport Assistant</div>
                                        <div className='text-xs text-emerald-500 flex items-center gap-1'>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-4 mb-4'>
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className='bg-zinc-100 text-zinc-800 rounded-2xl rounded-tr-sm px-4 py-3 text-sm ml-auto w-fit max-w-[85%]'
                                > 
                                    Do you offer cash on delivery?
                                </motion.div>
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.5 }}
                                    className='bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm w-fit max-w-[85%] shadow-md shadow-indigo-500/10'
                                >
                                    Yes, Cash On Delivery is available for all orders!
                                </motion.div>
                            </div>
                            
                            <div className="relative mt-6">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                </div>
                                <input type="text" disabled placeholder="Type a message..." className="w-full bg-zinc-50 border border-zinc-200 rounded-full py-3 pl-10 pr-12 text-sm text-zinc-500 focus:outline-none" />
                                <button className="absolute inset-y-1.5 right-1.5 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-md">
                                    <svg className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V6m0 0l-8 8m8-8l8 8"></path></svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section
                id='features'
                className="bg-white py-32 px-6 border-t border-zinc-100 relative"
            >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                <div className='max-w-7xl mx-auto'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className='text-center max-w-2xl mx-auto'
                    >
                        <h2 className='text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-3'>Features</h2>
                        <h3 className='text-3xl md:text-4xl font-bold text-zinc-900'>Why Businesses Choose Us</h3>
                    </motion.div>

                    <div className='mt-20 grid grid-cols-1 md:grid-cols-3 gap-8'>
                        {features.map((f, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.15, duration: 0.5 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className="group relative bg-zinc-50 rounded-3xl p-8 hover:bg-white transition-colors duration-300"
                            >
                                <div className="absolute inset-0 border border-zinc-200/60 rounded-3xl group-hover:border-indigo-500/30 transition-colors duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {f.icon}
                                    </div>
                                    <h4 className='text-xl font-bold text-zinc-900 mb-3'>{f.title}</h4>
                                    <p className='text-zinc-600 leading-relaxed'>{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className='py-12 border-t border-zinc-100 bg-zinc-50 text-center text-sm text-zinc-500'>
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className='flex items-center gap-2'>
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                           <span className="text-white font-bold text-[10px]">N</span>
                        </div>
                        <span className="font-semibold text-zinc-900">NexSupport AI</span>
                    </div>
                    <div>
                        &copy; {new Date().getFullYear()} Mukesh Chaudhari. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default HomeClient

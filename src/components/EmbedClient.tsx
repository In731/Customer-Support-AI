'use client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { motion } from "motion/react"

function EmbedClient({ ownerId }: { ownerId: string }) {
    const navigate = useRouter()
    const [copied, setCopied] = useState(false)
    const embedCode = `<script 
    src="${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}/chatBot.js" 
    data-owner-id="${ownerId}">
</script>`

    const copyCode = () => {
        navigator.clipboard.writeText(embedCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className='min-h-screen bg-zinc-50/50 text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900 pb-20'>
            {/* Minimal Background Effect */}
            <div className="fixed top-0 inset-x-0 h-64 bg-gradient-to-b from-violet-50/50 to-transparent pointer-events-none" />

            <div className='sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-zinc-200/50 supports-[backdrop-filter]:bg-white/40 shadow-sm shadow-zinc-200/20'>
                <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
                    <div className='flex items-center gap-2.5 cursor-pointer group' onClick={() => navigate.push("/")}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md group-hover:shadow-indigo-500/20 transition-all group-hover:scale-105">
                           <span className="text-white font-bold text-lg">N</span>
                        </div>
                        <div className='text-lg font-bold tracking-tight'>NexSupport <span className='text-indigo-600'>AI</span></div>
                    </div>
                    <button 
                        className='px-4 py-2 rounded-xl bg-white border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm' 
                        onClick={() => navigate.push("/dashboard")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className='flex justify-center px-4 py-12 relative z-10'>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-4xl"
                >
                    <div className="bg-white rounded-3xl shadow-sm shadow-zinc-200/50 border border-zinc-200 p-8 md:p-10">
                        <div className="mb-8">
                            <h1 className='text-3xl font-bold tracking-tight text-zinc-900 mb-2'>Embed ChatBot</h1>
                            <p className="text-zinc-500">Copy and paste this script right before the closing <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-pink-600 font-mono text-sm">&lt;/body&gt;</code> tag of your website.</p>
                        </div>

                        {/* Mac-like Code Window */}
                        <div className='relative bg-[#1E1E1E] rounded-2xl shadow-xl shadow-zinc-300/30 overflow-hidden mb-10 border border-zinc-800'>
                            <div className="flex items-center px-4 py-3 bg-[#2D2D2D] border-b border-zinc-700/50">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/90 shadow-inner"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/90 shadow-inner"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/90 shadow-inner"></div>
                                </div>
                                <div className="mx-auto text-xs font-medium text-zinc-400 font-mono">embed-script.html</div>
                            </div>
                            <div className="p-5 relative group">
                                <pre className='overflow-x-auto text-sm font-mono leading-relaxed text-zinc-300'>
                                    <span className="text-blue-400">&lt;script</span> <br/>
                                    <span className="text-sky-300 ml-4">src=</span><span className="text-amber-300">&quot;{process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}/chatBot.js&quot;</span> <br/>
                                    <span className="text-sky-300 ml-4">data-owner-id=</span><span className="text-amber-300">&quot;{ownerId}&quot;</span><span className="text-blue-400">&gt;</span><br/>
                                    <span className="text-blue-400">&lt;/script&gt;</span>
                                </pre>
                                
                                <button 
                                    className={`absolute top-4 right-4 text-xs font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}
                                    onClick={copyCode}
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                            Copy Code
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
                            {[
                                { step: "1", title: "Copy Script", desc: "Copy the embed code above" },
                                { step: "2", title: "Paste into HTML", desc: "Place it before the closing body tag" },
                                { step: "3", title: "Go Live", desc: "Reload your site to see the chatbot" }
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold mb-3">{s.step}</div>
                                    <h3 className="font-semibold text-sm text-zinc-900 mb-1">{s.title}</h3>
                                    <p className="text-xs text-zinc-500">{s.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className='mt-10 border-t border-zinc-100 pt-10'>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className='text-xl font-semibold mb-1'>Live Preview</h1>
                                    <p className='text-sm text-zinc-500'>This is exactly how the chatbot will appear to your visitors.</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold tracking-wide uppercase border border-emerald-100">Active</span>
                            </div>

                            {/* Browser Mockup */}
                            <div className='rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 overflow-hidden'>
                                <div className='flex items-center gap-3 px-4 h-12 bg-zinc-50 border-b border-zinc-200'>
                                    <div className="flex space-x-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                                    </div>
                                    <div className='flex-1 mx-4 bg-white border border-zinc-200 rounded-md h-7 flex items-center justify-center text-xs text-zinc-400 font-medium'>
                                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        your-website.com
                                    </div>
                                    <div className="w-10"></div>
                                </div>
                                
                                <div className='relative h-[400px] bg-zinc-50/50 p-8 overflow-hidden'>
                                    {/* Mock Website Content */}
                                    <div className="max-w-md space-y-4 opacity-40">
                                        <div className="w-32 h-6 bg-zinc-200 rounded-md"></div>
                                        <div className="w-full h-32 bg-zinc-200 rounded-xl"></div>
                                        <div className="space-y-2">
                                            <div className="w-3/4 h-3 bg-zinc-200 rounded-sm"></div>
                                            <div className="w-5/6 h-3 bg-zinc-200 rounded-sm"></div>
                                            <div className="w-1/2 h-3 bg-zinc-200 rounded-sm"></div>
                                        </div>
                                    </div>

                                    {/* Chat Widget Mockup */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
                                        className='absolute bottom-24 right-6 w-[320px] bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col'
                                    >
                                        <div className='bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-4 flex justify-between items-center relative overflow-hidden'>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10 pointer-events-none"></div>
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                    <span className="text-xs font-bold">AI</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold">Customer Support</div>
                                                    <div className="text-[10px] text-white/80 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="relative z-10 text-white/80 hover:text-white transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>

                                        <div className='p-4 space-y-4 bg-zinc-50 h-64 overflow-y-auto'>
                                            <div className="flex gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-indigo-600">AI</div>
                                                <div className='bg-white border border-zinc-100 text-zinc-800 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm'>
                                                    Hi there! 👋 How can I help you today?
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-row-reverse">
                                                <div className='bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-md shadow-indigo-500/10'>
                                                    What is your return policy?
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-indigo-600">AI</div>
                                                <div className='bg-white border border-zinc-100 text-zinc-800 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm'>
                                                    We offer a 7-day no-questions-asked return policy for all items in original condition.
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-white border-t border-zinc-100 relative">
                                            <input type="text" disabled placeholder="Type a message..." className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-4 pr-10 text-sm text-zinc-500 focus:outline-none" />
                                            <button className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V6m0 0l-8 8m8-8l8 8"></path></svg>
                                            </button>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 cursor-pointer hover:scale-105 transition-transform"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default EmbedClient

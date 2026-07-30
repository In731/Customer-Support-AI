'use client'
import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from "motion/react"

function HomeClient({ email }: { email: string }) {
  const handleLogin = () => {
    window.location.href = "/api/auth/login"
  }
  const firstLetter = email?.charAt(0).toUpperCase()
  const [open, setOpen] = useState(false)

  return (
    <div className='min-h-screen bg-linear-to-br from-white to-zinc-50 text-zinc-900 overflow-x-hi'>
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className='fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200'
      >
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='text-lg font-semibold tracking-tight'>Support <span className='text-zinc-400'>AI</span></div>
          {email ? <div className=''>
            <button className='w-10 h-10 rounded-full bg-black text-white flex items-center justify-center
            font-semibold
            hover:scale-105 transition'
              onClick={() => setOpen(true)}
            >{firstLetter}</button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className='absolute right-0 top-full mt-2 w-64 rounded-xl bg-white shadow-xl border border-zinc-200 p-4'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold'>
                      {firstLetter}
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-sm font-medium'>{email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className='w-full mt-4 px-4 py-2 rounded-lg bg-black text-white font-medium hover:bg-zinc-800 transition'
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>


          </div> : <button
            type="button"
            onClick={handleLogin}
            className='px-5 py-2 rounded-full
            
                        bg-black text-white 
                        text-sm font-medium hover:bg-zinc-800 transition 
                        disabled:opacity-60 flex items-center gap-2'
          >
            Login
          </button>
          }
        </div>
      </motion.div>
    </div>
  )
}

export default HomeClient

// 'use client'

// import React, { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import {
//   User,
//   Mail,
//   Lock,
//   Loader2,
//   AlertCircle,
//   CheckCircle,
//   UserPlus,
// } from 'lucide-react'

// export default function SignUpPage() {
//   const router = useRouter()
//   const [status, setStatus] = useState<{
//     type: 'error' | 'success' | null
//     message: string | null
//   }>({ type: null, message: null })
//   const [isLoading, setIsLoading] = useState(false)

//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//   })

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const handleSignUp = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setStatus({ type: null, message: null })

//     // Basic client-side validation
//     if (!formData.username || !formData.email || !formData.password) {
//       setStatus({ type: 'error', message: 'Please fill in all fields.' })
//       setIsLoading(false)
//       return
//     }

//     try {
//       const response = await fetch('/api/sign-up', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         setStatus({
//           type: 'success',
//           message: 'Account created! Redirecting to login...',
//         })

//         // Redirect to login page after 1.5 seconds
//         setTimeout(() => {
//           router.push('/sign-in') // Assuming your login page is at /login (or /sign-in)
//         }, 1500)
//       } else {
//         setStatus({
//           type: 'error',
//           message: data.message || 'Registration failed.',
//         })
//       }
//     } catch (err) {
//       setStatus({ type: 'error', message: 'Unable to connect to server.' })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//       <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
//         <div className="bg-indigo-600 p-8 text-center">
//           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500 mb-4 text-white">
//             <UserPlus size={32} />
//           </div>
//           <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
//           <p className="text-indigo-100">Join us to manage your POS</p>
//         </div>

//         <div className="p-8">
//           <form onSubmit={handleSignUp} className="space-y-5">
//             {status.message && (
//               <div
//                 className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
//                   status.type === 'error'
//                     ? 'bg-red-50 text-red-700 border border-red-200'
//                     : 'bg-green-50 text-green-700 border border-green-200'
//                 }`}
//               >
//                 {status.type === 'error' ? (
//                   <AlertCircle size={20} className="shrink-0" />
//                 ) : (
//                   <CheckCircle size={20} className="shrink-0" />
//                 )}
//                 {status.message}
//               </div>
//             )}

//             {/* Username Field */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium text-gray-700 block">
//                 Username
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
//                   <User size={20} />
//                 </div>
//                 <input
//                   type="text"
//                   name="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   placeholder="Choose a username"
//                 />
//               </div>
//             </div>

//             {/* Email Field */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium text-gray-700 block">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
//                   <Mail size={20} />
//                 </div>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   placeholder="name@example.com"
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium text-gray-700 block">
//                 Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
//                   <Lock size={20} />
//                 </div>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   placeholder="Create a password"
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors focus:ring-4 focus:ring-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="animate-spin mr-2" size={20} />
//                   Creating Account...
//                 </>
//               ) : (
//                 'Sign Up'
//               )}
//             </button>

//             <div className="text-center mt-4">
//               <p className="text-sm text-gray-600">
//                 Already have an account?{' '}
//                 <Link
//                   href="/sign-in"
//                   className="text-indigo-600 hover:text-indigo-800 font-medium"
//                 >
//                   Sign In
//                 </Link>
//               </p>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

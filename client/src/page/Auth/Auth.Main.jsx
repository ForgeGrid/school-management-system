import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import prd from './../../assets/prd.svg'
import School from '../../assets/school.png'
import Login from './Login'
import Register from './Register'
import { Sparkle, Users, BarChart2, ShieldCheck, BadgeCheck, Lock } from "lucide-react";

const features = [
  {
    icon: <Users className="w-5 h-5 text-indigo-500" />,
    title: "All-in-One",
    desc: "Everything you need in one place.",
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-indigo-500" />,
    title: "Smart Insights",
    desc: "Data-driven insights for better decisions.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-indigo-500" />,
    title: "Secure & Reliable",
    desc: "Enterprise-grade security you can trust.",
  },
]

function AuthMain() {
  const navigate = useNavigate()
  const location = useLocation()

  const isLogin = location.pathname === '/login' || location.pathname === '/'

  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-white to-indigo-50">

      <div className="grid lg:grid-cols-[55%_45%] h-full">

        {/* LEFT SECTION */}
       <div className="hidden lg:flex bg-white px-5 sm:px-8 lg:px-12 py-5 flex-col justify-between min-h-screen">
          <div>

            <div className="flex items-center gap-3 mb-7">
              <div className="bg-indigo-600 rounded-xl p-2 flex items-center justify-center shrink-0">
                <img src={prd} alt="logo" className="w-5 h-5" />
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900">
                School Management System
              </span>
            </div>

            <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xs">
              <Sparkle className="w-4 h-4 text-indigo-500" />
              <span className="text-indigo-600 text-xs sm:text-sm font-semibold">
                Empowering Education, Managing Tomorrow
              </span>
            </div>

            <div className="space-y-1 mt-5">
              <h1 className="text-4xl sm:text-5xl xl:text-[72px] font-semibold leading-none text-gray-900">
                Manage Smarter.
              </h1>
              <h1 className="text-4xl sm:text-5xl xl:text-[72px] font-semibold leading-none text-indigo-600">
                Educate Better.
              </h1>
            </div>

            <p className="text-sm sm:text-base lg:text-lg text-gray-500 leading-relaxed max-w-xl ">
              A complete platform to manage students, teachers,
              classes, attendance, exams and more seamlessly.
            </p>

            <div className="flex justify-center">
              <img
                src={School}
                alt="school"
                className="w-full max-w-[420px] max-h-[200px] object-contain"
              />
            </div>

          </div>

          <div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center flex flex-col items-center"
                >
                  <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs sm:text-sm">
              <BadgeCheck className="w-4 h-4 text-indigo-400" />
              <span>Trusted by 1000+ schools worldwide</span>
            </div>

          </div>

        </div>

        
        {/* RIGHT SECTION */}
        <div className="flex items-center justify-center p-6 xl:p-8 h-full">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {/* TABS */}
            <div className="grid grid-cols-2 border-b border-gray-200 mb-8">
              <button
                onClick={() => navigate('/login')}
                className={`py-3 text-sm font-semibold text-center rounded-xs transition-all duration-200 ${isLogin
                  ? 'text-indigo-600 border-b-3 border-indigo-600 -mb-px'
                  : 'text-gray-400 hover:text-gray-600 bg-indigo-50/70'
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className={`py-3 text-sm font-semibold text-center rounded-xs transition-all duration-200 ${!isLogin
                  ? 'text-indigo-600 border-b-3  border-indigo-600 -mb-px'
                  : 'text-gray-400 hover:text-gray-600 bg-indigo-50/70'
                  }`}
              >
                Register
              </button>
            </div>
            <div className='flex items-center justify-center gap-4 mb-7'>
              <div className='bg-indigo-50 rounded-full w-14 h-14 flex items-center justify-center '>
                <Lock className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome <span className="text-indigo-600">Back!</span>
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Login to continue to your account
                </p>
              </div>

            </div>
            {isLogin ? <Login /> : <Register />}


          </div>
        </div>

      </div>
    </div>
  )
}

export default AuthMain
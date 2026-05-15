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
  const isLogin = location.pathname === '/' || location.pathname === '/login'

  return (
    <div className="fixed inset-0 bg-linear-to-br from-white to-indigo-50 flex">
      <div className="flex w-full h-full">

        {/* ── LEFT PANEL (desktop only) ── */}
        <div className="hidden lg:flex flex-col justify-between bg-white w-[55%] h-full px-10 xl:px-14 py-6 overflow-hidden">
          <div className="flex flex-col gap-5 min-h-0">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 rounded-xl p-2 shrink-0">
                <img src={prd} alt="logo" className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-gray-900">School Management System</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg w-fit">
              <Sparkle className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-indigo-600 text-sm font-semibold">
                Empowering Education, Managing Tomorrow
              </span>
            </div>

            <div>
              <h1 className="text-5xl xl:text-[66px] font-semibold leading-none text-gray-900">Manage Smarter.</h1>
              <h1 className="text-5xl xl:text-[66px] font-semibold leading-none text-indigo-600">Educate Better.</h1>
            </div>

            <p className="text-base lg:text-lg text-gray-500 leading-relaxed max-w-lg">
              A complete platform to manage students, teachers, classes, attendance, exams and more seamlessly.
            </p>

            <div className="flex justify-center">
              <img src={School} alt="school" className="w-full max-w-[360px] max-h-[170px] object-contain" />
            </div>
          </div>

          <div className="shrink-0 pt-4">
            <div className="grid grid-cols-3 gap-3 mb-3">
              {features.map((f) => (
                <div key={f.title} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center flex flex-col items-center">
                  <div className="bg-indigo-50 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <BadgeCheck className="w-4 h-4 text-indigo-400" />
              <span>Trusted by 1000+ schools worldwide</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div
            className="w-full max-w-md lg:max-w-xl bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 24px)' }}
          >
            <div className="overflow-y-auto flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">

              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-2 mb-4">
                <div className="bg-indigo-600 rounded-lg p-1.5 shrink-0">
                  <img src={prd} alt="logo" className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-gray-900">School Management System</span>
              </div>

              {/* TABS */}
              <div className="grid grid-cols-2 border-b border-gray-200 mb-5">
                <button
                  onClick={() => navigate('/login')}
                  className={`py-2.5 text-sm font-semibold text-center transition-all duration-200 ${
                    isLogin
                      ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px'
                      : 'text-gray-400 hover:text-gray-600 bg-indigo-50/70'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className={`py-2.5 text-sm font-semibold text-center transition-all duration-200 ${
                    !isLogin
                      ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px'
                      : 'text-gray-400 hover:text-gray-600 bg-indigo-50/70'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Header */}
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="bg-indigo-50 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {isLogin ? <>Welcome <span className="text-indigo-600">Back!</span></> : <>Create <span className="text-indigo-600">Account</span></>}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                    {isLogin ? 'Login to continue to your account' : 'Register to get started today'}
                  </p>
                </div>
              </div>

              {/* Form */}
              {isLogin
                ? <Login onSwitchToRegister={() => navigate('/register')} />
                : <Register onSwitchToLogin={() => navigate('/login')} />
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AuthMain
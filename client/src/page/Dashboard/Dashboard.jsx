import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slice/getmeslice";
import { logoutUserThunk } from "../../redux/slice/authslice";
import { selectAppState, selectUser, selectSchool } from "../../redux/slice/getmeSelector";
import { Button } from "../../components/ui/Button";
import { DotCursorBackground } from "../../components/ui/DotCursorBackground";
import { CiLogout } from "react-icons/ci";
import Schoolmanage from './../../assets/Bus.jpeg';
import { PlusCircle, UserPlus, Bell, GraduationCap } from "lucide-react";
import { BorderBeam } from "../../components/ui/Borderbeam";
import { Card, CardContent } from "../../components/ui/Card";
import SelectionModal from "../../components/selection/SelectionModal";

export default function TenantMain() {
  const dispatch = useDispatch();
  const appState = useSelector(selectAppState);
  const user = useSelector(selectUser);
  const school = useSelector(selectSchool);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50/50">
      <DotCursorBackground />

      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="w-full flex items-center justify-end px-4 md:px-6 py-3 md:py-4 bg-transparent z-50 shrink-0">


          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="outline"
              onClick={() => {
                dispatch(logoutUserThunk());
                dispatch(logout());
                window.location.href = "/login";
              }}
              className="flex items-center gap-2 bg-white/90 hover:bg-slate-50 shadow-sm border border-gray-200 rounded-full px-3 md:px-4 py-2 md:py-2.5 transition-all text-slate-700 hover:text-red-600"
            >
              <CiLogout size={18} className="stroke-1" />
              <span className="text-sm font-semibold hidden sm:inline-block">
                Logout
              </span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-6 pb-4 overflow-y-auto flex flex-col justify-center">
          <div className="max-w-5xl mx-auto w-full flex flex-col items-center justify-center gap-6 md:gap-10">

            {/* Top Section */}
            <div className="text-center space-y-3 md:space-y-5 max-w-3xl mx-auto flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-100/80">
                <div className="w-4 h-4 rounded-sm overflow-hidden shrink-0 text-indigo-600 flex items-center justify-center">
                  <GraduationCap size={16} />
                </div>
                <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">Education Hub</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight leading-[1.1]">
                Manage your school <br className="hidden md:block" /> operations effortlessly
              </h1>
              <p className="text-slate-500 text-sm md:text-base lg:text-lg font-medium max-w-xl mx-auto leading-relaxed">
                Streamline administration, student records, and staff management in one unified platform.
              </p>
            </div>

            {/* Content Cards */}
            {appState === "ACTIVE" ? (
              <div className="w-full p-8 rounded-[2.5rem] bg-white border border-indigo-100 shadow-xl text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                  <GraduationCap size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Welcome to {school?.name}!</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                  Your school portal is now active. You can start managing your students, staff, and operations from here.
                </p>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-full h-11">
                  Go to School Dashboard
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 w-full items-stretch lg:items-center">

                {/* Left Image Section - Premium Glassmorphic Frame */}
                <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-indigo-100/50 bg-white/40 shadow-2xl shadow-indigo-100/40 h-full min-h-[250px] md:min-h-[320px]">
                  {/* Grid Background Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]"></div>

                  {/* Glowing Orbs */}
                  <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-linear-to-bl from-indigo-400/40 via-purple-300/40 to-pink-200/40 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s' }}></div>
                  <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-linear-to-tr from-blue-400/30 to-indigo-300/30 rounded-full blur-[60px] animate-pulse" style={{ animationDuration: '4s' }}></div>

                  {/* Floating Bus Container */}
                  <div className="relative z-10 bg-white/70 backdrop-blur-xl rounded-4xl p-4 md:p-6 border border-white/80 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transform hover:-translate-y-2 transition-transform duration-500 ease-out">
                    <div className="bg-white rounded-2xl p-6">
                      <img src={Schoolmanage} alt="School Management" className="w-full h-auto max-w-[160px] md:max-w-[220px] lg:max-w-[260px] object-contain mix-blend-multiply drop-shadow-sm" />
                    </div>

                    {/* Decorative Badges */}
                    <div className="absolute top-4 right-4 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-3 shadow-xl shadow-indigo-200 animate-bounce" style={{ animationDuration: '3s' }}>
                      <GraduationCap size={22} className="stroke-2" />
                    </div>
                    <div className="absolute bottom-4 left-4 bg-linear-to-br from-pink-500 to-rose-500 text-white rounded-2xl p-3 shadow-xl shadow-pink-200 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                      <Bell size={22} className="stroke-2" />
                    </div>
                  </div>

                  <BorderBeam size={400} duration={8} colorFrom="#818cf8" colorTo="#e879f9" className="opacity-100" />
                </div>

                {/* Right Cards Section */}
                <div className="flex flex-col gap-4 justify-center">

                  {/* Create Tenant Card */}
                  <Card
                    onClick={() => openModal('register')}
                    className="relative overflow-hidden group cursor-pointer border-indigo-100/80 hover:border-indigo-300 transition-all duration-300 shadow-sm bg-white hover:shadow-md"
                  >
                    <CardContent className="p-4 md:p-5 flex items-center gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 flex shrink-0 items-center justify-center rounded-full bg-indigo-50/50 text-indigo-500 border border-indigo-100/50">
                        <PlusCircle size={20} className="stroke-[1.5]" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm md:text-base lg:text-[17px] font-bold text-slate-800">Register Institution</h3>
                        <p className="text-xs lg:text-sm text-slate-500 leading-snug">Set up a new workspace for your school or college</p>
                      </div>
                    </CardContent>
                    <BorderBeam size={120} duration={4} borderWidth={2} colorFrom="#6366f1" colorTo="#a855f7" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Card>

                  {/* Join as Staff Card */}
                  <Card
                    onClick={() => openModal('join')}
                    className="relative overflow-hidden group cursor-pointer border-indigo-100/80 hover:border-indigo-300 transition-all duration-300 shadow-sm bg-white hover:shadow-md"
                  >
                    <CardContent className="p-4 md:p-5 flex items-center gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 flex shrink-0 items-center justify-center rounded-full bg-indigo-50/50 text-indigo-500 border border-indigo-100/50">
                        <UserPlus size={20} className="stroke-[1.5]" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm md:text-base lg:text-[17px] font-bold text-slate-800">Join as Staff</h3>
                        <p className="text-xs lg:text-sm text-slate-500 leading-snug">Get access to an existing institution via invite</p>
                      </div>
                    </CardContent>
                    <BorderBeam size={120} duration={4} borderWidth={2} colorFrom="#6366f1" colorTo="#a855f7" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Card>

                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      <SelectionModal
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
        type={modalType}
      />
    </div>
  );
}

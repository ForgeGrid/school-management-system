import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  Info, 
  RefreshCw, 
  LogOut 
} from "lucide-react";

export default function PendingApproval({ onLogout, onRefresh }) {
  return (
    <div className="w-full bg-white p-6 md:p-10 rounded-2xl flex flex-col items-center relative">
      
      {/* Top Tag */}
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-slate-100 p-1.5 rounded-lg flex items-center justify-center">
           {/* Mock logo icon */}
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
           </svg>
        </div>
        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
          Account Setup In Progress
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-3">
          Waiting for Admin Approval
        </h2>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-md mx-auto">
          Your organization has been submitted successfully. Our team is currently reviewing your profile to ensure everything is in order.
        </p>
      </div>

      {/* Status Card */}
      <div className="w-full bg-[#f8f9fc] rounded-2xl p-6 border border-slate-100 mb-8">
        <div className="grid grid-cols-2 gap-y-6">
          
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Organization Name</span>
            <span className="text-sm font-bold text-slate-700">CEOA School</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Current Status</span>
            <div className="inline-flex items-center gap-1.5 bg-yellow-100/80 text-yellow-700 px-2.5 py-1 rounded-full w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
              <span className="text-xs font-bold capitalize">Pending</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Submitted On</span>
            <span className="text-sm font-bold text-slate-700">May 14, 2026</span>
          </div>
          
        </div>
      </div>

      {/* Info List */}
      <div className="w-full flex flex-col gap-4 mb-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={18} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 font-medium">We'll notify you via email once your account is fully verified.</p>
        </div>
        <div className="flex items-start gap-3">
          <Clock size={18} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 font-medium">This usually takes a short review period (typically 24-48 hours).</p>
        </div>
        <div className="flex items-start gap-3">
          <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 font-medium">You can refresh this page to check for status updates at any time.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-3">
        <Button 
          onClick={onRefresh}
          className="w-full h-12 rounded-xl bg-[#5b5fdb] hover:bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200 text-base flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh Status
        </Button>
        <Button 
          variant="outline"
          onClick={onLogout}
          className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 text-base flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Logout from Account
        </Button>
      </div>

    </div>
  );
}

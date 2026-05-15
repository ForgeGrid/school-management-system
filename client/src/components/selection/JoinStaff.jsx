import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronDown } from "lucide-react";

export default function JoinStaff({ onClose }) {
  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-2xl flex flex-col relative">
      
      {/* Close Button */}
      <button 
        onClick={() => onClose(false)}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="mb-6 mt-2">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Invite New Member</h2>
        <p className="text-slate-500 text-sm mt-1 leading-relaxed">
          Send an invitation link to a colleague to join your organization.
        </p>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-6">
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input 
            placeholder="colleague@example.com" 
            className="h-12 rounded-xl border-slate-200 bg-white text-base shadow-sm placeholder:text-slate-300"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Assign Role <span className="text-red-500">*</span>
          </label>
          <div className="relative">
             <select className="w-full h-12 px-4 py-2 rounded-xl border border-slate-200 bg-white text-base text-slate-500 appearance-none outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer">
               <option>Staff</option>
               <option>Admin</option>
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={20} />
             </div>
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-10">
        <Button 
          variant="outline" 
          onClick={() => onClose(false)}
          className="h-12 px-6 rounded-full border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-base"
        >
          Cancel
        </Button>
        <Button 
          className="h-12 px-6 rounded-full bg-[#6366f1] hover:bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200 text-base"
        >
          Send Invitation
        </Button>
      </div>

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { inviteUser, clearInvitationStatus } from "../../redux/slice/Invitationslice";

export default function InviteModal({ isOpen = false, onClose, onSendInvite }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");

  const dispatch = useDispatch();
  const { actionLoading, error, successMessage } = useSelector((state) => state.invitation);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setRole("staff");
      dispatch(clearInvitationStatus());
    }
  }, [isOpen, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const result = await dispatch(inviteUser({ email: email.trim(), role }));

    if (inviteUser.fulfilled.match(result)) {
      onSendInvite?.(result.payload);
      setEmail("");
      setRole("staff");
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="relative bg-white w-full max-w-[540px] rounded-3xl p-9 shadow-2xl border border-slate-100 overflow-hidden"
        style={{ pointerEvents: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 mb-5">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
            Invite New Member
          </h3>
          <p className="text-[15px] text-slate-600 leading-relaxed">
            Send an invitation link to a colleague to join your organization.
          </p>
        </div>

        {/* Billing notice */}
        <div className="bg-[#F5F6FF] border border-[#E4E6FF] rounded-2xl px-5 py-4 mb-6">
          <p className="text-[13px] text-[#5C59E8] leading-relaxed font-semibold">
            <span className="font-bold text-[#3C3BE3]">Billing Notice:</span> Adding a new
            member will increase your monthly subscription by{" "}
            <span className="font-bold text-[#3C3BE3]">₹99</span>. Please ensure payment is
            made via GPay to activate this seat.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-600 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 block">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              autoFocus
              className="w-full px-4 py-3.5 text-[15px] text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium placeholder-slate-400 transition-all"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 block">
              Assign Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3.5 text-[15px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium transition-all cursor-pointer appearance-none pr-10"
              >
                <option value="staff">Staff</option>
                <option value="teacher">Teacher</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-full hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-full transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {actionLoading ? "Sending…" : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import InvitationQueue from "../Invitation/InvitationQueue";
import JoinedMembers from "../Invitation/JoinedMembers";
import InviteModal from "../Invitation/InviteModal";

export default function ProfileApprovalQueue() {
  const [activeTab, setActiveTab] = useState("joined");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const switchTab = (tab) => setActiveTab(tab);

  const handleSendInvite = ({ email, role }) => {
    setIsInviteModalOpen(false);
    toast.success(`Invitation sent successfully to ${email}`);
  };

  return (
    <div className="relative h-full flex flex-col gap-6 overflow-hidden pr-1 pb-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          School Management
        </h1>

        {/* Invite Member button — matches screenshot design */}
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-semibold text-[15px] px-6 py-3 rounded-full shadow-lg shadow-indigo-300/50 transition-all duration-200 cursor-pointer select-none"
        >
          <UserPlus className="w-[18px] h-[18px] stroke-[2.2]" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* ── Tab switcher ── */}
      <div className="shrink-0">
        <div className="bg-slate-100/80 p-1.5 rounded-2xl flex gap-1 w-fit">
          {[
            { key: "joined", label: "Joined Members" },
            { key: "pending", label: "Pending Requests" },
          ].map(({ key, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white border border-slate-100/90 rounded-4xl p-8 shadow-xs flex-1 flex flex-col overflow-hidden">

        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "joined" ? (
              <motion.div
                key="joined"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <JoinedMembers />
              </motion.div>
            ) : (
              <motion.div
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <InvitationQueue />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between mt-4 border-t border-slate-100 pt-4 shrink-0">
          <span>Synced with main directory</span>
          <span className="text-indigo-600 font-bold">SMS System v1.4.0</span>
        </div>

        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSendInvite={handleSendInvite}
        />

      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Mail, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";

import {
  getPendingInvitations,
  revokeInvitation,
} from "../../redux/slice/Invitationslice";

export default function InvitationQueue() {
  const dispatch = useDispatch();

  const { pending = [], loading = false, error = null } = useSelector(
    (state) => state.invitation || {}
  );

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getPendingInvitations());
  }, [dispatch]);

  const filtered = Array.isArray(pending)
    ? pending.filter((req) => {
        const query = searchQuery.toLowerCase();

        return (
          req?.name?.toLowerCase().includes(query) ||
          req?.role?.toLowerCase().includes(query) ||
          req?.email?.toLowerCase().includes(query) ||
          req?.department?.toLowerCase().includes(query)
        );
      })
    : [];

  const handleReject = async (id, email) => {
    try {
      await dispatch(revokeInvitation(id)).unwrap();

      toast.success(`Revoked invitation for ${email}`);
    } catch (err) {
      toast.error(err || "Failed to revoke invitation");
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">
          Pending Registration Approvals
        </h2>

        <span className="text-sm font-semibold text-rose-500">
          {filtered.length} Requests Pending
        </span>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-semibold">
          Error loading invitations: {typeof error === "object" ? error.message || JSON.stringify(error) : error}
        </div>
      )}

      {/* Table */}
      <div className="w-full rounded-2xl border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-3 bg-slate-50 border-b border-slate-200">
          {[
            "INVITED USER",
            "ROLE",
            "SENT DATE",
            "EXPIRES",
            "ACTIONS",
          ].map((h) => (
            <span
              key={h}
              className="text-xs font-bold text-slate-400 tracking-wider uppercase last:text-right"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            Loading invitations...
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-semibold">
                No pending invitations found.
              </div>
            ) : (
              filtered.map((req) => {
                const expiresDate = req?.expires_at
                  ? new Date(req.expires_at).toLocaleDateString()
                  : "N/A";

                const sentDate = req?.createdAt
                  ? new Date(req.createdAt).toLocaleDateString()
                  : "N/A";

                return (
                  <div
                    key={req?._id || req?.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-4 items-center hover:bg-slate-50/60 transition-colors"
                  >
                    {/* User */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-indigo-500" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-800 text-[15px] truncate">
                          {req?.email}
                        </span>

                        <span className="text-xs text-slate-400 mt-0.5">
                          Invited by: {req?.invited_by?.name || "Admin"}
                        </span>
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 capitalize">
                        {req?.role}
                      </span>
                    </div>

                    {/* Sent */}
                    <span className="text-sm text-slate-500 font-medium">
                      {sentDate}
                    </span>

                    {/* Expires */}
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {expiresDate}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          handleReject(req?._id || req?.id, req?.email)
                        }
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-rose-200 text-rose-500 text-xs font-bold hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Uninvite
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
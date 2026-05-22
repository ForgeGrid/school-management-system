import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { acceptInvitation, clearInvitationStatus } from "../../redux/slice/Invitationslice";
import { fetchMe } from "../../redux/slice/getmeslice";

export default function JoinOrganization({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { actionLoading, error, successMessage } = useSelector((state) => state.invitation);

  // getMe already resolved these — no extra fetch needed
  const userEmail = useSelector((state) => state.getme?.user?.email || "");
  const invitation = useSelector((state) => state.getme?.invitation);
  // invitation = { adminName, role, token }  ← straight from getMe

  useEffect(() => {
    return () => dispatch(clearInvitationStatus());
  }, [dispatch]);
  console.log("invitation", invitation);
  const handleJoin = async () => {
    if (!invitation?.token) return;

    try {
      await dispatch(acceptInvitation({ token: invitation.token })).unwrap();
      const meRes = await dispatch(fetchMe()).unwrap();
      onClose(false);

      // Explicitly navigate based on the role returned by fetchMe
      const role = meRes?.user?.role;
      const isAdmin = role === "school_admin" || role === "admin" || role === "teacher" || role === "staff" || meRes?.user?.platformRole === "super_admin";
      if (isAdmin) {
        navigate("/dashboard/admin", { replace: true });
      } else {
        navigate("/portal", { replace: true });
      }
    } catch (err) {
      // error is handled by invitation slice
    }
  };

  const handleClose = () => {
    dispatch(clearInvitationStatus());
    onClose(false);
  };

  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-2xl flex flex-col relative">

      {/* Close */}
      <button
        onClick={handleClose}
        disabled={actionLoading}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="mb-6 mt-2">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Join an Organization
        </h2>
        <p className="text-slate-500 text-sm mt-1 leading-relaxed">
          You've been invited to join an organization. Review the details below.
        </p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-3 rounded-xl mb-5">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
          {successMessage} Redirecting to dashboard…
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-5">
          <AlertCircle size={18} className="shrink-0 text-red-400" />
          {error}
        </div>
      )}

      {/* Invitation Details Card — all from getMe, no extra fetch */}
      {invitation ? (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 flex flex-col gap-3 mb-6">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
            Invitation Details
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Your Email</span>
              <span className="text-sm font-semibold text-slate-700">{userEmail}</span>
            </div>

            {invitation.adminName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Organization</span>
                <span className="text-sm font-semibold text-slate-700">
                  🏫 {invitation.adminName}
                </span>
              </div>
            )}

            {invitation.role && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Assigned Role</span>
                <span className="text-sm font-semibold text-indigo-600 capitalize bg-indigo-100 px-3 py-0.5 rounded-full">
                  {invitation.role}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Fallback if getMe didn't return an invitation
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle size={16} />
          No active invitation found for your account.
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-2">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={actionLoading}
          className="h-12 px-6 rounded-full border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-base disabled:opacity-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleJoin}
          disabled={actionLoading || !!successMessage || !invitation?.token}
          className="h-12 px-6 rounded-full bg-[#6366f1] hover:bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200 text-base disabled:opacity-60 flex items-center gap-2"
        >
          {actionLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Joining…
            </>
          ) : successMessage ? (
            <>
              <CheckCircle2 size={18} />
              Joined!
            </>
          ) : (
            "Join Organization"
          )}
        </Button>
      </div>

    </div>
  );
}
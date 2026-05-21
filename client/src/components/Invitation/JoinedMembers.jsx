import React, { useState } from "react";

const INITIAL_JOINED = [
  {
    id: 1,
    name: "SUKESH D",
    username: "@sukeshd31012006",
    email: "sukesh.d.31012006@gmail.com",
    role: "Staff",
    status: "inactive",
    joinedAt: "5/15/2026",
    avatarBg: "bg-slate-300 text-slate-800",
  },
  {
    id: 2,
    name: "V Manoj Kumar",
    username: "@yogomanojbro",
    email: "yogomanojbro@gmail.com",
    role: "Owner",
    status: "active",
    joinedAt: "5/13/2026",
    avatarBg: "bg-amber-100 text-amber-800",
  },
  {
    id: 3,
    name: "Prithivi New",
    username: "@rjaiagency",
    email: "rjaiagency@gmail.com",
    role: "Owner",
    status: "active",
    joinedAt: "5/8/2026",
    avatarBg: "bg-indigo-950 text-indigo-200",
  },
];

export default function JoinedMembers() {
  const [members, setMembers] = useState(INITIAL_JOINED);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 leading-none tracking-tight">
          Joined Members
        </h2>
        <span className="text-sm font-semibold text-slate-400">
          {filtered.length} Accounts Registered
        </span>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <th className="pb-3.5 pt-2 w-[35%]">Member</th>
            <th className="pb-3.5 pt-2 w-[30%]">Email</th>
            <th className="pb-3.5 pt-2 w-[15%]">Role</th>
            <th className="pb-3.5 pt-2 w-[12%]">Status</th>
            <th className="pb-3.5 pt-2 w-[8%]">Joined At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/70 text-sm text-slate-600">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-semibold">
                No registered users found.
              </td>
            </tr>
          ) : (
            filtered.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold uppercase text-base shrink-0 border border-slate-100 ${member.avatarBg}`}
                    >
                      {member.name.slice(0, 1)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-slate-800 text-[17px] leading-tight truncate">
                        {member.name}
                      </span>
                      <span className="text-xs font-normal text-slate-400 truncate mt-1">
                        {member.username}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-slate-500 font-normal truncate max-w-[240px] text-sm">
                  {member.email}
                </td>
                <td className="py-4">
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      member.role === "Owner"
                        ? "bg-amber-50 text-amber-600 border border-amber-100/50"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                    }`}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="py-4 text-sm">
                  {member.status === "active" ? (
                    <span className="flex items-center gap-2 text-emerald-600 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      active
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">inactive</span>
                  )}
                </td>
                <td className="py-4 text-slate-400 font-normal text-sm">
                  {member.joinedAt}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
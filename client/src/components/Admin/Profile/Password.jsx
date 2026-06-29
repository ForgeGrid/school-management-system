import { useState } from 'react';

/* ── Shared Primitives (local to this file) ──────────────────────────────── */
const inputBase = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400";
const Inp = (p) => <input {...p} className={inputBase} />;

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

/* ── Component ───────────────────────────────────────────────────────────── */
export default function Password() {
  const [pw, setPw]     = useState("········");
  const [show, setShow] = useState(false);

  return (
    <div className="max-w-lg">
      <Card>
        <div className="p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">Password &amp; Security</h2>
          <p className="text-sm text-gray-600 mb-5">
            To change your password, we'll send a verification code to{" "}
            <strong>admin@sunrisepublicschool.edu</strong>.
          </p>
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mb-1.5">New Password</p>
            <div className="relative">
              <Inp type={show ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} />
              <button
                onClick={() => setShow(!show)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
              >{show ? "Hide" : "Show"}</button>
            </div>
          </div>
          <button className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg py-2.5 text-sm transition-colors tracking-wide uppercase">
            Send Verification Code
          </button>
        </div>
      </Card>
    </div>
  );
}
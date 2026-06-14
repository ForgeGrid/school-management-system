import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  searchParents,
  clearParentSearchResults,
  selectParentSearchResults,
  selectParentSearchLoading,
  selectParentSearchError,
} from "../../../redux/slice/schoolStudentSlice";


function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}


function Avatar({ name, size = 36 }) {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div
      style={{ width: size, height: size, flexShrink: 0 }}
      className={`rounded-full flex items-center justify-center text-xs font-bold ${colors[idx]}`}
    >
      {initials(name)}
    </div>
  );
}


export function LinkExistingParent({
  studentName = "New Student",
  admissionNumber,
  onParentLinked,
}) {
  const dispatch = useDispatch();

  const results       = useSelector(selectParentSearchResults);
  const searching     = useSelector(selectParentSearchLoading);
  const searchError   = useSelector(selectParentSearchError);

  const [query,        setQuery]        = useState("");
  const [expandedId,   setExpandedId]   = useState(null);
  const [linkedParent, setLinkedParent] = useState(null);

  const debounceRef = useRef(null);
  // Track whether the user has typed at least once
  const hasSearched = useRef(false);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setLinkedParent(null);
    setExpandedId(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      dispatch(clearParentSearchResults());
      hasSearched.current = false;
      return;
    }

    debounceRef.current = setTimeout(() => {
      hasSearched.current = true;
      dispatch(searchParents(val.trim()));
    }, 500);
  };

  const handleSelectParent = (parent) => {
    setLinkedParent(parent);
    setQuery("");
    setExpandedId(null);
    dispatch(clearParentSearchResults());
    // Pass parentUserId + display fields up to Step1
    onParentLinked?.({
      parentUserId: parent.parentUserId,
      name:  parent.name,
      email: parent.email,
      phone: parent.phone,
    });
  };

  const handleChangeParent = () => {
    setLinkedParent(null);
    setQuery("");
    setExpandedId(null);
    dispatch(clearParentSearchResults());
    hasSearched.current = false;
  };

  const noResults = hasSearched.current && !searching && results.length === 0 && !searchError;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* ── Header ── */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Link Existing Parent</p>
          <p className="text-xs text-slate-400">Search and link an existing parent account to this student.</p>
        </div>
      </div>

      {/* ── Search box ── */}
      {!linkedParent && (
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            {searching ? (
              <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <input
            className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
            placeholder="Search by phone number, email address, sibling admission number, or student name"
            value={query}
            onChange={handleQueryChange}
          />
        </div>
      )}

      {/* ── Search error ── */}
      {searchError && !linkedParent && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
          {searchError}
        </div>
      )}

      {/* ── Search states (two-column grid) ── */}
      {!linkedParent && !searchError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Left: visual state */}
          <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 min-h-[160px]">
            {searching ? (
              <>
                <svg className="w-8 h-8 text-blue-300 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <p className="text-sm font-semibold text-slate-500">Searching…</p>
                <p className="text-xs text-slate-400 mt-1">Looking through parent records.</p>
              </>
            ) : noResults ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-600">No matching parent found</p>
                <p className="text-xs text-slate-400 mt-1 text-center max-w-[180px]">
                  Try a different phone, email, or student name.
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400 text-center max-w-[200px]">
                  Enter a search term above to find a parent account.
                </p>
              </>
            )}
          </div>

          {/* Right: results list */}
          {results.length > 0 ? (
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Search Results ({results.length})
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {results.map((parent) => {
                  const isExpanded = expandedId === String(parent.parentUserId);
                  return (
                    <div key={String(parent.parentUserId)} className="flex flex-col">
                      {/* Row header */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(
                            isExpanded ? null : String(parent.parentUserId)
                          )
                        }
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                          isExpanded ? "bg-blue-50/60" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <svg
                            className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                          >
                            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{parent.name}</p>
                            <p className="text-xs text-slate-400">
                              {parent.childrenCount}{" "}
                              {parent.childrenCount === 1 ? "Child" : "Children"} · {parent.phone}
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 bg-blue-50/40">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14z" />
                              </svg>
                              {parent.phone || "—"}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                              </svg>
                              {parent.email || "—"}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-1.5">Existing Children</p>
                              <div className="flex flex-wrap gap-1.5">
                                {parent.childrenPreview?.length > 0 ? (
                                  parent.childrenPreview.map((c) => (
                                    <span
                                      key={c.admissionNo}
                                      className="inline-flex items-center h-6 px-2.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold"
                                    >
                                      {c.studentName}
                                      {c.grade ? ` · ${c.grade}` : ""}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400">No children linked yet</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectParent(parent)}
                              className="shrink-0 h-9 px-4 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition shadow-md shadow-blue-200/60"
                            >
                              Select Parent
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Placeholder right panel when no results */
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 min-h-[160px]">
              <p className="text-xs text-slate-400 text-center max-w-[180px]">
                Results will appear here once you search.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Linked success banner ── */}
      {linkedParent && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-200 bg-emerald-50">
            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold text-emerald-700">Parent Linked Successfully</p>
          </div>
          <p className="px-4 pt-2 text-xs text-emerald-600">
            This student will be added as another child under the selected parent account.
          </p>

          <div className="px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-start">

              {/* Parent info */}
              <div className="flex items-center gap-3">
                <Avatar name={linkedParent.name || "?"} size={38} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{linkedParent.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14z" />
                    </svg>
                    {linkedParent.phone || "—"}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {linkedParent.email || "—"}
                  </p>
                </div>
              </div>

              {/* Existing children */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1.5">Existing Children</p>
                <div className="flex flex-wrap gap-1">
                  {linkedParent.childrenPreview?.length > 0 ? (
                    linkedParent.childrenPreview.map((c) => (
                      <span
                        key={c.admissionNo}
                        className="inline-flex items-center h-5 px-2 rounded-md bg-blue-100 text-blue-700 text-xs font-semibold"
                      >
                        {c.studentName}{c.grade ? ` · ${c.grade}` : ""}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </div>
              </div>

              {/* New student */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1.5">New Student</p>
                <p className="text-xs font-semibold text-slate-700">{studentName || "To be added"}</p>
              </div>

              {/* Admission number + change */}
              <div className="flex flex-col gap-1">
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1.5">Admission Number</p>
                  <p className="text-xs text-slate-400">{admissionNumber || "To be generated"}</p>
                </div>
                <button
                  type="button"
                  onClick={handleChangeParent}
                  className="mt-2 self-start flex items-center gap-1.5 h-7 px-3 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Change Parent
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
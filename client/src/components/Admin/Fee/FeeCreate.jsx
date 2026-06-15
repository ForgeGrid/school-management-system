import React, { useState } from "react";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save, Info, CheckCircle2, AlertTriangle,
  FileText, Check, Percent, PlayCircle, Archive, ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import {
  createAcademicFeeStructure,
  updateAcademicFeeStructure,
  activateAcademicFeeStructure,
  archiveAcademicFeeStructure,
  selectLoading,
} from "../../../redux/slice/academicFeeStructureSlice"; 

import "../../../fonts/feeCreateStyles.css";


const FREQUENCY_MAP = {
  "Yearly":    "yearly",
  "Term-wise": "term-wise",
  "Monthly":   "monthly",
  "One-time":  "one-time",
};

const FREQUENCY_REVERSE = Object.fromEntries(
  Object.entries(FREQUENCY_MAP).map(([k, v]) => [v, k])
);

// Map UI status → backend status
const STATUS_MAP = {
  "Draft":    "draft",
  "Active":   "active",
  "Archived": "archived",
};

const STATUS_REVERSE = {
  draft:    "Draft",
  active:   "Active",
  archived: "Archived",
};

// Build feeHeads payload matching backend normalizeFeeHeads()
const buildFeeHeadsPayload = (feeHeads) =>
  feeHeads.map((h, index) => ({
    name:      h.name.trim(),
    amount:    Number(h.amount),
    frequency: FREQUENCY_MAP[h.frequency] || h.frequency,
    mandatory: h.isMandatory,
    taxable:   h.isTaxable,
    order:     index + 1,
  }));

// Parse feeHeads from API response back to UI shape
const parseFeeHeadsFromApi = (feeHeads = []) =>
  feeHeads.map((h, index) => ({
    id:          index + 1,
    name:        h.name,
    amount:      String(h.amount),
    frequency:   FREQUENCY_REVERSE[h.frequency] || h.frequency,
    isMandatory: h.mandatory ?? true,
    isTaxable:   h.taxable   ?? false,
  }));

const INITIAL_FEE_HEADS = [
  { id: 1, name: "Tuition Fee",      amount: "18000.00", frequency: "Yearly",   isMandatory: true,  isTaxable: false },
  { id: 2, name: "Exam Fee",         amount: "2000.00",  frequency: "Yearly",   isMandatory: true,  isTaxable: false },
  { id: 3, name: "Lab Fee",          amount: "1500.00",  frequency: "Yearly",   isMandatory: false, isTaxable: false },
  { id: 4, name: "Library Fee",      amount: "800.00",   frequency: "Yearly",   isMandatory: false, isTaxable: false },
  { id: 5, name: "Annual Fee",       amount: "1200.00",  frequency: "Yearly",   isMandatory: true,  isTaxable: false },
  { id: 6, name: "Development Fee",  amount: "2500.00",  frequency: "Yearly",   isMandatory: true,  isTaxable: true  },
  { id: 7, name: "Miscellaneous Fee",amount: "1000.00",  frequency: "One-time", isMandatory: false, isTaxable: false },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function FeeCreate({ onBack, onSave, initialData }) {
  const dispatch = useDispatch();
  const loading  = useSelector(selectLoading);

  const isEdit = Boolean(initialData?._id);

  // Initialise form from API shape (edit) or defaults (create)
  const [year,     setYear]     = useState(initialData?.academicYear || "2025 - 2026");
  const [grade,    setGrade]    = useState(initialData?.standard     || "Grade 6");
  const [status,   setStatus]   = useState(STATUS_REVERSE[initialData?.status] || "Draft");
  const [feeHeads, setFeeHeads] = useState(
    initialData?.feeHeads?.length
      ? parseFeeHeadsFromApi(initialData.feeHeads)
      : INITIAL_FEE_HEADS
  );

  // Dynamic calculations
  const totalAmount    = feeHeads.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalHeads     = feeHeads.length;
  const mandatoryHeads = feeHeads.filter(h => h.isMandatory).length;
  const optionalHeads  = totalHeads - mandatoryHeads;
  const taxableHeads   = feeHeads.filter(h => h.isTaxable).length;

  // ── Fee Head local handlers ──────────────────────────────────────────────

  const handleAddHead = () => {
    const nextId = feeHeads.length > 0 ? Math.max(...feeHeads.map(h => h.id)) + 1 : 1;
    setFeeHeads([...feeHeads, { id: nextId, name: "", amount: "", frequency: "Yearly", isMandatory: false, isTaxable: false }]);
  };

  const handleDeleteHead = (id) => setFeeHeads(feeHeads.filter(h => h.id !== id));

  const handleUpdateHead = (id, field, value) =>
    setFeeHeads(feeHeads.map(h => h.id === id ? { ...h, [field]: value } : h));

  // ── Validation ───────────────────────────────────────────────────────────

  const validate = () => {
    if (!year)  { toast.error("Academic Year is required");         return false; }
    if (!grade) { toast.error("Standard / Grade is required");      return false; }
    if (feeHeads.length === 0) { toast.error("Please add at least one fee head"); return false; }

    for (let i = 0; i < feeHeads.length; i++) {
      const head = feeHeads[i];
      if (!head.name.trim()) {
        toast.error(`Fee head #${i + 1} is missing a name`);
        return false;
      }
      if (head.amount === "" || isNaN(Number(head.amount)) || Number(head.amount) < 0) {
        toast.error(`Fee head "${head.name || `#${i + 1}`}" must have a valid positive amount`);
        return false;
      }
    }
    return true;
  };

  // ── Save actions ─────────────────────────────────────────────────────────

  const handleSaveAction = async (overrideStatus = null) => {
    if (!validate()) return;

    const targetStatus = STATUS_MAP[overrideStatus || status];

    const payload = {
      academicYear: year,
      standard:     grade,
      status:       targetStatus,
      feeHeads:     buildFeeHeadsPayload(feeHeads),
    };

    let result;

    if (isEdit) {
      result = await dispatch(updateAcademicFeeStructure({ structureId: initialData._id, ...payload }));
    } else {
      result = await dispatch(createAcademicFeeStructure(payload));
    }

    const fulfilled = isEdit
      ? updateAcademicFeeStructure.fulfilled.match(result)
      : createAcademicFeeStructure.fulfilled.match(result);

    if (fulfilled) {
      toast.success(`Fee structure ${isEdit ? "updated" : "saved"} as ${overrideStatus || status} successfully!`);
      onSave(result.payload.structure);
      onBack();
    } else {
      toast.error(result.payload || "Something went wrong. Please try again.");
    }
  };

  // Activate: save with active status (also calls activate endpoint for existing records)
  const handleActivate = async () => {
    if (!validate()) return;

    if (isEdit) {
      // First save any changes, then activate via dedicated endpoint
      const updateResult = await dispatch(
        updateAcademicFeeStructure({
          structureId: initialData._id,
          academicYear: year,
          standard:     grade,
          feeHeads:     buildFeeHeadsPayload(feeHeads),
        })
      );

      if (!updateAcademicFeeStructure.fulfilled.match(updateResult)) {
        toast.error(updateResult.payload || "Failed to save changes before activating.");
        return;
      }

      const activateResult = await dispatch(activateAcademicFeeStructure(initialData._id));
      if (activateAcademicFeeStructure.fulfilled.match(activateResult)) {
        toast.success("Fee structure activated successfully!");
        onSave(activateResult.payload.structure);
        onBack();
      } else {
        toast.error(activateResult.payload || "Failed to activate.");
      }
    } else {
      // New record: just create with active status
      await handleSaveAction("Active");
    }
  };

  // Archive: save with archived status (also calls archive endpoint for existing records)
  const handleArchive = async () => {
    if (!validate()) return;

    if (isEdit) {
      const archiveResult = await dispatch(archiveAcademicFeeStructure(initialData._id));
      if (archiveAcademicFeeStructure.fulfilled.match(archiveResult)) {
        toast.success("Fee structure archived successfully!");
        onSave(archiveResult.payload.structure);
        onBack();
      } else {
        toast.error(archiveResult.payload || "Failed to archive.");
      }
    } else {
      await handleSaveAction("Archived");
    }
  };

  const isBusy =
    loading.create   ||
    loading.update   ||
    loading.activate ||
    loading.archive;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fcr-root" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, gap: 16, color: "#1e293b", overflowY: "auto", paddingBottom: 24 }}>


      {/* ── Top Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onBack}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, border: "1px solid #cbd5e1", borderRadius: 10, background: "#fff", cursor: "pointer" }}
            title="Back to list"
          >
            <ArrowLeft size={16} color="#0f172a" strokeWidth={2.5} style={{ margin: "auto" }} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px", margin: 0 }}>
              Academic Fee Structure
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500, margin: "4px 0 0 0" }}>
              Configure fee heads for a specific academic year and standard.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => handleSaveAction("Draft")}
            disabled={isBusy}
            className="fcr-btn-action"
            style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#1e293b" }}
          >
            <Save size={14} color="#1e293b" />
            {loading.create || loading.update ? "Saving..." : "Save Draft"}
          </button>

          <button
            onClick={() => handleSaveAction(status)}
            disabled={isBusy}
            className="fcr-btn-action"
            style={{ background: "#2563eb", border: "1px solid #2563eb", color: "#ffffff" }}
          >
            <CheckCircle2 size={14} color="#ffffff" />
            {loading.create || loading.update ? "Saving..." : "Save Structure"}
          </button>

          <button
            onClick={handleActivate}
            disabled={isBusy}
            className="fcr-btn-action"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}
          >
            <PlayCircle size={14} color="#15803d" />
            {loading.activate ? "Activating..." : "Activate Structure"}
          </button>

          <button
            onClick={handleArchive}
            disabled={isBusy}
            className="fcr-btn-action"
            style={{ background: "#fff7ed", border: "1px solid #ffedd5", color: "#c2410c" }}
          >
            <Archive size={14} color="#c2410c" />
            {loading.archive ? "Archiving..." : "Archive Structure"}
          </button>
        </div>
      </div>

      {/* ── Section 1: Structure Details ── */}
      <div className="fcr-section">
        <div className="fcr-section-title">
          <span className="fcr-num-badge">1</span> Structure Details
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          <div className="fcr-label-group">
            <label className="fcr-label">Academic Year <span>*</span></label>
            <div className="fcr-select-wrapper">
              <select value={year} onChange={e => setYear(e.target.value)} className="fcr-input fcr-select">
                <option>2025 - 2026</option>
                <option>2024 - 2025</option>
                <option>2026 - 2027</option>
              </select>
            </div>
            <span className="fcr-sub-desc">Select the academic year for this fee structure.</span>
          </div>

          <div className="fcr-label-group">
            <label className="fcr-label">Standard / Grade <span>*</span></label>
            <div className="fcr-select-wrapper">
              <select value={grade} onChange={e => setGrade(e.target.value)} className="fcr-input fcr-select">
                <option>Grade 6</option>
                <option>Grade 7</option>
                <option>Grade 8</option>
                <option>Grade 9</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>Grade 12</option>
              </select>
            </div>
            <span className="fcr-sub-desc">Select the standard or grade.</span>
          </div>

          <div className="fcr-label-group">
            <label className="fcr-label">Status <span>*</span></label>
            <div className="fcr-select-wrapper">
              <select value={status} onChange={e => setStatus(e.target.value)} className="fcr-input fcr-select">
                <option>Draft</option>
                <option>Active</option>
                <option>Archived</option>
              </select>
            </div>
            <span className="fcr-sub-desc">Select the status of this fee structure.</span>
          </div>
        </div>

        <div className="fcr-alert">
          <Info size={16} color="#1d4ed8" style={{ flexShrink: 0 }} />
          One fee structure can exist per school, academic year, and standard.
        </div>
      </div>

      {/* ── Section 2: Fee Heads ── */}
      <div className="fcr-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div className="fcr-section-title" style={{ margin: 0 }}>
            <span className="fcr-num-badge">2</span> Fee Heads
          </div>
          <button
            onClick={handleAddHead}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #2563eb", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#2563eb", background: "#ffffff", cursor: "pointer" }}
          >
            <Plus size={14} strokeWidth={2.5} /> Add Fee Head
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="fcr-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th style={{ width: 80 }}>Order</th>
                <th>Fee Head Name <span style={{ color: "#ef4444" }}>*</span></th>
                <th style={{ width: 200 }}>Amount (₹) <span style={{ color: "#ef4444" }}>*</span></th>
                <th style={{ width: 180 }}>Frequency <span style={{ color: "#ef4444" }}>*</span></th>
                <th style={{ width: 120, textAlign: "center" }}>Mandatory</th>
                <th style={{ width: 120, textAlign: "center" }}>Taxable</th>
                <th style={{ width: 80, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeHeads.map((head, index) => (
                <tr key={head.id}>
                  <td>
                    <div className="fcr-row-drag-handle"><GripVertical size={15} /></div>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={index + 1}
                      disabled
                      className="fcr-input"
                      style={{ textAlign: "center", background: "#f8fafc", borderColor: "#e2e8f0" }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="e.g. Tuition Fee"
                      value={head.name}
                      onChange={e => handleUpdateHead(head.id, "name", e.target.value)}
                      className="fcr-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={head.amount}
                      onChange={e => handleUpdateHead(head.id, "amount", e.target.value)}
                      className="fcr-input"
                    />
                  </td>
                  <td>
                    <div className="fcr-select-wrapper">
                      <select
                        value={head.frequency}
                        onChange={e => handleUpdateHead(head.id, "frequency", e.target.value)}
                        className="fcr-input fcr-select"
                      >
                        <option>Yearly</option>
                        <option>Term-wise</option>
                        <option>Monthly</option>
                        <option>One-time</option>
                      </select>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <label className="fcr-switch-container">
                      <input
                        type="checkbox"
                        checked={head.isMandatory}
                        onChange={e => handleUpdateHead(head.id, "isMandatory", e.target.checked)}
                        className="fcr-switch-input"
                      />
                      <div className="fcr-switch-slider"></div>
                    </label>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <label className="fcr-switch-container">
                      <input
                        type="checkbox"
                        checked={head.isTaxable}
                        onChange={e => handleUpdateHead(head.id, "isTaxable", e.target.checked)}
                        className="fcr-switch-input"
                      />
                      <div className="fcr-switch-slider"></div>
                    </label>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => handleDeleteHead(head.id)} className="fcr-btn-delete" title="Delete fee head">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {feeHeads.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
                    <Info size={24} style={{ opacity: 0.3, marginBottom: 8, marginInline: "auto" }} />
                    <div style={{ fontSize: 13, fontWeight: 700 }}>No Fee Heads Configured</div>
                    <div style={{ fontSize: 11.5, marginTop: 2 }}>Click "+ Add Fee Head" above to add itemized costs.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="fcr-bottom-tip">
          <GripVertical size={13} color="#64748b" /> Drag the rows to change the order of fee heads.
        </div>
      </div>

      {/* ── Section 3 & 4 (Columns) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Section 3: Summary */}
        <div className="fcr-section" style={{ margin: 0, display: "flex", flexDirection: "column" }}>
          <div className="fcr-section-title">
            <span className="fcr-num-badge">3</span> Fee Structure Summary
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            <div className="fcr-kpi-card">
              <div className="fcr-kpi-icon-wrapper" style={{ background: "#eff6ff" }}>
                <ClipboardList size={16} color="#2563eb" />
              </div>
              <div>
                <div className="fcr-kpi-title">Total Heads</div>
                <div className="fcr-kpi-value">{totalHeads}</div>
              </div>
            </div>

            <div className="fcr-kpi-card">
              <div className="fcr-kpi-icon-wrapper" style={{ background: "#f0fdf4" }}>
                <CheckCircle2 size={16} color="#16a34a" />
              </div>
              <div>
                <div className="fcr-kpi-title">Mandatory</div>
                <div className="fcr-kpi-value">{mandatoryHeads}</div>
              </div>
            </div>

            <div className="fcr-kpi-card">
              <div className="fcr-kpi-icon-wrapper" style={{ background: "#fff7ed" }}>
                <Percent size={16} color="#ea580c" />
              </div>
              <div>
                <div className="fcr-kpi-title">Optional</div>
                <div className="fcr-kpi-value">{optionalHeads}</div>
              </div>
            </div>

            <div className="fcr-kpi-card">
              <div className="fcr-kpi-icon-wrapper" style={{ background: "#faf5ff" }}>
                <Percent size={16} color="#9333ea" />
              </div>
              <div>
                <div className="fcr-kpi-title">Taxable</div>
                <div className="fcr-kpi-value">{taxableHeads}</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Total Base Amount</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#1e3a8a" }}>
                ₹ {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 4 }}>
              Sum of all fee heads (before taxes).
            </span>
          </div>
        </div>

        {/* Section 4: Notes */}
        <div className="fcr-section" style={{ margin: 0 }}>
          <div className="fcr-section-title">
            <span className="fcr-num-badge">4</span> Important Notes
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Academic Year + Standard must be unique.",
              "Fee head names must not be repeated.",
              "At least one fee head is required.",
              "Amounts must be zero or above.",
              "Order must be a valid positive number.",
            ].map((note) => (
              <div key={note} className="fcr-checklist-item">
                <CheckCircle2 size={16} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                {note}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
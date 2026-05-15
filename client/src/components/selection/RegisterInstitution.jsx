
import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Hash, Home, Mail, Phone, MapPin, FileText, Camera 
} from "lucide-react";
import { createSchool } from "../../redux/slice/schoolThunks";
import { clearSchoolState } from "../../redux/slice/schoolslice";

export default function RegisterInstitution({ onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((state) => state.school);

  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    schoolEmail: "",
    phone: "",
    board: "",
    medium: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    // Append all text fields
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Append logo file if selected
    const file = fileInputRef.current?.files[0];
    if (file) {
      formData.append("logo", file); 
    }

    const result = await dispatch(createSchool(formData));

    if (createSchool.fulfilled.match(result)) {
      dispatch(clearSchoolState());
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-2xl flex flex-col h-full max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="relative flex items-center justify-center mb-8 mt-2">
        <button
          onClick={() => onClose(false)}
          className="absolute left-0 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="text-center">
          <h2 className="text-2xl md:text-[28px] font-bold text-slate-800 tracking-tight">Register Institution</h2>
          <p className="text-slate-500 text-sm mt-1">Fill details to initialize your school profile and manage your institution.</p>
        </div>
      </div>

      {/* Error / Success Banner */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm font-medium">
          {successMessage}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
              <Home size={16} className="text-purple-500" />
              School Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="CEOA School"
              className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
                <Mail size={16} className="text-purple-500" />
                School Email <span className="text-red-500">*</span>
              </label>
              <Input
                name="schoolEmail"
                value={form.schoolEmail}
                onChange={handleChange}
                placeholder="jjjaiganesh@gmail.com"
                className="h-12 rounded-xl border-transparent bg-slate-100 focus-visible:ring-purple-500 text-base shadow-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
                <Phone size={16} className="text-purple-500" />
                School Phone <span className="text-red-500">*</span>
              </label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="8220278419"
                className="h-12 rounded-xl border-transparent bg-slate-100 focus-visible:ring-purple-500 text-base shadow-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
                <FileText size={16} className="text-purple-500" />
                School Board
              </label>
              <Input
                name="board"
                value={form.board}
                onChange={handleChange}
                placeholder="CBSE"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
                <Hash size={16} className="text-purple-500" />
                School Medium
              </label>
              <Input
                name="medium"
                value={form.medium}
                onChange={handleChange}
                placeholder="English"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
              <MapPin size={16} className="text-purple-500" />
              Official Address
            </label>
            <Input
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="Street (e.g. Kosakulam)"
              className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City (e.g. Madurai)"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
              />
              <Input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State (e.g. Tamil Nadu)"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Postal Code (e.g. 625016)"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
              />
              <Input
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Country (e.g. India)"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
              />
            </div>
          </div>

        </div>

        {/* Right Column - Logo & Actions */}
        <div className="bg-[#f8f9fc] rounded-3xl p-6 md:p-8 flex flex-col border border-slate-100">
          <div className="flex-1 flex flex-col items-center pt-2">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-6">
              Organization Logo
            </h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 bg-white hover:bg-slate-50 transition-colors text-slate-400 hover:text-indigo-500 hover:border-indigo-300 overflow-hidden relative"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Organization Logo" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={28} />
                  <span className="text-xs font-semibold">Upload</span>
                </>
              )}
            </button>

            <div className="mt-10 w-full text-left">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
                Owner Account
              </h3>
              <p className="text-sm font-semibold text-slate-700">
                prithivi.coder76@gmail.com
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-10">
            <Button
              variant="outline"
              disabled={loading}
              className="h-12 rounded-full border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 text-base"
            >
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-md shadow-indigo-200"
            >
              {loading ? "Submitting..." : "Submit Profile"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
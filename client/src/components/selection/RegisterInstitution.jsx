import React, { useState, useRef } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/input";
import { ArrowLeft, Hash, Home, Mail, Phone, MapPin, FileText, Camera } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createSchool } from "../../redux/slice/schoolThunks";
import { toast } from "sonner";
import { selectUser } from "../../redux/slice/getmeSelector";

export default function RegisterInstitution({ onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  // Get logged-in user's email dynamically using selectUser selector
  const user = useSelector(selectUser);
  const userEmail = user?.email;

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
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
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    // Frontend Validation
    if (!form.name.trim()) {
      return toast.error("School Name is required");
    }
    if (!form.schoolEmail.trim()) {
      return toast.error("School Email is required");
    }
    if (!form.phone.trim()) {
      return toast.error("School Phone is required");
    }

    const formData = new FormData();

    // Map form fields to the exact names createSchoolService expects
    formData.append("email", userEmail);
    formData.append("schoolName", form.name.trim());
    formData.append("schoolEmail", form.schoolEmail.trim());
    formData.append("schoolPhone", form.phone.trim());
    formData.append("schoolBoard", form.board.trim());
    formData.append("schoolMedium", form.medium.trim());

    // Combine address fields into officialAddress string
    const address = [form.street, form.city, form.state, form.postalCode, form.country]
      .filter(Boolean).join(", ");
    formData.append("officialAddress", address);

    // Append file — key must match upload.single("schoolLogo")
    if (logoFile) {
      formData.append("schoolLogo", logoFile);
    }

    setLoading(true);
    dispatch(createSchool(formData))
      .unwrap()
      .then(() => {
        toast.success("School registered successfully!");
        onSuccess?.();
      })

      .catch((err) => {
        toast.error(err || "Failed to register school");
      })
      .finally(() => setLoading(false));
  };


  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-2xl flex flex-col h-full max-h-[90vh] overflow-y-auto">

      {/* Header Section */}
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

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* School Name Field */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
              <Home size={16} className="text-purple-500" />
              School Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              placeholder="CEOA School"
              className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* School Email & Contact Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
                <Mail size={16} className="text-purple-500" />
                School Email <span className="text-red-500">*</span>
              </label>
              <Input
                name="schoolEmail"
                placeholder="jjjaiganesh@gmail.com"
                className="h-12 rounded-xl border-transparent bg-slate-100 focus-visible:ring-purple-500 text-base shadow-none"
                value={form.schoolEmail}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
                <Phone size={16} className="text-purple-500" />
                School Phone <span className="text-red-500">*</span>
              </label>
              <Input
                name="phone"
                placeholder="8220278419"
                className="h-12 rounded-xl border-transparent bg-slate-100 focus-visible:ring-purple-500 text-base shadow-none"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* School Board & Medium Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
                <FileText size={16} className="text-purple-500" />
                School Board
              </label>
              <Input
                name="board"
                placeholder="CBSE"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
                value={form.board}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
                <Hash size={16} className="text-purple-500" />
                School Medium
              </label>
              <Input
                name="medium"
                placeholder="English"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
                value={form.medium}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Official Address */}
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-sm font-bold text-indigo-900/80">
              <MapPin size={16} className="text-purple-500" />
              Official Address
            </label>

            <Input
              name="street"
              placeholder="Street (e.g. Kosakulam)"
              className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
              value={form.street}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="city"
                placeholder="City (e.g. Madurai)"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
                value={form.city}
                onChange={handleChange}
              />
              <Input
                name="state"
                placeholder="State (e.g. Tamil Nadu)"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
                value={form.state}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="postalCode"
                placeholder="Postal Code (e.g. 625016)"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
                value={form.postalCode}
                onChange={handleChange}
              />
              <Input
                name="country"
                placeholder="Country (e.g. India)"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm text-base"
                value={form.country}
                onChange={handleChange}
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
                {userEmail}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-10">
            <Button
              variant="outline"
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
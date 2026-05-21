import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Building2,
  Palette,
  Zap,
  Sparkles,
  MessageSquare,
  PenTool,
  Star,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

function AdminFeedback() {
  const [selectedCategory, setSelectedCategory] = useState("Other");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const user = {
    name: "Prithivi New",
    email: "rjaiagency@gmail.com",
    school: "BLACKPINK AREA",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=prithivi",
  };

  const categories = [
    { id: "UI / UX", label: "UI / UX", icon: Palette },
    { id: "Performance", label: "Performance", icon: Zap },
    { id: "Features", label: "Features", icon: Sparkles },
    { id: "Support", label: "Support", icon: MessageSquare },
    { id: "Other", label: "Other", icon: PenTool },
  ];

  const handleReset = () => {
    setSelectedCategory("Other");
    setRating(0);
    setComment("");
    setIsSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSubmitted(true);
  };

  return (
    <div className="h-full flex flex-col gap-3.5 overflow-hidden pr-1 pb-4 w-full">

      <div className="flex flex-row items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Feedback & Reviews
          </h1>
        </div>
      </div>

      <div className="bg-white border border-slate-100/90 rounded-3xl md:rounded-4xl pt-4 pb-6 px-5 sm:pt-4.5 sm:pb-7 sm:px-8 shadow-xs flex-1 flex flex-col justify-between overflow-hidden">

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="feedback-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col justify-between overflow-hidden w-full"
            >

              <div className="flex flex-col gap-0.5 shrink-0 pb-2.5 border-b border-slate-100/70">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  Share Your Feedback
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-400">
                  Help us make FGrow better for you
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden w-full pt-3">

                <div className="space-y-4 flex-1 overflow-hidden flex flex-col justify-start px-1 pt-1 pb-1">

                  {/* User Identity Profile Card */}
                  <div className="bg-indigo-50/30 border border-indigo-100/40 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 sm:gap-4 shrink-0">
                    {/*
                      FIX 1 — was: w-11 h-11 sm:w-12 h-12
                      Both h-11 and h-12 applied simultaneously because h-12 had no sm: prefix.
                      Fixed: use a single base size w-11 h-11, scale both width AND height at sm.
                    */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-900 overflow-hidden flex items-center justify-center border border-indigo-955/20 shadow-sm shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover scale-110"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-slate-800 text-base sm:text-lg leading-tight">
                        {user.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] sm:text-xs font-semibold text-slate-400/90">
                        <span className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span className="truncate">{user.email}</span>
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span className="truncate">{user.school}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Grid */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                      Category
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3.5">
                      {categories.map((cat) => {
                        const CatIcon = cat.icon;
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex flex-col items-center justify-center gap-1.5 p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.12)] scale-[1.02]"
                                : "border-slate-200/70 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {/*
                              FIX 2 — was: w-5 h-5 sm:w-5.5 h-5.5
                              h-5.5 had no sm: prefix so h-5 and h-5.5 conflicted.
                              FIX 3 — stroke-[2] replaced with canonical stroke-2
                              Fixed: add sm: to both w and h; use stroke-2.
                            */}
                            <CatIcon className={`w-5 h-5 sm:w-5 sm:h-5 transition-transform ${isSelected ? "stroke-[2.5] scale-105" : "stroke-2"}`} />
                            <span className="text-[10px] sm:text-xs font-bold tracking-tight mt-0.5">
                              {cat.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                      Rating
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {[1, 2, 3, 4, 5].map((starValue) => {
                        const isFilled = starValue <= (hoverRating || rating);
                        return (
                          <button
                            key={starValue}
                            type="button"
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-0.5 cursor-pointer transition-transform duration-150 active:scale-95"
                          >
                            {/*
                              FIX 4 — was: w-7.5 h-7.5 sm:w-8.5 h-8.5
                              h-8.5 had no sm: prefix so h-7.5 and h-8.5 conflicted.
                              Fixed: add sm: prefix to both w and h at the sm breakpoint.
                            */}
                            <Star
                              className={`w-7 h-7 sm:w-8 sm:h-8 transition-all ${
                                isFilled
                                  ? "text-amber-400 fill-amber-400 stroke-amber-400 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.15)]"
                                  : "text-slate-200 hover:text-slate-300"
                              }`}
                              strokeWidth={isFilled ? 2.5 : 2}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="flex flex-col gap-2 flex-1 min-h-[100px]">
                    <div className="flex justify-between items-baseline shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                        Comment
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-400/90 lowercase">
                        (optional)
                      </span>
                    </div>
                    <textarea
                      placeholder="Tell us more about your experience..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full flex-1 px-4 sm:px-5 py-3 sm:py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-xs sm:text-sm text-slate-700 placeholder-slate-400 resize-none leading-relaxed min-h-[80px]"
                    />
                  </div>

                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-100 shrink-0 mt-3.5">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 sm:px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="submit"
                    disabled={rating === 0}
                    className={`px-6 sm:px-7 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                      rating > 0
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.01]"
                        : "bg-indigo-100 text-indigo-300/80 cursor-not-allowed"
                    }`}
                  >
                    Submit Feedback
                  </button>
                </div>

              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-8 max-w-xl mx-auto"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Feedback Submitted!
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-400 leading-relaxed px-4">
                  Thank you, {user.name}. Your feedback has been received and helps us continuously refine the School Management platform.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="mt-3 px-6 sm:px-8 py-2.5 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
              >
                Submit Another Response
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}

export default AdminFeedback;
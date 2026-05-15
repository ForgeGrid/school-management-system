import mongoose from "mongoose";

const busItemSchema = new mongoose.Schema(
  {
    busNo: {
      type: Number,
      required: true,
      min: 1,
    },
    plateNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
    },
  },
  { _id: false }
);

const busRouteSchema = new mongoose.Schema(
  {
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    routeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },

    routeNameKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    buses: {
      type: [busItemSchema],
      default: [],
    },

    startPoint: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    endPoint: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    stops: {
      type: [String],
      default: [],
    },

    distanceKm: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

busRouteSchema.index({ school_id: 1, routeNameKey: 1 }, { unique: true });

busRouteSchema.pre("validate", function () {
  if (typeof this.routeName === "string") {
    this.routeName = this.routeName.trim();
    this.routeNameKey = this.routeName.toLowerCase();
  }
  if (typeof this.startPoint === "string") this.startPoint = this.startPoint.trim();
  if (typeof this.endPoint === "string") this.endPoint = this.endPoint.trim();

  if (Array.isArray(this.stops)) {
    this.stops = this.stops
      .filter(Boolean)
      .map((s) => String(s).trim())
      .filter(Boolean);
  }

  if (Array.isArray(this.buses)) {
    this.buses = this.buses.map((b) => ({
      busNo: Number(b.busNo),
      plateNumber: String(b.plateNumber).trim().toUpperCase(),
    }));
  }
});

export const BusRoute = mongoose.model("BusRoute", busRouteSchema);
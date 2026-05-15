import mongoose from "mongoose";
import { BusRoute } from "./src/models/transport/busRoute.model.js";

async function test() {
    try {
        const route = new BusRoute({
            school_id: new mongoose.Types.ObjectId(),
            routeName: "Test Route",
            startPoint: "A",
            endPoint: "B",
            distanceKm: 10,
            createdBy: new mongoose.Types.ObjectId()
        });
        console.log("Validating...");
        await route.validate();
        console.log("Validated successfully");
    } catch (err) {
        console.error("Error during validation:", err);
    } finally {
        process.exit();
    }
}

test();

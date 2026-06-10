/**
 * transport.helper.js
 * 
 * Domain-specific logic for transport module.
 */

/**
 * Normalizes bus objects.
 */
export const normalizeBuses = (buses = []) => {
    if (!Array.isArray(buses)) {
        throw new Error("buses must be an array");
    }

    const normalized = buses.map((item, index) => {
        if (item?.busNo === undefined || item?.busNo === null) {
            throw new Error(`buses[${index}].busNo is required`);
        }
        if (!item?.plateNumber) {
            throw new Error(`buses[${index}].plateNumber is required`);
        }

        return {
            busNo: Number(item.busNo),
            plateNumber: String(item.plateNumber).trim().toUpperCase(),
        };
    });

    const seenBusNo = new Set();
    const seenPlate = new Set();

    for (const b of normalized) {
        if (seenBusNo.has(b.busNo)) {
            throw new Error(`Duplicate busNo found: ${b.busNo}`);
        }
        if (seenPlate.has(b.plateNumber)) {
            throw new Error(`Duplicate plateNumber found: ${b.plateNumber}`);
        }
        seenBusNo.add(b.busNo);
        seenPlate.add(b.plateNumber);
    }

    return normalized;
};

export const rupeesToPaise = (rupees: number): number => {
    if (!Number.isFinite(rupees) || rupees < 0) {
        throw new Error("Invalid monetary amount");
    }

    const paise = Math.round(rupees * 100);

    if (!Number.isSafeInteger(paise)) {
        throw new Error("Monetary amount exceeds the safe limit");
    }

    return paise;
};
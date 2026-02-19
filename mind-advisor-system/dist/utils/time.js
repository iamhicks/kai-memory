"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daysSince = daysSince;
function daysSince(date) {
    if (!date)
        return 'N/A';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24))).toString();
}

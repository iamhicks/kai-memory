"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mentionRegex = void 0;
exports.extractMentions = extractMentions;
exports.mentionRegex = /@([\p{L}\p{N}_-]+)/gu;
function extractMentions(input) {
    const matches = [];
    let match;
    while ((match = exports.mentionRegex.exec(input)) !== null) {
        matches.push(match[1].toLowerCase());
    }
    return [...new Set(matches)];
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const utils_1 = require("../utils");
suite("Playful Sparkle: Replace Accents Tests", () => {
    suite("replaceAccents Tests", () => {
        test("removes accents correctly", () => {
            const input = "áéíóúñç";
            const expected = "aeiounc";
            assert.strictEqual((0, utils_1.replaceAccents)(input), expected);
        });
        test("handles custom character mappings", () => {
            const input = "áéíóúßð";
            const charMappings = { "ß": "ss", "ð": "d" };
            const expected = "aeioussd";
            assert.strictEqual((0, utils_1.replaceAccents)(input, charMappings), expected);
        });
        test("returns original text on error", () => {
            const input = null;
            assert.strictEqual((0, utils_1.replaceAccents)(input), input);
        });
        test("handles empty string", () => {
            assert.strictEqual((0, utils_1.replaceAccents)(""), "");
        });
        test("preserves non-accented characters", () => {
            const input = "Hello, World! 123";
            assert.strictEqual((0, utils_1.replaceAccents)(input), input);
        });
        test("handles mixed accented and non-accented text", () => {
            const input = "Hèllö Wórld! ¿Qué tal?";
            const expected = "Hello World! ¿Que tal?";
            assert.strictEqual((0, utils_1.replaceAccents)(input), expected);
        });
        test("handles overlapping custom mappings", () => {
            const input = "ßßß";
            const charMappings = { "ß": "ss", "ss": "z" };
            const expected = "ssssss";
            assert.strictEqual((0, utils_1.replaceAccents)(input, charMappings), expected);
        });
        test("preserves whitespace and special characters", () => {
            const input = "\t\náéí\n\r óú\t";
            const expected = "\t\naei\n\r ou\t";
            assert.strictEqual((0, utils_1.replaceAccents)(input), expected);
        });
        test("preserves case when removing accents", () => {
            const input = "ÁÉÍÓÚ áéíóú";
            const expected = "AEIOU aeiou";
            assert.strictEqual((0, utils_1.replaceAccents)(input), expected);
        });
    });
    suite("validateSpecialCharacterMappings Tests", () => {
        test("valid mappings", () => {
            const mappings = { "á": "a", "é": "e" };
            assert.strictEqual((0, utils_1.validateSpecialCharacterMappings)(mappings), "");
        });
        test("invalid key", () => {
            const mappings = { "abc": "a" };
            const errorMessage = (0, utils_1.validateSpecialCharacterMappings)(mappings);
            assert.ok(errorMessage.includes("Invalid key"));
        });
        test("invalid value", () => {
            const mappings = { "á": 123 };
            const errorMessage = (0, utils_1.validateSpecialCharacterMappings)(mappings);
            assert.ok(errorMessage.includes("Invalid value"));
        });
        test("not an object", () => {
            const mappings = null;
            const errorMessage = (0, utils_1.validateSpecialCharacterMappings)(mappings);
            assert.ok(errorMessage.includes("Invalid mappings"));
        });
    });
});
//# sourceMappingURL=extension.test.js.map
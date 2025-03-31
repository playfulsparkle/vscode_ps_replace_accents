import * as assert from "assert";
import { replaceAccents, validateSpecialCharacterMappings } from "../utils";

suite("PS: Replace Accents Tests", () => {
	suite("replaceAccents Tests", () => {
		test("removes accents correctly", () => {
			const input = "áéíóúñç";
			const expected = "aeiounc";
			assert.strictEqual(replaceAccents(input), expected);
		});

		test("handles custom character mappings", () => {
			const input = "áéíóúßð";
			const charMappings = { "ß": "ss", "ð": "d" };
			const expected = "aeioussd"; 
			assert.strictEqual(replaceAccents(input, charMappings), expected);
		});

		test("returns original text on error", () => {
			const input = null as unknown as string;
			assert.strictEqual(replaceAccents(input), input);
		});

		test("handles empty string", () => {
			assert.strictEqual(replaceAccents(""), "");
		});

		test("preserves non-accented characters", () => {
			const input = "Hello, World! 123";
			assert.strictEqual(replaceAccents(input), input);
		});

		test("handles mixed accented and non-accented text", () => {
			const input = "Hèllö Wórld! ¿Qué tal?";
			const expected = "Hello World! ¿Que tal?";
			assert.strictEqual(replaceAccents(input), expected);
		});

		test("handles overlapping custom mappings", () => {
			const input = "ßßß";
			const charMappings = { "ß": "ss", "ss": "z" };
			const expected = "ssssss";
			assert.strictEqual(replaceAccents(input, charMappings), expected);
		});

		test("preserves whitespace and special characters", () => {
			const input = "\t\náéí\n\r óú\t";
			const expected = "\t\naei\n\r ou\t";
			assert.strictEqual(replaceAccents(input), expected);
		});

		test("preserves case when removing accents", () => {
			const input = "ÁÉÍÓÚ áéíóú";
			const expected = "AEIOU aeiou";
			assert.strictEqual(replaceAccents(input), expected);
		});
	});

	suite("validateSpecialCharacterMappings Tests", () => {
		test("valid mappings", () => {
			const mappings = { "á": "a", "é": "e" };
			assert.strictEqual(validateSpecialCharacterMappings(mappings), "");
		});

		test("invalid key", () => {
			const mappings = { "abc": "a" };
			const errorMessage = validateSpecialCharacterMappings(mappings);
			assert.ok(errorMessage.includes("Invalid key"));
		});

		test("invalid value", () => {
			const mappings = { "á": 123 as unknown as string };
			const errorMessage = validateSpecialCharacterMappings(mappings);
			assert.ok(errorMessage.includes("Invalid value"));
		});

		test("not an object", () => {
			const mappings = null as unknown as Record<string, string>;
			const errorMessage = validateSpecialCharacterMappings(mappings);
			assert.ok(errorMessage.includes("Invalid mappings"));
		});
	});
});

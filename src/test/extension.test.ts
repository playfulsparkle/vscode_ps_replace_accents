import * as assert from "assert";
import { replaceAccents, validateAccentRemoveMapping } from "../utils";
import AccentRestorer from "../accent";

suite("Replace Accents Tests", () => {
	suite("Replace Accents Tests", () => {
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

	suite("Validate Special Character Mappings Tests", () => {
		test("valid mappings", () => {
			const mappings = { "á": "a", "é": "e" };
			assert.strictEqual(validateAccentRemoveMapping(mappings), "");
		});

		test("invalid key", () => {
			const mappings = { "abc": "a" };
			const errorMessage = validateAccentRemoveMapping(mappings);
			assert.ok(errorMessage.includes("Invalid key"));
		});

		test("invalid value", () => {
			const mappings = { "á": 123 as unknown as string };
			const errorMessage = validateAccentRemoveMapping(mappings);
			assert.ok(errorMessage.includes("Invalid value"));
		});

		test("not an object", () => {
			const mappings = null as unknown as Record<string, string>;
			const errorMessage = validateAccentRemoveMapping(mappings);
			assert.ok(errorMessage.includes("Invalid mappings"));
		});
	});

	suite("Accent Restoration Dictionary Tests", () => {
		test("Czech dictionary restores full diacritics", async () => {
			const restorer = new AccentRestorer("czech");
			await restorer.initialize();
			const input = "Prilis zlutoucky kun upel dabelske ody.";
			const expected = "Příliš žluťoučký kůň úpěl ďábelské ódy.";
			assert.strictEqual(restorer.restoreAccents(input), expected);
			restorer.dispose();
		});

		test("Danish dictionary restores å, æ, ø", async () => {
			const restorer = new AccentRestorer("danish");
			await restorer.initialize();
			const input = "Rod grod med flode.";
			const expected = "Rød grød med fløde.";
			assert.strictEqual(restorer.restoreAccents(input), expected);
			restorer.dispose();
		});

		test("French dictionary restores acute, grave and circumflex accents", async () => {
			const restorer = new AccentRestorer("french");
			await restorer.initialize();
			const input = "Lete Jerome a cote dElise mange des gateaux delicieux.";
			const expected = "L'été Jérôme à côté d'Élise mange des gâteaux délicieux.";
			assert.strictEqual(restorer.restoreAccents(input), expected);
			restorer.dispose();
		});

		test("German dictionary restores umlauts and ß", async () => {
			const restorer = new AccentRestorer("german");
			await restorer.initialize();
			const input = "Falsches Uben von Xylophonmusik qualt jeden grosseren Zwerg.";
			const expected = "Falsches Üben von Xylophonmusik quält jeden größeren Zwerg.";
			assert.strictEqual(restorer.restoreAccents(input), expected);
			restorer.dispose();
		});

		test("Hungarian dictionary restores every ékezet", async () => {
			const restorer = new AccentRestorer("hungarian");
			await restorer.initialize();
			const input = "Arvizturo tukorfurogep.";
			const expected = "Árvíztűrő tükörfúrógép.";
			assert.strictEqual(restorer.restoreAccents(input), expected);
			restorer.dispose();
		});

		test("Polish dictionary restores ogonki and kreski", async () => {
			const restorer = new AccentRestorer("polish");
			await restorer.initialize();
			const input = "Zazolc gesla jazn.";
			const expected = "Zażółć gęślą jaźń.";
			assert.strictEqual(restorer.restoreAccents(input), expected);
			restorer.dispose();
		});

		test("Slovak dictionary restores mäkčene and dĺžne", async () => {
			const restorer = new AccentRestorer("slovak");
			await restorer.initialize();
			const input = "Krdel datlov uci pri usti Vahu mkveho kona zrat cerstvu zihlavu.";
			const expected = "Kŕdeľ ďatľov učí pri ústí Váhu mĺkveho koňa žrať čerstvú žihľavu.";
			assert.strictEqual(restorer.restoreAccents(input), expected);
			restorer.dispose();
		});

		test("Spanish dictionary restores tildes, ñ and ü", async () => {
			const restorer = new AccentRestorer("spanish");
			await restorer.initialize();
			const input = "El pinguino Wenceslao hizo kilometros bajo exhaustiva lluvia y frio.";
			const expected = "El pingüino Wenceslao hizo kilómetros bajo exhaustiva lluvia y frío.";
			assert.strictEqual(restorer.restoreAccents(input), expected);
			restorer.dispose();
		});

		test("Swedish dictionary restores å, ä, ö", async () => {
			const restorer = new AccentRestorer("swedish");
			await restorer.initialize();
			const input = "Flygande backasiner soka hwila pa mjuka tuvor.";
			const expected = "Flygande bäckasiner söka hwila på mjuka tuvor.";
			assert.strictEqual(restorer.restoreAccents(input), expected);
			restorer.dispose();
		});
	});
});

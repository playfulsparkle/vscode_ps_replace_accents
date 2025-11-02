import * as assert from "assert";
import { validateUserCharacterMappings } from "../shared";
import DiacriticRestorer from "../restoreDiacritic";
import DiacriticRemover from "../removeDiacritic";

suite("Replace Accents Tests", () => {
	suite("Replace Accents Tests", () => {
		test("removes accents correctly", () => {
			const remover = new DiacriticRemover();
			const input = "áéíóúñç";
			const expected = "aeiounc";
			assert.strictEqual(remover.removeDiacritics(input), expected);
		});

		test("handles custom character mappings", () => {
			const remover = new DiacriticRemover();
			const input = "áéíóúßð";
			const charMappings = { "ß": "ss", "ð": "d" };
			const expected = "aeioussd";
			assert.strictEqual(remover.removeDiacritics(input, charMappings), expected);
		});

		test("returns original text on error", () => {
			const remover = new DiacriticRemover();
			const input = null as unknown as string;
			assert.strictEqual(remover.removeDiacritics(input), input);
		});

		test("handles empty string", () => {
			const remover = new DiacriticRemover();
			assert.strictEqual(remover.removeDiacritics(""), "");
		});

		test("preserves non-accented characters", () => {
			const remover = new DiacriticRemover();
			const input = "Hello, World! 123";
			assert.strictEqual(remover.removeDiacritics(input), input);
		});

		test("handles mixed accented and non-accented text", () => {
			const remover = new DiacriticRemover();
			const input = "Hèllö Wórld! ¿Qué tal?";
			const expected = "Hello World! ¿Que tal?";
			assert.strictEqual(remover.removeDiacritics(input), expected);
		});

		test("handles overlapping custom mappings", () => {
			const remover = new DiacriticRemover();
			const input = "ßßß";
			const charMappings = { "ß": "ss", "ss": "z" };
			const expected = "ssssss";
			assert.strictEqual(remover.removeDiacritics(input, charMappings), expected);
		});

		test("preserves whitespace and special characters", () => {
			const remover = new DiacriticRemover();
			const input = "\t\náéí\n\r óú\t";
			const expected = "\t\naei\n\r ou\t";
			assert.strictEqual(remover.removeDiacritics(input), expected);
		});

		test("preserves case when removing accents", () => {
			const remover = new DiacriticRemover();
			const input = "ÁÉÍÓÚ áéíóú";
			const expected = "AEIOU aeiou";
			assert.strictEqual(remover.removeDiacritics(input), expected);
		});
	});

	suite("Validate Special Character Mappings Tests", () => {
		test("valid mappings", () => {
			const mappings = { "á": "a", "é": "e" };
			assert.strictEqual(validateUserCharacterMappings(mappings), "");
		});

		test("invalid key", () => {
			const mappings = { "abc": "a" };
			const errorMessage = validateUserCharacterMappings(mappings);
			assert.ok(errorMessage.includes("Invalid key"));
		});

		test("invalid value", () => {
			const mappings = { "á": 123 as unknown as string };
			const errorMessage = validateUserCharacterMappings(mappings);
			assert.ok(errorMessage.includes("Invalid value"));
		});

		test("not an object", () => {
			const mappings = null as unknown as Record<string, string>;
			const errorMessage = validateUserCharacterMappings(mappings);
			assert.ok(errorMessage.includes("Invalid mappings"));
		});
	});

	suite("Accent Restoration Dictionary Tests", () => {
		test("Czech dictionary restores diacritics", async () => {
			const restorer = new DiacriticRestorer("czech");
			await restorer.initialize();
			const input = "O, nahly dest jiz zviril prach a cila lan ted bezi s houfcem gazel k ukrytum.";
			const expected = "O, náhlý déšť již zvířil prach a čilá laň teď běží s houfcem gazel k úkrytům."; // ok
			assert.strictEqual(restorer.restoreDiacritics(input), expected);
			restorer.dispose();
		});

		test("Danish dictionary restores diacritics", async () => {
			const restorer = new DiacriticRestorer("danish");
			await restorer.initialize();
			const input = "Quizdeltagerne spiste jordbaer med flode, mens cirkusklovnen Walther spillede pa xylofon.";
			const expected = "Quizdeltagerne spiste jordbær med fløde, mens cirkusklovnen Walther spillede på xylofon."; // ok
			assert.strictEqual(restorer.restoreDiacritics(input), expected);
			restorer.dispose();
		});

		test("French dictionary restores diacritics", async () => {
			const restorer = new DiacriticRestorer("french");
			await restorer.initialize();
			const input = "Voyez Twix, ce husky blond qu'on juge parfume.";
			const expected = "Voyez Twix, ce husky blond qu'on juge parfumé."; // ok
			assert.strictEqual(restorer.restoreDiacritics(input), expected);
			restorer.dispose();
		});

		test("German dictionary restores diacritics", async () => {
			const restorer = new DiacriticRestorer("german");
			await restorer.initialize();
			const input = "Victor jagt zwolf Boxkampfer quer uber den Sylter Deich.";
			const expected = "Victor jagt zwölf Boxkämpfer quer über den Sylter Deich."; // ok
			assert.strictEqual(restorer.restoreDiacritics(input), expected);
			restorer.dispose();
		});

		test("Hungarian dictionary restores diacritics", async () => {
			const restorer = new DiacriticRestorer("hungarian");
			await restorer.initialize();
			const input = "Arvizturo tukorfurogep.";
			const expected = "Árvíztűrő tükörfúrógép."; // ok
			assert.strictEqual(restorer.restoreDiacritics(input), expected);
			restorer.dispose();
		});

		test("Polish dictionary restores diacritics", async () => {
			const restorer = new DiacriticRestorer("polish");
			await restorer.initialize();
			const input = "Pchnac w te lodz jeza lub osm skrzyn fig.";
			const expected = "Pchnąć w tę łódź jeża lub ośm skrzyń fig."; // ok
			assert.strictEqual(restorer.restoreDiacritics(input), expected);
			restorer.dispose();
		});

		test("Slovak dictionary restores diacritics", async () => {
			const restorer = new DiacriticRestorer("slovak");
			await restorer.initialize();
			const input = "Pattyzdnove vlcata nervozne stekaju na mojho datla v trni.";
			const expected = "Päťtýždňové vĺčatá nervózne štekajú na môjho ďatľa v tŕní."; // ok
			assert.strictEqual(restorer.restoreDiacritics(input), expected);
			restorer.dispose();
		});

		test("Spanish dictionary restores diacritics", async () => {
			const restorer = new DiacriticRestorer("spanish");
			await restorer.initialize();
			const input = "Un jugoso zumo de pina y kiwi bien frio es exquisito y no lleva alcohol.";
			const expected = "Un jugoso zumo de piña y kiwi bien frío es exquisito y no lleva alcohol."; // ok
			assert.strictEqual(restorer.restoreDiacritics(input), expected);
			restorer.dispose();
		});

		test("Swedish dictionary restores diacritics", async () => {
			const restorer = new DiacriticRestorer("swedish");
			await restorer.initialize();
			const input = "Flygande backasiner soka hwila pa mjuka tuvor.";
			const expected = "Flygande bäckasiner söka hwila på mjuka tuvor."; // ok
			assert.strictEqual(restorer.restoreDiacritics(input), expected);
			restorer.dispose();
		});
	});
});

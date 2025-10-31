"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode2 = __toESM(require("vscode"));
var path = __toESM(require("path"));

// src/utils.ts
var vscode = __toESM(require("vscode"));
function replaceAccents(text, charMappings = {}) {
  if (!text || typeof text !== "string") {
    return text;
  }
  try {
    let normalized = text.normalize("NFD");
    normalized = normalized.replace(/[\u0300-\u036f]/g, "");
    return Array.from(normalized).map((char) => charMappings[char] || char).join("");
  } catch (error) {
    return text;
  }
}
function validateSpecialCharacterMappings(mappings) {
  if (!mappings || typeof mappings !== "object") {
    return vscode.l10n.t("Invalid mappings: Not an object.");
  }
  for (const [key, value] of Object.entries(mappings)) {
    if (typeof key !== "string" || key.length !== 1) {
      return vscode.l10n.t('Invalid key: "{key}". Keys must be single characters.', { key });
    }
    if (typeof value !== "string") {
      return vscode.l10n.t('Invalid value for key "${key}": "${value}". Values must be strings.', { key, value });
    }
  }
  return "";
}

// src/dictionaries/czech.ts
var czech = {
  code: "cs",
  name: "Czech",
  commonWords: {
    "cesky": "\u010Desk\xFD",
    "ceska": "\u010Desk\xE1",
    "ceske": "\u010Desk\xE9",
    "reka": "\u0159eka",
    "zena": "\u017Eena",
    "muz": "mu\u017E",
    "dite": "d\xEDt\u011B",
    "skola": "\u0161kola",
    "kniha": "kniha",
    "dum": "d\u016Fm",
    "stul": "st\u016Fl",
    "zidle": "\u017Eidle",
    "dvere": "dve\u0159e",
    "mesto": "m\u011Bsto",
    "stat": "st\xE1t",
    "vlada": "vl\xE1da",
    "politika": "politika",
    "ekonomika": "ekonomika",
    "pratel": "p\u0159\xEDtel",
    "tyden": "t\xFDden",
    "mesic": "m\u011Bs\xEDc",
    "cas": "\u010Das",
    "vcera": "v\u010Dera",
    "zitra": "z\xEDtra",
    "maly": "mal\xFD",
    "velky": "velk\xFD",
    "novy": "nov\xFD",
    "stary": "star\xFD",
    "dobry": "dobr\xFD",
    "spatny": "\u0161patn\xFD",
    "krasny": "kr\xE1sn\xFD",
    "tezky": "t\u011B\u017Ek\xFD",
    "lehky": "lehk\xFD"
  },
  patterns: [
    "\\b(a|s|v|z|o|u|k|se|na|po|pro)\\b",
    "\\b(je|jsem|jsi|je|jsme|jste|jsou)\\b",
    "\\b(ten|ta|to|ti|ty|t\xE9)\\b",
    "(\xE1|\u010D|\u010F|\xE9|\u011B|\xED|\u0148|\xF3|\u0159|\u0161|\u0165|\xFA|\u016F|\xFD|\u017E)"
  ],
  stopWords: ["a", "s", "v", "z", "o", "u", "k", "se", "na", "po", "pro", "je", "jsem", "jsi", "jsme", "jste", "jsou"],
  accentChars: ["\xE1", "\u010D", "\u010F", "\xE9", "\u011B", "\xED", "\u0148", "\xF3", "\u0159", "\u0161", "\u0165", "\xFA", "\u016F", "\xFD", "\u017E"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};
var czech_default = czech;

// src/dictionaries/german.ts
var german = {
  code: "de",
  name: "German",
  commonWords: {
    "schon": "sch\xF6n",
    "fruh": "fr\xFCh",
    "spat": "sp\xE4t",
    "gross": "gro\xDF",
    "grusse": "gr\xFC\xDFe",
    "fur": "f\xFCr",
    "uber": "\xFCber",
    "ausser": "au\xDFer",
    "mussen": "m\xFCssen",
    "konnen": "k\xF6nnen",
    "durfen": "d\xFCrfen",
    "wollen": "wollen",
    "sollen": "sollen",
    "mogen": "m\xF6gen",
    "masse": "ma\xDFe",
    "strasse": "stra\xDFe",
    "flusse": "fl\xFCsse",
    "busse": "bu\xDFe",
    "kusse": "k\xFCsse",
    "fusse": "f\xFC\xDFe",
    "hauser": "h\xE4user",
    "baume": "b\xE4ume",
    "universitat": "universit\xE4t"
  },
  patterns: [
    "\\b(der|die|das|und|in|zu|den|von|mit|sich)\\b",
    "\\b(ist|sind|war|waren|bin|bist|sind)\\b",
    "\\b(ein|eine|einer|einem|einen)\\b",
    "(\xE4|\xF6|\xFC|\xDF)"
  ],
  stopWords: ["der", "die", "das", "und", "in", "zu", "den", "von", "mit", "sich", "ist", "sind", "ein", "eine"],
  accentChars: ["\xE4", "\xF6", "\xFC", "\xDF"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};
var german_default = german;

// src/dictionaries/spanish.ts
var spanish = {
  code: "es",
  name: "Spanish",
  commonWords: {
    "mas": "m\xE1s",
    "si": "s\xED",
    "tu": "t\xFA",
    "el": "\xE9l",
    "se": "s\xE9",
    "ano": "a\xF1o",
    "nino": "ni\xF1o",
    "nina": "ni\xF1a",
    "ninos": "ni\xF1os",
    "ninas": "ni\xF1as",
    "senor": "se\xF1or",
    "senora": "se\xF1ora",
    "senorita": "se\xF1orita",
    "senores": "se\xF1ores",
    "manana": "ma\xF1ana",
    "espanol": "espa\xF1ol",
    "espanola": "espa\xF1ola",
    "espanoles": "espa\xF1oles",
    "como": "c\xF3mo",
    "donde": "d\xF3nde",
    "cuando": "cu\xE1ndo",
    "que": "qu\xE9",
    "quien": "qui\xE9n",
    "cual": "cu\xE1l",
    "tambien": "tambi\xE9n",
    "acion": "aci\xF3n",
    "razon": "raz\xF3n",
    "corazon": "coraz\xF3n",
    "habia": "hab\xEDa",
    "estaba": "estaba",
    "puede": "puede",
    "explicacion": "explicaci\xF3n",
    "nacion": "naci\xF3n",
    "educacion": "educaci\xF3n",
    "informacion": "informaci\xF3n",
    "atencion": "atenci\xF3n",
    "canon": "can\xF3n",
    "joven": "j\xF3ven",
    "unico": "\xFAnico",
    "unica": "\xFAnica",
    "publico": "p\xFAblico",
    "publica": "p\xFAblica",
    "politica": "pol\xEDtica",
    "economica": "econ\xF3mica",
    "historico": "hist\xF3rico",
    "importante": "importante",
    "diferente": "diferente",
    "pequeno": "peque\xF1o",
    "ultimo": "\xFAltimo"
  },
  patterns: [
    "\\b(el|la|los|las|un|una|de|del|y|o|con|por|para|sin)\\b",
    "\\b(es|son|esta|est\xE1n|era|eres|soy|somos)\\b",
    "\\b(que|como|donde|cuando|porque)\\b",
    "(\xE1|\xE9|\xED|\xF3|\xFA|\xF1|\xFC)"
  ],
  stopWords: ["el", "la", "de", "y", "en", "que", "con", "por", "para", "un", "una", "los", "las", "del", "al"],
  accentChars: ["\xE1", "\xE9", "\xED", "\xF3", "\xFA", "\xF1", "\xFC"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};
var spanish_default = spanish;

// src/dictionaries/french.ts
var french = {
  code: "fr",
  name: "French",
  commonWords: {
    "ou": "o\xF9",
    "des": "d\xE8s",
    "la": "l\xE0",
    "etre": "\xEAtre",
    "ete": "\xE9t\xE9",
    "deja": "d\xE9j\xE0",
    "cafe": "caf\xE9",
    "fete": "f\xEAte",
    "tete": "t\xEAte",
    "hopital": "h\xF4pital",
    "hotel": "h\xF4tel",
    "francais": "fran\xE7ais",
    "fenetre": "fen\xEAtre",
    "foret": "for\xEAt",
    "meme": "m\xEAme",
    "du": "d\xFB",
    "sur": "s\xFBr",
    "je": "j'ai",
    "creme": "cr\xE8me",
    "prefet": "pr\xE9fet",
    "repetition": "r\xE9p\xE9tition",
    "severement": "s\xE9v\xE8rement",
    "temoin": "t\xE9moin",
    "appareil": "appareil",
    "tache": "t\xE2che",
    "recit": "r\xE9cit",
    "debut": "d\xE9but",
    "role": "r\xF4le"
  },
  patterns: [
    "\\b(le|la|les|un|une|des|de|du|au|aux|je|tu|il|elle|nous|vous|ils|elles)\\b",
    "\\b(est|sont|avez|avoir|etait|serait|peut|doit)\\b",
    "\\b(mais|ou|et|donc|or|ni|car)\\b",
    "(\xE9|\xE8|\xEA|\xEB|\xE0|\xE2|\xF9|\xFB|\xEE|\xEF|\xF4|\xE7)"
  ],
  stopWords: ["le", "la", "les", "de", "et", "est", "des", "un", "une", "du", "au", "aux", "je", "tu"],
  accentChars: ["\xE9", "\xE8", "\xEA", "\xEB", "\xE0", "\xE2", "\xF9", "\xFB", "\xEE", "\xEF", "\xF4", "\xE7"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};
var french_default = french;

// src/dictionaries/hungarian.ts
var hungarian = {
  code: "hu",
  name: "Hungarian",
  commonWords: {
    "elet": "\xE9let",
    "ev": "\xE9v",
    "ut": "\xFAt",
    "ido": "id\u0151",
    "ora": "\xF3ra",
    "varos": "v\xE1ros",
    "orszag": "orsz\xE1g",
    "helyen": "helyen",
    "altal": "\xE1ltal",
    "mar": "m\xE1r",
    "barat": "bar\xE1t",
    "szulo": "sz\xFCl\u0151",
    "het": "h\xE9t",
    "honap": "h\xF3nap",
    "viz": "v\xEDz",
    "konyv": "k\xF6nyv",
    "var": "v\xE1r",
    "fold": "f\xF6ld",
    "egesz": "eg\xE9sz",
    "uj": "\xFAj",
    "regi": "r\xE9gi",
    "jo": "j\xF3",
    "szep": "sz\xE9p",
    "bator": "b\xE1tor",
    "keso": "k\xE9s\u0151",
    "koran": "kor\xE1n",
    "nehez": "neh\xE9z",
    "konnyu": "k\xF6nny\u0171",
    "szukseges": "sz\xFCks\xE9ges",
    "teszta": "t\xE9szta",
    "almas": "alm\xE1s",
    "kalacs": "kal\xE1cs"
  },
  patterns: [
    "\\b(a|az|egy|\xE9s|is|van|volt|lesz|megy|j\xF6n)\\b",
    "\\b(mert|hogy|mert|de|\xE9s|vagy|hanem|pedig)\\b",
    "(\xE1|\xE9|\xED|\xF3|\xF6|\u0151|\xFA|\xFC|\u0171)"
  ],
  stopWords: ["a", "az", "\xE9s", "is", "van", "volt", "mert", "hogy", "de", "egy", "ez", "meg", "vagy"],
  accentChars: ["\xE1", "\xE9", "\xED", "\xF3", "\xF6", "\u0151", "\xFA", "\xFC", "\u0171"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};
var hungarian_default = hungarian;

// src/dictionaries/portuguese.ts
var portuguese = {
  code: "pt",
  name: "Portuguese",
  commonWords: {
    "voce": "voc\xEA",
    "nao": "n\xE3o",
    "esta": "est\xE1",
    "sao": "s\xE3o",
    "portugues": "portugu\xEAs",
    "aviao": "avi\xE3o",
    "acao": "a\xE7\xE3o",
    "coracao": "cora\xE7\xE3o",
    "alemao": "alem\xE3o",
    "cao": "c\xE3o",
    "maos": "m\xE3os",
    "irmao": "irm\xE3o",
    "comecao": "come\xE7\xE3o",
    "pais": "pa\xEDs",
    "atraves": "atrav\xE9s",
    "tambem": "tamb\xE9m",
    "algum": "alg\xFAn",
    "nenhum": "nenh\xFAn",
    "comum": "com\xFAn",
    "futuro": "futuro",
    "passado": "passado",
    "presente": "presente",
    "gostaria": "gostaria",
    "dizer": "dizer",
    "ficar": "ficar",
    "ha": "h\xE1",
    "la": "l\xE1",
    "ca": "c\xE1",
    "so": "s\xF3",
    "ate": "at\xE9",
    "crianca": "crian\xE7a",
    "agua": "\xE1gua"
  },
  patterns: [
    "\\b(o|a|os|as|um|uma|de|do|da|e|em|no|na)\\b",
    "\\b(\xE9|s\xE3o|est\xE1|est\xE3o|era|foi|sou)\\b",
    "(\xE3|\xF5|\xE2|\xEA|\xF4|\xE1|\xE9|\xED|\xF3|\xFA|\xE7)"
  ],
  stopWords: ["o", "a", "de", "e", "em", "um", "uma", "os", "as", "do", "da", "no", "na"],
  accentChars: ["\xE1", "\xE2", "\xE3", "\xE9", "\xEA", "\xED", "\xF3", "\xF4", "\xF5", "\xFA", "\xE7"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};
var portuguese_default = portuguese;

// src/dictionaries/slovak.ts
var slovak = {
  code: "sk",
  name: "Slovak",
  commonWords: {
    "slovensky": "slovensk\xFD",
    "slovenska": "slovensk\xE1",
    "slovenske": "slovensk\xE9",
    "rieka": "rieka",
    "zena": "\u017Eena",
    "muz": "mu\u017E",
    "dieta": "die\u0165a",
    "skola": "\u0161kola",
    "kniha": "kniha",
    "stol": "st\xF4l",
    "stolica": "stoli\u010Dka",
    "stat": "\u0161t\xE1t",
    "vlada": "vl\xE1da",
    "politika": "politika",
    "ekonomia": "ekon\xF3mia",
    "kultura": "kult\xFAra",
    "historia": "hist\xF3ria",
    "priatel": "priate\u013E",
    "den": "de\u0148",
    "tyzden": "t\xFD\u017Ede\u0148",
    "cas": "\u010Das",
    "vcera": "v\u010Dera",
    "maly": "mal\xFD",
    "velky": "ve\u013Ek\xFD",
    "novy": "nov\xFD",
    "stary": "star\xFD",
    "dobry": "dobr\xFD",
    "zly": "zl\xFD",
    "krasny": "kr\xE1sny",
    "tazky": "\u0165a\u017Ek\xFD",
    "lahky": "\u013Eahk\xFD"
  },
  patterns: [
    "\\b(a|s|v|z|o|u|k|sa|na|po|pre)\\b",
    "\\b(je|som|si|je|sme|ste|s\xFA)\\b",
    "\\b(ten|ta|to|ti|ty|t\xE9)\\b",
    "(\xE1|\xE4|\u010D|\u010F|\xE9|\xED|\u013A|\u013E|\u0148|\xF3|\xF4|\u0155|\u0161|\u0165|\xFA|\xFD|\u017E)"
  ],
  stopWords: ["a", "s", "v", "z", "o", "u", "k", "sa", "na", "po", "pre", "je", "som", "si", "sme", "ste", "s\xFA"],
  accentChars: ["\xE1", "\xE4", "\u010D", "\u010F", "\xE9", "\xED", "\u013A", "\u013E", "\u0148", "\xF3", "\xF4", "\u0155", "\u0161", "\u0165", "\xFA", "\xFD", "\u017E"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};
var slovak_default = slovak;

// src/dictionaries/index.ts
var dictionaries = {
  czech: czech_default,
  german: german_default,
  spanish: spanish_default,
  french: french_default,
  hungarian: hungarian_default,
  portuguese: portuguese_default,
  slovak: slovak_default
};

// src/accent_restore.ts
var AccentRestorer = class {
  loadedDictionaries = /* @__PURE__ */ new Map();
  customDictionary = /* @__PURE__ */ new Map();
  preloadedLanguages = /* @__PURE__ */ new Set();
  constructor(preloadLanguages = ["fr", "es", "hu"]) {
    this.preloadedLanguages = new Set(preloadLanguages);
    this.initializeSync();
  }
  /**
   * Synchronous initialization with pre-bundled dictionaries
   */
  initializeSync() {
    this.preloadedLanguages.forEach((lang) => {
      this.loadLanguageSync(lang);
    });
  }
  /**
   * Synchronous language loading from pre-bundled dictionaries
   */
  loadLanguageSync(languageCode) {
    try {
      const dictionary = dictionaries[languageCode];
      if (dictionary) {
        this.loadedDictionaries.set(languageCode, dictionary);
        return true;
      }
    } catch (error) {
      console.warn(`Failed to load dictionary for ${languageCode}:`, error);
    }
    return false;
  }
  /**
   * Language detection (synchronous)
   */
  detectLanguages(text) {
    const scores = /* @__PURE__ */ new Map();
    const words = text.toLowerCase().split(/\s+/);
    this.loadedDictionaries.forEach((config, code) => {
      scores.set(code, 0);
    });
    words.forEach((word) => {
      if (word.length < 2) {
        return;
      }
      this.loadedDictionaries.forEach((config, code) => {
        let wordScore = 0;
        if (config.stopWords.includes(word.toLowerCase())) {
          wordScore += 3;
        }
        if (config.commonWords && config.commonWords[word.toLowerCase()]) {
          wordScore += 5;
        }
        config.patterns.forEach((patternStr) => {
          const pattern = new RegExp(patternStr, "gi");
          if (word.match(pattern)) {
            wordScore += 2;
          }
        });
        if (config.accentChars.length > 0) {
          const accentPattern = new RegExp(`[${config.accentChars.join("")}]`);
          if (accentPattern.test(word)) {
            wordScore += 4;
          }
        }
        scores.set(code, scores.get(code) + wordScore);
      });
    });
    this.loadedDictionaries.forEach((config, code) => {
      let patternScore = 0;
      config.patterns.forEach((patternStr) => {
        const pattern = new RegExp(patternStr, "gi");
        const matches = text.match(pattern);
        if (matches) {
          patternScore += matches.length;
        }
      });
      if (config.accentChars.length > 0) {
        const accentPattern = new RegExp(`[${config.accentChars.join("")}]`, "g");
        const accentMatches = text.match(accentPattern);
        if (accentMatches) {
          patternScore += accentMatches.length * 2;
        }
      }
      scores.set(code, scores.get(code) + patternScore);
    });
    const detected = Array.from(scores.entries()).filter(([, score]) => score > 2).sort(([, a], [, b]) => b - a).map(([code]) => code);
    return detected.length > 0 ? detected : Array.from(this.preloadedLanguages).slice(0, 3);
  }
  /**
   * Preserve case when replacing words
   */
  preserveCase(original, replacement) {
    if (!original || !replacement) {
      return original;
    }
    if (original === original.toUpperCase()) {
      return replacement.toUpperCase();
    }
    if (original[0] === original[0].toUpperCase()) {
      return replacement[0].toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }
  /**
   * Dictionary lookup across loaded languages
   */
  dictionaryLookup(word, languages) {
    const lowerWord = word.toLowerCase();
    if (this.customDictionary.has(lowerWord)) {
      return this.customDictionary.get(lowerWord);
    }
    for (const lang of languages) {
      const dict = this.loadedDictionaries.get(lang);
      if (dict && dict.commonWords && dict.commonWords[lowerWord]) {
        return dict.commonWords[lowerWord];
      }
    }
    return null;
  }
  /**
   * Main restoration function (synchronous)
   */
  restore(text, targetLanguages) {
    if (!text || text.trim().length === 0) {
      return text;
    }
    const languages = targetLanguages || this.detectLanguages(text);
    console.log(`Detected languages: ${languages.join(", ")}`);
    languages.forEach((lang) => {
      if (!this.loadedDictionaries.has(lang)) {
        this.loadLanguageSync(lang);
      }
    });
    const result = text.replace(/\b[\wÀ-ÿ']+\b/g, (word) => {
      if (word.length < 2 || /[À-ÿ]/.test(word)) {
        return word;
      }
      const englishWords = ["the", "and", "for", "are", "but", "not", "you", "all", "can", "your", "with", "have", "this", "that", "was", "from"];
      if (englishWords.includes(word.toLowerCase())) {
        return word;
      }
      const dictMatch = this.dictionaryLookup(word, languages);
      if (dictMatch) {
        return this.preserveCase(word, dictMatch);
      }
      return word;
    });
    return result;
  }
  /**
   * Train with custom examples
   */
  train(examples) {
    examples.forEach(({ plain, accented, language }) => {
      const key = plain.toLowerCase();
      this.customDictionary.set(key, accented);
      if (language && this.loadedDictionaries.has(language)) {
        const dict = this.loadedDictionaries.get(language);
        dict.commonWords[key] = accented;
      }
    });
  }
  /**
   * Get statistics about loaded dictionaries
   */
  getStats() {
    let totalDictionarySize = 0;
    const loadedLanguages = [];
    const supportedLanguages = [];
    this.loadedDictionaries.forEach((dict, code) => {
      const wordCount = Object.keys(dict.commonWords).length;
      totalDictionarySize += wordCount;
      supportedLanguages.push(`${dict.name} (${code})`);
      if (wordCount > 0) {
        loadedLanguages.push(code);
      }
    });
    totalDictionarySize += this.customDictionary.size;
    return {
      languages: this.loadedDictionaries.size,
      dictionarySize: totalDictionarySize,
      loadedLanguages,
      supportedLanguages
    };
  }
  /**
   * Check if a language dictionary is loaded
   */
  isLanguageLoaded(languageCode) {
    return this.loadedDictionaries.has(languageCode);
  }
  /**
   * Get list of supported language codes
   */
  getSupportedLanguages() {
    return Object.keys(dictionaries);
  }
  /**
   * Preload additional languages
   */
  preloadLanguages(languageCodes) {
    languageCodes.forEach((code) => {
      if (!this.loadedDictionaries.has(code)) {
        this.loadLanguageSync(code);
      }
    });
  }
};

// src/extension.ts
function activate(context) {
  let CommandId;
  ((CommandId2) => {
    CommandId2["ReportIssue"] = "ps-replace-accents.reportIssue";
    CommandId2["ReplaceAccents"] = "ps-replace-accents.replaceAccents";
    CommandId2["ReplaceAccentsFileOrFolder"] = "ps-replace-accents.replaceAccentsFileOrFolder";
    CommandId2["RestoreAccents"] = "ps-replace-accents.restoreAccents";
  })(CommandId || (CommandId = {}));
  const processTextInEditor = async (transformFn, expandToFullLines = false, options) => {
    const editor = vscode2.window.activeTextEditor;
    if (!editor) {
      return -1;
    }
    const document = editor.document;
    const selections = editor.selections;
    if (!selections.length || selections.every((s) => s.isEmpty)) {
      const entireDocumentRange = new vscode2.Range(
        0,
        0,
        document.lineCount - 1,
        document.lineAt(document.lineCount - 1).text.length
      );
      const text = document.getText(entireDocumentRange);
      const processedText = transformFn(text, options);
      await editor.edit((editBuilder) => {
        editBuilder.replace(entireDocumentRange, processedText);
      });
      return 1;
    }
    await editor.edit((editBuilder) => {
      for (const selection of selections) {
        if (selection.isEmpty) {
          continue;
        }
        let rangeToProcess = selection;
        if (expandToFullLines) {
          const startLine = document.lineAt(selection.start.line);
          const endLine = document.lineAt(selection.end.line);
          rangeToProcess = new vscode2.Selection(startLine.range.start, endLine.range.end);
        }
        const selectedText = document.getText(rangeToProcess);
        const processedText = transformFn(selectedText, options);
        editBuilder.replace(rangeToProcess, processedText);
      }
    });
    return 0;
  };
  const replaceAccentsFileOrFolder = async (uri, userMappings) => {
    const oldPath = uri.fsPath;
    const itemName = path.basename(oldPath);
    const parentPath = path.dirname(oldPath);
    const itemNameWithoutAccent = replaceAccents(itemName, userMappings);
    if (itemNameWithoutAccent.trim().length === 0) {
      return;
    }
    if (itemName === itemNameWithoutAccent) {
      vscode2.window.showWarningMessage(
        vscode2.l10n.t("No diacritics were removed from '{0}'.", itemName)
      );
      return;
    }
    const newPath = path.join(parentPath, itemNameWithoutAccent);
    const newUri = vscode2.Uri.file(newPath);
    let shouldOverwrite = false;
    try {
      await vscode2.workspace.fs.stat(newUri);
      const overwritePrompt = await vscode2.window.showWarningMessage(
        vscode2.l10n.t("'{0}' already exists. Do you want to overwrite it?", itemNameWithoutAccent),
        { modal: true },
        vscode2.l10n.t("Yes"),
        vscode2.l10n.t("No")
      );
      if (overwritePrompt === vscode2.l10n.t("Yes")) {
        shouldOverwrite = true;
      } else if (overwritePrompt === vscode2.l10n.t("No")) {
        return;
      }
    } catch (_) {
    }
    try {
      await vscode2.workspace.fs.rename(uri, vscode2.Uri.file(newPath), { overwrite: shouldOverwrite });
      vscode2.window.showInformationMessage(
        vscode2.l10n.t("Renamed: {0} to {1}", itemName, itemNameWithoutAccent)
      );
    } catch (error) {
      vscode2.window.showErrorMessage(
        vscode2.l10n.t("Failed to rename '{0}': {1}", itemName, error.message)
      );
    }
  };
  const commandHandlers = {
    ["ps-replace-accents.reportIssue" /* ReportIssue */]: () => vscode2.env.openExternal(vscode2.Uri.parse("https://github.com/playfulsparkle/vscode_ps_replace_accents/issues")),
    ["ps-replace-accents.replaceAccents" /* ReplaceAccents */]: async () => {
      const userMappings = vscode2.workspace.getConfiguration("ps-replace-accents").get("specialCharacterMappings", {});
      const userMappingsErrors = validateSpecialCharacterMappings(userMappings);
      if (userMappingsErrors) {
        vscode2.window.showErrorMessage(userMappingsErrors);
        return;
      }
      const allSelectionsEmpty = await processTextInEditor((text) => replaceAccents(text, userMappings));
      let modified = false;
      if (modified) {
        switch (allSelectionsEmpty) {
          case 1:
            vscode2.window.showInformationMessage(vscode2.l10n.t("All accented characters were replaced in the selected text."));
            break;
          case 0:
            vscode2.window.showInformationMessage(vscode2.l10n.t("All accented characters were replaced in the entire document."));
            break;
        }
      }
    },
    ["ps-replace-accents.replaceAccentsFileOrFolder" /* ReplaceAccentsFileOrFolder */]: async (uri, selectedUris) => {
      if (!uri) {
        return;
      }
      const userMappings = vscode2.workspace.getConfiguration("ps-replace-accents").get("specialCharacterMappings", {});
      const userMappingsErrors = validateSpecialCharacterMappings(userMappings);
      if (userMappingsErrors) {
        vscode2.window.showErrorMessage(userMappingsErrors);
        return;
      }
      const urisToRename = selectedUris && selectedUris.length > 0 ? selectedUris : [uri];
      for (const currentUri of urisToRename) {
        await replaceAccentsFileOrFolder(currentUri, userMappings);
      }
      if (urisToRename.length > 1) {
        vscode2.window.showInformationMessage(
          vscode2.l10n.t("Diacritics removed from {0} items.", urisToRename.length)
        );
      }
    },
    ["ps-replace-accents.restoreAccents" /* RestoreAccents */]: async () => {
      const restorer = new AccentRestorer();
      await processTextInEditor((text) => restorer.restore(text));
    }
  };
  for (const [commandId, handler] of Object.entries(commandHandlers)) {
    const disposable = vscode2.commands.registerCommand(commandId, handler);
    context.subscriptions.push(disposable);
  }
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map

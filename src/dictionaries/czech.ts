const czech = {
  code: "cs",
  name: "Czech",
  commonWords: {
    "cesky": "český",
    "ceska": "česká",
    "ceske": "české",
    "reka": "řeka",
    "zena": "žena",
    "muz": "muž",
    "dite": "dítě",
    "skola": "škola",
    "kniha": "kniha",
    "dum": "dům",
    "stul": "stůl",
    "zidle": "židle",
    "dvere": "dveře",
    "mesto": "město",
    "stat": "stát",
    "vlada": "vláda",
    "politika": "politika",
    "ekonomika": "ekonomika",
    "pratel": "přítel",
    "tyden": "týden",
    "mesic": "měsíc",
    "cas": "čas",
    "vcera": "včera",
    "zitra": "zítra",
    "maly": "malý",
    "velky": "velký",
    "novy": "nový",
    "stary": "starý",
    "dobry": "dobrý",
    "spatny": "špatný",
    "krasny": "krásný",
    "tezky": "těžký",
    "lehky": "lehký"
  },
  patterns: [
    "\\b(a|s|v|z|o|u|k|se|na|po|pro)\\b",
    "\\b(je|jsem|jsi|je|jsme|jste|jsou)\\b",
    "\\b(ten|ta|to|ti|ty|té)\\b",
    "(á|č|ď|é|ě|í|ň|ó|ř|š|ť|ú|ů|ý|ž)"
  ],
  stopWords: ["a", "s", "v", "z", "o", "u", "k", "se", "na", "po", "pro", "je", "jsem", "jsi", "jsme", "jste", "jsou"],
  accentChars: ["á", "č", "ď", "é", "ě", "í", "ň", "ó", "ř", "š", "ť", "ú", "ů", "ý", "ž"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};

export default czech;
const slovak = {
  code: "sk",
  name: "Slovak",
  commonWords: {
    "slovensky": "slovenský",
    "slovenska": "slovenská",
    "slovenske": "slovenské",
    "rieka": "rieka",
    "zena": "žena",
    "muz": "muž",
    "dieta": "dieťa",
    "skola": "škola",
    "kniha": "kniha",
    "stol": "stôl",
    "stolica": "stolička",
    "stat": "štát",
    "vlada": "vláda",
    "politika": "politika",
    "ekonomia": "ekonómia",
    "kultura": "kultúra",
    "historia": "história",
    "priatel": "priateľ",
    "den": "deň",
    "tyzden": "týždeň",
    "cas": "čas",
    "vcera": "včera",
    "maly": "malý",
    "velky": "veľký",
    "novy": "nový",
    "stary": "starý",
    "dobry": "dobrý",
    "zly": "zlý",
    "krasny": "krásny",
    "tazky": "ťažký",
    "lahky": "ľahký"
  },
  patterns: [
    "\\b(a|s|v|z|o|u|k|sa|na|po|pre)\\b",
    "\\b(je|som|si|je|sme|ste|sú)\\b",
    "\\b(ten|ta|to|ti|ty|té)\\b",
    "(á|ä|č|ď|é|í|ĺ|ľ|ň|ó|ô|ŕ|š|ť|ú|ý|ž)"
  ],
  stopWords: ["a", "s", "v", "z", "o", "u", "k", "sa", "na", "po", "pre", "je", "som", "si", "sme", "ste", "sú"],
  accentChars: ["á", "ä", "č", "ď", "é", "í", "ĺ", "ľ", "ň", "ó", "ô", "ŕ", "š", "ť", "ú", "ý", "ž"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};

export default slovak;
const german = {
  code: "de",
  name: "German",
  commonWords: {
    "schon": "schön",
    "fruh": "früh",
    "spat": "spät",
    "gross": "groß",
    "grusse": "grüße",
    "fur": "für",
    "uber": "über",
    "ausser": "außer",
    "mussen": "müssen",
    "konnen": "können",
    "durfen": "dürfen",
    "wollen": "wollen",
    "sollen": "sollen",
    "mogen": "mögen",
    "masse": "maße",
    "strasse": "straße",
    "flusse": "flüsse",
    "busse": "buße",
    "kusse": "küsse",
    "fusse": "füße",
    "hauser": "häuser",
    "baume": "bäume",
    "universitat": "universität"
  },
  patterns: [
    "\\b(der|die|das|und|in|zu|den|von|mit|sich)\\b",
    "\\b(ist|sind|war|waren|bin|bist|sind)\\b",
    "\\b(ein|eine|einer|einem|einen)\\b",
    "(ä|ö|ü|ß)"
  ],
  stopWords: ["der", "die", "das", "und", "in", "zu", "den", "von", "mit", "sich", "ist", "sind", "ein", "eine"],
  accentChars: ["ä", "ö", "ü", "ß"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};

export default german;
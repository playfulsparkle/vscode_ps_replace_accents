const french = {
  code: "fr",
  name: "French",
  commonWords: {
    "ou": "où",
    "des": "dès",
    "la": "là",
    "etre": "être",
    "ete": "été",
    "deja": "déjà",
    "cafe": "café",
    "fete": "fête",
    "tete": "tête",
    "hopital": "hôpital",
    "hotel": "hôtel",
    "francais": "français",
    "fenetre": "fenêtre",
    "foret": "forêt",
    "meme": "même",
    "du": "dû",
    "sur": "sûr",
    "je": "j'ai",
    "creme": "crème",
    "prefet": "préfet",
    "repetition": "répétition",
    "severement": "sévèrement",
    "temoin": "témoin",
    "appareil": "appareil",
    "tache": "tâche",
    "recit": "récit",
    "debut": "début",
    "role": "rôle"
  },
  patterns: [
    "\\b(le|la|les|un|une|des|de|du|au|aux|je|tu|il|elle|nous|vous|ils|elles)\\b",
    "\\b(est|sont|avez|avoir|etait|serait|peut|doit)\\b",
    "\\b(mais|ou|et|donc|or|ni|car)\\b",
    "(é|è|ê|ë|à|â|ù|û|î|ï|ô|ç)"
  ],
  stopWords: ["le", "la", "les", "de", "et", "est", "des", "un", "une", "du", "au", "aux", "je", "tu"],
  accentChars: ["é", "è", "ê", "ë", "à", "â", "ù", "û", "î", "ï", "ô", "ç"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};

export default french;
const hungarian = {
  code: "hu",
  name: "Hungarian",
  commonWords: {
    "elet": "élet",
    "ev": "év",
    "ut": "út",
    "ido": "idő",
    "ora": "óra",
    "varos": "város",
    "orszag": "ország",
    "helyen": "helyen",
    "altal": "által",
    "mar": "már",
    "barat": "barát",
    "szulo": "szülő",
    "het": "hét",
    "honap": "hónap",
    "viz": "víz",
    "konyv": "könyv",
    "var": "vár",
    "fold": "föld",
    "egesz": "egész",
    "uj": "új",
    "regi": "régi",
    "jo": "jó",
    "szep": "szép",
    "bator": "bátor",
    "keso": "késő",
    "koran": "korán",
    "nehez": "nehéz",
    "konnyu": "könnyű",
    "szukseges": "szükséges",
    "teszta": "tészta",
    "almas": "almás",
    "kalacs": "kalács"
  },
  patterns: [
    "\\b(a|az|egy|és|is|van|volt|lesz|megy|jön)\\b",
    "\\b(mert|hogy|mert|de|és|vagy|hanem|pedig)\\b",
    "(á|é|í|ó|ö|ő|ú|ü|ű)"
  ],
  stopWords: ["a", "az", "és", "is", "van", "volt", "mert", "hogy", "de", "egy", "ez", "meg", "vagy"],
  accentChars: ["á", "é", "í", "ó", "ö", "ő", "ú", "ü", "ű"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};

export default hungarian;
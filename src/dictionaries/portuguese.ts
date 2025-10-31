const portuguese = {
  code: "pt",
  name: "Portuguese",
  commonWords: {
    "voce": "você",
    "nao": "não",
    "esta": "está",
    "sao": "são",
    "portugues": "português",
    "aviao": "avião",
    "acao": "ação",
    "coracao": "coração",
    "alemao": "alemão",
    "cao": "cão",
    "maos": "mãos",
    "irmao": "irmão",
    "comecao": "começão",
    "pais": "país",
    "atraves": "através",
    "tambem": "também",
    "algum": "algún",
    "nenhum": "nenhún",
    "comum": "común",
    "futuro": "futuro",
    "passado": "passado",
    "presente": "presente",
    "gostaria": "gostaria",
    "dizer": "dizer",
    "ficar": "ficar",
    "ha": "há",
    "la": "lá",
    "ca": "cá",
    "so": "só",
    "ate": "até",
    "crianca": "criança",
    "agua": "água"
  },
  patterns: [
    "\\b(o|a|os|as|um|uma|de|do|da|e|em|no|na)\\b",
    "\\b(é|são|está|estão|era|foi|sou)\\b",
    "(ã|õ|â|ê|ô|á|é|í|ó|ú|ç)"
  ],
  stopWords: ["o", "a", "de", "e", "em", "um", "uma", "os", "as", "do", "da", "no", "na"],
  accentChars: ["á", "â", "ã", "é", "ê", "í", "ó", "ô", "õ", "ú", "ç"],
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15"
  }
};

export default portuguese;
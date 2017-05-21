export class InMemoryStoreService {
  /**
  * Creates fresh copy of data each time.
  * Safe for consuming service to morph arrays and objects.
  */
  createDb() {

    let shelters = [
    {
        "id": 1,
        "name": "Regina Margherita",
        "idCAI": "X1",
        "type": "Rifugio",
        "local": "Varallo Sesia",
        "owner": "CAI sede centrale",
        "category": null,
        "insertDate": null,
        "updateDate": null,
        "geoData": {
            "location": {
                "region": "Piemonte",
                "province": "VC",
                "municipality": "Alagna Valsesia",
                "locality": "Punta Gnifetti",
                "ownerRegion": "Piemonte",
                "authorityJurisdiction": null,
                "altitude": 4554,
                "latitude": 45.97304,
                "longitude": 7.6475900000000365,
                "massif": "Alpi Pennine",
                "valley": null
            },
            "tags": [
                { "key": "Comprensorio sciistico", "value": "" },
                { "key": "Commissione regionale", "value": "LPV" }
            ]
        }
    }
];

    return { shelters };
  }
}

// Servizi ={
//     "Pernottamento": {
//         "Cuccette": 77,
//         "Cuccette invernali": 19,
//         "Cuccette totali": 96,
//         "Tavolato": 0,
//         "Ristorante": null,
//         "Cucinare in proprio": null,
//         "Vendita sacco lenzuolo": null,
//         "Docce": null,
//         "WC in camera": null,
//         "WC uso comune": null
//     },
//     "Acqua e riscaldamento": {
//         "Acqua calda": null,
//         "Acqua in rifugio": null,
//         "Disponibilità acqua": null,
//         "Periodi di siccità": null,
//         "Riscaldamento": null
//     },
//     "Elettricità": {
//         "Elettricità": null,
//         "Punti ricarica spazi comuni": null,
//         "Punti ricarica camere": null
//     },
//     "WIFI e GSM": {
//         "WIFI": null,
//         "Segnale GSM": null,
//         "Gestore telefonia mobile": null
//     },
//     "Accessibilità": {
//         "Accessibilità disabili": null,
//         "Accessibiltà macchina": null,
//         "Accessibilità animali domestici": null,
//         "Quantità stanze dedicate": null
//     },
//     "Altro": {
//         "Pagamento POS": null,
//         "Convenzioni": null,
//         "Richiesta rifornire il rifugio": null
//     }
// }


// Contatti e apertura ={
//     "Contatti": {
//         "Telefono fisso": null,
//         "Cellulare 1": "+39 348 1415490",
//         "Cellulare 2": "+39 348 1415491",
//         "Sito web rifugio": "www.rifugimonterosa.it",
//         "Sito web sezione": "www.cairavallo.it",
//         "PEC": null,
//         "Email": "info@rifugimonterosa.it"
//     },
//     "Apertura": {
//         "Apertura": null,
//         "Apertura su richiesta": null
//     }
// }


// Proprietà e custodia ={
//     "Proprietà": {
//         "Ente": null,
//         "P.IVA": null,
//         "Telefono": null,
//         "PEC": null,
//         "Email": null,
//         "Canone annuale": null,
//         "Tipo canone": null
//     },
//     "Custodia": {
//         "Nome cognome": null,
//         "Telefono fisso": null,
//         "Cellulare": null,
//         "Email": null,
//         "Ritiro chiavi": null
//     }
// }

// Dati catastali ={
//     "Dati catastali e Certificazioni": {
//         "Anno costruzione": 1893,
//         "Anno ristrutturazione": 1980,
//         "Codice catastale": null,
//         "Classe catastale": null,
//         "Regolarità antincendio": null,
//         "Regolarità edilizia": null,
//         "Regolarità urbanistica": null,
//         "Coerenza tipologica": null,
//         "Coerenza materica": null,
//         "Consistenza corpo primario": null,
//         "Consistenza corpo secondario": null,
//         "Certificazione ambientale ISO 14001": true
//     },
//     "Energia": {
//         "Classe energetica": null,
//         "Energia": null,
//         "Fotovoltaico": null,
//         "Generatore diesel": null
//     },
//     "Scarico": {
//         "Tipo scarico": null,
//         "Scarico a norma": null,
//         "Disoleatore": null
//     }
// }
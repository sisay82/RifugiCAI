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
                "branch": "Varallo Sesia",
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
                        { "key": "zona tutelata", "value": "parco" },
                        { "key": "Commissione regionale", "value": "LPV" }
                    ]
                },
                "services": [
                    {
                        "name": "Prenottamento",
                        "category": "Pernottamento e servizi",
                        "description": "Posti letto",
                        "tags": [
                            { "key": "Camerate", "value": "4" },
                            { "key": "Cuccette", "value": "20" },
                            { "key": "Cuccette invernali", "value": "10" },
                            { "key": "Tavolato", "value": "5" },
                            { "key": "Docce", "value": "6" },
                            { "key": "WC in camera", "value": "0" },
                            { "key": "WC uso comune", "value": "3" }
                        ]
                    },
                    {
                        "name": "Ristorazione",
                        "category": "Pernottamento e servizi",
                        "description": "tavoli e servizi di ristorazione",
                        "tags": [
                            { "key": "Ristorante", "value": "true" },
                            { "key": "Accesso alla cucina", "value": "false" },
                        ]
                    },
                    {
                        "name": "Bagni",
                        "category": "Pernottamento e servizi",
                        "description": "Cessi disponibili",
                        "tags": [
                            { "key": "Docce", "value": "6" },
                            { "key": "WC in camera", "value": "0" },
                            { "key": "WC uso comune", "value": "3" }
                        ]
                    },
                    {
                        "name": "altro",
                        "category": "Pernottamento e servizi",
                        "description": "varie ed eventuali",
                        "tags": [
                            { "key": "Vendita sacco lenzuolo", "value": "false" }
                        ]
                    },
                    {
                        "service_name": "Acqua e riscaldamento",
                        "service_category": "service_cat1",
                        "description": "d1",
                        "options": [
                            "Acqua in rifugio",
                            "Acqua calda"
                        ],
                        "tags": [
                            {
                                "key": "Disponibilit� acqua",
                                "value": "Costante"
                            },
                            {
                                "key": "Periodi di siccit�",
                                "value": "Estate"
                            },
                            {
                                "key": "Riscaldamento",
                                "value": "Legna"
                            }
                        ]
                    },
                    {
                        "service_name": "Elettricit�",
                        "service_category": "service_cat1",
                        "description": "d1",
                        "options": [
                            "Elettricit�"
                        ],
                        "tags": [
                            {
                                "key": "Punti ricarica spazi comuni",
                                "value": "5"
                            },
                            {
                                "key": "Punti ricarica camere",
                                "value": "2"
                            }
                        ]
                    },
                    {
                        "service_name": "WIFI e GSM",
                        "service_category": "service_cat1",
                        "description": "d1",
                        "options": [
                            "WIFI"
                        ],
                        "tags": [
                            {
                                "key": "Segnale GSM",
                                "value": "E"
                            },
                            {
                                "key": "Gestore telefonia mobile",
                                "value": "Vodafone"
                            }
                        ]
                    },
                    {
                        "service_name": "Accessibilit�",
                        "service_category": "service_cat1",
                        "description": "d1",
                        "options": [
                            "Accessibilit� disabili",
                            "Accessibilit� macchina",
                            "Accesso animali domestici"
                        ]
                    }
                ]
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



let rifugio = {
    "_id": "5943fbc81436630012cf70d9",
    "name": "sheNNN",
    "registry": {
        "address": {
            "district": "Provincia4",
            "country": "Regione4",
            "collective": "Comune4",
            "city": "city4",
            "cap": 4,
            "number": 4,
            "via4": "via1"
        },
        "_id": "59451ec9a1a1bd3c98f8fdf1",
        "insert_date": "2017-06-17T12:21:29.337Z"
    },
    "__v": 3,
    "services": [
        {
            "_id": "5946968a4c580300121e7041",
            "service_name": "servicN",
            "service_category": "service_cat1",
            "description": "d1",
            "__v": 0,
            "options": [
                "o1",
                "o2"
            ],
            "tags": [
                {
                    "key": "key1",
                    "value": "value1",
                    "_id": "59451ec9a1a1bd3c98f8fdf4"
                },
                {
                    "key": "key2",
                    "value": "value2",
                    "_id": "59451ec9a1a1bd3c98f8fdf3"
                }
            ]
        },
        {
            "_id": "5946968a4c580300121e7042",
            "service_name": "serviNNN",
            "service_category": "service_cat2",
            "description": "d2",
            "__v": 0,
            "options": [],
            "tags": [
                {
                    "key": "key1",
                    "value": "value1",
                    "_id": "59451ec9a1a1bd3c98f8fdf7"
                },
                {
                    "key": "key2",
                    "value": "value2",
                    "_id": "59451ec9a1a1bd3c98f8fdf6"
                }
            ]
        },
        {
            "_id": "594696ba4c580300121e7044",
            "service_name": "servicN",
            "service_category": "service_cat1",
            "description": "d1",
            "__v": 0,
            "options": [
                "o1",
                "o2"
            ],
            "tags": [
                {
                    "key": "key1",
                    "value": "value1",
                    "_id": "59451ec9a1a1bd3c98f8fdf4"
                },
                {
                    "key": "key2",
                    "value": "value2",
                    "_id": "59451ec9a1a1bd3c98f8fdf3"
                }
            ]
        },
        {
            "_id": "594696ba4c580300121e7045",
            "service_name": "serviNNN",
            "service_category": "service_cat2",
            "description": "d2",
            "__v": 0,
            "options": [],
            "tags": [
                {
                    "key": "key1",
                    "value": "value1",
                    "_id": "59451ec9a1a1bd3c98f8fdf7"
                },
                {
                    "key": "key2",
                    "value": "value2",
                    "_id": "59451ec9a1a1bd3c98f8fdf6"
                }
            ]
        }
    ],
    "logs": []
}
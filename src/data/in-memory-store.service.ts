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
                            { "key": "Vendita sacco lenzuolo", "value": "false" }
                        ]
                    },
                    {
                        "name": "Ristorazione",
                        "category": "Pernottamento e servizi",
                        "description": "Ristorazione e tavoli",
                        "tags": [
                            { "key": "Ristorante", "value": "true" },
                            { "key": "Accesso alla cucina", "value": "false" },
                            { "key": "Tavolato", "value": "5" }
                        ]
                    },
                    {
                        "name": "Servizi igienici",
                        "category": "Pernottamento e servizi",
                        "description": "Bagni e docce",
                        "tags": [
                            { "key": "Docce", "value": "6" },
                            { "key": "WC in camera", "value": "0" },
                            { "key": "WC uso comune", "value": "3" }
                        ]
                    },
                    {
                        "name": "Acqua",
                        "category": "Acqua e riscaldamento",
                        "description": "Disponibilità di acqua",
                        "tags": [
                            { "key": "Acqua calda", "value": "true" },
                            { "key": "Acqua in rifugio", "value": "true" },
                            { "key": "Disponibilità di acqua", "value": "costante" },
                            { "key": "Periodi di siccità", "value": "estate" }
                        ]
                    },
                    {
                        "name": "Riscaldamento",
                        "category": "Acqua e riscaldamento",
                        "description": "Disponibilità di riscaldamento",
                        "tags": [
                            { "key": "Riscaldamento", "value": "legna" }
                        ]
                    },
                    {
                        "name": "Elettricità",
                        "category": "Elettricità",
                        "description": "Disponibilità di elettricità",
                        "tags": [
                            { "key": "Elettricità", "value": "true" },
                            { "key": "Punti ricarica spazi comuni", "value": "5" },
                            { "key": "Punti ricarica camere", "value": "3" }
                        ]
                    },
                    {
                        "name": "WIFI e GSM",
                        "category": "WIFI e GSM",
                        "description": "Disponibilit� di WIFI e GSM",
                        "tags": [
                            { "key": "WIFI", "value": "true" },
                            { "key": "Segnale GSM", "value": "E" },
                            { "key": "Gestore telefonia mobile", "value": "Vodafone; TIM" }
                        ]
                    },
                    {
                        "name": "Accessibilità",
                        "category": "Accessibilità",
                        "description": null,
                        "tags": [
                            { "key": "Accessibilità disabili", "value": "true" },
                            { "key": "Accessibilità macchina", "value": "true" },
                            { "key": "Accessibilità animali domestici", "value": "true" },
                            { "key": "Quantità stanze dedicate", "value": "2" }
                        ]
                    },
                    {
                        "name": "Informazioni aggiuntive",
                        "category": "Informazioni aggiuntive",
                        "description": null,
                        "tags": [
                            { "key": "Pagamento POS", "value": "true" },
                            { "key": "Convenzioni", "value": "true" },
                            { "key": "Richiesta rifornire il rifugio", "value": "true" }]
                    }
                ],
                "contatti": {
                    "name": "pincopallo",
                    "role": "custode",
                    "fixed_phone": "0522897497",
                    "mobile_phone": "3485954241",
                    "mail_pec": "rifugio_battisti@postecert.it",
                    "email_address": "info@rifugio-battisti.it",
                    "web_address": "http://www.rifugio-battisti.it"
                },
                "openingTime":[
                    {
                        "startDate": "2017-06-17T12:21:29.337Z",
                        "endDate": "2017-10-17T12:21:29.337Z",
                        "type": "Apertura estiva",
                    },
                    {
                        "startDate": "2017-12-17T12:21:29.337Z",
                        "endDate": "2018-01-17T12:21:29.337Z",
                        "type": "Apertura estiva",
                    }
                ]
            }
        ];

        return { shelters };
    }
}


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
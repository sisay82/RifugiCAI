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
                "contacts": {
                    "name": "pincopallo",
                    "role": "custode",
                    "fixed_phone": "0522897497",
                    "mobile_phone": "3485954241",
                    "mail_pec": "rifugio_battisti@postecert.it",
                    "email_address": "info@rifugio-battisti.it",
                    "web_address": "http://www.rifugio-battisti.it"
                },
                "openingTime": [
                    {
                        "startDate": "2017-06-17T12:21:29.337Z",
                        "endDate": "2017-10-17T12:21:29.337Z",
                        "type": "Apertura estiva",
                    },
                    {
                        "startDate": "2017-12-17T12:21:29.337Z",
                        "endDate": "2018-01-17T12:21:29.337Z",
                        "type": "Apertura estiva",
                    },
                    {
                        "startDate": null,
                        "endDate": null,
                        "type": "luglio agosto sempre, ecc.",
                    },
                    {
                        "startDate": null,
                        "endDate": null,
                        "type": "apertura su richiesta",
                    }
                ],
                "management": {
                    "rent": 6000,
                    "period": "annuale",
                    "valuta": "euro",
                    "rentType": "Affitto ramo d'impresa",
                    "pickupKey": "true",
                    "subject": [
                        {
                            "name": "CAI Reggio Emilia",
                            "surname": "",
                            "taxCode": "01845040359",
                            "fixedPhone": "0522436685",
                            "mobilePhone": "",
                            "pec": "caireggioemilia@postecert.it",
                            "email": "info@caireggioemilia.it",
                            "webSite": "http://www.caireggioemilia.it/",
                            "type": "Proprietario"
                        },
                        {
                            "name": "Mascia",
                            "surname": "Foschi",
                            "taxCode": "01845040359",
                            "fixedPhone": "052243325",
                            "mobilePhone": "3485954241",
                            "pec": "",
                            "email": "mascia@gmail.com",
                            "webSite": "",
                            "type": "custode"
                        }
                    ]
                },
                "catastal": {
                    "buildYear": "1950",
                    "rebuildYear": "1989",
                    "code": "A20",
                    "class": "4",
                    "fireRegulation": "true",
                    "buildingRegulation": "true",
                    "cityPlanRegulation": "true",
                    "typologicalCoherence": "piena",
                    "matericalCoherence": "true",
                    "mainBody": "presente",
                    "secondaryBody": "presente",
                    "ISO14001": "true"
                },
                "energy": {
                    "class": "C",
                    "energy": "4500",
                    "photovoltaic": "true",
                    "powerGenerator": "true"
                },
                "drain": {
                    "type": "IMOF fognatura",
                    "regulation": "true",
                    "oilSeparator": "true"
                }
            }
        ];

        return { shelters };
    }
}
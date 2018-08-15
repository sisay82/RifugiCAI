import 'jasmine'
import {
    createCSV,
    getValueForFieldDoc,
    processArrayField,
    processServicesFields,
    transform,
    getCSVDict,
    processFlatArrayNames,
    transformArrayFields,
    getCSVLines,
    parseCSVLines,
    getCSVAliasesOrdered,
    getAliasForField,
    getAliasForPartialField
} from './csv.logic'
import {
    CSV_UNWINDS
} from '../../tools/constants';
import { intersectArray, removeDuplicate } from '../../tools/common';

const TEST_SHELTER_A = {
    _id: '59c57aa289bf531d741f2626',
    name: 'ADAME\'',
    idCai: '921606201',
    type: 'Capanna sociale',
    branch: 'Cedegolo',
    owner: 'Comune',
    geoData: {
        location: {
            region: 'Lombardia',
            province: 'BS',
            municipality: 'SAVIORE DELL\'ADAMELLO',
            locality: 'CASINE DI MEZZO',
            ownerRegion: 'Lombardia',
            regional_commission: 'LOM',
            authorityJurisdiction: null,
            altitude: 2107,
            latitude: 46.236667,
            longitude: 11.902778,
            massif: 'alpi retiche',
            valley: 'asdf',
            ski_area: null,
            protected_area: null,
            site: null,
            _id: '5aec5c1fe45a083a1ec2cdd9'
        },
        _id: '5aec5c1fe45a083a1ec2cdd8',
        tags: []
    },
    contacts: {
        fixedPhone: '1235234523',
        mobilePhone: '23465264365',
        role: 'Custode',
        emailAddress: 'roba@roba.it',
        prenotation_link: null,
        webAddress: null,
        _id: '5b3bb434425e8140d4aea90b'
    },
    management: {
        rentType: null,
        reference: 'riferimento',
        pickupKey: true,
        self_management: true,
        _id: '5b3bb434425e8140d4aea90c',
        subject: [{
            possession_type: 'Affitto a gestore',
            contract_fee: 22323342,
            contract_duration: null,
            contract_end_date: null,
            contract_start_date: null,
            type: null,
            webSite: null,
            email: null,
            pec: null,
            mobilePhone: '134522345',
            fixedPhone: '23452345235',
            taxCode: null,
            surname: ' cognomeGest',
            name: 'gest',
            _id: '5b3bb434425e8140d4aea90e'
        }, {
            possession_type: 'Affitto a gestore',
            contract_fee: 4343,
            contract_duration: null,
            contract_end_date: '2002 - 02 - 02T23: 00: 00.000Z',
            contract_start_date: '2002 - 02 - 01T23: 00: 00.000Z',
            type: 'Proprietario',
            webSite: 'www.sito.it',
            email: 'mail@prop.it',
            pec: 'prop@pec.it',
            mobilePhone: null,
            fixedPhone: '234504325234',
            taxCode: '149052345234451',
            surname: null,
            name: 'enteProp',
            _id: '5b3bb434425e8140d4aea90d'
        }],
        valuta: 'Euro'
    },
    __v: 2,
    updateSubject: 'CAI Centrale',
    catastal: {
        buildingRegulation: true,
        buildYear: '2342',
        rebuildYear: '2341',
        class: 'a12',
        code: 'a112',
        typologicalCoherence: 'Parziale',
        matericalCoherence: null,
        cityPlanRegulation: true,
        mainBody: 'vva',
        secondaryBody: 'vvb',
        fireRegulation: 'Sì',
        ISO14001: true,
        _id: '5b3bb457425e8140d4aea917'
    },
    drain: {
        type: 'IMHOFF pozzo perdente',
        regulation: true,
        oilSeparator: null,
        recycling: true,
        water_type: 'Acquedotto',
        water_availability: null,
        droughts: 'Primavera',
        water_certification: null,
        _id: '5b3bb457425e8140d4aea918'
    },
    energy: {
        class: 'C',
        energy: 24,
        greenCertification: null,
        powerGenerator: null,
        photovoltaic: null,
        heating_type: 'Gas',
        sourceType: null,
        sourceName: null,
        _id: '5b3bb457425e8140d4aea919'
    },
    use: [],
    economy: [],
    openingTime: [{
        type: 'roba',
        endDate: '2018 - 03 - 01T23: 00: 00.000Z',
        startDate: '2018 - 02 - 01T23: 00: 00.000Z',
        _id: '5b3bb434425e8140d4aea90a'
    }],
    services: [{
        _id: '59c57aa589bf531d741f41c5',
        name: 'pernottamento',
        category: 'pernottamento',
        __v: 0,
        tags: [{
            _id: '5b3900c7c9b75c324c56f3bc',
            value: '23',
            key: 'camerate_da_4_posti'
        },
        {
            _id: '5b3900c7c9b75c324c56f3bb',
            value: '3',
            key: 'camerate_da_6_posti'
        },
        {
            _id: '5b3900c7c9b75c324c56f3ba',
            value: '3',
            key: 'posti_letto'
        }
        ]
    }, {
        _id: '59c57aa589bf531d741f41ca',
        name: 'WIFI_e_GSM',
        category: 'WIFI_e_GSM',
        __v: 0,
        tags: []
    }, {
        _id: '59c57aa589bf531d741f41c7',
        name: 'acqua',
        category: 'acqua',
        __v: 0,
        tags: []
    }, {
        _id: '59c57aa589bf531d741f41cc',
        name: 'servizi_aggiuntivi',
        category: 'servizi_aggiuntivi',
        __v: 0,
        tags: []
    }, {
        _id: '59c57aa589bf531d741f41c6',
        name: 'ristorazione',
        category: 'ristorazione',
        __v: 0,
        tags: []
    }, {
        _id: '59c57aa589bf531d741f41cb',
        name: 'accessibilità',
        category: 'accessibilità',
        __v: 0,
        tags: []
    }, {
        _id: '59c57aa589bf531d741f41c8',
        name: 'servizi_igenici',
        category: 'servizi_igenici',
        __v: 0,
        tags: [{
            _id: '5b3900c7c9b75c324c56f3bd',
            value: '3',
            key: 'docce'
        }]
    }, {
        _id: '59c57aa589bf531d741f41c9',
        name: 'elettricità',
        category: 'elettricità',
        __v: 0,
        tags: []
    }],
    updateDate: '2018 - 07 - 03T17: 37: 27.102Z',
    insertDate: '2017 - 09 - 22T21: 03: 30.663Z'
}

const TEST_SHELTER_B = {
    "_id": "59c57aa389bf531d741f28ec",
    "name": "ANTELAO",
    "alias": "-",
    "idCai": "922000903",
    "type": "Rifugio custodito",
    "branch": "Treviso",
    "owner": "CAI",
    "category": "A",
    "regional_type": "Escursionistico",
    "geoData": {
        "location": {
            "region": "Veneto",
            "province": "BL",
            "municipality": "PIEVE DI CADORE",
            "locality": "SELLA PRADONEGRO",
            "ownerRegion": "Veneto",
            "regional_commission": "VFG",
            "authorityJurisdiction": null,
            "altitude": 1796,
            "latitude": 46.448055,
            "longitude": 12.324444,
            "massif": "alpi dolomitiche",
            "valley": null,
            "ski_area": null,
            "protected_area": null,
            "site": null,
            "_id": "59c57aa389bf531d741f28f1"
        },
        "_id": "59c57aa389bf531d741f28f0",
        "tags": []
    },
    "contacts": {
        "fixedPhone": "+39 0435 75333",
        "mobilePhone": "+39 347 8935693",
        "mailPec": null,
        "emailAddress": "info@rifugioantelao.com",
        "role": null,
        "prenotation_link": null,
        "webAddress": "www.rifugioantelao.com",
        "name": null,
        "_id": "59c57aa389bf531d741f28ef"
    },
    "management": {
        "_id": "59c57aa389bf531d741f28ed",
        "subject": [{
            "name": "Sezione di Treviso",
            "type": "proprietario",
            "_id": "59c57aa389bf531d741f28ee"
        }],
        "valuta": "Euro"
    },
    "openingTime": [],
    "services": [{
        "_id": "59c57aa489bf531d741f39cc",
        "name": "acqua",
        "category": "acqua",
        "tags": [{
            "key": "acqua_calda",
            "value": "Sì",
            "_id": "59c57aa489bf531d741f39cd"
        }],
        "__v": 0
    },
    {
        "_id": "59c57aa489bf531d741f39cb",
        "name": "ristorazione",
        "category": "ristorazione",
        "tags": [],
        "__v": 0
    },
    {
        "_id": "59c57aa489bf531d741f39ce",
        "name": "servizi_igenici",
        "category": "servizi_igenici",
        "tags": [{
            "key": "docce",
            "value": "1",
            "_id": "59c57aa489bf531d741f39cf"
        }],
        "__v": 0
    },
    {
        "_id": "59c57aa489bf531d741f39d0",
        "name": "elettricità",
        "category": "elettricità",
        "tags": [],
        "__v": 0
    },
    {
        "_id": "59c57aa489bf531d741f39d3",
        "name": "servizi_aggiuntivi",
        "category": "servizi_aggiuntivi",
        "tags": [{
            "key": "pagamento_POS",
            "value": "No",
            "_id": "59c57aa489bf531d741f39d4"
        }],
        "__v": 0
    },
    {
        "_id": "59c57aa489bf531d741f39d2",
        "name": "accessibilità",
        "category": "accessibilità",
        "tags": [],
        "__v": 0
    },
    {
        "_id": "59c57aa489bf531d741f39c6",
        "name": "pernottamento",
        "category": "pernottamento",
        "tags": [{
            "key": "cuccette",
            "value": "24",
            "_id": "59c57aa489bf531d741f39ca"
        },
        {
            "key": "cuccette_invernali",
            "value": "9",
            "_id": "59c57aa489bf531d741f39c9"
        },
        {
            "key": "tavolato",
            "value": "7",
            "_id": "59c57aa489bf531d741f39c8"
        },
        {
            "key": "posti_totali",
            "value": "40",
            "_id": "59c57aa489bf531d741f39c7"
        }
        ],
        "__v": 0
    },
    {
        "_id": "59c57aa489bf531d741f39d1",
        "name": "WIFI_e_GSM",
        "category": "WIFI_e_GSM",
        "tags": [],
        "__v": 0
    }
    ],
    "updateDate": "2017-09-22T21:09:44.547Z",
    "insertDate": "2017-09-22T21:03:31.221Z",
    "__v": 1,
    "catastal": {
        "_id": "59c57c1889bf531d741f44b5",
        "buildingRegulation": null,
        "buildYear": "1947",
        "rebuildYear": "2005",
        "class": null,
        "code": null,
        "typologicalCoherence": null,
        "matericalCoherence": null,
        "cityPlanRegulation": null,
        "mainBody": null,
        "secondaryBody": null,
        "fireRegulation": null,
        "ISO14001": null
    }
}

describe('Common tools', () => {
    it('Should get alias for a specific field', () => {
        expect(getAliasForField('geoData.location.region')).toBe('Regione');
        expect(getAliasForField('regional_type')).toBe('Categoria per la Regione');
    });

    it('Should get aliases for a partial field', () => {
        expect(getAliasForPartialField('geoData.location.region')).toBe('Regione');
        expect(getAliasForPartialField('regional_type')).toBe('Categoria per la Regione');
        expect(JSON.stringify(getAliasForPartialField('geoData.location'))).toBe(JSON.stringify({
            "region": "Regione",
            "province": "Provincia/Città metropolitana",
            "municipality": "Comune",
            "locality": "Località",
            "ownerRegion": "GR (Gruppo Regionale)",
            "regional_commission": "Commissione regionale",
            "authorityJurisdiction": "Ente sovracomunale di competenza",
            "altitude": "Quota (m slm)",
            "latitude": "Latitudine",
            "longitude": "Longitudine",
            "massif": "Gruppo montuoso",
            "valley": "Valle",
            "ski_area": "Comprensiorio sciistico",
            "protected_area": "Zona tutelata",
            "site": "Sito"
        }));
    });

    it('Should get value from normal field', () => {
        expect(getValueForFieldDoc(TEST_SHELTER_A, 'name')).toBe('ADAME\'');
        expect(getValueForFieldDoc(TEST_SHELTER_A, 'geoData.location.region')).toBe('Lombardia');
        expect(getValueForFieldDoc(TEST_SHELTER_A, 'contacts.role')).toBe('Custode');
        expect(getValueForFieldDoc(TEST_SHELTER_A, 'energy.class')).toBe('C');
        expect(getValueForFieldDoc(TEST_SHELTER_A, 'updateDate')).toBe('2018 - 07 - 03T17: 37: 27.102Z');
    });
});

describe('CSV Tools', () => {
    it('Should parse CSV single item', () => {
        const test = `Nome,Nome comune,IDCAI,Tipo,Sezione,Proprietà,Stato,Categoria per la Regione,Categoria,Inserito il,Aggiornato il,Aggiornato da,Regione,Provincia/Città metropolitana,Comune,Località,GR (Gruppo Regionale),Commissione regionale,Ente sovracomunale di competenza,Quota (m slm),Latitudine,Longitudine,Gruppo montuoso,Valle,Comprensiorio sciistico,Zona tutelata,Sito,Camere da 4 posti,Camere da 6 posti,Posti letto,Docce,Nome (Contatti),Ruolo (Contatti),Telefono (Contatti),Cellulare (Contatti),PEC (Contatti),Link prenotazione (Contatti),Mail (Contatti),Sito web (Contatti),Apertura0 -> Apertura (inizio),Apertura0 -> Apertura (fine),Apertura0 -> Tipo apertura,Subject0 -> Nome (Proprietà e custodia),Subject1 -> Nome (Proprietà e custodia),Subject0 -> Cognome (Proprietà e custodia),Subject1 -> Cognome (Proprietà e custodia),Subject0 -> P. IVA (Proprietà e custodia),Subject1 -> P. IVA (Proprietà e custodia),Subject0 -> Telefono (Proprietà e custodia),Subject1 -> Telefono (Proprietà e custodia),Subject0 -> Cellulare (Proprietà e custodia),Subject1 -> Cellulare (Proprietà e custodia),Subject0 -> PEC (Proprietà e custodia),Subject1 -> PEC (Proprietà e custodia),Subject0 -> Mail (Proprietà e custodia),Subject1 -> Mail (Proprietà e custodia),Subject0 -> Sito web (Proprietà e custodia),Subject1 -> Sito web (Proprietà e custodia),Subject0 -> Tipo (Proprietà e custodia),Subject1 -> Tipo (Proprietà e custodia),Subject0 -> Data inizio contratto (Proprietà e custodia),Subject1 -> Data inizio contratto (Proprietà e custodia),Subject0 -> Data fine contratto (Proprietà e custodia),Subject1 -> Data fine contratto (Proprietà e custodia),Subject0 -> Durata contratto (Proprietà e custodia),Subject1 -> Durata contratto (Proprietà e custodia),Subject0 -> Canone annuale (Proprietà e custodia),Subject1 -> Canone annuale (Proprietà e custodia),Subject0 -> Tipo possesso (Proprietà e custodia),Subject1 -> Tipo possesso (Proprietà e custodia),Riferimento (Proprietà),Regolarità edilizia,Anno di costruzione,Anno di ristrutturazione,Classe catastale,Codice catastale,Coerenza tipologica,Coerenza materica,Regolarità urbanistica,Consistenza corpo principale,Consistenza corpo secondario,Regolarità antincendio,Certificazione ISO 14001,Classe energetica,Quantità (KW),Green,Generatore diesel,Fotovoltaico,Tipo di riscaldamento,Tipo fonte energetica,Nome fonte energetica,Tipo di scarico,Scarico a norma,Disoleatore,Captazione certificata,Riciclo,Acqua,Disponibilità acqua,Periodi di siccità,Anno (Richiesta contributo),Lavori a corpo (€),Lavori a misura (€),Oneri di sicurezza (€),TOTALE LAVORI (€),Spese per indagini - rilievi - ecc. (€),Spese per allacciamenti a reti di distribuzione (€),Spese tecniche (€),Spese di collaudo (€),Tasse e oneri (€),TOTALE SPESE (€),IVA compresa perché non recuperabile,COSTO TOTALE DEL PROGETTO (€),Finanziamento esterno (€),Autofinanziamento (€),SCOPERTO (€),RICHIESTO (€),Contributo accettato,Tipo di contributo richiesto\nADAME',,921606201,Capanna sociale,Cedegolo,Comune,,,,2017 - 09 - 22T21: 03: 30.663Z,2018 - 07 - 03T17: 37: 27.102Z,CAI Centrale,Lombardia,BS,SAVIORE DELL'ADAMELLO,CASINE DI MEZZO,Lombardia,LOM,,2107,46.236667,11.902778,alpi retiche,asdf,,,,23,3,3,3,,Custode,1235234523,23465264365,,,roba@roba.it,,2018 - 02 - 01T23: 00: 00.000Z,2018 - 03 - 01T23: 00: 00.000Z,roba,gest,enteProp, cognomeGest,,,149052345234451,23452345235,234504325234,134522345,,,prop@pec.it,,mail@prop.it,,www.sito.it,,Proprietario,,2002 - 02 - 01T23: 00: 00.000Z,,2002 - 02 - 02T23: 00: 00.000Z,,,22323342,4343,Affitto a gestore,Affitto a gestore,riferimento,true,2342,2341,a12,a112,Parziale,,true,vva,vvb,Sì,true,C,24,,,,Gas,,,IMHOFF pozzo perdente,true,,,true,Acquedotto,,Primavera,,,,,,,,,,,,,,,,,,,`

        createCSV(<any>[TEST_SHELTER_A])
            .then(csv => {
                expect(csv).toBe(test)
            })
            .catch(err => {
                expect(err).toBe(undefined)
            })
    });

    it('Should parse CSV multiple item', () => {
        const test = `Nome,Nome comune,IDCAI,Tipo,Sezione,Proprietà,Stato,Categoria per la Regione,Categoria,Inserito il,Aggiornato il,Aggiornato da,Regione,Provincia/Città metropolitana,Comune,Località,GR (Gruppo Regionale),Commissione regionale,Ente sovracomunale di competenza,Quota (m slm),Latitudine,Longitudine,Gruppo montuoso,Valle,Comprensiorio sciistico,Zona tutelata,Sito,Camere da 4 posti,Camere da 6 posti,Posti letto,Posti totali,Acqua calda,Docce,Pagamento POS,Nome (Contatti),Ruolo (Contatti),Telefono (Contatti),Cellulare (Contatti),PEC (Contatti),Link prenotazione (Contatti),Mail (Contatti),Sito web (Contatti),Apertura0 -> Apertura (inizio),Apertura0 -> Apertura (fine),Apertura0 -> Tipo apertura,Subject0 -> Nome (Proprietà e custodia),Subject1 -> Nome (Proprietà e custodia),Subject0 -> Cognome (Proprietà e custodia),Subject1 -> Cognome (Proprietà e custodia),Subject0 -> P. IVA (Proprietà e custodia),Subject1 -> P. IVA (Proprietà e custodia),Subject0 -> Telefono (Proprietà e custodia),Subject1 -> Telefono (Proprietà e custodia),Subject0 -> Cellulare (Proprietà e custodia),Subject1 -> Cellulare (Proprietà e custodia),Subject0 -> PEC (Proprietà e custodia),Subject1 -> PEC (Proprietà e custodia),Subject0 -> Mail (Proprietà e custodia),Subject1 -> Mail (Proprietà e custodia),Subject0 -> Sito web (Proprietà e custodia),Subject1 -> Sito web (Proprietà e custodia),Subject0 -> Tipo (Proprietà e custodia),Subject1 -> Tipo (Proprietà e custodia),Subject0 -> Data inizio contratto (Proprietà e custodia),Subject1 -> Data inizio contratto (Proprietà e custodia),Subject0 -> Data fine contratto (Proprietà e custodia),Subject1 -> Data fine contratto (Proprietà e custodia),Subject0 -> Durata contratto (Proprietà e custodia),Subject1 -> Durata contratto (Proprietà e custodia),Subject0 -> Canone annuale (Proprietà e custodia),Subject1 -> Canone annuale (Proprietà e custodia),Subject0 -> Tipo possesso (Proprietà e custodia),Subject1 -> Tipo possesso (Proprietà e custodia),Riferimento (Proprietà),Regolarità edilizia,Anno di costruzione,Anno di ristrutturazione,Classe catastale,Codice catastale,Coerenza tipologica,Coerenza materica,Regolarità urbanistica,Consistenza corpo principale,Consistenza corpo secondario,Regolarità antincendio,Certificazione ISO 14001,Classe energetica,Quantità (KW),Green,Generatore diesel,Fotovoltaico,Tipo di riscaldamento,Tipo fonte energetica,Nome fonte energetica,Tipo di scarico,Scarico a norma,Disoleatore,Captazione certificata,Riciclo,Acqua,Disponibilità acqua,Periodi di siccità,Anno (Richiesta contributo),Lavori a corpo (€),Lavori a misura (€),Oneri di sicurezza (€),TOTALE LAVORI (€),Spese per indagini - rilievi - ecc. (€),Spese per allacciamenti a reti di distribuzione (€),Spese tecniche (€),Spese di collaudo (€),Tasse e oneri (€),TOTALE SPESE (€),IVA compresa perché non recuperabile,COSTO TOTALE DEL PROGETTO (€),Finanziamento esterno (€),Autofinanziamento (€),SCOPERTO (€),RICHIESTO (€),Contributo accettato,Tipo di contributo richiesto\nADAME',,921606201,Capanna sociale,Cedegolo,Comune,,,,2017 - 09 - 22T21: 03: 30.663Z,2018 - 07 - 03T17: 37: 27.102Z,CAI Centrale,Lombardia,BS,SAVIORE DELL'ADAMELLO,CASINE DI MEZZO,Lombardia,LOM,,2107,46.236667,11.902778,alpi retiche,asdf,,,,23,3,3,,,3,,,Custode,1235234523,23465264365,,,roba@roba.it,,2018 - 02 - 01T23: 00: 00.000Z,2018 - 03 - 01T23: 00: 00.000Z,roba,gest,enteProp, cognomeGest,,,149052345234451,23452345235,234504325234,134522345,,,prop@pec.it,,mail@prop.it,,www.sito.it,,Proprietario,,2002 - 02 - 01T23: 00: 00.000Z,,2002 - 02 - 02T23: 00: 00.000Z,,,22323342,4343,Affitto a gestore,Affitto a gestore,riferimento,true,2342,2341,a12,a112,Parziale,,true,vva,vvb,Sì,true,C,24,,,,Gas,,,IMHOFF pozzo perdente,true,,,true,Acquedotto,,Primavera,,,,,,,,,,,,,,,,,,,\nANTELAO,-,922000903,Rifugio custodito,Treviso,CAI,,Escursionistico,A,2017-09-22T21:03:31.221Z,2017-09-22T21:09:44.547Z,,Veneto,BL,PIEVE DI CADORE,SELLA PRADONEGRO,Veneto,VFG,,1796,46.448055,12.324444,alpi dolomitiche,,,,,,,,40,Sì,1,No,,,+39 0435 75333,+39 347 8935693,,,info@rifugioantelao.com,www.rifugioantelao.com,,,,Sezione di Treviso,,,,,,,,,,,,,,,,proprietario,,,,,,,,,,,,,,1947,2005,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`

        createCSV(<any>[TEST_SHELTER_A, TEST_SHELTER_B])
            .then(csv => {
                expect(csv).toBe(test)
            })
            .catch(err => {
                expect(err).toBe(undefined)
            })
    });

    it('Should get CSV Lines number', () => {
        const dict = getCSVDict(<any>[TEST_SHELTER_A, TEST_SHELTER_B]);
        expect(getCSVLines(dict)).toBe(<any>2)
    })

    it('Should parse CSV Lines', () => {
        const dict = getCSVDict(<any>[TEST_SHELTER_A, TEST_SHELTER_B]);
        const test = {
            header: 'Nome,Nome comune,IDCAI,Tipo,Sezione,Proprietà,Stato,Categoria per la Regione,Categoria,Inserito il,Aggiornato il,Aggiornato da,Regione,Provincia/Città metropolitana,Comune,Località,GR (Gruppo Regionale),Commissione regionale,Ente sovracomunale di competenza,Quota (m slm),Latitudine,Longitudine,Gruppo montuoso,Valle,Comprensiorio sciistico,Zona tutelata,Sito,Camere da 4 posti,Camere da 6 posti,Posti letto,Posti totali,Acqua calda,Docce,Pagamento POS,Nome (Contatti),Ruolo (Contatti),Telefono (Contatti),Cellulare (Contatti),PEC (Contatti),Link prenotazione (Contatti),Mail (Contatti),Sito web (Contatti),Apertura0 -> Apertura (inizio),Apertura0 -> Apertura (fine),Apertura0 -> Tipo apertura,Subject0 -> Nome (Proprietà e custodia),Subject1 -> Nome (Proprietà e custodia),Subject0 -> Cognome (Proprietà e custodia),Subject1 -> Cognome (Proprietà e custodia),Subject0 -> P. IVA (Proprietà e custodia),Subject1 -> P. IVA (Proprietà e custodia),Subject0 -> Telefono (Proprietà e custodia),Subject1 -> Telefono (Proprietà e custodia),Subject0 -> Cellulare (Proprietà e custodia),Subject1 -> Cellulare (Proprietà e custodia),Subject0 -> PEC (Proprietà e custodia),Subject1 -> PEC (Proprietà e custodia),Subject0 -> Mail (Proprietà e custodia),Subject1 -> Mail (Proprietà e custodia),Subject0 -> Sito web (Proprietà e custodia),Subject1 -> Sito web (Proprietà e custodia),Subject0 -> Tipo (Proprietà e custodia),Subject1 -> Tipo (Proprietà e custodia),Subject0 -> Data inizio contratto (Proprietà e custodia),Subject1 -> Data inizio contratto (Proprietà e custodia),Subject0 -> Data fine contratto (Proprietà e custodia),Subject1 -> Data fine contratto (Proprietà e custodia),Subject0 -> Durata contratto (Proprietà e custodia),Subject1 -> Durata contratto (Proprietà e custodia),Subject0 -> Canone annuale (Proprietà e custodia),Subject1 -> Canone annuale (Proprietà e custodia),Subject0 -> Tipo possesso (Proprietà e custodia),Subject1 -> Tipo possesso (Proprietà e custodia),Riferimento (Proprietà),Regolarità edilizia,Anno di costruzione,Anno di ristrutturazione,Classe catastale,Codice catastale,Coerenza tipologica,Coerenza materica,Regolarità urbanistica,Consistenza corpo principale,Consistenza corpo secondario,Regolarità antincendio,Certificazione ISO 14001,Classe energetica,Quantità (KW),Green,Generatore diesel,Fotovoltaico,Tipo di riscaldamento,Tipo fonte energetica,Nome fonte energetica,Tipo di scarico,Scarico a norma,Disoleatore,Captazione certificata,Riciclo,Acqua,Disponibilità acqua,Periodi di siccità,Anno (Richiesta contributo),Lavori a corpo (€),Lavori a misura (€),Oneri di sicurezza (€),TOTALE LAVORI (€),Spese per indagini - rilievi - ecc. (€),Spese per allacciamenti a reti di distribuzione (€),Spese tecniche (€),Spese di collaudo (€),Tasse e oneri (€),TOTALE SPESE (€),IVA compresa perché non recuperabile,COSTO TOTALE DEL PROGETTO (€),Finanziamento esterno (€),Autofinanziamento (€),SCOPERTO (€),RICHIESTO (€),Contributo accettato,Tipo di contributo richiesto,',
            lines: [
                "ADAME',,921606201,Capanna sociale,Cedegolo,Comune,,,,2017 - 09 - 22T21: 03: 30.663Z,2018 - 07 - 03T17: 37: 27.102Z,CAI Centrale,Lombardia,BS,SAVIORE DELL'ADAMELLO,CASINE DI MEZZO,Lombardia,LOM,,2107,46.236667,11.902778,alpi retiche,asdf,,,,23,3,3,,,3,,,Custode,1235234523,23465264365,,,roba@roba.it,,2018 - 02 - 01T23: 00: 00.000Z,2018 - 03 - 01T23: 00: 00.000Z,roba,gest,enteProp, cognomeGest,,,149052345234451,23452345235,234504325234,134522345,,,prop@pec.it,,mail@prop.it,,www.sito.it,,Proprietario,,2002 - 02 - 01T23: 00: 00.000Z,,2002 - 02 - 02T23: 00: 00.000Z,,,22323342,4343,Affitto a gestore,Affitto a gestore,riferimento,true,2342,2341,a12,a112,Parziale,,true,vva,vvb,Sì,true,C,24,,,,Gas,,,IMHOFF pozzo perdente,true,,,true,Acquedotto,,Primavera,,,,,,,,,,,,,,,,,,,,",
                "ANTELAO,-,922000903,Rifugio custodito,Treviso,CAI,,Escursionistico,A,2017-09-22T21:03:31.221Z,2017-09-22T21:09:44.547Z,,Veneto,BL,PIEVE DI CADORE,SELLA PRADONEGRO,Veneto,VFG,,1796,46.448055,12.324444,alpi dolomitiche,,,,,,,,40,Sì,1,No,,,+39 0435 75333,+39 347 8935693,,,info@rifugioantelao.com,www.rifugioantelao.com,,,,Sezione di Treviso,,,,,,,,,,,,,,,,proprietario,,,,,,,,,,,,,,1947,2005,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"
            ]
        }
        const parsed = parseCSVLines(dict);
        expect(parsed.header).toEqual(test.header);
        expect(parsed.lines.length).toEqual(2)
        parsed.lines.forEach((line, index) => {
            expect(line.split(',').length).toEqual(parsed.header.split(',').length)
            expect(line).toEqual(test.lines[index])
        });
    });

    it('Should get CSV Dictionary', () => {
        const test = {
            "Nome": ["ADAME'", "ANTELAO"],
            "Nome comune": [null, "-"],
            "IDCAI": ["921606201", "922000903"],
            "Tipo": ["Capanna sociale", "Rifugio custodito"],
            "Sezione": ["Cedegolo", "Treviso"],
            "Proprietà": ["Comune", "CAI"],
            "Stato": [null, null],
            "Categoria per la Regione": [null, "Escursionistico"],
            "Categoria": [null, "A"],
            "Inserito il": ["2017 - 09 - 22T21: 03: 30.663Z", "2017-09-22T21:03:31.221Z"],
            "Aggiornato il": ["2018 - 07 - 03T17: 37: 27.102Z", "2017-09-22T21:09:44.547Z"],
            "Aggiornato da": ["CAI Centrale", null],
            "Regione": ["Lombardia", "Veneto"],
            "Provincia/Città metropolitana": ["BS", "BL"],
            "Comune": ["SAVIORE DELL'ADAMELLO", "PIEVE DI CADORE"],
            "Località": ["CASINE DI MEZZO", "SELLA PRADONEGRO"],
            "GR (Gruppo Regionale)": ["Lombardia", "Veneto"],
            "Commissione regionale": ["LOM", "VFG"],
            "Ente sovracomunale di competenza": [null, null],
            "Quota (m slm)": [2107, 1796],
            "Latitudine": [46.236667, 46.448055],
            "Longitudine": [11.902778, 12.324444],
            "Gruppo montuoso": ["alpi retiche", "alpi dolomitiche"],
            "Valle": ["asdf", null],
            "Comprensiorio sciistico": [null, null],
            "Zona tutelata": [null, null],
            "Sito": [null, null],
            "Nome (Contatti)": [null, null],
            "Ruolo (Contatti)": ["Custode", null],
            "Telefono (Contatti)": ["1235234523", "+39 0435 75333"],
            "Cellulare (Contatti)": ["23465264365", "+39 347 8935693"],
            "PEC (Contatti)": [null, null],
            "Link prenotazione (Contatti)": [null, null],
            "Mail (Contatti)": ["roba@roba.it", "info@rifugioantelao.com"],
            "Sito web (Contatti)": [null, "www.rifugioantelao.com"],
            "Riferimento (Proprietà)": ["riferimento", null],
            "Regolarità edilizia": [true, null],
            "Anno di costruzione": ["2342", "1947"],
            "Anno di ristrutturazione": ["2341", "2005"],
            "Classe catastale": ["a12", null],
            "Codice catastale": ["a112", null],
            "Coerenza tipologica": ["Parziale", null],
            "Coerenza materica": [null, null],
            "Regolarità urbanistica": [true, null],
            "Consistenza corpo principale": ["vva", null],
            "Consistenza corpo secondario": ["vvb", null],
            "Regolarità antincendio": ["Sì", null],
            "Certificazione ISO 14001": [true, null],
            "Classe energetica": ["C", null],
            "Quantità (KW)": [24, null],
            "Green": [null, null],
            "Generatore diesel": [null, null],
            "Fotovoltaico": [null, null],
            "Tipo di riscaldamento": ["Gas", null],
            "Tipo fonte energetica": [null, null],
            "Nome fonte energetica": [null, null],
            "Tipo di scarico": ["IMHOFF pozzo perdente", null],
            "Scarico a norma": [true, null],
            "Disoleatore": [null, null],
            "Captazione certificata": [null, null],
            "Riciclo": [true, null],
            "Acqua": ["Acquedotto", null],
            "Disponibilità acqua": [null, null],
            "Periodi di siccità": ["Primavera", null],
            "Anno (Richiesta contributo)": [null, null],
            "Lavori a corpo (€)": [null, null],
            "Lavori a misura (€)": [null, null],
            "Oneri di sicurezza (€)": [null, null],
            "TOTALE LAVORI (€)": [null, null],
            "Spese per indagini - rilievi - ecc. (€)": [null, null],
            "Spese per allacciamenti a reti di distribuzione (€)": [null, null],
            "Spese tecniche (€)": [null, null],
            "Spese di collaudo (€)": [null, null],
            "Tasse e oneri (€)": [null, null],
            "TOTALE SPESE (€)": [null, null],
            "IVA compresa perché non recuperabile": [null, null],
            "COSTO TOTALE DEL PROGETTO (€)": [null, null],
            "Finanziamento esterno (€)": [null, null],
            "Autofinanziamento (€)": [null, null],
            "SCOPERTO (€)": [null, null],
            "RICHIESTO (€)": [null, null],
            "Contributo accettato": [null, null],
            "Tipo di contributo richiesto": [null, null],
            "Camere da 4 posti": ["23", null],
            "Camere da 6 posti": ["3", null],
            "Posti letto": ["3", null],
            "Docce": ["3", "1"],
            "Apertura0 -> Apertura (inizio)": ["2018 - 02 - 01T23: 00: 00.000Z", null],
            "Apertura0 -> Apertura (fine)": ["2018 - 03 - 01T23: 00: 00.000Z", null],
            "Apertura0 -> Tipo apertura": ["roba", null],
            "Subject0 -> Nome (Proprietà e custodia)": ["gest", "Sezione di Treviso"],
            "Subject0 -> Cognome (Proprietà e custodia)": [" cognomeGest", null],
            "Subject0 -> P. IVA (Proprietà e custodia)": [null, null],
            "Subject0 -> Telefono (Proprietà e custodia)": ["23452345235", null],
            "Subject0 -> Cellulare (Proprietà e custodia)": ["134522345", null],
            "Subject0 -> PEC (Proprietà e custodia)": [null, null],
            "Subject0 -> Mail (Proprietà e custodia)": [null, null],
            "Subject0 -> Sito web (Proprietà e custodia)": [null, null],
            "Subject0 -> Tipo (Proprietà e custodia)": [null, "proprietario"],
            "Subject0 -> Data inizio contratto (Proprietà e custodia)": [null, null],
            "Subject0 -> Data fine contratto (Proprietà e custodia)": [null, null],
            "Subject0 -> Durata contratto (Proprietà e custodia)": [null, null],
            "Subject0 -> Canone annuale (Proprietà e custodia)": [22323342, null],
            "Subject0 -> Tipo possesso (Proprietà e custodia)": ["Affitto a gestore", null],
            "Subject1 -> Nome (Proprietà e custodia)": ["enteProp", null],
            "Subject1 -> Cognome (Proprietà e custodia)": [null, null],
            "Subject1 -> P. IVA (Proprietà e custodia)": ["149052345234451", null],
            "Subject1 -> Telefono (Proprietà e custodia)": ["234504325234", null],
            "Subject1 -> Cellulare (Proprietà e custodia)": [null, null],
            "Subject1 -> PEC (Proprietà e custodia)": ["prop@pec.it", null],
            "Subject1 -> Mail (Proprietà e custodia)": ["mail@prop.it", null],
            "Subject1 -> Sito web (Proprietà e custodia)": ["www.sito.it", null],
            "Subject1 -> Tipo (Proprietà e custodia)": ["Proprietario", null],
            "Subject1 -> Data inizio contratto (Proprietà e custodia)": ["2002 - 02 - 01T23: 00: 00.000Z", null],
            "Subject1 -> Data fine contratto (Proprietà e custodia)": ["2002 - 02 - 02T23: 00: 00.000Z", null],
            "Subject1 -> Durata contratto (Proprietà e custodia)": [null, null],
            "Subject1 -> Canone annuale (Proprietà e custodia)": [4343, null],
            "Subject1 -> Tipo possesso (Proprietà e custodia)": ["Affitto a gestore", null],
            "Acqua calda": [null, "Sì"],
            "Pagamento POS": [null, "No"],
            "Posti totali": [null, "40"]
        }

        expect(JSON.stringify(getCSVDict(<any>[TEST_SHELTER_A, TEST_SHELTER_B]))).toBe(JSON.stringify(test))
    });

    it('Should get ordered CSV values', () => {
        const test = [
            "Nome",
            "Nome comune",
            "IDCAI",
            "Tipo",
            "Sezione",
            "Proprietà",
            "Stato",
            "Categoria per la Regione",
            "Categoria",
            "Inserito il",
            "Aggiornato il",
            "Aggiornato da",
            "Regione",
            "Provincia/Città metropolitana",
            "Comune",
            "Località", "GR (Gruppo Regionale)",
            "Commissione regionale",
            "Ente sovracomunale di competenza",
            "Quota (m slm)", "Latitudine",
            "Longitudine",
            "Gruppo montuoso",
            "Valle",
            "Comprensiorio sciistico",
            "Zona tutelata",
            "Sito",
            "Camere da 4 posti",
            "Camere da 6 posti",
            "Posti letto",
            "Posti letto invernale",
            "Tavolati",
            "Posti totali",
            "Vendita sacco lenzuolo",
            "Ristorante",
            "Accesso alla cucina",
            "Acqua in rifugio",
            "Acqua calda",
            "Docce",
            "WC in camera",
            "WC uso comune",
            "Elettricità",
            "Punti ricarica camere",
            "Punti ricarica spazi comuni",
            "WIFI",
            "Segnale GSM",
            "Gestore telefonia mobile",
            "Accessibilità ai disabili",
            "Servizi igienici per disabili",
            "Accessibilità famiglie con bambini",
            "Accessibilità macchina",
            "Ammissibilità animali domestici",
            "Stanze dedicate",
            "Pagamento POS",
            "convenzioni",
            "Richiesta di rifornire il rifugio",
            "Presidio culturale",
            "Attività culturali/corsi specifici",
            "Nome (Contatti)",
            "Ruolo (Contatti)",
            "Telefono (Contatti)",
            "Cellulare (Contatti)",
            "PEC (Contatti)",
            "Link prenotazione (Contatti)",
            "Mail (Contatti)",
            "Sito web (Contatti)",
            "-> Apertura (inizio)",
            "-> Apertura (fine)",
            "-> Tipo apertura",
            "-> Nome (Proprietà e custodia)",
            "-> Cognome (Proprietà e custodia)",
            "-> P. IVA (Proprietà e custodia)",
            "-> Telefono (Proprietà e custodia)",
            "-> Cellulare (Proprietà e custodia)",
            "-> PEC (Proprietà e custodia)",
            "-> Mail (Proprietà e custodia)",
            "-> Sito web (Proprietà e custodia)",
            "-> Tipo (Proprietà e custodia)",
            "-> Data inizio contratto (Proprietà e custodia)",
            "-> Data fine contratto (Proprietà e custodia)",
            "-> Durata contratto (Proprietà e custodia)",
            "-> Canone annuale (Proprietà e custodia)",
            "-> Tipo possesso (Proprietà e custodia)",
            "Riferimento (Proprietà)",
            "Regolarità edilizia",
            "Anno di costruzione",
            "Anno di ristrutturazione",
            "Classe catastale",
            "Codice catastale",
            "Coerenza tipologica",
            "Coerenza materica",
            "Regolarità urbanistica",
            "Consistenza corpo principale",
            "Consistenza corpo secondario",
            "Regolarità antincendio",
            "Certificazione ISO 14001",
            "Classe energetica",
            "Quantità (KW)",
            "Green",
            "Generatore diesel",
            "Fotovoltaico",
            "Tipo di riscaldamento",
            "Tipo fonte energetica",
            "Nome fonte energetica",
            "Tipo di scarico",
            "Scarico a norma",
            "Disoleatore",
            "Captazione certificata",
            "Riciclo",
            "Acqua",
            "Disponibilità acqua",
            "Periodi di siccità",
            "Anno (Richiesta contributo)",
            "Lavori a corpo (€)",
            "Lavori a misura (€)",
            "Oneri di sicurezza (€)",
            "TOTALE LAVORI (€)",
            "Spese per indagini - rilievi - ecc. (€)",
            "Spese per allacciamenti a reti di distribuzione (€)",
            "Spese tecniche (€)",
            "Spese di collaudo (€)",
            "Tasse e oneri (€)",
            "TOTALE SPESE (€)",
            "IVA compresa perché non recuperabile",
            "COSTO TOTALE DEL PROGETTO (€)",
            "Finanziamento esterno (€)",
            "Autofinanziamento (€)",
            "SCOPERTO (€)", "RICHIESTO (€)",
            "Contributo accettato",
            "Tipo di contributo richiesto"
        ];

        expect(removeDuplicate(getCSVAliasesOrdered(), test)).toEqual([]);
        expect(JSON.stringify(getCSVAliasesOrdered())).toBe(<any>JSON.stringify(test))

    });

    it('Should CSV Dictionary have the right length for each key', () => {
        const dict = getCSVDict(<any>[TEST_SHELTER_A, TEST_SHELTER_B]);
        expect(dict).toBeTruthy();
        Object.keys(dict).forEach(v => {
            expect(dict[v].length).toBe(<any>2);
        });
    });

    it('Should transform object', () => {
        const obj = {
            "Nome": "ADAME'",
            "Nome comune": null,
            "IDCAI": "921606201",
            "Tipo": "Capanna sociale",
            "Sezione": "Cedegolo",
            "Proprietà": "Comune",
            "Stato": null,
            "Categoria per la Regione": null,
            "Categoria": null,
            "Inserito il": "2017 - 09 - 22T21: 03: 30.663Z",
            "Aggiornato il": "2018 - 07 - 03T17: 37: 27.102Z",
            "Aggiornato da": "CAI Centrale",
            "Regione": "Lombardia",
            "Provincia/Città metropolitana": "BS",
            "Comune": "SAVIORE DELL'ADAMELLO",
            "Località": "CASINE DI MEZZO",
            "GR (Gruppo Regionale)": "Lombardia",
            "Commissione regionale": "LOM",
            "Ente sovracomunale di competenza": null,
            "Quota (m slm)": 2107,
            "Latitudine": 46.236667,
            "Longitudine": 11.902778,
            "Gruppo montuoso": "alpi retiche",
            "Valle": "asdf",
            "Comprensiorio sciistico": null,
            "Zona tutelata": null,
            "Sito": null,
            "Nome (Contatti)": null,
            "Ruolo (Contatti)": "Custode",
            "Telefono (Contatti)": "1235234523",
            "Cellulare (Contatti)": "23465264365",
            "PEC (Contatti)": null,
            "Link prenotazione (Contatti)": null,
            "Mail (Contatti)": "roba@roba.it",
            "Sito web (Contatti)": null,
            "Riferimento (Proprietà)": "riferimento",
            "Regolarità edilizia": true,
            "Anno di costruzione": "2342",
            "Anno di ristrutturazione": "2341",
            "Classe catastale": "a12",
            "Codice catastale": "a112",
            "Coerenza tipologica": "Parziale",
            "Coerenza materica": null,
            "Regolarità urbanistica": true,
            "Consistenza corpo principale": "vva",
            "Consistenza corpo secondario": "vvb",
            "Regolarità antincendio": "Sì",
            "Certificazione ISO 14001": true,
            "Classe energetica": "C",
            "Quantità (KW)": 24,
            "Green": null,
            "Generatore diesel": null,
            "Fotovoltaico": null,
            "Tipo di riscaldamento": "Gas",
            "Tipo fonte energetica": null,
            "Nome fonte energetica": null,
            "Tipo di scarico": "IMHOFF pozzo perdente",
            "Scarico a norma": true,
            "Disoleatore": null,
            "Captazione certificata": null,
            "Riciclo": true,
            "Acqua": "Acquedotto",
            "Disponibilità acqua": null,
            "Periodi di siccità": "Primavera",
            "Anno (Richiesta contributo)": null,
            "Lavori a corpo (€)": null,
            "Lavori a misura (€)": null,
            "Oneri di sicurezza (€)": null,
            "TOTALE LAVORI (€)": null,
            "Spese per indagini - rilievi - ecc. (€)": null,
            "Spese per allacciamenti a reti di distribuzione (€)": null,
            "Spese tecniche (€)": null,
            "Spese di collaudo (€)": null,
            "Tasse e oneri (€)": null,
            "TOTALE SPESE (€)": null,
            "IVA compresa perché non recuperabile": null,
            "COSTO TOTALE DEL PROGETTO (€)": null,
            "Finanziamento esterno (€)": null,
            "Autofinanziamento (€)": null,
            "SCOPERTO (€)": null,
            "RICHIESTO (€)": null,
            "Contributo accettato": null,
            "Tipo di contributo richiesto": null,
            "Camere da 4 posti": "23",
            "Camere da 6 posti": "3",
            "Posti letto": "3",
            "Docce": "3",
            "Apertura0 -> Apertura (inizio)": "2018 - 02 - 01T23: 00: 00.000Z",
            "Apertura0 -> Apertura (fine)": "2018 - 03 - 01T23: 00: 00.000Z",
            "Apertura0 -> Tipo apertura": "roba",
            "Subject0 -> Nome (Proprietà e custodia)": "gest",
            "Subject0 -> Cognome (Proprietà e custodia)": " cognomeGest",
            "Subject0 -> P. IVA (Proprietà e custodia)": null,
            "Subject0 -> Telefono (Proprietà e custodia)": "23452345235",
            "Subject0 -> Cellulare (Proprietà e custodia)": "134522345",
            "Subject0 -> PEC (Proprietà e custodia)": null,
            "Subject0 -> Mail (Proprietà e custodia)": null,
            "Subject0 -> Sito web (Proprietà e custodia)": null,
            "Subject0 -> Tipo (Proprietà e custodia)": null,
            "Subject0 -> Data inizio contratto (Proprietà e custodia)": null,
            "Subject0 -> Data fine contratto (Proprietà e custodia)": null,
            "Subject0 -> Durata contratto (Proprietà e custodia)": null,
            "Subject0 -> Canone annuale (Proprietà e custodia)": 22323342,
            "Subject0 -> Tipo possesso (Proprietà e custodia)": "Affitto a gestore",
            "Subject1 -> Nome (Proprietà e custodia)": "enteProp",
            "Subject1 -> Cognome (Proprietà e custodia)": null,
            "Subject1 -> P. IVA (Proprietà e custodia)": "149052345234451",
            "Subject1 -> Telefono (Proprietà e custodia)": "234504325234",
            "Subject1 -> Cellulare (Proprietà e custodia)": null,
            "Subject1 -> PEC (Proprietà e custodia)": "prop@pec.it",
            "Subject1 -> Mail (Proprietà e custodia)": "mail@prop.it",
            "Subject1 -> Sito web (Proprietà e custodia)": "www.sito.it",
            "Subject1 -> Tipo (Proprietà e custodia)": "Proprietario",
            "Subject1 -> Data inizio contratto (Proprietà e custodia)": "2002 - 02 - 01T23: 00: 00.000Z",
            "Subject1 -> Data fine contratto (Proprietà e custodia)": "2002 - 02 - 02T23: 00: 00.000Z",
            "Subject1 -> Durata contratto (Proprietà e custodia)": null,
            "Subject1 -> Canone annuale (Proprietà e custodia)": 4343,
            "Subject1 -> Tipo possesso (Proprietà e custodia)": "Affitto a gestore"
        }
        expect(JSON.stringify(transform(<any>TEST_SHELTER_A))).toBe(JSON.stringify(obj))
    });

    it('Should get value from array -> management', () => {
        const obj = {
            'management.subject0.name': 'gest',
            'management.subject0.surname': ' cognomeGest',
            'management.subject0.taxCode': null,
            'management.subject0.fixedPhone': '23452345235',
            'management.subject0.mobilePhone': '134522345',
            'management.subject0.pec': null,
            'management.subject0.email': null,
            'management.subject0.webSite': null,
            'management.subject0.type': null,
            'management.subject0.contract_start_date': null,
            'management.subject0.contract_end_date': null,
            'management.subject0.contract_duration': null,
            'management.subject0.contract_fee': 22323342,
            'management.subject0.possession_type': 'Affitto a gestore',
            'management.subject1.name': 'enteProp',
            'management.subject1.surname': null,
            'management.subject1.taxCode': '149052345234451',
            'management.subject1.fixedPhone': '234504325234',
            'management.subject1.mobilePhone': null,
            'management.subject1.pec': 'prop@pec.it',
            'management.subject1.email': 'mail@prop.it',
            'management.subject1.webSite': 'www.sito.it',
            'management.subject1.type': 'Proprietario',
            'management.subject1.contract_start_date': '2002 - 02 - 01T23: 00: 00.000Z',
            'management.subject1.contract_end_date': '2002 - 02 - 02T23: 00: 00.000Z',
            'management.subject1.contract_duration': null,
            'management.subject1.contract_fee': 4343,
            'management.subject1.possession_type': 'Affitto a gestore'
        }

        expect(JSON.stringify(processArrayField('management.subject', TEST_SHELTER_A.management.subject))).toBe(JSON.stringify(obj))
    });

    it('Should get value from array -> openingTime', () => {
        const obj = {
            "openingTime0.startDate": "2018 - 02 - 01T23: 00: 00.000Z",
            "openingTime0.endDate": "2018 - 03 - 01T23: 00: 00.000Z",
            "openingTime0.type": "roba"
        }
        expect(JSON.stringify(processArrayField('openingTime', TEST_SHELTER_A.openingTime))).toBe(JSON.stringify(obj))
    });

    it('Should get value from array -> services', () => {
        const obj = {
            "services0.name": "pernottamento",
            "services0.tags0.key": "camerate_da_4_posti",
            "services0.tags0.value": "23",
            "services0.tags1.key": "camerate_da_6_posti",
            "services0.tags1.value": "3",
            "services0.tags2.key": "posti_letto",
            "services0.tags2.value": "3",
            "services1.name": "WIFI_e_GSM",
            "services2.name": "acqua",
            "services3.name": "servizi_aggiuntivi",
            "services4.name": "ristorazione",
            "services5.name": "accessibilità",
            "services6.name": "servizi_igenici",
            "services6.tags0.key": "docce",
            "services6.tags0.value": "3",
            "services7.name": "elettricità"
        }

        const obj1 = {
            "services.pernottamento.camerate_da_4_posti": "23",
            "services.pernottamento.camerate_da_6_posti": "3",
            "services.pernottamento.posti_letto": "3",
            "services.servizi_igenici.docce": "3"
        }
        expect(JSON.stringify(processArrayField('services', TEST_SHELTER_A.services))).toBe(JSON.stringify(obj))
        expect(JSON.stringify(processServicesFields(TEST_SHELTER_A.services))).toBe(JSON.stringify(obj1))
    });

    it("Should transform doc fields to human readable -> management.subject", () => {
        const ret = {
            "Subject0 -> Nome (Proprietà e custodia)": "gest",
            "Subject0 -> Cognome (Proprietà e custodia)": " cognomeGest",
            "Subject2 -> P. IVA (Proprietà e custodia)": null,
            "Subject0 -> Telefono (Proprietà e custodia)": "23452345235",
            "Subject242 -> Cellulare (Proprietà e custodia)": "134522345"
        }
        const test = {
            'management.subject0.name': 'gest',
            'management.subject0.surname': ' cognomeGest',
            'management.subject2.taxCode': null,
            'management.subject0.fixedPhone': '23452345235',
            'management.subject242.mobilePhone': '134522345'
        }
        expect(JSON.stringify(processFlatArrayNames(test, "management.subject"))).toBe(JSON.stringify(ret));
    });

    it("Should transform doc fields to human readable -> services", () => {
        const ret = {
            "Camere da 4 posti": "23",
            "Camere da 6 posti": "3",
            "Posti letto": "3",
            "Docce": "3"
        }
        const test = {
            "services.pernottamento.camerate_da_4_posti": "23",
            "services.pernottamento.camerate_da_6_posti": "3",
            "services.pernottamento.posti_letto": "3",
            "services.servizi_igenici.docce": "3"
        }
        expect(JSON.stringify(processFlatArrayNames(test, "services"))).toBe(JSON.stringify(ret));
    });

    it("Should transform doc fields to human readable -> openingTime", () => {
        const ret = {
            "Apertura0 -> Apertura (inizio)": "2018 - 02 - 01T23: 00: 00.000Z",
            "Apertura22 -> Apertura (fine)": "2018 - 03 - 01T23: 00: 00.000Z",
            "Apertura1 -> Tipo apertura": "roba"
        }
        const test = {
            "openingTime0.startDate": "2018 - 02 - 01T23: 00: 00.000Z",
            "openingTime22.endDate": "2018 - 03 - 01T23: 00: 00.000Z",
            "openingTime1.type": "roba"
        }
        expect(JSON.stringify(processFlatArrayNames(test, "openingTime"))).toBe(JSON.stringify(ret));
    });

    it("Should get and transform array field -> management.subject", () => {
        const obj = {
            "Subject0 -> Nome (Proprietà e custodia)": "gest",
            "Subject0 -> Cognome (Proprietà e custodia)": " cognomeGest",
            "Subject0 -> P. IVA (Proprietà e custodia)": null,
            "Subject0 -> Telefono (Proprietà e custodia)": "23452345235",
            "Subject0 -> Cellulare (Proprietà e custodia)": "134522345",
            "Subject0 -> PEC (Proprietà e custodia)": null,
            "Subject0 -> Mail (Proprietà e custodia)": null,
            "Subject0 -> Sito web (Proprietà e custodia)": null,
            "Subject0 -> Tipo (Proprietà e custodia)": null,
            "Subject0 -> Data inizio contratto (Proprietà e custodia)": null,
            "Subject0 -> Data fine contratto (Proprietà e custodia)": null,
            "Subject0 -> Durata contratto (Proprietà e custodia)": null,
            "Subject0 -> Canone annuale (Proprietà e custodia)": 22323342,
            "Subject0 -> Tipo possesso (Proprietà e custodia)": "Affitto a gestore",
            "Subject1 -> Nome (Proprietà e custodia)": "enteProp",
            "Subject1 -> Cognome (Proprietà e custodia)": null,
            "Subject1 -> P. IVA (Proprietà e custodia)": "149052345234451",
            "Subject1 -> Telefono (Proprietà e custodia)": "234504325234",
            "Subject1 -> Cellulare (Proprietà e custodia)": null,
            "Subject1 -> PEC (Proprietà e custodia)": "prop@pec.it",
            "Subject1 -> Mail (Proprietà e custodia)": "mail@prop.it",
            "Subject1 -> Sito web (Proprietà e custodia)": "www.sito.it",
            "Subject1 -> Tipo (Proprietà e custodia)": "Proprietario",
            "Subject1 -> Data inizio contratto (Proprietà e custodia)": "2002 - 02 - 01T23: 00: 00.000Z",
            "Subject1 -> Data fine contratto (Proprietà e custodia)": "2002 - 02 - 02T23: 00: 00.000Z",
            "Subject1 -> Durata contratto (Proprietà e custodia)": null,
            "Subject1 -> Canone annuale (Proprietà e custodia)": 4343,
            "Subject1 -> Tipo possesso (Proprietà e custodia)": "Affitto a gestore"
        }

        expect(JSON.stringify(transformArrayFields(TEST_SHELTER_A, "management.subject"))).toBe(JSON.stringify(obj));
    });

    it("Should get and transform array field -> openingTime", () => {
        const obj = {
            "Apertura0 -> Apertura (inizio)": "2018 - 02 - 01T23: 00: 00.000Z",
            "Apertura0 -> Apertura (fine)": "2018 - 03 - 01T23: 00: 00.000Z",
            "Apertura0 -> Tipo apertura": "roba"
        }

        expect(JSON.stringify(transformArrayFields(TEST_SHELTER_A, "openingTime"))).toBe(JSON.stringify(obj));
    });

    it("Should get and transform array field -> services", () => {
        const test = {
            "Camere da 4 posti": "23",
            "Camere da 6 posti": "3",
            "Posti letto": "3",
            "Docce": "3"
        }

        expect(JSON.stringify(transformArrayFields(TEST_SHELTER_A, "services"))).toBe(JSON.stringify(test));
    });
});
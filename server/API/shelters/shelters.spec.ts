import 'jasmine'
import {
    createCSV,
    getValueForFieldDoc,
    processArrayField,
    processServicesFields,
    transform,
    getCSVDict
} from './csv.logic'

const TEST_SHELTER = {
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

describe('Common tools', () => {
    it('Should parse CSV single item', () => {
        const csvStr = `Nome,Nome comune,IDCAI,Tipo,Sezione,Proprietà,Stato,Categoria per la Regione,Categoria,Inserito il,Aggiornato il,Aggiornato da,Regione,Provincia/Città metropolitana,Comune,Località,GR (Gruppo Regionale),Commissione regionale,Ente sovracomunale di competenza,Quota (m slm),Latitudine,Longitudine,Gruppo montuoso,Valle,Comprensiorio sciistico,Zona tutelata,Sito,Nome (Contatti),Ruolo (Contatti),Telefono (Contatti),Cellulare (Contatti),PEC (Contatti),Link prenotazione (Contatti),Mail (Contatti),Sito web (Contatti),null,Riferimento (Proprietà),Regolarità edilizia,Anno di costruzione,Anno di ristrutturazione,Classe catastale,Codice catastale,Coerenza tipologica,Coerenza materica,Regolarità urbanistica,Consistenza corpo principale,Consistenza corpo secondario,Regolarità antincendio,Certificazione ISO 14001,Classe energetica,Quantità (KW),Green,Generatore diesel,Fotovoltaico,Tipo di riscaldamento,Tipo fonte energetica,Nome fonte energetica,Tipo di scarico,Scarico a norma,Disoleatore,Captazione certificata,Riciclo,Acqua,Disponibilità acqua,Periodi di siccità,Anno (Richiesta contributo),Lavori a corpo (€),Lavori a misura (€),Oneri di sicurezza (€),TOTALE LAVORI (€),Spese per indagini, rilievi, ecc. (€),Spese per allacciamenti a reti di distribuzione (€),Spese tecniche (€),Spese di collaudo (€),Tasse e oneri (€),TOTALE SPESE (€),IVA compresa perché non recuperabile,COSTO TOTALE DEL PROGETTO (€),Finanziamento esterno (€),Autofinanziamento (€),SCOPERTO (€),RICHIESTO (€),Contributo accettato,Tipo di contributo richiesto,services.pernottamento.camerate_da_4_posti,services.pernottamento.camerate_da_6_posti,services.pernottamento.posti_letto,services.servizi_igenici.docce,openingTime0.startDate,openingTime0.endDate,openingTime0.type,management.subject0.name,management.subject0.surname,management.subject0.taxCode,management.subject0.fixedPhone,management.subject0.mobilePhone,management.subject0.pec,management.subject0.email,management.subject0.webSite,management.subject0.type,management.subject0.contract_start_date,management.subject0.contract_end_date,management.subject0.contract_duration,management.subject0.contract_fee,management.subject0.possession_type,management.subject1.name,management.subject1.surname,management.subject1.taxCode,management.subject1.fixedPhone,management.subject1.mobilePhone,management.subject1.pec,management.subject1.email,management.subject1.webSite,management.subject1.type,management.subject1.contract_start_date,management.subject1.contract_end_date,management.subject1.contract_duration,management.subject1.contract_fee,management.subject1.possession_type\nADAME',,921606201,Capanna sociale,Cedegolo,Comune,,,,2017 - 09 - 22T21: 03: 30.663Z,2018 - 07 - 03T17: 37: 27.102Z,CAI Centrale,Lombardia,BS,SAVIORE DELL'ADAMELLO,CASINE DI MEZZO,Lombardia,LOM,,2107,46.236667,11.902778,alpi retiche,asdf,,,,,Custode,1235234523,23465264365,,,roba@roba.it,,,riferimento,true,2342,2341,a12,a112,Parziale,,true,vva,vvb,Sì,true,C,24,,,,Gas,,,IMHOFF pozzo perdente,true,,,true,Acquedotto,,Primavera,,,,,,,,,,,,,,,,,,,,23,3,3,3,2018 - 02 - 01T23: 00: 00.000Z,2018 - 03 - 01T23: 00: 00.000Z,roba,gest, cognomeGest,,23452345235,134522345,,,,,,,,22323342,Affitto a gestore,enteProp,,149052345234451,234504325234,,prop@pec.it,mail@prop.it,www.sito.it,Proprietario,2002 - 02 - 01T23: 00: 00.000Z,2002 - 02 - 02T23: 00: 00.000Z,,4343,Affitto a gestore`

        createCSV( < any > [TEST_SHELTER])
            .then(csv => {
                expect(csv).toBe(csvStr)
            })
            .catch(err => {
                expect(err).toBe(undefined)
            })
    });

    it('Should parse CSV multiple item', () => {
        const csvStr = `Nome,Nome comune,IDCAI,Tipo,Sezione,Proprietà,Stato,Categoria per la Regione,Categoria,Inserito il,Aggiornato il,Aggiornato da,Regione,Provincia/Città metropolitana,Comune,Località,GR (Gruppo Regionale),Commissione regionale,Ente sovracomunale di competenza,Quota (m slm),Latitudine,Longitudine,Gruppo montuoso,Valle,Comprensiorio sciistico,Zona tutelata,Sito,Nome (Contatti),Ruolo (Contatti),Telefono (Contatti),Cellulare (Contatti),PEC (Contatti),Link prenotazione (Contatti),Mail (Contatti),Sito web (Contatti),null,Riferimento (Proprietà),Regolarità edilizia,Anno di costruzione,Anno di ristrutturazione,Classe catastale,Codice catastale,Coerenza tipologica,Coerenza materica,Regolarità urbanistica,Consistenza corpo principale,Consistenza corpo secondario,Regolarità antincendio,Certificazione ISO 14001,Classe energetica,Quantità (KW),Green,Generatore diesel,Fotovoltaico,Tipo di riscaldamento,Tipo fonte energetica,Nome fonte energetica,Tipo di scarico,Scarico a norma,Disoleatore,Captazione certificata,Riciclo,Acqua,Disponibilità acqua,Periodi di siccità,Anno (Richiesta contributo),Lavori a corpo (€),Lavori a misura (€),Oneri di sicurezza (€),TOTALE LAVORI (€),Spese per indagini, rilievi, ecc. (€),Spese per allacciamenti a reti di distribuzione (€),Spese tecniche (€),Spese di collaudo (€),Tasse e oneri (€),TOTALE SPESE (€),IVA compresa perché non recuperabile,COSTO TOTALE DEL PROGETTO (€),Finanziamento esterno (€),Autofinanziamento (€),SCOPERTO (€),RICHIESTO (€),Contributo accettato,Tipo di contributo richiesto,services.pernottamento.camerate_da_4_posti,services.pernottamento.camerate_da_6_posti,services.pernottamento.posti_letto,services.servizi_igenici.docce,openingTime0.startDate,openingTime0.endDate,openingTime0.type,management.subject0.name,management.subject0.surname,management.subject0.taxCode,management.subject0.fixedPhone,management.subject0.mobilePhone,management.subject0.pec,management.subject0.email,management.subject0.webSite,management.subject0.type,management.subject0.contract_start_date,management.subject0.contract_end_date,management.subject0.contract_duration,management.subject0.contract_fee,management.subject0.possession_type,management.subject1.name,management.subject1.surname,management.subject1.taxCode,management.subject1.fixedPhone,management.subject1.mobilePhone,management.subject1.pec,management.subject1.email,management.subject1.webSite,management.subject1.type,management.subject1.contract_start_date,management.subject1.contract_end_date,management.subject1.contract_duration,management.subject1.contract_fee,management.subject1.possession_type\nADAME',,921606201,Capanna sociale,Cedegolo,Comune,,,,2017 - 09 - 22T21: 03: 30.663Z,2018 - 07 - 03T17: 37: 27.102Z,CAI Centrale,Lombardia,BS,SAVIORE DELL'ADAMELLO,CASINE DI MEZZO,Lombardia,LOM,,2107,46.236667,11.902778,alpi retiche,asdf,,,,,Custode,1235234523,23465264365,,,roba@roba.it,,,riferimento,true,2342,2341,a12,a112,Parziale,,true,vva,vvb,Sì,true,C,24,,,,Gas,,,IMHOFF pozzo perdente,true,,,true,Acquedotto,,Primavera,,,,,,,,,,,,,,,,,,,,23,3,3,3,2018 - 02 - 01T23: 00: 00.000Z,2018 - 03 - 01T23: 00: 00.000Z,roba,gest, cognomeGest,,23452345235,134522345,,,,,,,,22323342,Affitto a gestore,enteProp,,149052345234451,234504325234,,prop@pec.it,mail@prop.it,www.sito.it,Proprietario,2002 - 02 - 01T23: 00: 00.000Z,2002 - 02 - 02T23: 00: 00.000Z,,4343,Affitto a gestore\nADAME',,921606201,Capanna sociale,Cedegolo,Comune,,,,2017 - 09 - 22T21: 03: 30.663Z,2018 - 07 - 03T17: 37: 27.102Z,CAI Centrale,Lombardia,BS,SAVIORE DELL'ADAMELLO,CASINE DI MEZZO,Lombardia,LOM,,2107,46.236667,11.902778,alpi retiche,asdf,,,,,Custode,1235234523,23465264365,,,roba@roba.it,,,riferimento,true,2342,2341,a12,a112,Parziale,,true,vva,vvb,Sì,true,C,24,,,,Gas,,,IMHOFF pozzo perdente,true,,,true,Acquedotto,,Primavera,,,,,,,,,,,,,,,,,,,,23,3,3,3,2018 - 02 - 01T23: 00: 00.000Z,2018 - 03 - 01T23: 00: 00.000Z,roba,gest, cognomeGest,,23452345235,134522345,,,,,,,,22323342,Affitto a gestore,enteProp,,149052345234451,234504325234,,prop@pec.it,mail@prop.it,www.sito.it,Proprietario,2002 - 02 - 01T23: 00: 00.000Z,2002 - 02 - 02T23: 00: 00.000Z,,4343,Affitto a gestore`

        createCSV( < any > [TEST_SHELTER, TEST_SHELTER])
            .then(csv => {
                expect(csv).toBe(csvStr)
            })
            .catch(err => {
                expect(err).toBe(undefined)
            })
    });

    it('Should get CSV Dictionary', () => {
        const obj = {
            "Nome": ["ADAME'", "ADAME'"],
            "Nome comune": [null, null],
            "IDCAI": ["921606201", "921606201"],
            "Tipo": ["Capanna sociale", "Capanna sociale"],
            "Sezione": ["Cedegolo", "Cedegolo"],
            "Proprietà": ["Comune", "Comune"],
            "Stato": [null, null],
            "Categoria per la Regione": [null, null],
            "Categoria": [null, null],
            "Inserito il": ["2017 - 09 - 22T21: 03: 30.663Z", "2017 - 09 - 22T21: 03: 30.663Z"],
            "Aggiornato il": ["2018 - 07 - 03T17: 37: 27.102Z", "2018 - 07 - 03T17: 37: 27.102Z"],
            "Aggiornato da": ["CAI Centrale", "CAI Centrale"],
            "Regione": ["Lombardia", "Lombardia"],
            "Provincia/Città metropolitana": ["BS", "BS"],
            "Comune": ["SAVIORE DELL'ADAMELLO", "SAVIORE DELL'ADAMELLO"],
            "Località": ["CASINE DI MEZZO", "CASINE DI MEZZO"],
            "GR (Gruppo Regionale)": ["Lombardia", "Lombardia"],
            "Commissione regionale": ["LOM", "LOM"],
            "Ente sovracomunale di competenza": [null, null],
            "Quota (m slm)": [2107, 2107],
            "Latitudine": [46.236667, 46.236667],
            "Longitudine": [11.902778, 11.902778],
            "Gruppo montuoso": ["alpi retiche", "alpi retiche"],
            "Valle": ["asdf", "asdf"],
            "Comprensiorio sciistico": [null, null],
            "Zona tutelata": [null, null],
            "Sito": [null, null],
            "Nome (Contatti)": [null, null],
            "Ruolo (Contatti)": ["Custode", "Custode"],
            "Telefono (Contatti)": ["1235234523", "1235234523"],
            "Cellulare (Contatti)": ["23465264365", "23465264365"],
            "PEC (Contatti)": [null, null],
            "Link prenotazione (Contatti)": [null, null],
            "Mail (Contatti)": ["roba@roba.it", "roba@roba.it"],
            "Sito web (Contatti)": [null, null],
            "null": [null, null],
            "Riferimento (Proprietà)": ["riferimento", "riferimento"],
            "Regolarità edilizia": [true, true],
            "Anno di costruzione": ["2342", "2342"],
            "Anno di ristrutturazione": ["2341", "2341"],
            "Classe catastale": ["a12", "a12"],
            "Codice catastale": ["a112", "a112"],
            "Coerenza tipologica": ["Parziale", "Parziale"],
            "Coerenza materica": [null, null],
            "Regolarità urbanistica": [true, true],
            "Consistenza corpo principale": ["vva", "vva"],
            "Consistenza corpo secondario": ["vvb", "vvb"],
            "Regolarità antincendio": ["Sì", "Sì"],
            "Certificazione ISO 14001": [true, true],
            "Classe energetica": ["C", "C"],
            "Quantità (KW)": [24, 24],
            "Green": [null, null],
            "Generatore diesel": [null, null],
            "Fotovoltaico": [null, null],
            "Tipo di riscaldamento": ["Gas", "Gas"],
            "Tipo fonte energetica": [null, null],
            "Nome fonte energetica": [null, null],
            "Tipo di scarico": ["IMHOFF pozzo perdente", "IMHOFF pozzo perdente"],
            "Scarico a norma": [true, true],
            "Disoleatore": [null, null],
            "Captazione certificata": [null, null],
            "Riciclo": [true, true],
            "Acqua": ["Acquedotto", "Acquedotto"],
            "Disponibilità acqua": [null, null],
            "Periodi di siccità": ["Primavera", "Primavera"],
            "Anno (Richiesta contributo)": [null, null],
            "Lavori a corpo (€)": [null, null],
            "Lavori a misura (€)": [null, null],
            "Oneri di sicurezza (€)": [null, null],
            "TOTALE LAVORI (€)": [null, null],
            "Spese per indagini, rilievi, ecc. (€)": [null, null],
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
            "services.pernottamento.camerate_da_4_posti": ["23", "23"],
            "services.pernottamento.camerate_da_6_posti": ["3", "3"],
            "services.pernottamento.posti_letto": ["3", "3"],
            "services.servizi_igenici.docce": ["3", "3"],
            "openingTime0.startDate": ["2018 - 02 - 01T23: 00: 00.000Z", "2018 - 02 - 01T23: 00: 00.000Z"],
            "openingTime0.endDate": ["2018 - 03 - 01T23: 00: 00.000Z", "2018 - 03 - 01T23: 00: 00.000Z"],
            "openingTime0.type": ["roba", "roba"],
            "management.subject0.name": ["gest", "gest"],
            "management.subject0.surname": [" cognomeGest", " cognomeGest"],
            "management.subject0.taxCode": [null, null],
            "management.subject0.fixedPhone": ["23452345235", "23452345235"],
            "management.subject0.mobilePhone": ["134522345", "134522345"],
            "management.subject0.pec": [null, null],
            "management.subject0.email": [null, null],
            "management.subject0.webSite": [null, null],
            "management.subject0.type": [null, null],
            "management.subject0.contract_start_date": [null, null],
            "management.subject0.contract_end_date": [null, null],
            "management.subject0.contract_duration": [null, null],
            "management.subject0.contract_fee": [22323342, 22323342],
            "management.subject0.possession_type": ["Affitto a gestore", "Affitto a gestore"],
            "management.subject1.name": ["enteProp", "enteProp"],
            "management.subject1.surname": [null, null],
            "management.subject1.taxCode": ["149052345234451", "149052345234451"],
            "management.subject1.fixedPhone": ["234504325234", "234504325234"],
            "management.subject1.mobilePhone": [null, null],
            "management.subject1.pec": ["prop@pec.it", "prop@pec.it"],
            "management.subject1.email": ["mail@prop.it", "mail@prop.it"],
            "management.subject1.webSite": ["www.sito.it", "www.sito.it"],
            "management.subject1.type": ["Proprietario", "Proprietario"],
            "management.subject1.contract_start_date": ["2002 - 02 - 01T23: 00: 00.000Z", "2002 - 02 - 01T23: 00: 00.000Z"],
            "management.subject1.contract_end_date": ["2002 - 02 - 02T23: 00: 00.000Z", "2002 - 02 - 02T23: 00: 00.000Z"],
            "management.subject1.contract_duration": [null, null],
            "management.subject1.contract_fee": [4343, 4343],
            "management.subject1.possession_type": ["Affitto a gestore", "Affitto a gestore"]
        }

        expect(JSON.stringify(getCSVDict( < any > [TEST_SHELTER, TEST_SHELTER]))).toBe(JSON.stringify(obj))
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
            "null": null,
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
            "Spese per indagini, rilievi, ecc. (€)": null,
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
            "services.pernottamento.camerate_da_4_posti": "23",
            "services.pernottamento.camerate_da_6_posti": "3",
            "services.pernottamento.posti_letto": "3",
            "services.servizi_igenici.docce": "3",
            "openingTime0.startDate": "2018 - 02 - 01T23: 00: 00.000Z",
            "openingTime0.endDate": "2018 - 03 - 01T23: 00: 00.000Z",
            "openingTime0.type": "roba",
            "management.subject0.name": "gest",
            "management.subject0.surname": " cognomeGest",
            "management.subject0.taxCode": null,
            "management.subject0.fixedPhone": "23452345235",
            "management.subject0.mobilePhone": "134522345",
            "management.subject0.pec": null,
            "management.subject0.email": null,
            "management.subject0.webSite": null,
            "management.subject0.type": null,
            "management.subject0.contract_start_date": null,
            "management.subject0.contract_end_date": null,
            "management.subject0.contract_duration": null,
            "management.subject0.contract_fee": 22323342,
            "management.subject0.possession_type": "Affitto a gestore",
            "management.subject1.name": "enteProp",
            "management.subject1.surname": null,
            "management.subject1.taxCode": "149052345234451",
            "management.subject1.fixedPhone": "234504325234",
            "management.subject1.mobilePhone": null,
            "management.subject1.pec": "prop@pec.it",
            "management.subject1.email": "mail@prop.it",
            "management.subject1.webSite": "www.sito.it",
            "management.subject1.type": "Proprietario",
            "management.subject1.contract_start_date": "2002 - 02 - 01T23: 00: 00.000Z",
            "management.subject1.contract_end_date": "2002 - 02 - 02T23: 00: 00.000Z",
            "management.subject1.contract_duration": null,
            "management.subject1.contract_fee": 4343,
            "management.subject1.possession_type": "Affitto a gestore"
        }

        expect(JSON.stringify(transform( < any > TEST_SHELTER))).toBe(JSON.stringify(obj))
    });

    it('Should get value from normal field', () => {
        expect(getValueForFieldDoc(TEST_SHELTER, 'name')).toBe('ADAME\'');
        expect(getValueForFieldDoc(TEST_SHELTER, 'geoData.location.region')).toBe('Lombardia');
        expect(getValueForFieldDoc(TEST_SHELTER, 'contacts.role')).toBe('Custode');
        expect(getValueForFieldDoc(TEST_SHELTER, 'energy.class')).toBe('C');
        expect(getValueForFieldDoc(TEST_SHELTER, 'updateDate')).toBe('2018 - 07 - 03T17: 37: 27.102Z');
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

        expect(JSON.stringify(processArrayField('management.subject', TEST_SHELTER.management.subject))).toBe(JSON.stringify(obj))
    });

    it('Should get value from array -> openingTime', () => {
        const obj = {
            "openingTime0.startDate": "2018 - 02 - 01T23: 00: 00.000Z",
            "openingTime0.endDate": "2018 - 03 - 01T23: 00: 00.000Z",
            "openingTime0.type": "roba"
        }
        expect(JSON.stringify(processArrayField('openingTime', TEST_SHELTER.openingTime))).toBe(JSON.stringify(obj))
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
        expect(JSON.stringify(processArrayField('services', TEST_SHELTER.services))).toBe(JSON.stringify(obj))
        expect(JSON.stringify(processServicesFields(TEST_SHELTER.services))).toBe(JSON.stringify(obj1))
    });

});

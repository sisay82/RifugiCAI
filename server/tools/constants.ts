import * as path from 'path';
import { ENV_CONFIG } from '../config/env';

export const OUT_DIR = path.join(__dirname, '../../../dist');

export const MONTHS = [
    'gennaio',
    'febbraio',
    'marzo',
    'aprile',
    'maggio',
    'giugno',
    'luglio',
    'agosto',
    'settembre',
    'ottobre',
    'novembre',
    'dicembre'
];

export const CLEAR_CACHE_INTERVAL = 1000 * 60; // 1 minute
export const MAX_TIME = 1000 * 60 * 60; // 1 hour
export const MAX_SESSION_TIME = 1000 * 60 * 60; // 1 hour
export const MAX_DELAY_GET_REQUEST = 1000 * 10;

export const CAS_BASE_URL = 'https://accesso.cai.it';
export const AUTH_URL = 'https://services.cai.it/cai-integration-ws/secured/users/';
export const DISABLE_AUTH = false;

export const CAS_LOGOUT_URL = CAS_BASE_URL + '/cai-cas/logout'
export function getLoginURL() {
    return CAS_BASE_URL + '/cai-cas/login?service=' + ENV_CONFIG.getParsedURL();
}
export function getValidationURL(ticket: string) {
    return CAS_BASE_URL + '/cai-cas/serviceValidate?service=' + ENV_CONFIG.getParsedURL() + '&ticket=' + ticket
}

export const CSV_UNWINDS = {
    'services': [],
    'openingTime': ["Apertura"],
    'management.subject': [null, "Subject"],
    'contributions': ["Contributo"]
    // 'economy',
    // 'use',
    // 'contributions.attachments'
}

export const ENV_LIST = [
    'SESSION_SECRET',
    'USER_DATA_AUTH',
    'INFOMONT_USER',
    'INFOMONT_PASS',
]

export const CSV_UNWINDS_ALIASES = {
    "services": {
        "camerate_da_4_posti": "Camere da 4 posti",
        "camerate_da_6_posti": "Camere da 6 posti",
        "posti_letto": "Posti letto",
        "posti_letto_invernali": "Posti letto invernale",
        "tavolati": "Tavolati",
        "posti_totali": "Posti totali",
        "vendita_sacco_lenzuolo": "Vendita sacco lenzuolo",
        "ristorante": "Ristorante",
        "accesso_alla_cucina": "Accesso alla cucina",
        "acqua_in_rifugio": "Acqua in rifugio",
        "acqua_calda": "Acqua calda",
        "docce": "Docce",
        "WC_in_camera": "WC in camera",
        "WC_uso_comune": "WC uso comune",
        "elettricità": "Elettricità",
        "punti_ricarica_camere": "Punti ricarica camere",
        "punti_ricarica_spazi_comuni": "Punti ricarica spazi comuni",
        "WIFI": "WIFI",
        "segnale_GSM": "Segnale GSM",
        "gestore_telefonia_mobile": "Gestore telefonia mobile",
        "accessibilità_ai_disabili": "Accessibilità ai disabili",
        "servizi_igienici_per_disabili": "Servizi igienici per disabili",
        "accessibilità_famiglie_con_bambini": "Accessibilità famiglie con bambini",
        "accessibilità_macchina": "Accessibilità macchina",
        "ammissibilità_animali_domestici": "Ammissibilità animali domestici",
        "stanze_dedicate": "Stanze dedicate",
        "pagamento_POS": "Pagamento POS",
        "convenzioni": "convenzioni",
        "richiesta_di_rifornire_il_rifugio": "Richiesta di rifornire il rifugio",
        "presidio_culturale": "Presidio culturale",
        "attività_culturali/corsi_specifici": "Attività culturali/corsi specifici"
    },
    "management.subject": {
        "name": "Nome (Proprietà e custodia)",
        "surname": "Cognome (Proprietà e custodia)",
        "taxCode": "P. IVA (Proprietà e custodia)",
        "fixedPhone": "Telefono (Proprietà e custodia)",
        "mobilePhone": "Cellulare (Proprietà e custodia)",
        "pec": "PEC (Proprietà e custodia)",
        "email": "Mail (Proprietà e custodia)",
        "webSite": "Sito web (Proprietà e custodia)",
        "type": "Tipo (Proprietà e custodia)",
        "contract_start_date": "Data inizio contratto (Proprietà e custodia)",
        "contract_end_date": "Data fine contratto (Proprietà e custodia)",
        "contract_duration": "Durata contratto (Proprietà e custodia)",
        "contract_fee": "Canone annuale (Proprietà e custodia)",
        "possession_type": "Tipo possesso (Proprietà e custodia)",
    },
    "openingTime": {
        "startDate": "Apertura (inizio)",
        "endDate": "Apertura (fine)",
        "type": "Tipo apertura"
    },
    "contributions": {
        "year": "Anno (Richiesta contributo)",
        "data": {
            "handWorks": "Lavori a corpo (€)",
            "customizedWorks": "Lavori a misura (€)",
            "safetyCharges": "Oneri di sicurezza (€)",
            "totWorks": "TOTALE LAVORI (€)",
            "surveyorsCharges": "Spese per indagini - rilievi - ecc. (€)",
            "connectionsCharges": "Spese per allacciamenti a reti di distribuzione (€)",
            "technicalCharges": "Spese tecniche (€)",
            "testCharges": "Spese di collaudo (€)",
            "taxes": "Tasse e oneri (€)",
            "totCharges": "TOTALE SPESE (€)",
            "IVAincluded": "IVA compresa perché non recuperabile",
            "totalProjectCost": "COSTO TOTALE DEL PROGETTO (€)",
            "externalFinancing": "Finanziamento esterno (€)",
            "selfFinancing": "Autofinanziamento (€)",
            "red": "SCOPERTO (€)",
        },
        "value": "RICHIESTO (€)",
        "accepted": "Contributo accettato",
        "type": "Tipo di contributo richiesto"
    }
}

export const CSV_ALIASES = {
    "name": "Nome",
    "alias": "Nome comune",
    "idCai": "IDCAI",
    "type": "Tipo",
    "branch": "Sezione",
    "owner": "Proprietà",
    "status": "Stato",
    "regional_type": "Categoria per la Regione",
    "category": "Categoria",
    "insertDate": "Inserito il",
    "updateDate": "Aggiornato il",
    "updateSubject": "Aggiornato da",
    "geoData": {
        "location": {
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
        }
    },
    "contacts": {
        "name": "Nome (Contatti)",
        "role": "Ruolo (Contatti)",
        "fixedPhone": "Telefono (Contatti)",
        "mobilePhone": "Cellulare (Contatti)",
        "mailPec": "PEC (Contatti)",
        "prenotation_link": "Link prenotazione (Contatti)",
        "emailAddress": "Mail (Contatti)",
        "webAddress": "Sito web (Contatti)",
    },
    "management": {
        "reference": "Riferimento (Proprietà)",
        "self_management": "Autogestione",
        "pickupKey": "Ritiro chiavi",
    },
    "catastal": {
        "buildingRegulation": "Regolarità edilizia",
        "buildYear": "Anno di costruzione",
        "rebuildYear": "Anno di ristrutturazione",
        "class": "Classe catastale",
        "code": "Codice catastale",
        "typologicalCoherence": "Coerenza tipologica",
        "matericalCoherence": "Coerenza materica",
        "cityPlanRegulation": "Regolarità urbanistica",
        "mainBody": "Consistenza corpo principale",
        "secondaryBody": "Consistenza corpo secondario",
        "fireRegulation": "Regolarità antincendio",
        "ISO14001": "Certificazione ISO 14001",
    },
    "energy": {
        "class": "Classe energetica",
        "energy": "Quantità (KW)",
        "greenCertification": "Green",
        "powerGenerator": "Generatore diesel",
        "photovoltaic": "Fotovoltaico",
        "heating_type": "Tipo di riscaldamento",
        "sourceType": "Tipo fonte energetica",
        "sourceName": "Nome fonte energetica",
    },
    "drain": {
        "type": "Tipo di scarico",
        "regulation": "Scarico a norma",
        "oilSeparator": "Disoleatore",
        "water_certification": "Captazione certificata",
        "recycling": "Riciclo",
        "water_type": "Acqua",
        "water_availability": "Disponibilità acqua",
        "droughts": "Periodi di siccità",
    }
}

export const CSV_FIELDS = [
    "name",
    "alias",
    "idCai",
    "type",
    "branch",
    "owner",
    "status",
    "regional_type",
    "category",
    "insertDate",
    "updateDate",
    "updateSubject",
    "geoData.location.region",
    "geoData.location.province",
    "geoData.location.municipality",
    "geoData.location.locality",
    "geoData.location.ownerRegion",
    "geoData.location.regional_commission",
    "geoData.location.authorityJurisdiction",
    "geoData.location.altitude",
    "geoData.location.latitude",
    "geoData.location.longitude",
    "geoData.location.massif",
    "geoData.location.valley",
    "geoData.location.ski_area",
    "geoData.location.protected_area",
    "geoData.location.site",
    "services.name",
    "services.tags.key",
    "services.tags.value",
    "contacts.name",
    "contacts.role",
    "contacts.fixedPhone",
    "contacts.mobilePhone",
    "contacts.mailPec",
    "contacts.prenotation_link",
    "contacts.emailAddress",
    "contacts.webAddress",
    "openingTime.startDate",
    "openingTime.endDate",
    "openingTime.type",
    "management.subject.name",
    "management.subject.surname",
    "management.subject.taxCode",
    "management.subject.fixedPhone",
    "management.subject.mobilePhone",
    "management.subject.pec",
    "management.subject.email",
    "management.subject.webSite",
    "management.subject.type",
    "management.subject.contract_start_date",
    "management.subject.contract_end_date",
    "management.subject.contract_duration",
    "management.subject.contract_fee",
    "management.subject.possession_type",
    "management.reference",
    "catastal.buildingRegulation",
    "catastal.buildYear",
    "catastal.rebuildYear",
    "catastal.class",
    "catastal.code",
    "catastal.typologicalCoherence",
    "catastal.matericalCoherence",
    "catastal.cityPlanRegulation",
    "catastal.mainBody",
    "catastal.secondaryBody",
    "catastal.fireRegulation",
    "catastal.ISO14001",
    "energy.class",
    "energy.energy",
    "energy.greenCertification",
    "energy.powerGenerator",
    "energy.photovoltaic",
    "energy.heating_type",
    "energy.sourceType",
    "energy.sourceName",
    "drain.type",
    "drain.regulation",
    "drain.oilSeparator",
    "drain.water_certification",
    "drain.recycling",
    "drain.water_type",
    "drain.water_availability",
    "drain.droughts",
    "contributions.year",
    "contributions.data",
    "contributions.value",
    "contributions.accepted",
    "contributions.type",
]

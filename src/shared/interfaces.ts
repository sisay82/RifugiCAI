import { Enums } from './enums'

export interface IAnagrafica{
    nome:String,
    tipo_rifugio?:Enums.Tipo_Rif,
    tipo_regionale?:Enums.Tipo_Reg,
    categoria?:Enums.Tipo_Cat,
    indirizzo:{
        via:{type:String,required:true},
        numero:{type:Number,required:true},
        cap:{type:Number,required:true},
        citta:{type:String,required:true},
        stato:{type:String,required:true}
    },
    tel_fisso?:[String],
    tel_mobile?:[String],
    ind_mail?:[String],
    ind_web?:String,
    descrizione?:String,
    data_inserimento?:Date,
    tipo_custodia?:Enums.Tipo_Cust,
    custode?:String,//ObjectID
    proprietario?:String
}

export interface IApertura{
    data_apertura:Date,
    data_chiusura:Date,
    tipo_apertura:String
}


export interface ILog{
    stato:String,
    utente:String,
    data_ag?:Date
}

export interface IGeografici{
    valle?:String,
    com_montana?:String,
    gruppo_montuoso?:String,
    quota?:Number,
    coordinate?:{
        latitudine:Number,
        longitudine:Number
    },
    dati_aggiuntivi?:[{
        chiave:String,
        valore:String
    }]
}

export interface ICatastali{
    reg_edilizia?:Boolean,
    anno_costruzione?:Number,
    coer_tipologica?:{type:Enums.Tipo_Coe},
    coer_materica?:Boolean,
    reg_urbanistica?:Boolean,
    consistenza_c_principale?:String,
    consistenza_c_secondari?:String,
    classe_catastale?:String,
    reg_antincendio?:Boolean,
    classe_energetica?:String,
    certificazione?:String,
    energia_necessaria?:Number,
    cert_green?:Boolean,
    smaltimento_rifiuti?:String,
    raccolta_differenziata?:Boolean,
    smaltimento_reflui?:String,
    adeguamento_reflui?:Boolean,
    fonti_risorse?:[{
        tipo:{type:Enums.Tipo_Fonte},
        nome_fonte:String,
        descrizione?:String,
        valore?:Number
    }]
}

export interface IAmministrativi{
    codice_rifugio:Number,
    data_inizio_contratto?:Date,
    data_fine_contratto?:Date,
    durata_contratto?:Number,
    canone_contratto?:Number,
    titolo_possesso?:String,
    codice_sezione?:String
}

export interface IShelter {
    id?:String,
    name:String
}

export interface IRifugiot{
    id:String,
    anagrafica:IAnagrafica,    
    amministrativi?:IAmministrativi,
    aperture?:[{IApertura}],
    dati_geografici?:IGeografici,
    dati_catastali?:ICatastali,
    logs?:[{ILog}],
    servizi?:[{
        servizio:String,
        prezzo:Number,
        disponibilita:Number
    }]
}

export interface ITag{
    chiave:String;
    valore:String;
}

export interface IServizio{
    nome_servizio:String;
    categ_servizio?:String;
    descrizione?:String;
    tags?:[ITag];
}

export interface IUtente{
    nome:String;
    valore:String;
}
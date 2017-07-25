export namespace Enums {
    //Type of section available for shelter request
    export enum ShelterSectionType {
        Geolocation = <any>"geolocation",
        Contacts = <any>"contacts",
        Services = <any>"services",
        Management = <any>"management",
        Catastal = <any>"catastal"
    }

    //tipo riscaldamento
    export enum Heating_Type {
        ELETTRICO = <any>"Elettrico",
        GAS = <any>"Gas",
        SOLARE = <any>"Solare",
        LEGNA = <any>"Legna",
        ASSENTE = <any>"Assente"
    }

    //stagioni
    export enum Seasons {
        PRIMAVERA = <any>"Primavera",
        ESTATE = <any>"Estate",
        AUTUNNO = <any>"Autunno",
        INVERNO = <any>"Inverno"
    }

    //disponibilitá acqua
    export enum Water_Availability {
        SCARSA = <any>"Scarsa", 
        COSTANTE = <any>"Costante", 
        MEDIA = <any>"Media",
        ABBONDANTE = <any>"Abbondante"
    }

    //tipologia fonte acqua
    export enum Water_Type {
        ASSENTE = <any>"Assente", 
        ACQUEDOTTO =<any> "Acquedotto", 
        CAPTAZIONE = <any>"Captazione"
    }

    //tipo rifugio
    export enum Shelter_Type {
        RIFUGIO=<any>"Rifugio",
        BIVACCO=<any>"Bivacco",
        RIFUGIO_CUSTODITO=<any>"Rifugio custodito",
        RIFUGIO_INCUSTODITO=<any>"Rifugio incustodito",
        CAPANNA_SOCIALE=<any>"Capanna sociale",
        PUNTO_dAPPOGGIO=<any>"Punto d'appoggio"
    }

    //tipo rifugio regionale
    export enum Regional_Type {
        ESCURSIONISTICO = <any>"Escursionistico",
        ALPINISTICO = <any>"Alpinistico",
        BIVACCO = <any>"Bivacco",
        NON_CLASSIFICABILE = <any>"Non classificabile"
    }

    //categoria rifugio
    export enum Shelter_Category {
        A=<any>"A",
        B=<any>"B",
        C=<any>"C",
        D=<any>"D"
    }

    //tipologia scarico
    export enum Drain_Type {
        IMOF_FOGNATURA=<any>"IMOF fognatura",
        IMOF_POZZO_PERDENTE=<any>"IMOF pozzo perdente",
        IMOF_DISPERSORE_SOTTOSUOLO=<any>"IMOF dispersore sottosuolo"
    }

    //coerenza tipologica
    export enum Typo_consistency {
        PIENA=<any>"Piena",
        PARZIALE=<any>"Parziale",
        RECUPERABILE=<any>"Recuperabile",
        NESSUNA=<any>"Nessuna"
    }

    //tipo fonte risorsa
    export enum Source_Type {
        ENERGETICA = <any>"Energetica",
        IDRICA = <any>"Idrica",
        RISCALDAMENTO = <any>"Riscaldamento"
    }

    export enum Owner_Type
    {
        Custode,
        Proprietario
    }

    //tipo custodia
    export enum Custody_Type {
        DIRETTA = <any>"Diretta",
        AFFIRRO_A_GESTORE = <any>"Affitto a gestore",
        AFFITTO_RAMO_AZIENDA = <any>"Affito ramo azienda",
        CAPANNA_SOCIALE = <any>"Capanna sociale",
        CUSTODIA = <any>"Custodia"
    }
}
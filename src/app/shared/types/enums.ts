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
        ELETTRICO = "Elettrico",
        GAS = "Gas",
        SOLARE = "Solare",
        LEGNA = "Legna",
        ASSENTE = "Assente"
    }

    //stagioni
    export enum Seasons {
        PRIMAVERA = "Primavera",
        ESTATE = "Estate",
        AUTUNNO = "Autunno",
        INVERNO = "Inverno"
    }

    //disponibilitá acqua
    export enum Water_Availability {
        SCARSA = "Scarsa", 
        COSTANTE = "Costante", 
        MEDIA = "Media",
        ABBONDANTE = "Abbondante"
    }

    //tipologia fonte acqua
    export enum Water_Type {
        ASSENTE = "Assente", 
        ACQUEDOTTO = "Acquedotto", 
        CAPTAZIONE = "Captazione"
    }

    //tipo rifugio
    export enum Shelter_Type {
        RIFUGIO="Rifugio",
        BIVACCO="Bivacco",
        RIFUGIO_CUSTODITO="Rifugio custodito",
        RIFUGIO_INCUSTODITO="Rifugio incustodito",
        CAPANNA_SOCIALE="Capanna sociale",
        PUNTO_dAPPOGGIO="Punto d'appoggio"
    }

    //tipo rifugio regionale
    export enum Regional_Type {
        ESCURSIONISTICO = "Escursionistico",
        ALPINISTICO = "Alpinistico",
        BIVACCO = "Bivacco",
        NON_CLASSIFICABILE = "Non classificabile"
    }

    //categoria rifugio
    export enum Shelter_Category {
        A="A",
        B="B",
        C="C",
        D="D"
    }

    //tipologia scarico
    export enum Drain_Type {
        IMOF_FOGNATURA="IMOF fognatura",
        IMOF_POZZO_PERDENTE="IMOF pozzo perdente",
        IMOF_DISPERSORE_SOTTOSUOLO="IMOF dispersore sottosuolo"
    }

    //coerenza tipologica
    export enum Typo_consistency {
        PIENA="Piena",
        PARZIALE="Parziale",
        RECUPERABILE="Recuperabile",
        NESSUNA="Nessuna"
    }

    //tipo fonte risorsa
    export enum Source_Type {
        ENERGETICA = "Energetica",
        IDRICA = "Idrica",
        RISCALDAMENTO = "Riscaldamento"
    }

    export enum Owner_Type
    {
        Custode,
        Proprietario
    }

    //tipo custodia
    export enum Custody_Type {
        DIRETTA = "Diretta",
        AFFIRRO_A_GESTORE = "Affitto a gestore",
        AFFITTO_RAMO_AZIENDA = "Affito ramo azienda",
        CAPANNA_SOCIALE = "Capanna sociale",
        CUSTODIA = "Custodia"
    }
}
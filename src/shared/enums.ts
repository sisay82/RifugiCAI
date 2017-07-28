export namespace Enums {
    //Type of section available for shelter request
    export enum ShelterSectionType {
        "geolocation",
        "contacts",
        "services",
        "management",
        "catastal"
    }

    //tipo riscaldamento
    export enum Heating_Type {
        "Elettrico",
        "Gas",
        "Solare",
        "Legna",
        "Assente"
    }

    //tipo classe energetica
    export enum Energy_Class_Type {
        "A+", "A", "B", "C", "D", "E", "F", "G"
    }

    //tipo di regolamentazione antincendio
    export enum Fire_Regulation_Type {
        "Sì", 
        "No", 
        "In fase di adeguamento"
    }

    //tipo di possesso
    export enum Possession_Type {
        "Affitto ramo d'impresa", 
        "Affitto immobile", 
        "Affitto a gestore", 
        "Diretto", 
        "Capanna sociale", 
        "Custodia", 
        "Proprietà", 
        "Usufrutto", 
        "Concessione", 
        "Comodato"
    }

    //stagioni
    export enum Seasons {
        "Primavera",
        "Estate",
        "Autunno",
        "Inverno"
    }

    //disponibilitá acqua
    export enum Water_Availability {
        "Scarsa", 
        "Costante", 
        "Media",
        "Abbondante"
    }

    //tipologia fonte acqua
    export enum Water_Type {
        "Assente", 
        "Acquedotto", 
        "Captazione"
    }

    //tipo rifugio
    export enum Shelter_Type {
        "Bivacco",
        "Rifugio custodito",
        "Rifugio incustodito",
        "Capanna sociale",
        "Punto d'appoggio"
    }

    //tipo rifugio regionale
    export enum Regional_Type {
        "Escursionistico",
        "Alpinistico",
        "Bivacco",
        "Non classificabile"
    }

    //categoria rifugio
    export enum Shelter_Category {
        "A",
        "B",
        "C",
        "D"
    }

    //tipologia scarico
    export enum Drain_Type {
        "IMOF fognatura",
        "IMOF pozzo perdente",
        "IMOF dispersore sottosuolo"
    }

    //coerenza tipologica
    export enum Typo_consistency {
        "Piena",
        "Parziale",
        "Recuperabile",
        "Nessuna"
    }

    //tipo fonte risorsa
    export enum Source_Type {
        "Energetica",
        "Idrica",
        "Riscaldamento"
    }

    export enum Owner_Type
    {
        Custode,
        Proprietario
    }

    //tipo custodia
    export enum Custody_Type {
        "Diretta",
        "Affitto a gestore",
        "Affito ramo azienda",
        "Capanna sociale",
        "Custodia"
    }
}
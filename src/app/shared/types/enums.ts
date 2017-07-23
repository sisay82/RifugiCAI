export namespace Enums {
    //Type of section available for shelter request
    export enum ShelterSectionType {
        Geolocation = <any>"geolocation",
        Contacts = <any>"contacts",
        Services = <any>"services",
        Management = <any>"management",
        Catastal = <any>"catastal"
    }

    //tipo rifugio
    export enum Shelter_Type
    {
        Rifugio,
        Bivacco,
        Rifugio_Custodito,
        Rifugio_Incustodito,
        Capanna_Sociale,
        Punto_Appoggio
    }

    //tipo rifugio regionale
    export enum Regional_Type {
        Escursionistico,
        Alpinistico,
        Bivacco,
        Non_Classificabile
    }

    //categoria rifugio
    export enum Shelter_Category {
        A,
        B,
        C,
        D
    }

    //coerenza tipologica
    export enum Typo_consistency {
        Piena,
        Parziale,
        Recuperabile,
        Nessuna
    }

    //tipo fonte risorsa
    export enum Source_Type {
        Energetica,
        Idrica,
        Riscaldamento
    }

    export enum Owner_Type
    {
        Custode,
        Proprietario
    }

    //tipo custodia
    export enum Custody_Type {
        Diretta,
        Affitto_a_Gestore,
        Affito_Ramo_Azienda,
        Capanna_Sociale,
        Custodia
    }
}
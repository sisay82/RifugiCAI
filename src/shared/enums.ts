export namespace Enums{
    //tipo rifugio
    export enum Tipo_Rif
    {
        Bivacco,
        Rifugio_Custodito,
        Rifugio_Incustodito,
        Capanna_Sociale,
        Punto_dAppoggio
    }

    //tipo rifugio regionale
    export enum Tipo_Reg
    {
        Escursionistico,
        Aplinistico,
        Bivacco,
        Non_Classificabile
    }

    //categoria rifugio
    export enum Tipo_Cat
    {
        A,
        B,
        C,
        D
    }

    //coerenza tipologica
    export enum Tipo_Coe
    {
        Piena,
        Parziale,
        Recuperabile,
        Nessuna
    }

    //tipo fonte risorsa
    export enum Tipo_Fonte
    {
        Energetica,
        Idrica,
        Riscaldamento
    }

    //tipo custodia
    export enum Tipo_Cust
    {
        Diretta,
        Affitto_a_Gestore,
        Affito_Ramo_Azienda,
        Capanna_Sociale,
        Custodia
    }
}
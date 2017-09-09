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
        "Assente",
        "Combinato"
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
        "Captazione superficiale",
        "Captazione da sorgente",
        "Nelle vicinanze"
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
        "D",
        "E"
    }

    //tipo di file
    export enum File_Type {
        doc,
        map,
        invoice,
        image
    }

    //tipi di documento
    export enum Docs_Type {
        txt=<any>"text/plain",
        pdf=<any>"application/pdf",
        doc=<any>"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        docx=<any>"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls=<any>"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        xlsx=<any>"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }

    //tipi di mappa
    export enum Maps_Type {
        dwg=<any>"application/acad, application/x-acad, application/autocad_dwg, image/x-dwg, application/dwg, application/x-dwg, application/x-autocad, image/vnd.dwg, drawing/dwg",
        pdf=<any>"application/pdf"
    }

    //tipi di ricevuta
    export enum Invoices_Type {
        txt=<any>"text/plain",
        pdf=<any>"application/pdf",
        doc=<any>"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        docx=<any>"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls=<any>"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        xlsx=<any>"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }

    export enum Image_Type {
        png=<any>"image/png",
        jpeg=<any>"image/jpeg",
        jpg=<any>"image/jpeg"
    }
    
    //tipologia scarico
    export enum Drain_Type {
        "IMOF fognatura",
        "IMOF pozzo perdente",
        "IMOF dispersore sottosuolo",
        "IMOF trasporto a valle"
    }

    //tipologia di utente
    export enum User_Type {
        "central",
        "regional",
        "sectional"
    }

    //permessi per dettagli rifugio
    export const DetailRevisionPermission:any[] = [
        User_Type.central,
        User_Type.sectional
    ]  
    
    //permessi per documenti rifugio
    export const DocRevisionPermission:any[] = [
        User_Type.central,
        User_Type.sectional
    ]

    //permessi per economia rifugio
    export const EconomyRevisionPermission:any[] = [
        User_Type.central,
        User_Type.sectional
    ]

    //permessi per inserimento rifugio
    export const InsertShelterPermission:any[] = [
        User_Type.central
    ]
    
    //permessi per rimozione rifugio
    export const DeleteShelterPermission:any[] = [
        User_Type.central
    ]

    //sezioni del menu
    export enum MenuSection {
        "detail",
        "document",
        "economy"
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
        Proprietario,
        Gestore
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
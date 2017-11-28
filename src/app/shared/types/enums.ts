export namespace Enums {
    export enum ShelterSectionType {
        "geolocation",
        "contacts",
        "services",
        "management",
        "catastal"
    }

    export enum Heating_Type {
        "Elettrico",
        "Gas",
        "Solare",
        "Legna",
        "Assente",
        "Combinato"
    }

    export enum Routed_Component{
        geographic=<any>"geographic",
        services=<any>"services",
        contacts=<any>"contacts",
        management=<any>"management",
        catastal=<any>"catastal",
        documents=<any>"documents",
        images=<any>"images",
        economy=<any>"economy",
        contribution=<any>"contribution",
        use=<any>"use",
        working=<any>"working"
    }
    
    export enum Routed_Outlet{
        content=<any>"content",
        revision=<any>"revision"
    }

    export enum Contribution_Type {
        "Ordinario",
        "FondoStabile",
        "Contributo Pubblico",
        "Contributo Privato",
        "Canone d'affitto"
    }

    export const Contributions = [
        Contribution_Type["Ordinario"],
        Contribution_Type["FondoStabile"]
    ]

    export enum Energy_Class_Type {
        "A+", "A", "B", "C", "D", "E", "F", "G"
    }

    export enum Fire_Regulation_Type {
        "Sì", 
        "No", 
        "In fase di adeguamento"
    }

    export enum Possession_Type {
        "Affitto ramo d'impresa", 
        "Affitto immobile", 
        "Affitto a gestore", 
        "Diretto", 
        "Custodia", 
        "Proprietà", 
        "Usufrutto", 
        "Concessione", 
        "Comodato"
    }

    export enum Seasons {
        "Primavera",
        "Estate",
        "Autunno",
        "Inverno"
    }

    export enum Water_Availability {
        "Scarsa", 
        "Costante", 
        "Media",
        "Abbondante"
    }

    export enum Water_Type {
        "Assente", 
        "Acquedotto", 
        "Captazione superficiale",
        "Captazione da sorgente",
        "Nelle vicinanze"
    }

    export enum Shelter_Type {
        "Bivacco",
        "Rifugio custodito",
        "Rifugio incustodito",
        "Capanna sociale",
        "Punto d'appoggio"
    }

    export enum Regional_Type {
        "Escursionistico",
        "Alpinistico",
        "Bivacco",
        "Non classificabile"
    }

    export enum Shelter_Category {
        "A",
        "B",
        "C",
        "D",
        "E"
    }

    export enum File_Type {
        doc,
        map,
        invoice,
        image,
        contribution
    }

    export enum Docs_Type {
        txt=<any>"text/plain",
        pdf=<any>"application/pdf",
        doc=<any>"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        docx=<any>"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls=<any>"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        xlsx=<any>"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }

    export enum Maps_Type {
        dwg=<any>"application/acad, application/x-acad, application/autocad_dwg, image/x-dwg, application/dwg, application/x-dwg, application/x-autocad, image/vnd.dwg, drawing/dwg",
        pdf=<any>"application/pdf"
    }

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
    
    export enum Drain_Type {
        "IMHOFF fognatura",
        "IMHOFF pozzo perdente",
        "IMHOFF dispersore sottosuolo",
        "IMHOFF trasporto a valle"
    }

    export enum Typo_consistency {
        "Piena",
        "Parziale",
        "Recuperabile",
        "Nessuna"
    }

    export enum Region_Code{
        "Liguria"=10,
        "Piemonte"=12,
        "Valle d'Aosta"=14,
        "Lombardia"=16,
        "Trentino Alto Adige"=18,
        "Alto Adige"=19,
        "Veneto"=20,
        "Friuli-Venezia Giulia"=22,
        "Emilia Romagna"=24,
        "Toscana"=26,
        "Marche"=28,
        "Umbria"=30,
        "Lazio"=32,
        "Abruzzo"=34,
        "Molise"=36,
        "Campania"=38,
        "Puglia"=40,
        "Basilicata"=42,
        "Calabria"=44,
        "Sicilia"=46,
        "Sardegna"=48
    }

    export enum Invoice_Type {
        "Attività",
        "Passività"
    }

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

    export enum Custody_Type {
        "Diretta",
        "Affitto a gestore",
        "Affito ramo azienda",
        "Capanna sociale",
        "Custodia"
    }
}
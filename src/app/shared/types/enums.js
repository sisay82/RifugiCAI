"use strict";
exports.__esModule = true;
var Enums;
(function (Enums) {
    //Type of section available for shelter request
    var ShelterSectionType;
    (function (ShelterSectionType) {
        ShelterSectionType[ShelterSectionType["geolocation"] = 0] = "geolocation";
        ShelterSectionType[ShelterSectionType["contacts"] = 1] = "contacts";
        ShelterSectionType[ShelterSectionType["services"] = 2] = "services";
        ShelterSectionType[ShelterSectionType["management"] = 3] = "management";
        ShelterSectionType[ShelterSectionType["catastal"] = 4] = "catastal";
    })(ShelterSectionType = Enums.ShelterSectionType || (Enums.ShelterSectionType = {}));
    //tipo riscaldamento
    var Heating_Type;
    (function (Heating_Type) {
        Heating_Type[Heating_Type["Elettrico"] = 0] = "Elettrico";
        Heating_Type[Heating_Type["Gas"] = 1] = "Gas";
        Heating_Type[Heating_Type["Solare"] = 2] = "Solare";
        Heating_Type[Heating_Type["Legna"] = 3] = "Legna";
        Heating_Type[Heating_Type["Assente"] = 4] = "Assente";
        Heating_Type[Heating_Type["Combinato"] = 5] = "Combinato";
    })(Heating_Type = Enums.Heating_Type || (Enums.Heating_Type = {}));
    var Contribution_Type;
    (function (Contribution_Type) {
        Contribution_Type[Contribution_Type["Ordinario CAI"] = 0] = "Ordinario CAI";
        Contribution_Type[Contribution_Type["FondoStabile"] = 1] = "FondoStabile";
        Contribution_Type[Contribution_Type["Contributo Pubblico"] = 2] = "Contributo Pubblico";
        Contribution_Type[Contribution_Type["Contributo Privato"] = 3] = "Contributo Privato";
    })(Contribution_Type = Enums.Contribution_Type || (Enums.Contribution_Type = {}));
    //tipo classe energetica
    var Energy_Class_Type;
    (function (Energy_Class_Type) {
        Energy_Class_Type[Energy_Class_Type["A+"] = 0] = "A+";
        Energy_Class_Type[Energy_Class_Type["A"] = 1] = "A";
        Energy_Class_Type[Energy_Class_Type["B"] = 2] = "B";
        Energy_Class_Type[Energy_Class_Type["C"] = 3] = "C";
        Energy_Class_Type[Energy_Class_Type["D"] = 4] = "D";
        Energy_Class_Type[Energy_Class_Type["E"] = 5] = "E";
        Energy_Class_Type[Energy_Class_Type["F"] = 6] = "F";
        Energy_Class_Type[Energy_Class_Type["G"] = 7] = "G";
    })(Energy_Class_Type = Enums.Energy_Class_Type || (Enums.Energy_Class_Type = {}));
    //tipo di regolamentazione antincendio
    var Fire_Regulation_Type;
    (function (Fire_Regulation_Type) {
        Fire_Regulation_Type[Fire_Regulation_Type["S\u00EC"] = 0] = "S\u00EC";
        Fire_Regulation_Type[Fire_Regulation_Type["No"] = 1] = "No";
        Fire_Regulation_Type[Fire_Regulation_Type["In fase di adeguamento"] = 2] = "In fase di adeguamento";
    })(Fire_Regulation_Type = Enums.Fire_Regulation_Type || (Enums.Fire_Regulation_Type = {}));
    //tipo di possesso
    var Possession_Type;
    (function (Possession_Type) {
        Possession_Type[Possession_Type["Affitto ramo d'impresa"] = 0] = "Affitto ramo d'impresa";
        Possession_Type[Possession_Type["Affitto immobile"] = 1] = "Affitto immobile";
        Possession_Type[Possession_Type["Affitto a gestore"] = 2] = "Affitto a gestore";
        Possession_Type[Possession_Type["Diretto"] = 3] = "Diretto";
        Possession_Type[Possession_Type["Capanna sociale"] = 4] = "Capanna sociale";
        Possession_Type[Possession_Type["Custodia"] = 5] = "Custodia";
        Possession_Type[Possession_Type["Propriet\u00E0"] = 6] = "Propriet\u00E0";
        Possession_Type[Possession_Type["Usufrutto"] = 7] = "Usufrutto";
        Possession_Type[Possession_Type["Concessione"] = 8] = "Concessione";
        Possession_Type[Possession_Type["Comodato"] = 9] = "Comodato";
    })(Possession_Type = Enums.Possession_Type || (Enums.Possession_Type = {}));
    //stagioni
    var Seasons;
    (function (Seasons) {
        Seasons[Seasons["Primavera"] = 0] = "Primavera";
        Seasons[Seasons["Estate"] = 1] = "Estate";
        Seasons[Seasons["Autunno"] = 2] = "Autunno";
        Seasons[Seasons["Inverno"] = 3] = "Inverno";
    })(Seasons = Enums.Seasons || (Enums.Seasons = {}));
    //disponibilitá acqua
    var Water_Availability;
    (function (Water_Availability) {
        Water_Availability[Water_Availability["Scarsa"] = 0] = "Scarsa";
        Water_Availability[Water_Availability["Costante"] = 1] = "Costante";
        Water_Availability[Water_Availability["Media"] = 2] = "Media";
        Water_Availability[Water_Availability["Abbondante"] = 3] = "Abbondante";
    })(Water_Availability = Enums.Water_Availability || (Enums.Water_Availability = {}));
    //tipologia fonte acqua
    var Water_Type;
    (function (Water_Type) {
        Water_Type[Water_Type["Assente"] = 0] = "Assente";
        Water_Type[Water_Type["Acquedotto"] = 1] = "Acquedotto";
        Water_Type[Water_Type["Captazione superficiale"] = 2] = "Captazione superficiale";
        Water_Type[Water_Type["Captazione da sorgente"] = 3] = "Captazione da sorgente";
        Water_Type[Water_Type["Nelle vicinanze"] = 4] = "Nelle vicinanze";
    })(Water_Type = Enums.Water_Type || (Enums.Water_Type = {}));
    //tipo rifugio
    var Shelter_Type;
    (function (Shelter_Type) {
        Shelter_Type[Shelter_Type["Bivacco"] = 0] = "Bivacco";
        Shelter_Type[Shelter_Type["Rifugio custodito"] = 1] = "Rifugio custodito";
        Shelter_Type[Shelter_Type["Rifugio incustodito"] = 2] = "Rifugio incustodito";
        Shelter_Type[Shelter_Type["Capanna sociale"] = 3] = "Capanna sociale";
        Shelter_Type[Shelter_Type["Punto d'appoggio"] = 4] = "Punto d'appoggio";
    })(Shelter_Type = Enums.Shelter_Type || (Enums.Shelter_Type = {}));
    //tipo rifugio regionale
    var Regional_Type;
    (function (Regional_Type) {
        Regional_Type[Regional_Type["Escursionistico"] = 0] = "Escursionistico";
        Regional_Type[Regional_Type["Alpinistico"] = 1] = "Alpinistico";
        Regional_Type[Regional_Type["Bivacco"] = 2] = "Bivacco";
        Regional_Type[Regional_Type["Non classificabile"] = 3] = "Non classificabile";
    })(Regional_Type = Enums.Regional_Type || (Enums.Regional_Type = {}));
    //categoria rifugio
    var Shelter_Category;
    (function (Shelter_Category) {
        Shelter_Category[Shelter_Category["A"] = 0] = "A";
        Shelter_Category[Shelter_Category["B"] = 1] = "B";
        Shelter_Category[Shelter_Category["C"] = 2] = "C";
        Shelter_Category[Shelter_Category["D"] = 3] = "D";
        Shelter_Category[Shelter_Category["E"] = 4] = "E";
    })(Shelter_Category = Enums.Shelter_Category || (Enums.Shelter_Category = {}));
    //tipo di file
    var File_Type;
    (function (File_Type) {
        File_Type[File_Type["doc"] = 0] = "doc";
        File_Type[File_Type["map"] = 1] = "map";
        File_Type[File_Type["invoice"] = 2] = "invoice";
        File_Type[File_Type["image"] = 3] = "image";
    })(File_Type = Enums.File_Type || (Enums.File_Type = {}));
    //tipi di documento
    var Docs_Type;
    (function (Docs_Type) {
        Docs_Type[Docs_Type["txt"] = "text/plain"] = "txt";
        Docs_Type[Docs_Type["pdf"] = "application/pdf"] = "pdf";
        Docs_Type[Docs_Type["doc"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = "doc";
        Docs_Type[Docs_Type["docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = "docx";
        Docs_Type[Docs_Type["xls"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = "xls";
        Docs_Type[Docs_Type["xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = "xlsx";
    })(Docs_Type = Enums.Docs_Type || (Enums.Docs_Type = {}));
    //tipi di mappa
    var Maps_Type;
    (function (Maps_Type) {
        Maps_Type[Maps_Type["dwg"] = "application/acad, application/x-acad, application/autocad_dwg, image/x-dwg, application/dwg, application/x-dwg, application/x-autocad, image/vnd.dwg, drawing/dwg"] = "dwg";
        Maps_Type[Maps_Type["pdf"] = "application/pdf"] = "pdf";
    })(Maps_Type = Enums.Maps_Type || (Enums.Maps_Type = {}));
    //tipi di ricevuta
    var Invoices_Type;
    (function (Invoices_Type) {
        Invoices_Type[Invoices_Type["txt"] = "text/plain"] = "txt";
        Invoices_Type[Invoices_Type["pdf"] = "application/pdf"] = "pdf";
        Invoices_Type[Invoices_Type["doc"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = "doc";
        Invoices_Type[Invoices_Type["docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = "docx";
        Invoices_Type[Invoices_Type["xls"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = "xls";
        Invoices_Type[Invoices_Type["xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = "xlsx";
    })(Invoices_Type = Enums.Invoices_Type || (Enums.Invoices_Type = {}));
    var Image_Type;
    (function (Image_Type) {
        Image_Type[Image_Type["png"] = "image/png"] = "png";
        Image_Type[Image_Type["jpeg"] = "image/jpeg"] = "jpeg";
        Image_Type[Image_Type["jpg"] = "image/jpeg"] = "jpg";
    })(Image_Type = Enums.Image_Type || (Enums.Image_Type = {}));
    //tipologia scarico
    var Drain_Type;
    (function (Drain_Type) {
        Drain_Type[Drain_Type["IMOF fognatura"] = 0] = "IMOF fognatura";
        Drain_Type[Drain_Type["IMOF pozzo perdente"] = 1] = "IMOF pozzo perdente";
        Drain_Type[Drain_Type["IMOF dispersore sottosuolo"] = 2] = "IMOF dispersore sottosuolo";
        Drain_Type[Drain_Type["IMOF trasporto a valle"] = 3] = "IMOF trasporto a valle";
    })(Drain_Type = Enums.Drain_Type || (Enums.Drain_Type = {}));
    //coerenza tipologica
    var Typo_consistency;
    (function (Typo_consistency) {
        Typo_consistency[Typo_consistency["Piena"] = 0] = "Piena";
        Typo_consistency[Typo_consistency["Parziale"] = 1] = "Parziale";
        Typo_consistency[Typo_consistency["Recuperabile"] = 2] = "Recuperabile";
        Typo_consistency[Typo_consistency["Nessuna"] = 3] = "Nessuna";
    })(Typo_consistency = Enums.Typo_consistency || (Enums.Typo_consistency = {}));
    //Region group code for cai
    var Region_Code;
    (function (Region_Code) {
        Region_Code[Region_Code["Liguria"] = 10] = "Liguria";
        Region_Code[Region_Code["Piemonte"] = 12] = "Piemonte";
        Region_Code[Region_Code["Valle d'Aosta"] = 14] = "Valle d'Aosta";
        Region_Code[Region_Code["Lombardia"] = 16] = "Lombardia";
        Region_Code[Region_Code["Trentino Alto Adige"] = 18] = "Trentino Alto Adige";
        Region_Code[Region_Code["Alto Adige"] = 19] = "Alto Adige";
        Region_Code[Region_Code["Veneto"] = 20] = "Veneto";
        Region_Code[Region_Code["Friuli-Venezia Giulia"] = 22] = "Friuli-Venezia Giulia";
        Region_Code[Region_Code["Emilia Romagna"] = 24] = "Emilia Romagna";
        Region_Code[Region_Code["Toscana"] = 26] = "Toscana";
        Region_Code[Region_Code["Marche"] = 28] = "Marche";
        Region_Code[Region_Code["Umbria"] = 30] = "Umbria";
        Region_Code[Region_Code["Lazio"] = 32] = "Lazio";
        Region_Code[Region_Code["Abruzzo"] = 34] = "Abruzzo";
        Region_Code[Region_Code["Molise"] = 36] = "Molise";
        Region_Code[Region_Code["Campania"] = 38] = "Campania";
        Region_Code[Region_Code["Puglia"] = 40] = "Puglia";
        Region_Code[Region_Code["Basilicata"] = 42] = "Basilicata";
        Region_Code[Region_Code["Calabria"] = 44] = "Calabria";
        Region_Code[Region_Code["Sicilia"] = 46] = "Sicilia";
        Region_Code[Region_Code["Sardegna"] = 48] = "Sardegna";
    })(Region_Code = Enums.Region_Code || (Enums.Region_Code = {}));
    //tipo fonte risorsa
    var Source_Type;
    (function (Source_Type) {
        Source_Type[Source_Type["Energetica"] = 0] = "Energetica";
        Source_Type[Source_Type["Idrica"] = 1] = "Idrica";
        Source_Type[Source_Type["Riscaldamento"] = 2] = "Riscaldamento";
    })(Source_Type = Enums.Source_Type || (Enums.Source_Type = {}));
    var Owner_Type;
    (function (Owner_Type) {
        Owner_Type[Owner_Type["Custode"] = 0] = "Custode";
        Owner_Type[Owner_Type["Proprietario"] = 1] = "Proprietario";
        Owner_Type[Owner_Type["Gestore"] = 2] = "Gestore";
    })(Owner_Type = Enums.Owner_Type || (Enums.Owner_Type = {}));
    //tipo custodia
    var Custody_Type;
    (function (Custody_Type) {
        Custody_Type[Custody_Type["Diretta"] = 0] = "Diretta";
        Custody_Type[Custody_Type["Affitto a gestore"] = 1] = "Affitto a gestore";
        Custody_Type[Custody_Type["Affito ramo azienda"] = 2] = "Affito ramo azienda";
        Custody_Type[Custody_Type["Capanna sociale"] = 3] = "Capanna sociale";
        Custody_Type[Custody_Type["Custodia"] = 4] = "Custodia";
    })(Custody_Type = Enums.Custody_Type || (Enums.Custody_Type = {}));
})(Enums = exports.Enums || (exports.Enums = {}));

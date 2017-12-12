"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Enums;
(function (Enums) {
    var Routes;
    (function (Routes) {
        var Routed_Component;
        (function (Routed_Component) {
            Routed_Component[Routed_Component["geographic"] = "geographic"] = "geographic";
            Routed_Component[Routed_Component["services"] = "services"] = "services";
            Routed_Component[Routed_Component["contacts"] = "contacts"] = "contacts";
            Routed_Component[Routed_Component["management"] = "management"] = "management";
            Routed_Component[Routed_Component["catastal"] = "catastal"] = "catastal";
            Routed_Component[Routed_Component["documents"] = "documents"] = "documents";
            Routed_Component[Routed_Component["images"] = "images"] = "images";
            Routed_Component[Routed_Component["economy"] = "economy"] = "economy";
            Routed_Component[Routed_Component["contribution"] = "contribution"] = "contribution";
            Routed_Component[Routed_Component["use"] = "use"] = "use";
            Routed_Component[Routed_Component["working"] = "working"] = "working";
        })(Routed_Component = Routes.Routed_Component || (Routes.Routed_Component = {}));
        var Routed_Outlet;
        (function (Routed_Outlet) {
            Routed_Outlet[Routed_Outlet["content"] = "content"] = "content";
            Routed_Outlet[Routed_Outlet["revision"] = "revision"] = "revision";
        })(Routed_Outlet = Routes.Routed_Outlet || (Routes.Routed_Outlet = {}));
    })(Routes = Enums.Routes || (Enums.Routes = {}));
    /*export enum ShelterSectionType {
        "geolocation",
        "contacts",
        "services",
        "management",
        "catastal"
    }*/
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
        Contribution_Type[Contribution_Type["Ordinario"] = 0] = "Ordinario";
        Contribution_Type[Contribution_Type["FondoStabile"] = 1] = "FondoStabile";
        Contribution_Type[Contribution_Type["Contributo Pubblico"] = 2] = "Contributo Pubblico";
        Contribution_Type[Contribution_Type["Contributo Privato"] = 3] = "Contributo Privato";
        Contribution_Type[Contribution_Type["Canone d'affitto"] = 4] = "Canone d'affitto";
    })(Contribution_Type = Enums.Contribution_Type || (Enums.Contribution_Type = {}));
    Enums.Contributions = [
        Contribution_Type["Ordinario"],
        Contribution_Type["FondoStabile"]
    ];
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
    var Fire_Regulation_Type;
    (function (Fire_Regulation_Type) {
        Fire_Regulation_Type[Fire_Regulation_Type["S\u00EC"] = 0] = "S\u00EC";
        Fire_Regulation_Type[Fire_Regulation_Type["No"] = 1] = "No";
        Fire_Regulation_Type[Fire_Regulation_Type["In fase di adeguamento"] = 2] = "In fase di adeguamento";
    })(Fire_Regulation_Type = Enums.Fire_Regulation_Type || (Enums.Fire_Regulation_Type = {}));
    var Possession_Type;
    (function (Possession_Type) {
        Possession_Type[Possession_Type["Affitto ramo d'impresa"] = 0] = "Affitto ramo d'impresa";
        Possession_Type[Possession_Type["Affitto immobile"] = 1] = "Affitto immobile";
        Possession_Type[Possession_Type["Affitto a gestore"] = 2] = "Affitto a gestore";
        Possession_Type[Possession_Type["Diretto"] = 3] = "Diretto";
        Possession_Type[Possession_Type["Custodia"] = 4] = "Custodia";
        Possession_Type[Possession_Type["Propriet\u00E0"] = 5] = "Propriet\u00E0";
        Possession_Type[Possession_Type["Usufrutto"] = 6] = "Usufrutto";
        Possession_Type[Possession_Type["Concessione"] = 7] = "Concessione";
        Possession_Type[Possession_Type["Comodato"] = 8] = "Comodato";
    })(Possession_Type = Enums.Possession_Type || (Enums.Possession_Type = {}));
    var Seasons;
    (function (Seasons) {
        Seasons[Seasons["Primavera"] = 0] = "Primavera";
        Seasons[Seasons["Estate"] = 1] = "Estate";
        Seasons[Seasons["Autunno"] = 2] = "Autunno";
        Seasons[Seasons["Inverno"] = 3] = "Inverno";
    })(Seasons = Enums.Seasons || (Enums.Seasons = {}));
    var Water_Availability;
    (function (Water_Availability) {
        Water_Availability[Water_Availability["Scarsa"] = 0] = "Scarsa";
        Water_Availability[Water_Availability["Costante"] = 1] = "Costante";
        Water_Availability[Water_Availability["Media"] = 2] = "Media";
        Water_Availability[Water_Availability["Abbondante"] = 3] = "Abbondante";
    })(Water_Availability = Enums.Water_Availability || (Enums.Water_Availability = {}));
    var Water_Type;
    (function (Water_Type) {
        Water_Type[Water_Type["Assente"] = 0] = "Assente";
        Water_Type[Water_Type["Acquedotto"] = 1] = "Acquedotto";
        Water_Type[Water_Type["Captazione superficiale"] = 2] = "Captazione superficiale";
        Water_Type[Water_Type["Captazione da sorgente"] = 3] = "Captazione da sorgente";
        Water_Type[Water_Type["Nelle vicinanze"] = 4] = "Nelle vicinanze";
    })(Water_Type = Enums.Water_Type || (Enums.Water_Type = {}));
    var Shelter_Type;
    (function (Shelter_Type) {
        Shelter_Type[Shelter_Type["Bivacco"] = 0] = "Bivacco";
        Shelter_Type[Shelter_Type["Rifugio custodito"] = 1] = "Rifugio custodito";
        Shelter_Type[Shelter_Type["Rifugio incustodito"] = 2] = "Rifugio incustodito";
        Shelter_Type[Shelter_Type["Capanna sociale"] = 3] = "Capanna sociale";
        Shelter_Type[Shelter_Type["Punto d'appoggio"] = 4] = "Punto d'appoggio";
    })(Shelter_Type = Enums.Shelter_Type || (Enums.Shelter_Type = {}));
    var Regional_Type;
    (function (Regional_Type) {
        Regional_Type[Regional_Type["Escursionistico"] = 0] = "Escursionistico";
        Regional_Type[Regional_Type["Alpinistico"] = 1] = "Alpinistico";
        Regional_Type[Regional_Type["Bivacco"] = 2] = "Bivacco";
        Regional_Type[Regional_Type["Non classificabile"] = 3] = "Non classificabile";
    })(Regional_Type = Enums.Regional_Type || (Enums.Regional_Type = {}));
    var Shelter_Category;
    (function (Shelter_Category) {
        Shelter_Category[Shelter_Category["A"] = 0] = "A";
        Shelter_Category[Shelter_Category["B"] = 1] = "B";
        Shelter_Category[Shelter_Category["C"] = 2] = "C";
        Shelter_Category[Shelter_Category["D"] = 3] = "D";
        Shelter_Category[Shelter_Category["E"] = 4] = "E";
    })(Shelter_Category = Enums.Shelter_Category || (Enums.Shelter_Category = {}));
    var Drain_Type;
    (function (Drain_Type) {
        Drain_Type[Drain_Type["IMHOFF fognatura"] = 0] = "IMHOFF fognatura";
        Drain_Type[Drain_Type["IMHOFF pozzo perdente"] = 1] = "IMHOFF pozzo perdente";
        Drain_Type[Drain_Type["IMHOFF dispersore sottosuolo"] = 2] = "IMHOFF dispersore sottosuolo";
        Drain_Type[Drain_Type["IMHOFF trasporto a valle"] = 3] = "IMHOFF trasporto a valle";
    })(Drain_Type = Enums.Drain_Type || (Enums.Drain_Type = {}));
    var Typo_consistency;
    (function (Typo_consistency) {
        Typo_consistency[Typo_consistency["Piena"] = 0] = "Piena";
        Typo_consistency[Typo_consistency["Parziale"] = 1] = "Parziale";
        Typo_consistency[Typo_consistency["Recuperabile"] = 2] = "Recuperabile";
        Typo_consistency[Typo_consistency["Nessuna"] = 3] = "Nessuna";
    })(Typo_consistency = Enums.Typo_consistency || (Enums.Typo_consistency = {}));
    var MenuSection;
    (function (MenuSection) {
        MenuSection[MenuSection["detail"] = 0] = "detail";
        MenuSection[MenuSection["document"] = 1] = "document";
        MenuSection[MenuSection["economy"] = 2] = "economy";
    })(MenuSection = Enums.MenuSection || (Enums.MenuSection = {}));
    var Invoice_Type;
    (function (Invoice_Type) {
        Invoice_Type[Invoice_Type["Attivit\u00E0"] = 0] = "Attivit\u00E0";
        Invoice_Type[Invoice_Type["Passivit\u00E0"] = 1] = "Passivit\u00E0";
    })(Invoice_Type = Enums.Invoice_Type || (Enums.Invoice_Type = {}));
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
    var Custody_Type;
    (function (Custody_Type) {
        Custody_Type[Custody_Type["Diretta"] = 0] = "Diretta";
        Custody_Type[Custody_Type["Affitto a gestore"] = 1] = "Affitto a gestore";
        Custody_Type[Custody_Type["Affito ramo azienda"] = 2] = "Affito ramo azienda";
        Custody_Type[Custody_Type["Capanna sociale"] = 3] = "Capanna sociale";
        Custody_Type[Custody_Type["Custodia"] = 4] = "Custodia";
    })(Custody_Type = Enums.Custody_Type || (Enums.Custody_Type = {}));
    var Files;
    (function (Files) {
        var File_Type;
        (function (File_Type) {
            File_Type[File_Type["doc"] = 0] = "doc";
            File_Type[File_Type["map"] = 1] = "map";
            File_Type[File_Type["invoice"] = 2] = "invoice";
            File_Type[File_Type["image"] = 3] = "image";
            File_Type[File_Type["contribution"] = 4] = "contribution";
        })(File_Type = Files.File_Type || (Files.File_Type = {}));
        var Docs_Type;
        (function (Docs_Type) {
            Docs_Type[Docs_Type["txt"] = "text/plain"] = "txt";
            Docs_Type[Docs_Type["pdf"] = "application/pdf"] = "pdf";
            Docs_Type[Docs_Type["doc"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = "doc";
            Docs_Type[Docs_Type["docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = "docx";
            Docs_Type[Docs_Type["xls"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = "xls";
            Docs_Type[Docs_Type["xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = "xlsx";
        })(Docs_Type = Files.Docs_Type || (Files.Docs_Type = {}));
        var Maps_Type;
        (function (Maps_Type) {
            Maps_Type[Maps_Type["dwg"] = "application/acad, application/x-acad, application/autocad_dwg, image/x-dwg, application/dwg, application/x-dwg, application/x-autocad, image/vnd.dwg, drawing/dwg"] = "dwg";
            Maps_Type[Maps_Type["pdf"] = "application/pdf"] = "pdf";
        })(Maps_Type = Files.Maps_Type || (Files.Maps_Type = {}));
        var Invoices_Type;
        (function (Invoices_Type) {
            Invoices_Type[Invoices_Type["txt"] = "text/plain"] = "txt";
            Invoices_Type[Invoices_Type["pdf"] = "application/pdf"] = "pdf";
            Invoices_Type[Invoices_Type["doc"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = "doc";
            Invoices_Type[Invoices_Type["docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = "docx";
            Invoices_Type[Invoices_Type["xls"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = "xls";
            Invoices_Type[Invoices_Type["xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = "xlsx";
        })(Invoices_Type = Files.Invoices_Type || (Files.Invoices_Type = {}));
        var Image_Type;
        (function (Image_Type) {
            Image_Type[Image_Type["png"] = "image/png"] = "png";
            Image_Type[Image_Type["jpeg"] = "image/jpeg"] = "jpeg";
            Image_Type[Image_Type["jpg"] = "image/jpeg"] = "jpg";
        })(Image_Type = Files.Image_Type || (Files.Image_Type = {}));
    })(Files = Enums.Files || (Enums.Files = {}));
    var Defaults;
    (function (Defaults) {
        var Region_LanLng;
        (function (Region_LanLng) {
            Region_LanLng[Region_LanLng["valle d'aosta"] = [45.7372, 7.3206]] = "valle d'aosta";
            Region_LanLng[Region_LanLng["piemonte"] = [45.0667, 7.7]] = "piemonte";
            Region_LanLng[Region_LanLng["liguria"] = [44.4072, 8.934]] = "liguria";
            Region_LanLng[Region_LanLng["lombardia"] = [45.4642, 9.1903]] = "lombardia";
            Region_LanLng[Region_LanLng["trentino alto adige"] = [46.0667, 11.1167]] = "trentino alto adige";
            Region_LanLng[Region_LanLng["veneto"] = [45.4397, 12.3319]] = "veneto";
            Region_LanLng[Region_LanLng["friuli-venezia giulia"] = [45.6361, 13.8042]] = "friuli-venezia giulia";
            Region_LanLng[Region_LanLng["emilia romagna"] = [44.4939, 11.3428]] = "emilia romagna";
            Region_LanLng[Region_LanLng["toscana"] = [43.7714, 11.2542]] = "toscana";
            Region_LanLng[Region_LanLng["umbria"] = [43.1121, 12.3886]] = "umbria";
            Region_LanLng[Region_LanLng["marche"] = [43.6167, 13.5167]] = "marche";
            Region_LanLng[Region_LanLng["lazio"] = [41.8931, 12.4828]] = "lazio";
            Region_LanLng[Region_LanLng["abruzzo"] = [42.354, 13.3919]] = "abruzzo";
            Region_LanLng[Region_LanLng["molise"] = [41.561, 14.6684]] = "molise";
            Region_LanLng[Region_LanLng["campania"] = [40.8333, 14.25]] = "campania";
            Region_LanLng[Region_LanLng["puglia"] = [41.1253, 16.8667]] = "puglia";
            Region_LanLng[Region_LanLng["basilicata"] = [40.6333, 15.8]] = "basilicata";
            Region_LanLng[Region_LanLng["calabria"] = [38.91, 16.5875]] = "calabria";
            Region_LanLng[Region_LanLng["sicilia"] = [38.1157, 13.3639]] = "sicilia";
            Region_LanLng[Region_LanLng["sardegna"] = [39.2167, 9.1167]] = "sardegna";
        })(Region_LanLng = Defaults.Region_LanLng || (Defaults.Region_LanLng = {}));
    })(Defaults = Enums.Defaults || (Enums.Defaults = {}));
    var Auth_Permissions;
    (function (Auth_Permissions) {
        var User_Type;
        (function (User_Type) {
            User_Type[User_Type["central"] = 1] = "central";
            User_Type[User_Type["regional"] = 2] = "regional";
            User_Type[User_Type["sectional"] = 3] = "sectional";
            User_Type[User_Type["superUser"] = 4] = "superUser";
            User_Type[User_Type["visualization"] = 5] = "visualization";
            User_Type[User_Type["area"] = 6] = "area";
        })(User_Type = Auth_Permissions.User_Type || (Auth_Permissions.User_Type = {}));
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
        })(Region_Code = Auth_Permissions.Region_Code || (Auth_Permissions.Region_Code = {}));
        var Area_Code;
        (function (Area_Code) {
            Area_Code[Area_Code["C.M.I."] = 50] = "C.M.I.";
            Area_Code[Area_Code["Lombardo"] = 16] = "Lombardo";
            Area_Code[Area_Code["L.P.V."] = 10] = "L.P.V.";
            Area_Code[Area_Code["T.A.A."] = 18] = "T.A.A.";
            Area_Code[Area_Code["T.E.R."] = 24] = "T.E.R.";
            Area_Code[Area_Code["V.F.G."] = 20] = "V.F.G.";
        })(Area_Code = Auth_Permissions.Area_Code || (Auth_Permissions.Area_Code = {}));
        Auth_Permissions.Regions_Area = {
            "C.M.I.": [
                Region_Code.Abruzzo,
                Region_Code.Basilicata,
                Region_Code.Calabria,
                Region_Code.Campania,
                Region_Code.Lazio,
                Region_Code.Marche,
                Region_Code.Molise,
                Region_Code.Puglia,
                Region_Code.Sardegna,
                Region_Code.Sicilia,
                Region_Code.Umbria
            ],
            "Lombardo": [
                Region_Code.Lombardia
            ],
            "L.P.V.": [
                Region_Code.Liguria,
                Region_Code.Piemonte,
                Region_Code["Valle d'Aosta"]
            ],
            "T.A.A.": [
                Region_Code["Trentino Alto Adige"],
                Region_Code["Alto Adige"]
            ],
            "T.E.R.": [
                Region_Code["Emilia Romagna"],
                Region_Code.Toscana
            ],
            "V.F.G.": [
                Region_Code["Friuli-Venezia Giulia"],
                Region_Code.Veneto
            ]
        };
        var Revision;
        (function (Revision) {
            Revision.DocRevisionPermission = [
                User_Type.superUser,
                User_Type.central,
                User_Type.sectional
            ];
            Revision.EconomyRevisionPermission = [
                User_Type.superUser,
                User_Type.central,
                User_Type.sectional
            ];
            Revision.DetailRevisionPermission = Revision.DocRevisionPermission.concat(Revision.EconomyRevisionPermission).filter(function (item, index, input) {
                return input.indexOf(item) == index;
            }).slice();
        })(Revision = Auth_Permissions.Revision || (Auth_Permissions.Revision = {}));
        var Edit;
        (function (Edit) {
            Edit.InsertShelterPermission = [
                User_Type.superUser,
                User_Type.central
            ];
            Edit.DeleteShelterPermission = [
                User_Type.superUser,
                User_Type.central
            ];
        })(Edit = Auth_Permissions.Edit || (Auth_Permissions.Edit = {}));
        var Visualization;
        (function (Visualization) {
            var Visualization_Level;
            (function (Visualization_Level) {
                Visualization_Level[Visualization_Level["section"] = 0] = "section";
                Visualization_Level[Visualization_Level["region"] = 1] = "region";
                Visualization_Level[Visualization_Level["area"] = 2] = "area";
                Visualization_Level[Visualization_Level["complete"] = 3] = "complete";
            })(Visualization_Level = Visualization.Visualization_Level || (Visualization.Visualization_Level = {}));
            Visualization.Complete_Visualization = [
                User_Type.central,
                User_Type.superUser,
                User_Type.visualization
            ];
            Visualization.Area_Visualization = Visualization.Complete_Visualization.concat([
                User_Type.area
            ]);
            Visualization.Region_Visualization = Visualization.Area_Visualization.concat([
                User_Type.regional
            ]);
            Visualization.Section_Visualization = Visualization.Region_Visualization.concat([
                User_Type.sectional
            ]);
        })(Visualization = Auth_Permissions.Visualization || (Auth_Permissions.Visualization = {}));
    })(Auth_Permissions = Enums.Auth_Permissions || (Enums.Auth_Permissions = {}));
})(Enums = exports.Enums || (exports.Enums = {}));
//# sourceMappingURL=enums.js.map
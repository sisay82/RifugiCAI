export namespace Enums {
    export namespace Routes {
        export enum Routed_Component {
            geographic = <any>"geographic",
            services = <any>"services",
            contacts = <any>"contacts",
            management = <any>"management",
            catastal = <any>"catastal",
            documents = <any>"documents",
            images = <any>"images",
            economy = <any>"economy",
            contribution = <any>"contribution",
            use = <any>"use",
            working = <any>"working"
        }

        export enum Routed_Outlet {
            content = <any>"content",
            revision = <any>"revision"
        }
    }

    /*export enum ShelterSectionType {
        "geolocation",
        "contacts",
        "services",
        "management",
        "catastal"
    }*/

    export enum Heating_Type {
        "Elettrico",
        "Gas",
        "Solare",
        "Legna",
        "Assente",
        "Combinato"
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

    export enum Shelter_Status {
        "Immobile non agibile",
        "In ristrutturazione",
        "Momentaneamente chiuso",
        "In attività"
    }

    export enum Shelter_Type {
        "Bivacco",
        "Rifugio custodito",
        "Rifugio incustodito",
        "Capanna sociale",
        "Punto d'appoggio",
        "Ricovero di emergenza"
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

    export enum MenuSection {
        "detail",
        "document",
        "economy"
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

    export enum Owner_Type {
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

    export namespace Files {
        export enum File_Type {
            doc,
            map,
            invoice,
            image,
            contribution
        }

        export enum Docs_Type {
            txt = <any>"text/plain",
            pdf = <any>"application/pdf",
            doc = <any>"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            docx = <any>"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xls = <any>"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            xlsx = <any>"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }

        export enum Maps_Type {
            dwg = <any>`application/acad,
             application/x-acad,
              application/autocad_dwg,
               image/x-dwg,
                application/dwg,
                 application/x-dwg,
                  application/x-autocad,
                   image/vnd.dwg,
                    drawing/dwg`,
            pdf = <any>"application/pdf"
        }

        export enum Invoices_Type {
            txt = <any>"text/plain",
            pdf = <any>"application/pdf",
            doc = <any>"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            docx = <any>"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xls = <any>"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            xlsx = <any>"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }

        export enum Image_Type {
            png = <any>"image/png",
            jpeg = <any>"image/jpeg",
            jpg = <any>"image/jpeg"
        }
    }

    export namespace Defaults {
        export enum Region_LanLng {
            "valle d'aosta" = <any>[45.7372, 7.3206],
            "piemonte" = <any>[45.0667, 7.7],
            "liguria" = <any>[44.4072, 8.934],
            "lombardia" = <any>[45.4642, 9.1903],
            "trentino alto adige" = <any>[46.0667, 11.1167],
            "veneto" = <any>[45.4397, 12.3319],
            "friuli-venezia giulia" = <any>[45.6361, 13.8042],
            "emilia romagna" = <any>[44.4939, 11.3428],
            "toscana" = <any>[43.7714, 11.2542],
            "umbria" = <any>[43.1121, 12.3886],
            "marche" = <any>[43.6167, 13.5167],
            "lazio" = <any>[41.8931, 12.4828],
            "abruzzo" = <any>[42.354, 13.3919],
            "molise" = <any>[41.561, 14.6684],
            "campania" = <any>[40.8333, 14.25],
            "puglia" = <any>[41.1253, 16.8667],
            "basilicata" = <any>[40.6333, 15.8],
            "calabria" = <any>[38.91, 16.5875],
            "sicilia" = <any>[38.1157, 13.3639],
            "sardegna" = <any>[39.2167, 9.1167]
        }
    }

    export namespace Auth_Permissions {
        export enum User_Type {
            central = 1,
            regional = 2,
            sectional = 3,
            superUser = 4,
            visualization = 5,
            area = 6,
            test = 7
        }

        export const UserTypeName = {
            [User_Type.central]: "Centrale",
            [User_Type.regional]: "Regionale",
            [User_Type.sectional]: "Sezionale",
            [User_Type.superUser]: "SUPERUSER",
            [User_Type.visualization]: "Visualization",
            [User_Type.area]: "Area",
            [User_Type.test]: "TEST"
        }

        export const getUserRolesByType = {
            [User_Type.central]: ['ROLE_RIFUGI_ADMIN'],
            [User_Type.sectional]: ['ROLE_MEMBERS_VIEW', 'ROLE_MEMBERSHIP'],
            [User_Type.area]: [''],
            [User_Type.visualization]: [''],
            [User_Type.regional]: ['PGR']
        }

        export enum Region_Code {
            "Liguria" = 10,
            "Piemonte" = 12,
            "Valle d'Aosta" = 14,
            "Lombardia" = 16,
            "Trentino Alto Adige" = 18,
            "Alto Adige" = 19,
            "Veneto" = 20,
            "Friuli-Venezia Giulia" = 22,
            "Emilia Romagna" = 24,
            "Toscana" = 26,
            "Marche" = 28,
            "Umbria" = 30,
            "Lazio" = 32,
            "Abruzzo" = 34,
            "Molise" = 36,
            "Campania" = 38,
            "Puglia" = 40,
            "Basilicata" = 42,
            "Calabria" = 44,
            "Sicilia" = 46,
            "Sardegna" = 48
        }

        export enum Area_Code {
            "C.M.I." = 50,
            "Lombardo" = 16,
            "L.P.V." = 10,
            "T.A.A." = 18,
            "T.E.R." = 24,
            "V.F.G." = 20
        }

        export const Regions_Area = {
            [Area_Code["C.M.I."]]: <Region_Code[]>[
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
            [Area_Code["Lombardo"]]: <Region_Code[]>[
                Region_Code.Lombardia
            ],
            [Area_Code["L.P.V."]]: <Region_Code[]>[
                Region_Code.Liguria,
                Region_Code.Piemonte,
                Region_Code["Valle d'Aosta"]
            ],
            [Area_Code["T.A.A."]]: <Region_Code[]>[
                Region_Code["Trentino Alto Adige"],
                Region_Code["Alto Adige"]
            ],
            [Area_Code["T.E.R."]]: <Region_Code[]>[
                Region_Code["Emilia Romagna"],
                Region_Code.Toscana
            ],
            [Area_Code["V.F.G."]]: <Region_Code[]>[
                Region_Code["Friuli-Venezia Giulia"],
                Region_Code.Veneto
            ]
        }

        export namespace Codes {
            /**
            [starting_position, count]
            */

            export enum CodeNames {
                "CODETYPE" = <any>Symbol("CODETYPE"),
                "REGION" = <any>Symbol("REGION"),
                "AREA" = <any>Symbol("AREA"),
                "GR" = <any>Symbol("GR"),
                "SECTION" = <any>Symbol("SECTION"),
                "SUBSECTION" = <any>Symbol("SUBSECTION"),
            }

            export const CodeSection = {
                [CodeNames.CODETYPE]: <any>[0, 2],
                [CodeNames.REGION]: <any>[2, 2],
                [CodeNames.AREA]: <any>[4, 3],
                [CodeNames.SECTION]: <any>[4, 3],
                [CodeNames.SUBSECTION]: <any>[7, 3],
            }

            export const UserTypeCodes = <any>{
                [User_Type.central]: <CodeNames[]>[],
                [User_Type.superUser]: <CodeNames[]>[],
                [User_Type.visualization]: <CodeNames[]>[],
                [User_Type.regional]: <CodeNames[]>[CodeNames.GR],
                [User_Type.sectional]: <CodeNames[]>[CodeNames.REGION, CodeNames.SECTION],
                [User_Type.area]: <CodeNames[]>[CodeNames.AREA],
                [User_Type.test]: <CodeNames[]>[CodeNames.CODETYPE, CodeNames.SUBSECTION],
            }

        }


        export namespace Revision {
            export const RevisionPermissionType = {
                "DocRevisionPermission": MenuSection.document,
                "EconomyRevisionPermission": MenuSection.economy,
                "DetailRevisionPermission": MenuSection.detail
            }

            export const DocRevisionPermission: any[] = [
                User_Type.superUser,
                User_Type.central,
                User_Type.sectional
            ]

            export const EconomyRevisionPermission: any[] = [
                User_Type.superUser,
                User_Type.central,
                User_Type.sectional
            ]

            export const DetailRevisionPermission: any[] = [
                ...DocRevisionPermission.concat(EconomyRevisionPermission).filter(function (item, index, input) {
                    return input.indexOf(item) === index;
                }),
            ]
        }

        export namespace Edit {
            export const InsertShelterPermission: any[] = [
                User_Type.superUser,
                User_Type.central
            ]

            export const DeleteShelterPermission: any[] = [
                User_Type.superUser,
                User_Type.central
            ]
        }


        export namespace Visualization {
            export enum Visualization_Level {
                section,
                region,
                area,
                complete
            }

            export const Complete_Visualization = [
                User_Type.central,
                User_Type.superUser,
                User_Type.visualization
            ]

            export const Area_Visualization = [
                ...Complete_Visualization,
                User_Type.area
            ]

            export const Region_Visualization = [
                ...Area_Visualization,
                User_Type.regional
            ]

            export const Section_Visualization = [
                ...Region_Visualization,
                User_Type.sectional
            ]

        }

    }
}

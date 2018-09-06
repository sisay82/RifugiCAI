
export namespace A {
    export enum Routed_Component {
        geographic = "geographic",
        services = "services",
        contacts = "contacts",
        management = "management",
        catastal = "catastal",
        documents = "documents",
        images = "images",
        economy = "economy",
        contribution = "contribution",
        use = "use",
        working = "working"
    }

    export enum Routed_Outlet {
        "content",
        "revision"
    }
}

export module Enums {
    export module Routes {
        export enum Routed_Component {
            geographic = "geographic",
            services = "services",
            contacts = "contacts",
            management = "management",
            catastal = "catastal",
            documents = "documents",
            images = "images",
            economy = "economy",
            contribution = "contribution",
            use = "use",
            working = "working"
        }

        export enum Routed_Outlet {
            content = "content",
            revision = "revision"
        }
    }

    export enum Heating_Type {
        elettrico = "Elettrico",
        gas = "Gas",
        solare = "Solare",
        legna = "Legna",
        assente = "Assente",
        combinato = "Combinato"
    }

    export enum Contribution_Type {
        ordinario = "Ordinario",
        fondostabile = "FondoStabile",
        pubblico = "Contributo Pubblico",
        privato = "Contributo Privato",
        canone = "Canone d'affitto"
    }

    export const Contributions = [
        Contribution_Type.ordinario,
        Contribution_Type.fondostabile
    ]

    export enum Energy_Class_Type {
        aplus = "A+",
        a = "A",
        b = "B",
        c = "C",
        d = "D",
        e = "E",
        f = "F",
        g = "G"
    }

    export enum Fire_Regulation_Type {
        si = "Sì",
        no = "No",
        adeguamento = "In fase di adeguamento"
    }

    export enum Possession_Type {
        affittoImpresa = "Affitto ramo d'impresa",
        affittoImmobile = "Affitto immobile",
        affittoGestore = "Affitto a gestore",
        diretto = "Diretto",
        custodia = "Custodia",
        prop = "Proprietà",
        usufrutto = "Usufrutto",
        concessione = "Concessione",
        comodato = "Comodato"
    }

    export enum Seasons {
        primavera = "Primavera",
        estate = "Estate",
        autunno = "Autunno",
        inverno = "Inverno"
    }

    export enum Water_Availability {
        scarsa = "Scarsa",
        costante = "Costante",
        media = "Media",
        abbondante = "Abbondante"
    }

    export enum Water_Type {
        assente = "Assente",
        acquedotto = "Acquedotto",
        capSuperficiale = "Captazione superficiale",
        capSorgente = "Captazione da sorgente",
        vicinanze = "Nelle vicinanze"
    }

    export enum Shelter_Status {
        nonAgibile = "Immobile non agibile",
        ristrutturazione = "In ristrutturazione",
        chiuso = "Momentaneamente chiuso",
        attivo = "In attività"
    }

    export enum Shelter_Type {
        bivacco = "Bivacco",
        custodito = "Rifugio custodito",
        incustodito = "Rifugio incustodito",
        sociale = "Capanna sociale",
        appoggio = "Punto d'appoggio",
        emergenza = "Ricovero di emergenza"
    }

    export enum Regional_Type {
        escursionistico = "Escursionistico",
        alpinistico = "Alpinistico",
        bivacco = "Bivacco",
        nc = "Non classificabile"
    }

    export enum Shelter_Category {
        a = "A",
        b = "B",
        c = "C",
        d = "D",
        e = "E"
    }

    export enum Drain_Type {
        fognatura = "IMHOFF fognatura",
        pozzo = "IMHOFF pozzo perdente",
        dispersore = "IMHOFF dispersore sottosuolo",
        trasporto = "IMHOFF trasporto a valle"
    }

    export enum Typo_consistency {
        piena = "Piena",
        parziale = "Parziale",
        recuperabile = "Recuperabile",
        nessuna = "Nessuna"
    }

    export enum MenuSection {
        detail = "detail",
        document = "document",
        economy = "economy"
    }

    export enum Invoice_Type {
        att = "Attività",
        pass = "Passività"
    }

    export enum Source_Type {
        energetica = "Energetica",
        idrica = "Idrica",
        riscaldamento = "Riscaldamento"
    }

    export enum Owner_Type {
        custode = "Custode",
        proprietario = "Proprietario",
        gestore = "Gestore"
    }

    export enum Custody_Type {
        diretta = "Diretta",
        gestore = "Affitto a gestore",
        azienda = "Affito ramo azienda",
        capanna = "Capanna sociale",
        custodia = "Custodia"
    }

    export module Files {
        export enum File_Type {
            doc = "doc",
            map = "map",
            invoice = "invoice",
            image = "image",
            contribution = "contribution"
        }

        export enum Docs_Type {
            txt = "text/plain",
            pdf = "application/pdf",
            doc = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xls = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }

        export enum Maps_Type {
            dwg = "application/acad, application/x-acad, application/autocad_dwg, image/x-dwg, application/dwg, application/x-dwg, application/x-autocad, image/vnd.dwg, drawing/dwg",
            pdf = "application/pdf"
        }

        export enum Invoices_Type {
            txt = "text/plain",
            pdf = "application/pdf",
            doc = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xls = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }

        export enum Image_Type {
            png = "image/png",
            jpeg = "image/jpeg",
            jpg = "image/jpeg"
        }
    }

    export module Auth_Permissions {
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
            [User_Type.central]: "CAI Centrale",
            [User_Type.regional]: "CAI Regionale",
            [User_Type.sectional]: "Sezione CAI",
            [User_Type.superUser]: "SUPERUSER",
            [User_Type.visualization]: "Visualization",
            [User_Type.area]: "Area",
            [User_Type.test]: "TEST"
        }

        export const USER_TYPE_TO_ROLE = {
            [User_Type.central]: ['ROLE_RIFUGI_ADMIN'],
            [User_Type.sectional]: ['ROLE_MEMBERS_VIEW', 'ROLE_MEMBERSHIP'],
            [User_Type.area]: ['ROLE_RIFUGI_AREA'],
            [User_Type.visualization]: ['ROLE_RIFUGI_CC'],
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

        export const Region_LatLng = {
            [Region_Code["Valle d'Aosta"]]: [45.7372, 7.3206],
            [Region_Code.Piemonte]: [45.0667, 7.7],
            [Region_Code.Liguria]: [44.4072, 8.934],
            [Region_Code.Lombardia]: [45.4642, 9.1903],
            [Region_Code["Trentino Alto Adige"]]: [46.0667, 11.1167],
            [Region_Code.Veneto]: [45.4397, 12.3319],
            [Region_Code["Friuli-Venezia Giulia"]]: [45.6361, 13.8042],
            [Region_Code["Emilia Romagna"]]: [44.4939, 11.3428],
            [Region_Code.Toscana]: [43.7714, 11.2542],
            [Region_Code.Umbria]: [43.1121, 12.3886],
            [Region_Code.Marche]: [43.6167, 13.5167],
            [Region_Code.Lazio]: [41.8931, 12.4828],
            [Region_Code.Abruzzo]: [42.354, 13.3919],
            [Region_Code.Molise]: [41.561, 14.6684],
            [Region_Code.Campania]: [40.8333, 14.25],
            [Region_Code.Puglia]: [41.1253, 16.8667],
            [Region_Code.Basilicata]: [40.6333, 15.8],
            [Region_Code.Calabria]: [38.91, 16.5875],
            [Region_Code.Sicilia]: [38.1157, 13.3639],
            [Region_Code.Sardegna]: [39.2167, 9.1167]
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

        export module Codes {
            /**
            [starting_position, count]
            */

            export enum CodeNames {
                CODETYPE = "CODETYPE",
                REGION = "REGION",
                AREA = "AREA",
                GR = "GR",
                SECTION = "SECTION",
                SUBSECTION = "SUBSECTION",
            }

            export const CodeSection = {
                [CodeNames.CODETYPE]: [0, 2],
                [CodeNames.REGION]: [2, 2],
                [CodeNames.AREA]: [4, 3],
                [CodeNames.GR]: [5, 2],
                [CodeNames.SECTION]: [4, 3],
                [CodeNames.SUBSECTION]: [7, 3],
            }

            export const UserTypeCodes = {
                [User_Type.central]: <CodeNames[]>[],
                [User_Type.superUser]: <CodeNames[]>[],
                [User_Type.visualization]: <CodeNames[]>[],
                [User_Type.regional]: <CodeNames[]>[CodeNames.GR],
                [User_Type.sectional]: <CodeNames[]>[CodeNames.REGION, CodeNames.SECTION],
                [User_Type.area]: <CodeNames[]>[CodeNames.AREA],
                [User_Type.test]: <CodeNames[]>[CodeNames.CODETYPE, CodeNames.SUBSECTION],
            }

        }


        export module Revision {
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

        export module Edit {
            export const InsertShelterPermission: any[] = [
                User_Type.superUser,
                User_Type.central
            ]

            export const DeleteShelterPermission: any[] = [
                User_Type.superUser,
                User_Type.central
            ]
        }


        export module Visualization {
            export enum Visualization_Level {
                section = "section",
                region = "region",
                area = "area",
                complete = "complete"
            }

            export const CSVPermission = [
                User_Type.central,
                User_Type.superUser
            ]

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

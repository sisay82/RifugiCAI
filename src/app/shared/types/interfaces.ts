import { ModuleWithProviders } from '@angular/core';
import { Routes } from '@angular/router';
import { Enums } from './enums';
import { LatLng } from 'leaflet';
import { Buffer } from 'buffer';

export interface IPagedResults<T> {
    totalRecords: number;
    results: T;
}

export interface IMarker {
    latLng: LatLng;
    popup: string;
    optional?: any;
}

export interface IMenuElement {
    name: String;
    icon: String;
    link: any;
    default?: boolean;
}

export interface IMenuLayer {
    layerName?: String;
    elements: IMenuElement[];
}

export interface IMenu {
    layers: IMenuLayer[];
}

export interface ILocation {
    region?: String;
    province?: String;
    municipality?: String;
    locality?: String;
    ownerRegion?: Enums.Auth_Permissions.Region_Code;
    regional_commission?: String;
    authorityJurisdiction?: String;
    altitude?: Number;
    latitude?: Number;
    longitude?: Number;
    massif?: String;
    valley?: String;
    ski_area?: String;
    protected_area?: String;
    site?: String;
}

export interface ITag {
    key: String;
    value?: String;
    type?: String;
}

export interface IGeographic {
    location?: ILocation;
    tags?: ITag[];
}

export interface IService {
    _id?: String;
    name?: String;
    category?: String;
    description?: String;
    tags?: ITag[];
}

export interface IOpening {
    startDate?: Date;
    endDate?: Date;
    type?: String;
}

export interface IContacts {
    name?: String;
    role?: Enums.Owner_Type;
    fixedPhone?: String;
    mobilePhone?: String;
    prenotation_link?: String;
    mailPec?: String;
    emailAddress?: String;
    webAddress?: String;
}

export interface ISubject {
    name?: String;
    surname?: String;
    taxCode?: String;
    fixedPhone?: String;
    mobilePhone?: String;
    pec?: String;
    email?: String;
    webSite?: String;
    type?: String;
    contract_start_date?: Date;
    contract_end_date?: Date;
    contract_duration?: String;
    contract_fee?: Number;
    possession_type?: Enums.Possession_Type;
}

export interface IManagement {
    rentType?: Enums.Custody_Type;
    reference?: String;
    webSite?: String;
    self_management?: Boolean;
    valuta?: String;
    pickupKey?: Boolean;
    subject?: ISubject[];
}

export interface ICatastal {
    buildingRegulation?: Boolean;
    buildYear?: Number;
    rebuildYear?: Number;
    class?: String;
    code?: String;
    typologicalCoherence?: Enums.Typo_consistency;
    matericalCoherence?: Boolean;
    cityPlanRegulation?: Boolean;
    mainBody?: String;
    secondaryBody?: String;
    fireRegulation?: Enums.Fire_Regulation_Type;
    ISO14001?: Boolean;
}

export interface IEnergy {
    class?: Enums.Energy_Class_Type;
    energy?: Number;
    greenCertification?: Boolean;
    powerGenerator?: Boolean;
    photovoltaic?: Boolean;
    heating_type?: Enums.Heating_Type;
    sourceType?: Enums.Source_Type;
    sourceName?: String;
}

export interface IDrain {
    type?: Enums.Drain_Type;
    regulation?: Boolean;
    oilSeparator?: Boolean;
    water_certification?: Boolean;
    recycling?: Boolean;
    water_type?: Enums.Water_Type;
    water_availability?: Enums.Water_Availability;
    droughts?: Enums.Seasons;
}

export interface IEconomy {
    year: Number;
    confirm?: Boolean;
    accepted?: Boolean;
}

export interface IUse {
    year: Number;
    stay_count_associate?: Number;
    stay_count_reciprocity?: Number;
    stay_count?: Number;
    transit_count_associate?: Number;
    transit_count_reciprocity?: Number;
    transit_count?: Number;
}

export interface IFileRef {
    name: String;
    id: String;
}

export interface IContributionData {
    handWorks?: Number;
    customizedWorks?: Number;
    safetyCharges?: Number;
    totWorks?: Number;
    surveyorsCharges?: Number;
    connectionsCharges?: Number;
    technicalCharges?: Number;
    testCharges?: Number;
    taxes?: Number;
    totCharges?: Number;
    IVAincluded?: Boolean;
    totalProjectCost?: Number;
    externalFinancing?: Number;
    selfFinancing?: Number;
    red?: Number;
}

export interface IContribution {
    year: Number;
    data?: IContributionData;
    attachments?: IFileRef[];
    value?: Number;
    accepted?: Boolean;
    type?: Enums.Contribution_Type;
    relatedFileId?: String;
    fileCreated?: Boolean;
}

export interface IShelter {
    _id?: String;
    name?: String;
    alias?: String;
    idCai?: String;
    type?: Enums.Shelter_Type;
    status?: Enums.Shelter_Status;
    branch?: String;
    owner?: String;
    category?: Enums.Shelter_Category;
    regional_type?: Enums.Regional_Type;
    insertDate?: Date;
    updateDate?: Date;
    updateSubject?: Enums.Auth_Permissions.User_Type;

    geoData?: IGeographic;
    services?: IService[];
    contacts?: IContacts;
    openingTime?: IOpening[];
    management?: IManagement;
    catastal?: ICatastal;
    energy?: IEnergy;
    drain?: IDrain;
    economy?: IEconomy[];
    use?: IUse[];
    contributions?: [IContribution];
}

export interface IFile {
    _id?: String;
    size?: Number;
    shelterId?: String;
    uploadDate?: Date;
    md5?: String;
    name?: String;
    data?: Buffer;
    invoice_type?: Enums.Invoice_Type;
    invoice_tax?: Number;
    invoice_year?: Number;
    invoice_confirmed?: Boolean;
    contribution_type?: Enums.Contribution_Type;
    contentType?: String;
    type?: Enums.Files.File_Type;
    description?: String;
    value?: Number;
}

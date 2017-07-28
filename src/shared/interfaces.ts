import * as L from 'leaflet';
import { Enums } from './enums';

export interface IMarker{
    latLng:L.LatLng,
    popup:string,
    optional?:any
}

export interface IButton {
    ref:string;
    icon?:string;
    dark_theme?:Boolean;
    text?:string;
    enabled?:Boolean;
    action?:Function;
}

export interface IMenuElement{
    name:String,
    icon:String,
    link:any,
    default?:boolean
}

export interface IMenuLayer{
    layerName?:String,
    elements:[IMenuElement]
}

export interface IMenu{
    layers:[IMenuLayer];
}

export interface ILocation{
    region?:String;
    province?:String;
    municipality?:String;
    locality?:String;
    ownerRegion?:String;
    authorityJurisdiction?:String;
    altitude?:Number;
    latitude?:Number;
    longitude?:Number;
    massif?:String;
    valley?:String;
}

export interface ITag{
    key:String;
    value?:String;
}

export interface IGeographic{
    location?:ILocation;
    tags?:[ITag];
}

export interface IService{
    _id:String;
    name?:String;
    category?:String;
    description?:String;
    tags?:[ITag];
}

export interface IOpening{
    startDate?:Date;
    endDate?:Date;
    type?:String;
}

export interface IContacts{
    name?:String;
    role?:String;
    fixedPhone?:String;
    mobilePhone?:String;
    mailPec?:String;
    emailAddress?:String;
    webAddress?:String;
}

export interface ISubject{
    name?:String;
    surname?:String;
    taxCode?:String;
    fixedPhone?:String;
    mobilePhone?:String;
    pec?:String;
    email?:String;
    webSite?:String;
    type?:String;
}

export interface IManagement{
    rent?:Number;
    period?:String;
    contract_start_date?:Date;
    contract_end_date?:Date;
    contract_duration?:Number;
    contract_fee?:Number;
    self_management?:Boolean;
    webSite?:String;
    valuta?:String;
    rentType?:Enums.Custody_Type;
    pickupKey?:Boolean;
    subject?:[ISubject];
}

export interface ICatastal{
    buildingRegulation?:Boolean;
    buildYear?:Number;
    rebuildYear?:Number;
    class?:String;
    code?:String;
    typologicalCoherence?:Enums.Typo_consistency;
    matericalCoherence?:Boolean;
    cityPlanRegulation?:Boolean;
    mainBody?:String;
    secondaryBody?:String;
    fireRegulation?:Boolean;
    ISO14001?:Boolean;
}

export interface IEnergy{
    class?:String;
    energy?:Number;
    greenCertification?:Boolean;
    powerGenerator?:Boolean;
    photovoltaic?:Boolean;
    heating_type?:Enums.Heating_Type;
    sourceType?:Enums.Source_Type;
    sourceName?:String;
}

export interface IDrain{
    type?:Enums.Drain_Type;
    regulation?:Boolean;
    oilSeparator?:Boolean;
    recycling?:Boolean;
    water_type?:Enums.Water_Type;
    water_availability?:Enums.Water_Availability;
    droughts?:Enums.Seasons;
}

export interface IShelter{
    name:String;
    alias:String;
    idCai?:String;
    type?:Enums.Shelter_Type;
    branch?:String;
    owner?:String;
    category?:Enums.Shelter_Category;
    regional_type?:Enums.Regional_Type;
    insertDate?:Date;
    updateDate?:Date;

    geoData?:IGeographic; 
    services?:[IService];
    contacts?:IContacts;
    openingTime?:[IOpening];
    management?:IManagement;
    catastal?:ICatastal;
    energy?:IEnergy;
    drain?:IDrain;
}

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

export interface IRegistry{
    shelter_type?:Enums.Shelter_Type,
    regional_type?:Enums.Regional_Type,
    category?:Enums.Shelter_Category,
    address:{
        via:String,
        number:Number,
        cap:Number,
        city:String,
        collective:String,
        district:String,
        country:String
    },
    fixed_phone?:[String],
    mobile_phone?:[String],
    email_address?:[String],
    web_address?:String,
    description?:String,
    insert_date?:Date,
    custody_type?:Enums.Custody_Type,
    custodian?:String,//ObjectID
    owner?:String
}

export interface IOpening{
    opening_date:Date,
    closure_date:Date,
    opening_type:String
}

export interface ILog{
    state:String,
    user:String,
    update_date?:Date
}

export interface IGeographic{
    valley?:String,
    mountain_community?:String,
    mountain_group?:String,
    quote?:Number,
    coordinates?:{
        latitude:number,
        longitude:number
    },
    additional_data?:[{
        key:String,
        value:String
    }]
}

export interface ICadastral{
    construction_reg?:Boolean,
    construction_year?:Number,
    typological_consistency?:{type:Enums.Typo_consistency},
    material_consistency?:Boolean,
    urban_regularity?:Boolean,
    main_body_consistency?:String,
    secondary_body_consistency?:String,
    cadastral_class?:String,
    fire_regulation?:Boolean,
    energy_class?:String,
    certification?:String,
    necessary_energy?:Number,
    green_certification?:Boolean,
    garbage_disposal?:String,
    recycling?:Boolean,
    waste_disposal?:String,
    waste_adjustment?:Boolean,
    resources_sources?:[{
        type:{type:Enums.Source_Type},
        source_name:String,
        description?:String,
        value?:Number
    }]
}

export interface IAdministrative{
    shelter_code:Number,
    contract_start_date?:Date,
    contract_end_date?:Date,
    contract_duration?:Number,
    contract_fee?:Number,
    possession_title?:String,
    section_code?:String
}

export interface IShelter {
    id:String,
    name:String,
    registry:IRegistry,    
    administrative?:IAdministrative,
    openings?:[{IOpening}],
    geographic_data?:IGeographic,
    cadastral_data?:ICadastral,
    logs?:[{ILog}],
    services?:[{IService}]
}

export interface ITag{
    key:String;
    value:String;
}

export interface IService{
    service_name:String;
    service_category?:String;
    description?:String;
    tags?:[ITag];
}

export interface IUser{
    name:String;
    value:String;
}
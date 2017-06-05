export interface IMarker{
    latLng:L.LatLng,
    popup:string,
    optional?:any
}

export interface IShelter{
    name:string,
    country:string,
    district:string,
    collective:string,
    latLng:L.LatLng
}

export interface IButton {
    ref:string;
    icon?:string;
    dark_theme?:Boolean;
    text?:string;
    enabled?:Boolean;
    action?:Function;
}
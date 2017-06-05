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
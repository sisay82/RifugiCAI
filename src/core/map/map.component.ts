import { Component, OnInit, Input } from '@angular/core';
import { ShelterService } from '../shelter/shelter.service';
import * as L from 'leaflet';
import { Map } from 'leaflet';
import { IMarker } from '../../shared/interfaces';
@Component({
    moduleId:module.id,
    selector:'bc-map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    providers:[ShelterService]
})
export class BcMap implements OnInit{
    @Input() enableExpansion:boolean=false;
    @Input() normalIconSize:number=26;
    @Input() regionIconSize:number=60;
    @Input() windowSize:{width:string,height:string}={width:'800px',height:'600px'};
    @Input() initialCenter:L.LatLng=L.latLng(41.9051,12.4879);

    public static latLngCountries: IMarker[]=[
        {latLng:new L.LatLng(45.7372,7.3206),popup:"",optional:{id:"Valle d'Aosta"}},
        {latLng:new L.LatLng(45.0667,7.7),popup:"",optional:{id:"Piemonte"}},
        {latLng:new L.LatLng(44.4072,8.934),popup:"",optional:{id:"Liguria"}},
        {latLng:new L.LatLng(45.4642,9.1903),popup:"",optional:{id:"Lombardia"}},
        {latLng:new L.LatLng(46.0667,11.1167),popup:"",optional:{id:"Trentino Alto Adige"}},
        {latLng:new L.LatLng(45.4397,12.3319),popup:"",optional:{id:"Veneto"}},
        {latLng:new L.LatLng(45.6361,13.8042),popup:"",optional:{id:"Friuli-Venezia Giulia"}},
        {latLng:new L.LatLng(44.4939,11.3428),popup:"",optional:{id:"Emilia Romagna"}},
        {latLng:new L.LatLng(43.7714,11.2542),popup:"",optional:{id:"Toscana"}},
        {latLng:new L.LatLng(43.1121,12.3886),popup:"",optional:{id:"Umbria"}},
        {latLng:new L.LatLng(43.6167,13.5167),popup:"",optional:{id:"Marche"}},
        {latLng:new L.LatLng(41.8931,12.4828),popup:"",optional:{id:"Lazio"}},
        {latLng:new L.LatLng(42.354,13.3919),popup:"",optional:{id:"Abruzzo"}},
        {latLng:new L.LatLng(41.561,14.6684),popup:"",optional:{id:"Molise"}},
        {latLng:new L.LatLng(40.8333,14.25),popup:"",optional:{id:"Campania"}},
        {latLng:new L.LatLng(41.1253,16.8667),popup:"",optional:{id:"Puglia"}},
        {latLng:new L.LatLng(40.6333,15.8),popup:"",optional:{id:"Basilicata"}},
        {latLng:new L.LatLng(38.91,16.5875),popup:"",optional:{id:"Calabria"}},
        {latLng:new L.LatLng(38.1157,13.3639),popup:"",optional:{id:"Sicilia"}},
        {latLng:new L.LatLng(39.2167,9.1167),popup:"",optional:{id:"Sardegna"}},
    ];

    private normalIcon;

    private expanded:boolean=false;   
    private markerPane= L.featureGroup();

    private base_url:string="http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    private map:Map;
    private divIcon;

    constructor(public shelterService:ShelterService){
        this.normalIcon=L.divIcon({
            className:'',
            iconSize:null,
            iconAnchor:[this.normalIconSize/4,this.normalIconSize],
            popupAnchor:[0,0],
            html:'<style>.bc-marker:hover{color:#26a69a;} .bc-marker{font-size:'+this.normalIconSize+'px;} </style><div style="position:relative" class="fa fa-map-marker bc-marker"></div>'
        });
    }

    ngOnInit(){
        this.getMapInit('map');
       // document.getElementById("map").style.width=this.windowSize.width;
      //  document.getElementById("map").style.height=this.windowSize.height;
        this.map.invalidateSize();
        this.map.setView(this.initialCenter,6);

        this.markRegions();

    }

    addMarker(marker:L.Marker){
        this.markerPane.addLayer(marker);
    }

    getMapInit(mapElement:string){
        this.map = new L.Map(mapElement);
        L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'        
        }).addTo(this.map);
        this.map.on("zoom",this.zoomEvent,this);
        this.map.on("click",function(e:L.MouseEvent){
            e.target.eachLayer(function(layer){layer.closeTooltip()})
        });
        this.markerPane.addTo(this.map);
        if(this.enableExpansion)
            this.map.on("click",this.clickEvent,this);
    }

    popolateMarkers(markers:IMarker[]){
        for(let item of markers){
            this.addMarker(
                L.marker(item.latLng,{icon:this.normalIcon}).bindPopup(item.popup)
                );
        }
    }

    markRegions(){
        for(let item of BcMap.latLngCountries){       
            let shelterCount:number = this.shelterService.getConutryMarkers(item.optional.id).length;
            let regionIcon= L.divIcon({
                className:'',
                iconSize:null,
                iconAnchor:[this.regionIconSize/4,this.regionIconSize],
                popupAnchor:[0,0],
                html:'<style>.bc-marker:hover{color:#26a69a;} .bc-marker{font-size:'+this.regionIconSize+'px;} .bc-marker-content{font-family:Roboto,Helvetica Neue, sans-serif;} .bc-marker:hover .bc-marker-content{color:black;}</style><div style="position:relative" class="fa fa-map-marker bc-marker"><div class="bc-marker-content" style="position:absolute;z-index:-1;background:white;top:18%;text-align:center;left:20%;width:60%;height:35%;"><div style="font-size:20%;transform: translateY(35%);">'+shelterCount+'</div></div></div>'
            });

            this.addMarker(L.marker(item.latLng,{icon:regionIcon}).on("click",this.openPopupRegion,this));
        }
    }

    openPopupRegion(event:L.Event){
        this.map.setView(event.target._latlng,9);
    }

    removeMarkers(){
        this.markerPane.clearLayers();
    }

    zoomEvent(event:L.Event){
        if(event.target.getZoom()>7){
            this.removeMarkers();
            for(let shelter of this.shelterService.getShelters(event.target.getCenter(),10)){
                let popup:string=`<div style="width:250px;height:150px;background:white;border:0.1px;border-color:black;border-style:solid;font-family:Roboto,Helvetica Neue, sans-serif;font-size:20px">
                                <div style="width:100%;height:50px;background:black;font-family:inherit;font-size:inherit;text-align:center;color:white;position:relative">
                                <div style="top:20%;position:relative">`+shelter.name+`</div></div><div style="width:100%;height:100px;top:50px;"><div style="text-align:center;position:relative;top:20%">`
                                +shelter.registry.address.collective+`, `+shelter.registry.address.district+`</br>`+shelter.registry.address.country+`</div></div></div>`;
                let tooltip:L.Tooltip=L.tooltip({permanent:true,direction:"right",offset:[50,-50],interactive:true}).setContent(popup);
                let mark=L.marker([shelter.geographic_data.coordinates.latitude as number,shelter.geographic_data.coordinates.longitude as number],{icon:this.normalIcon}).bindTooltip(tooltip).on("click",function(e:L.MouseEvent){
                    let isOpen=e.target.isTooltipOpen();
                    this.map.eachLayer(function(layer){layer.closeTooltip()})               
                    if(!isOpen)
                        e.target.toggleTooltip();    
                },this);
                
                this.addMarker(mark);
                this.map.closeTooltip(tooltip);
            }                
        }else{
            this.removeMarkers();
            this.markRegions();
        }
    }

    clickEvent(event:MouseEvent){   
        if(!this.expanded){
            this.expanded=true;
            document.getElementById("map").style.width="100%";
            document.getElementById("map").style.height="100%";
            document.getElementById("map").style.position="absolute";
            this.map.off("click",this.clickEvent);
            this.map.closeTooltip();
            this.map.invalidateSize();
        }else{this.expanded=false;}
    }

    clickCloseEvent(event:Event){        
        if(this.expanded){
            document.getElementById("map").style.width=this.windowSize.width;
            document.getElementById("map").style.height=this.windowSize.height;
            document.getElementById("map").style.position="relative";
            this.map.invalidateSize();
            this.map.on("click",this.clickEvent,this);
        }
    }

}
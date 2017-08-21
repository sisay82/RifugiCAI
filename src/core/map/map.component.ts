import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { ShelterService } from '../../app/shelter/shelter.service';
import * as L from 'leaflet';
import { Map } from 'leaflet';
import { IMarker } from '../../app/shared/types/interfaces';

function getRegionMarkerHtml(content,size){
    return `<div style="font-size:`+size+`px" class="fa fa-map-marker bc-marker">
                <div class="bc-marker-content">
                    <div style="font-size:20%;transform: translateY(35%);">`+content+`</div>
                </div>
            </div>`;
}

function getNormalMarkerHtml(size){
    return `<div style="font-size:`+size+`px" class="fa fa-map-marker bc-marker bc-tiny-marker"></div>`;
}

function getTooltip(name,municipality,province,region){
    return `<div class="bc-tooltip">
                <div class="bc-tooltip-head">
                    <div style="top:20%;position:relative">`+name+`</div>
                </div>
                <div class="bc-tooltip-line">
                    <div class="bc-tooltip-content-line">`+municipality||'---'+`, `+province||'---'+`</br>`+region||'---'+`</div>
                </div>
            </div>`;
}

@Component({
    moduleId:module.id,
    selector:'bc-map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    providers:[ShelterService],
    encapsulation:ViewEncapsulation.None
})
export class BcMap implements OnInit{
    @Input() enableExpansion:boolean=false;
    @Input() normalIconSize:number=26;
    @Input() regionIconSize:number=60;
    @Input() initialCenter:Subject<L.LatLng|L.LatLngExpression>;
    @Input() initialZoom:number=6;
    @Input() openTooltipCenter:boolean=false;
    increaseRatio:number=1;
    private _toggle:boolean=false;

    public static defaultCenter:L.LatLng=L.latLng(41.9051,12.4879);
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

    constructor(private router:Router,public shelterService:ShelterService){
        this.normalIcon=L.divIcon({
            className:'',
            iconSize:null,
            iconAnchor:[this.normalIconSize/4,this.normalIconSize],
            popupAnchor:[0,0],
            html:getNormalMarkerHtml(this.normalIconSize)
        });
    }

    ngOnInit(){
        this.getMapInit('map');
        this.map.invalidateSize();
        this.map.setView(BcMap.defaultCenter,this.initialZoom);
        if(this.initialCenter!=undefined){
            let initialCenterSub=this.initialCenter.subscribe(value=>{
                if(value[0]!=null&&value[1]!=null){
                    this.map.setView(value,this.initialZoom);
                }
                if(initialCenterSub!=undefined){
                    initialCenterSub.unsubscribe();
                }
            });
        }

        if(this.initialZoom<=7){
            this.markRegions();
        }

        if(this.openTooltipCenter){
            this.map.eachLayer(function(layer){
                if(layer.getTooltip()!=undefined){
                    if(layer.getTooltip().getLatLng().equals(this.initialCenter)){
                        layer.openTooltip();
                    }else{
                        layer.closeTooltip()
                    }
                }
            },this);
        }
    }

    addMarker(marker:L.Marker){
        this.markerPane.addLayer(marker);
    }

    getMapInit(mapElement:string){
        this.map = new L.Map(mapElement);
        L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'        
        }).addTo(this.map);
        this.map.on("click",function(e:L.MouseEvent){
            e.target.eachLayer(function(layer){layer.closeTooltip()})
        });
        this.markerPane.addTo(this.map);
        if(this.enableExpansion){
                this.map.on("click",this.clickEvent,this);
        }
        this.map.on("moveend",this.moveEvent,this);
        
    }

    markRegions(){
        for(let item of BcMap.latLngCountries){       
            let countryMarkerSub=this.shelterService.getConutryMarkersNumber(item.optional.id).subscribe(obj=>{
                if(obj!=undefined&&obj.num!=undefined&&obj.num>0){
                    let regionIcon= L.divIcon({
                        className:'',
                        iconSize:null,
                        iconAnchor:[this.regionIconSize/4,this.regionIconSize],
                        html:  getRegionMarkerHtml(obj.num,this.regionIconSize)
                    });
                    this.addMarker(L.marker(item.latLng,{icon:regionIcon}).on("click",this.openPopupRegion,this));
                }
                if(countryMarkerSub!=undefined){
                    countryMarkerSub.unsubscribe();
                }
            });
        }
    }

    openPopupRegion(event:L.Event){
        this.map.setView(event.target._latlng,9);
    }

    removeMarkers(){
        this.markerPane.clearLayers();
    }

    moveEvent(event:L.Event){
        if(event.target.getZoom()>7){
            this.removeMarkers();
            this.setMarkersAround(event.target.getCenter());
        }else{
            this.removeMarkers();
            this.markRegions();
        }
    }

    setMarkersAround(point:L.LatLng){
        let sheltersAroundSub = this.shelterService.getSheltersAroundPoint(point,1+this.increaseRatio/this.map.getZoom()).subscribe(shelters=>{
            for(let shelter of shelters){
                if(shelter.geoData!=undefined&&shelter.geoData.location!=undefined){
                    let popup:string=getTooltip(shelter.name,shelter.geoData.location.municipality,shelter.geoData.location.province,shelter.geoData.location.region);
                    let tooltip:L.Tooltip=L.tooltip({permanent:true,direction:"right",offset:[25,-50],interactive:true}).setContent(popup);
                    
                    tooltip.on("click",function(event:Event){
                        this.router.navigateByUrl("/shelter/"+shelter._id);
                    });
                    let mark=L.marker([shelter.geoData.location.latitude as number,shelter.geoData.location.longitude as number],{icon:this.normalIcon}).bindTooltip(tooltip).on("click",function(e:L.MouseEvent){
                        let isOpen=e.target.isTooltipOpen();
                        if(isOpen){
                            location.href="/shelter/"+shelter._id+"/(content:geographic)";
                        }
                        this.map.eachLayer(function(layer){layer.closeTooltip()});               
                        if(!isOpen){
                            this.map.off('moveend');
                            this.map.on('moveend',(ev)=>{
                                ev.target.openTooltip(e.target._tooltip);
                                this.map.off('moveend');
                                this.map.on("moveend",this.moveEvent,this);
                                
                            });
                            this.map.setView(e.target._latlng);
                            e.target.toggleTooltip();
                        }    
                    },this);
                    this.addMarker(mark);
                    this.map.closeTooltip(tooltip);
                }
            }
            if(sheltersAroundSub!=undefined){
                sheltersAroundSub.unsubscribe();
            }
        });
    }

    clickEvent(event:MouseEvent){   
        if(!this._toggle){
            if(!this.expanded){
                this.expanded=true;
                this._toggle=true;
                document.getElementById("map").style.width="100%";
                document.getElementById("map").style.height="100%";
                document.getElementById("map").style.position="relative";
                this.map.closeTooltip();
                this.map.invalidateSize();
            }else{
                this.expanded=false;
            }
        }
    }
}
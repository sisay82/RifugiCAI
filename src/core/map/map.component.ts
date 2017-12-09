import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ShelterService } from '../../app/shelter/shelter.service';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { Map } from 'leaflet';
import { IMarker } from '../../app/shared/types/interfaces';
import { Enums } from '../../app/shared/types/enums';
import {BcAuthService} from '../../app/shared/auth.service';

function getRegionMarkerHtml(content,size){
    return `<div style="font-size:`+size+`px" class="fa fa-map-marker bc-marker">
                <div class="bc-marker-content">
                    <div style="font-size:20%;transform: translateY(35%);">`+content+`</div>
                </div>
            </div>`;
}

function getNormalMarkerHtml(size){
    return `<div style="font-size:`+size+`px" class="fa fa-map-marker bc-marker bc-marker-tiny"></div>`;
}

function getTooltip(name,municipality,province,region){
    let tooltip=`<div class="bc-tooltip">
    <div class="bc-tooltip-head">
        <div style="top:20%;position:relative">`+(name?(name):'---')+`</div>
    </div>
    <div class="bc-tooltip-line">
        <div class="bc-tooltip-line-content">`+(municipality?(municipality):'---')+`, `+(province?(province):'---')+`</br>`+(region?(region):'---')+`</div>
    </div>
</div>`
    return tooltip;
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
    increaseRatio:number=10;

    private checkUser(code:String):any{
        return code.substr(0,2)
    }

    private getRegion(code:String){
        return code.substr(2,2);
    }

    private getSection(code:String){
        return code.substr(4,3);
    }
    
    private _toggle:boolean=false;
    private countrySheltersNumber:{region:string,marker:L.Marker}[]=[];
    public static defaultCenter:L.LatLng=new L.LatLng((<any>Enums.Defaults.Region_LanLng.lazio)[0],(<any>Enums.Defaults.Region_LanLng.lazio)[1]);
    private normalIcon;

    expanded:boolean=false;   
    private markerPane= L.featureGroup();

    private base_url:string="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    private map:Map;
    private divIcon;

    constructor(private authService:BcAuthService,private router:Router,public shelterService:ShelterService){
        this.normalIcon=L.divIcon({
            className:'',
            iconSize:null,
            iconAnchor:[this.normalIconSize/4,this.normalIconSize],
            popupAnchor:[0,0],
            html:getNormalMarkerHtml(this.normalIconSize)
        });
    }

    ngAfterContentInit() {
        //Called after ngOnInit when the component's or directive's content has been initialized.
        //Add 'implements AfterContentInit' to the class.
        setTimeout(()=>{this.map.invalidateSize()}, 400);
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
        L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="https://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'        
        }).addTo(this.map);
        this.map.on("click",function(e:any){
            e.target.eachLayer(function(layer){layer.closeTooltip()})
        });
        this.markerPane.addTo(this.map);
        if(this.enableExpansion){
                this.map.on("click",this.clickEvent,this);
        }
        this.map.on("moveend",this.moveEvent,this);
        
    }

    getShelterNumberForRegion(country:string){
        let savedMarkers;
        let coordinateMarker:L.LatLng;        
        if(country){
            savedMarkers=this.countrySheltersNumber.find(obj=>obj.region==country);
            if(Enums.Defaults.Region_LanLng[country.toLowerCase()]){
                coordinateMarker=Enums.Defaults.Region_LanLng[country.toLowerCase()];
            }else{
                return;
            }
        }else{
            return;
        }

        if(!coordinateMarker){
            return;
        }

        if(savedMarkers==undefined){
            let countryMarkerSub=this.shelterService.getConutryMarkersNumber(country).subscribe(obj=>{                
                if(obj!=undefined&&obj.num!=undefined&&obj.num>0){
                    let regionIcon= L.divIcon({
                        className:'',
                        iconSize:null,
                        iconAnchor:[this.regionIconSize/4,this.regionIconSize],
                        html:  getRegionMarkerHtml(obj.num,this.regionIconSize)
                    });
                    let mark:L.Marker=L.marker(coordinateMarker,{icon:regionIcon});
                    this.countrySheltersNumber.push({marker:mark,region:country});           
                    this.addMarker(mark.on("click",this.openPopupRegion,this));
                }else{
                    this.countrySheltersNumber.push({marker:null,region:country})
                }
                if(countryMarkerSub!=undefined){
                    countryMarkerSub.unsubscribe();
                }
            });
        }else{
            if(savedMarkers.marker!=null)
                this.addMarker(savedMarkers.marker.on("click",this.openPopupRegion,this));
            else{
                this.countrySheltersNumber.splice(this.countrySheltersNumber.findIndex(obj=>obj.region==country),1);                    
            }
        }
    }



    markRegions(){
        let permissionSub = this.authService.getUserProfile().subscribe(profile=>{      
            let processedUser = this.authService.processUserProfileCode(profile);    
            if(processedUser){
                const regions=this.authService.getRegions(profile.role,profile.code);
                for(let region of regions){
                    this.getShelterNumberForRegion(region);
                }
                /*if(!this.authService.isCentralRole(profile.role)){
                    if(profile.role==Enums.Auth_Permissions.User_Type.area){
                        for(const region of this.authService.getRegions(profile.role,profile.code)){

                        }
                    }else{
                        this.getShelterNumberForRegion(<string>processedUser.region);                        
                    }
                }else{
                    
                }
                if(profile.role==Enums.Auth_Permissions.User_Type.regional){
                    this.getShelterNumberForRegion(processedUser.region.toString());
                }else if(profile.role==Enums.Auth_Permissions.User_Type.sectional){
                    this.getShelterNumberForRegion(processedUser.region.toString());
                }else{
                    for(let item of Object.keys(Enums.Auth_Permissions.Region_Code)){      
                        this.getShelterNumberForRegion(item);
                    }
                }*/
            }else{
                return;
            }

            if(permissionSub){
                permissionSub.unsubscribe();
            }
        });
    }

    openPopupRegion(event:any){
        this.map.setView(event.target._latlng,9);
    }

    removeMarkers(){
        this.markerPane.clearLayers();
    }

    moveEvent(event:any){
        if(event.target.getZoom()>7){
            this.removeMarkers();
            this.setMarkersAround(event.target.getCenter());
        }else{
            this.removeMarkers();
            this.markRegions();
        }
    }

    setMarkersAround(point:L.LatLng){
        const permissionSub = this.authService.getUserProfile().subscribe(profile=>{            
            const sheltersAroundSub = this.shelterService.getSheltersAroundPoint(point,1+this.increaseRatio/this.map.getZoom()).subscribe(shelters=>{
                for(let shelter of shelters){
                    if(shelter.geoData!=undefined&&shelter.geoData.location!=undefined){
                        let popup:string=getTooltip(shelter.name,shelter.geoData.location.municipality,shelter.geoData.location.province,shelter.geoData.location.region);
                        let tooltip:L.Tooltip=L.tooltip({permanent:true,direction:"right",offset:[25,-50],interactive:true}).setContent(popup);
                        tooltip.on("click",function(event:Event){
                            this.router.navigateByUrl("/shelter/"+shelter._id);
                        });
                        let mark=L.marker([shelter.geoData.location.latitude as number,shelter.geoData.location.longitude as number],{icon:this.normalIcon}).bindTooltip(tooltip).on("click",function(e:any){
                            let isOpen=e.target.isTooltipOpen();
                            if(isOpen){
                                location.href="/shelter/"+shelter._id+"/(content:geographic)";
                            }
                            this.map.eachLayer(function(layer){layer.closeTooltip()});               
                            if(!isOpen){
                                if(e.latlng.distanceTo(this.map.getCenter())>100){
                                    this.map.off('moveend');
                                    this.map.on('moveend',(ev)=>{
                                        ev.target.openTooltip(e.target._tooltip);
                                        this.map.off('moveend');
                                        this.map.on("moveend",this.moveEvent,this);
                                        
                                    });
                                    this.map.setView(e.target._latlng);
                                    e.target.toggleTooltip();                                    
                                }else{
                                    e.target.openTooltip(e.target._tooltip);
                                }
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
import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IGeographic,IShelter,ITag } from '../../../app/shared/types/interfaces'
import {BcMap} from '../../map/map.component';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import {BcSharedService} from '../../../app/shared/shared.service'
import {BcDetailsService} from '../details.service';
@Component({
  moduleId: module.id,
  selector: 'bc-geo',
  templateUrl: 'geo.component.html',
  styleUrls: ['geo.component.scss'],
  providers:[ShelterService]
})
export class BcGeo {
  data:IGeographic={location:{longitude:null,latitude:null}};
  center:Subject<L.LatLng|L.LatLngExpression>=new Subject();
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService,private detailsService:BcDetailsService){
    shared.activeComponent="geographic";
    this.shared.onActiveOutletChange("content");
  }

  getCenter(){
    if(this.data!=undefined && this.data.location!=undefined
    &&this.data.location.latitude!=undefined&&this.data.location.longitude!=undefined){
      return [this.data.location.latitude,this.data.location.longitude];
    }else{
      return BcMap.defaultCenter;//default
    }
  }

  getZoom(){
    if(this.data!=undefined && this.data.location!=undefined){
      return 17;
    }else{
      return 6;//default
    }
  }

  ngOnDestroy(){

  }

  getGeoData(id):Promise<IShelter>{
    return new Promise<IShelter>((resolve,reject)=>{
        let revSub=this.detailsService.load$.subscribe(shelter=>{
          if(shelter!=null&&shelter.geoData!=undefined){
              if(revSub!=undefined){
                  revSub.unsubscribe();
              }
              resolve(shelter);
          }else{
              let shelSub=this.shelterService.getShelterSection(id,"geoData").subscribe(shelter=>{
                  if(shelter.geoData==undefined) shelter.geoData={location:{},tags:[] as [ITag]};
                  this.detailsService.onChildSave(shelter,"geoData");
                  if(shelSub!=undefined){
                      shelSub.unsubscribe();
                  }
                  if(revSub!=undefined){
                      revSub.unsubscribe();
                  }
                  resolve(shelter);
              });
          }
      });
      this.detailsService.onChildLoadRequest("geoData");
    });
  }

  initGeographic(data){
    this.data=data;
    if(this.data!=undefined&&this.data.location!=undefined){
      this.center.next([data.location.latitude as number,data.location.longitude as number]);
    }
  }

  ngOnInit(){
    let routeSub=this._route.parent.params.subscribe(params=>{
      this.getGeoData(params["id"])
      .then((shelter)=>{
          this.initGeographic(shelter.geoData);
          if(routeSub!=undefined){
              routeSub.unsubscribe();
          }
      });
    });
  }

  getTag(key:String){
    if(this.data!=undefined && this.data.tags!=undefined){
      let index=this.data.tags.findIndex((tag)=>tag.key.toLowerCase().indexOf(key.toLowerCase())>-1)
      if(index>-1){
        if(this.data.tags[index].value!=""){
          return this.data.tags[index].value;
        }else{
          return null;
        }
      }else{
        return null;
      }
    }else{
      return null;
    } 
  }
}
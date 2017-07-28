import {
  Component,Input,OnInit,OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IGeographic } from '../../../app/shared/types/interfaces'
import {BcMap} from '../../map/map.component';
import {ShelterService} from '../../../app/shelter/shelter.service'
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import {BcSharedService} from '../../../app/shelter/shelterPage/shared.service'
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'titleCase'})
export class TitleCasePipe implements PipeTransform {
    public transform(input:string): string{
        if (!input) {
            return '';
        } else {
            return input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1).toLowerCase() ));
        }
    }
    
}
  
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
  private activeComponentSub:Subscription;
  constructor(private shelterService:ShelterService,private _route:ActivatedRoute,private shared:BcSharedService){
    this.activeComponentSub=this.shared.activeComponentRequest$.subscribe(()=>{
      this.shared.onActiveComponentAnswer("geographic");
    })

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
    if(this.activeComponentSub!=undefined){
      this.activeComponentSub.unsubscribe();
    }
  }

  ngOnInit(){
    let routeSub:Subscription=this._route.parent.params.subscribe(params=>{
      let shelSub=this.shelterService.getShelterSection(params['id'],"geoData").subscribe(shelter=>{
        this.data=shelter.geoData;
        if(this.data!=undefined&&this.data.location!=undefined){
          this.center.next([shelter.geoData.location.latitude as number,shelter.geoData.location.longitude as number]);
        }
        if(shelSub!=undefined){
          shelSub.unsubscribe();
        }
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
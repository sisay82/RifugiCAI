import {
  Component, Input,OnInit
} from '@angular/core';
import { IShelter } from '../../shared/interfaces';
import {Router,ActivatedRoute} from '@angular/router';
import {ShelterService} from '../../app/shelter/shelter.service'
import {BcSharedService} from '../../app/shelter/shared.service'

@Component({
    moduleId: module.id,
    selector: 'bc-mask',
    templateUrl: 'mask-controller.component.html',
    providers:[ShelterService]
})
export class BcMaskController {
  @Input() shelter:IShelter;
  @Input() ref:string;
  private currentOutlet:string="content";

  constructor(private shared:BcSharedService,private shelterService:ShelterService,private route:ActivatedRoute){
    shared.activeOutletChange$.subscribe(outlet=>{
        this.currentOutlet=outlet;
    });
  }

  ngOnInit(){
      /*if(this.shelter==undefined){
          this.shelterService.getshelter(this.route.params["id"]).subscribe(shelter=>{
              this.shelter=shelter;
          })
      }*/
  }
}
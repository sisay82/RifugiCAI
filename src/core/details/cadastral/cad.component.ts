import {
  Component,Input,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IShelter } from '../../../app/shared/types/interfaces'
import {ShelterService} from '../../../app/shelter/shelter.service'
import { Enums } from '../../../app/shared/types/enums'

@Component({
  moduleId: module.id,
  selector: 'bc-cadastrad',
  templateUrl: 'cad.component.html',
  styleUrls: ['cad.component.scss'],
  providers:[ShelterService]
})
export class BcCadastral {
  data:IShelter;

  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){}
  
  getSourceValue(value:Enums.Source_Type){
    return Object.keys(Enums.Source_Type).find(k=>Enums.Source_Type[k]===value);
  }

  getTypoValue(value:Enums.Typo_consistency){
    return Object.keys(Enums.Typo_consistency).find(k=>Enums.Typo_consistency[k]===value);
  }

  ngOnInit(){
    this._route.parent.params.subscribe(params=>{
      this.shelterService.getShelterSection(params['id'],"catastal").subscribe(shelter=>{
        this.data.catastal=shelter.catastal;
        this.shelterService.getShelterSection(params['id'],"drain").subscribe(shelter=>{
          this.data.drain=shelter.drain;
          this.shelterService.getShelterSection(params['id'],"energy").subscribe(shelter=>{
            this.data.energy=shelter.energy;
          });
        });
      });
    });
  }
}
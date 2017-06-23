import {
  Component,Input,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICatastal,IDrain,IEnergy } from '../../../app/shared/types/interfaces'
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
  catastal:ICatastal={};
  drain:IDrain={type:null};
  energy:IEnergy={};

  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){}
  
  getSourceValue(value:Enums.Source_Type){
    return Object.keys(Enums.Source_Type).find(k=>Enums.Source_Type[k]===value);
  }

  getTypoValue(){
    if(this.catastal!=undefined&&this.catastal.typologicalCoherence!=undefined){
      return Object.keys(Enums.Typo_consistency).find(k=>Enums.Typo_consistency[k]===this.catastal.typologicalCoherence);
    }else{
      return '----';
    }
  }

  ngOnInit(){
    this._route.parent.params.subscribe(params=>{

      this.shelterService.getShelterSection(params['id'],"catastal").subscribe(shelter=>{
        this.catastal=shelter.catastal;
      });

      this.shelterService.getShelterSection(params['id'],"drain").subscribe(shelter=>{
        this.drain=shelter.drain;
      });

      this.shelterService.getShelterSection(params['id'],"energy").subscribe(shelter=>{
        this.energy=shelter.energy;
      });
    });
  }
}
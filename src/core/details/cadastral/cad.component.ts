import {
  Component,Input,OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICadastral } from '../../../shared/interfaces'
import {ShelterService} from '../../shelter/shelter.service'
import { Enums } from '../../../shared/enums'

@Component({
  moduleId: module.id,
  selector: 'bc-cadastrad',
  templateUrl: 'cad.component.html',
  styleUrls: ['cad.component.scss'],
  providers:[ShelterService]
})
export class BcCadastral {
  data:ICadastral;

  constructor(private shelterService:ShelterService,private _route:ActivatedRoute){}
  
  getSourceValue(value:Enums.Source_Type){
    return Object.keys(Enums.Source_Type).find(k=>Enums.Source_Type[k]===value);
  }

  getTypoValue(value:Enums.Typo_consistency){
    return Object.keys(Enums.Typo_consistency).find(k=>Enums.Typo_consistency[k]===value);
  }

  ngOnInit(){
    this._route.parent.params.subscribe(params=>{
      this.data=this.shelterService.getCadastralsByName(params['name']);
    });
  }
}
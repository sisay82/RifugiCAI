import {
    Component,Input,OnInit,OnDestroy
  } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { IShelter } from '../../../app/shared/types/interfaces'
  import {ShelterService} from '../../../app/shelter/shelter.service'
  import { Subject } from 'rxjs/Subject';
  import { Subscription } from 'rxjs/Subscription';
  import {BcSharedService} from '../../../app/shared/shared.service'
  import {BcDetailsService} from '../details.service';
  @Component({
    moduleId: module.id,
    selector: 'bc-economy',
    templateUrl: 'economy.component.html',
    styleUrls: ['economy.component.scss'],
    providers:[ShelterService]
  })
  export class BcEconomy {
  }
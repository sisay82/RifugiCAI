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
    selector: 'bc-fruition',
    templateUrl: 'fruition.component.html',
    styleUrls: ['fruition.component.scss'],
    providers:[ShelterService]
  })
  export class BcFruition {
  }
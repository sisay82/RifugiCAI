import {
  Component, Input, OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IManagement, ISubject, IShelter } from '../../../app/shared/types/interfaces';
import { ShelterService } from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs';
import { BcDetailsService } from '../details.service';
import { DetailBase } from '../shared/detail_base';

@Component({
  moduleId: module.id,
  selector: 'bc-manage',
  templateUrl: 'manage.component.html',
  styleUrls: ['manage.component.scss'],
  providers: [ShelterService]
})
export class BcManage extends DetailBase {
  data: IManagement = { subject: [{ name: null }] };
  owner: ISubject;
  managers: ISubject[] = [];
  constructor(shelterService: ShelterService,
    _route: ActivatedRoute,
    shared: BcSharedService,
    router: Router,
    detailsService: BcDetailsService
  ) {
    super(_route, shared, router, detailsService, shelterService);
    shared.activeComponent = Enums.Routes.Routed_Component.management;
  }

  initManagement(management: IManagement) {
    this.data = management;
    if (this.data && this.data.subject) {
      this.data.subject.forEach(subject => {
        if (subject.type && subject.type.toLowerCase().indexOf("proprietario") > -1) {
          this.owner = subject;
        } else {
          this.managers.push(subject);
        }
      })
    }

  }

  /*getManagement(id): Promise<IShelter> {
    return new Promise<IShelter>((resolve, reject) => {
      let detSub = this.detailsService.load$.subscribe(shelter => {
        if (shelter != null && shelter.management != undefined) {
          if (detSub != undefined) {
            detSub.unsubscribe();
          }
          resolve(shelter);
        } else {
          let managSub = this.shelterService.getShelterSection(id, "management").subscribe(shelter => {
            if (shelter.management == undefined) shelter.management = { subject: [] as [ISubject] };
            this.detailsService.onChildSave(shelter, "management");
            if (managSub != undefined) {
              managSub.unsubscribe();
            }
            if (detSub != undefined) {
              detSub.unsubscribe();
            }
            resolve(shelter);
          });
        }
      });
      this.detailsService.onChildLoadRequest("management");
    });
  }*/

  getEmptyObjData(section) {
    return { subject: [] as any };
  }

  init(shelId) {
    this.getData(shelId, "management")
      .then(shelter => {
        this.initManagement(shelter.management);
      })
    /*this.getManagement(shelId)
      .then(shelter => {
        this.initManagement(shelter.management);
      });*/
  }

  getDifferenceDates(date1: Date, date2: Date) {
    if (date1 && date2) {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      if (d1 && d2) {
        return Math.abs((d2.getMonth() - d1.getMonth()) + (d2.getFullYear() - d1.getFullYear()) * 12);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  gotoSite(webSite: string) {
    this.redirect(webSite);
  }

}

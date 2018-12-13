import {
  Component, Input, OnInit, Directive
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IShelter, IUse } from '../../../app/shared/types/interfaces'
import { ShelterService } from '../../../app/shelter/shelter.service'
import { Subject, Subscription } from 'rxjs';
import { BcSharedService } from '../../../app/shared/shared.service'
import { BcDetailsService } from '../details.service';
import { Enums } from '../../../app/shared/types/enums';
import { DetailBase } from '../shared/detail_base';

@Directive({
  selector: "div[active]",
  host: {
    "[class.bc-detail-fruition-tab-active]": "active"
  }
})
export class BcActiveTabStyler {
  @Input("active") active = false;
}

@Component({
  moduleId: module.id,
  selector: 'bc-fruition',
  templateUrl: 'fruition.component.html',
  styleUrls: ['fruition.component.scss'],
  providers: [ShelterService]
})
export class BcFruition extends DetailBase {
  data: IUse[] = [];
  activeYear;
  activeTab: IUse;
  constructor(shelterService: ShelterService,
    _route: ActivatedRoute,
    shared: BcSharedService,
    router: Router,
    detailsService: BcDetailsService
  ) {
    super(_route, shared, router, detailsService, shelterService);
    this.data = this.data.sort((a, b) => { return a.year < b.year ? -1 : a.year > b.year ? +1 : 0; })
    shared.activeComponent = Enums.Routes.Routed_Component.use;
  }

  isActive(year) {
    return year == this.activeYear;
  }

  showTab(year) {
    if (year != this.activeYear) {
      this.activeYear = year;
      this.activeTab = this.data.find(obj => obj.year == year);
    }
  }

  init(shelId) {
    this.getData(shelId, "use")
      .then(shelter => {
        this.data = shelter.use.sort((a, b) => { return a.year < b.year ? -1 : a.year > b.year ? +1 : 0; });
        this.activeTab = shelter.use.find(obj => obj.year === (new Date().getFullYear()));
        this.activeYear = (new Date()).getFullYear();
        if (!this.activeTab) {
          const use: IUse = { year: (new Date()).getFullYear() }
          this.data.push(use);
          this.activeTab = use;
        }
      });
  }
}

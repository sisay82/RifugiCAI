import {
  Component, Input, OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IGeographic, IShelter, ITag } from '../../../app/shared/types/interfaces'
import { BcMap } from '../../map/map.component';
import { ShelterService } from '../../../app/shelter/shelter.service'
import { Subject, Subscription } from 'rxjs';
import { BcSharedService } from '../../../app/shared/shared.service'
import { BcDetailsService } from '../details.service';
import { Enums } from '../../../app/shared/types/enums'
import { DetailBase } from '../shared/detail_base';
import { BcMapService } from '../../map/map.service';

@Component({
  moduleId: module.id,
  selector: 'bc-geo',
  templateUrl: 'geo.component.html',
  styleUrls: ['geo.component.scss'],
  providers: [ShelterService, BcMapService]
})
export class BcGeo extends DetailBase {
  data: IGeographic = { location: { longitude: null, latitude: null } };

  constructor(shelterService: ShelterService,
    private mapService: BcMapService,
    _route: ActivatedRoute,
    shared: BcSharedService,
    router: Router,
    detailsService: BcDetailsService
  ) {
    super(_route, shared, router, detailsService, shelterService);
    shared.activeComponent = Enums.Routes.Routed_Component.geographic;
  }

  getZoom() {
    if (this.data && this.data.location) {
      return 17;
    } else {
      return 6;
    }
  }

  initGeographic(data) {
    this.data = data;
    if (this.data && this.data.location) {
      this.mapService.changeCurrentCenter([data.location.latitude as number, data.location.longitude as number]);
    }
  }

  getEmptyObjData(section) {
    return { location: {}, tags: [] as [ITag] };
  }

  init(shelId) {
    this.getData(shelId, "geoData")
      .then(shelter => {
        this.initGeographic(shelter.geoData);
      })
  }

  getTag(key: String) {
    if (this.data && this.data.tags) {
      const index = this.data.tags.findIndex((tag) => tag.key.toLowerCase().indexOf(key.toLowerCase()) > -1)
      if (index > -1) {
        if (this.data.tags[index].value !== "") {
          return this.data.tags[index].value;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

}

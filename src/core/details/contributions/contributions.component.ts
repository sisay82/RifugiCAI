import {
  Component, Input, OnInit, Directive
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IShelter, IContribution, IFileRef, IFile } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import { ShelterService } from '../../../app/shelter/shelter.service'
import { Subject, Subscription } from 'rxjs';
import { BcSharedService } from '../../../app/shared/shared.service'
import { BcDetailsService } from '../details.service';
import { DetailBase } from '../shared/detail_base';

@Directive({
  selector: "div[active]",
  host: {
    "[class.bc-detail-contributions-tab-active]": "active"
  }
})
export class BcActiveTabStyler {
  @Input("active") active = false;
}

@Component({
  moduleId: module.id,
  selector: 'bc-contributions',
  templateUrl: 'contributions.component.html',
  styleUrls: ['contributions.component.scss'],
  providers: [ShelterService]
})
export class BcContributions extends DetailBase {
  activeYear: Number;
  activeTab: { year: Number, contributions: IFile[] };
  data: { year: Number, contributions: IFile[] }[] = <any>[];

  constructor(shelterService: ShelterService,
    _route: ActivatedRoute,
    shared: BcSharedService,
    router: Router,
    detailsService: BcDetailsService
  ) {
    super(_route, shared, router, detailsService, shelterService);
    shared.activeComponent = Enums.Routes.Routed_Component.contribution;
  }

  isActive(year) {
    return year == this.activeYear;
  }

  showTab(year) {
    if (year != this.activeYear) {
      this.changeActiveTab(year);
    }
  }

  changeActiveTab(year) {
    this.activeYear = year;
    this.activeTab = this.data.find(obj => obj.year == year);
  }

  groupByYear(list: IFile[]): { year: Number, contributions: IFile[] }[] {
    const result = list.reduce(function (r, a) {
      r[<any>a.invoice_year] = r[<any>a.invoice_year] || [];
      r[<any>a.invoice_year].push(a);
      return r;
    }, Object.create(null));
    const ret: { year: Number, contributions: IFile[] }[] = [];
    for (let y in result) {
      ret.push({ year: new Number(y), contributions: result[y] });
    }
    return ret;
  }

  downloadFile(id: any) {
    if (id) {
      const queryFileSub = this.shelterService.getFile(id).subscribe(file => {
        const e = document.createEvent('MouseEvents');
        const blob = new Blob([new Uint8Array(file.data.data)], { type: "application/pdf" });
        const a = document.createElement('a');
        a.download = <string>file.name;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ["application/pdf", a.download, a.href].join(':');
        e.initEvent('click', true, false);
        a.dispatchEvent(e);
      });
    }
  }

  init(shelId) {
    this.getDocs(shelId, [Enums.Files.File_Type.contribution])
      .then(files => {
        this.data = this.groupByYear(files);
        const year = (new Date()).getFullYear();
        const tab = this.data.find(obj => obj.year == year);
        if (!tab) {
          this.data.push({ year: year, contributions: [] });
        }
        this.changeActiveTab(year);
      });
  }
}

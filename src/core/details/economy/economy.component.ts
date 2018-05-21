import {
  Component, Input, OnInit, Directive
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IShelter, IEconomy, IContribution, IFile } from '../../../app/shared/types/interfaces'
import { Enums } from '../../../app/shared/types/enums'
import { ShelterService } from '../../../app/shelter/shelter.service'
import { Subject, Subscription } from 'rxjs';
import { BcSharedService } from '../../../app/shared/shared.service'
import { BcDetailsService } from '../details.service';
import { DetailBase } from '../shared/detail_base';

@Directive({
  selector: "div[active]",
  host: {
    "[class.bc-detail-economy-tab-active]": "active"
  }
})
export class BcActiveTabStyler {
  @Input("active") active: boolean = false;
}


@Component({
  moduleId: module.id,
  selector: 'bc-economy',
  templateUrl: 'economy.component.html',
  styleUrls: ['economy.component.scss'],
  providers: [ShelterService]
})
export class BcEconomy extends DetailBase {
  economy: [IEconomy] = <any>[];
  activeYear: Number;
  activeTab: IEconomy;
  balanceSheet = 0;
  files: IFile[] = [];
  revenuesFiles: [IFile] = [] as [IFile];
  outgosFiles: [IFile] = [] as [IFile];
  revenues = 0;
  outgos = 0;
  constructor(shelterService: ShelterService,
    _route: ActivatedRoute,
    shared: BcSharedService,
    router: Router,
    detailsService: BcDetailsService
  ) {
    super(_route, shared, router, detailsService, shelterService);
    shared.activeComponent = Enums.Routes.Routed_Component.economy;
  }

  isActive(year) {
    return year == this.activeYear;
  }

  showTab(year) {
    if (year != this.activeYear) {
      this.changeActiveTab(year, this.economy.find(obj => obj.year == year));
    }
  }

  getContributionSumPerType(type: Enums.Contribution_Type) {
    let total: any = 0;
    this.revenuesFiles.concat(
      this.files.filter(obj => obj.type === Enums.Files.File_Type.contribution)
    ).filter(obj => obj.contribution_type === type && obj.invoice_year === this.activeYear).forEach((file) => {
      total += this.getTotal(file.value, file.invoice_tax);
    });
    return total;
  }

  changeActiveTab(year, newTab: IEconomy) {
    this.activeYear = year;
    if (newTab) {
      this.activeTab = newTab;
    } else {
      this.activeTab = { year: year };
    }
    this.setBalanceSheetByYear(year);
  }

  getTotal(value, tax) {
    if (tax) {
      if (tax > 1) {
        return (value * (tax / 100)) + value;
      } else {
        return (value * tax) + value;
      }
    } else {
      return value;
    }

  }

  getEnumNames() {
    const names: any[] = [];
    const objValues = Object.keys(Enums.Contribution_Type).map(k => Enums.Contribution_Type[k]);
    objValues.filter(v => typeof v === "string").forEach((val) => {
      names.push(val);
    });
    return names;
  }

  setBalanceSheetByYear(year) {
    let total = 0;
    let totRevenues = 0;
    let totOutgos = 0;
    this.outgosFiles.filter(obj => obj.invoice_year == year).forEach(entry => {
      let n = 0;
      n = this.getTotal(entry.value, entry.invoice_tax);
      totOutgos += <number>n;
    });
    this.revenuesFiles.filter(obj => obj.invoice_year == year).forEach(entry => {
      let n = 0;
      n = this.getTotal(entry.value, entry.invoice_tax);
      totRevenues += <number>n;
    });
    this.outgos = totOutgos;
    this.revenues = totRevenues;
    total = totRevenues - totOutgos;
    this.balanceSheet = total;
    return total;
  }

  analyzeDocsYear(files: IFile[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      files.forEach(file => {
        if (!this.economy.find(obj => obj.year === file.invoice_year)) {
          this.economy.push({ year: file.invoice_year, accepted: false, confirm: false });
        }

      });
      this.economy = this.economy.sort((a, b) => { return a.year < b.year ? -1 : a.year > b.year ? +1 : 0; })
      resolve()
    });
  }

  getFilesByYear(files: IFile[]): IFile[] {
    return files.filter(obj => obj.invoice_year === this.activeYear);
  }

  init(shelId) {
    Promise.all([
      this.getData(shelId, "economy"),
      this.getDocs(shelId, [Enums.Files.File_Type.invoice, Enums.Files.File_Type.contribution])
        .then(files => {
          this.files = files;

          this.revenuesFiles = <[IFile]>files.filter(obj => obj.invoice_type &&
            obj.invoice_type === Enums.Invoice_Type.att.toString()
          );

          this.outgosFiles = <[IFile]>files.filter(obj => obj.invoice_type &&
            obj.invoice_type === Enums.Invoice_Type.pass.toString());

          this.setBalanceSheetByYear((new Date()).getFullYear());
          return this.analyzeDocsYear(files);
        })
    ])
      .then(values => {
        const shelter = values["0"];
        const files = values["1"];
        let tab;
        let year;
        year = (new Date()).getFullYear();
        if (shelter.economy && shelter.economy.length > 0) {
          this.economy = shelter.economy.sort((a, b) => { return a.year < b.year ? -1 : a.year > b.year ? +1 : 0; });
          tab = shelter.economy.find(obj => obj.year === (new Date().getFullYear()));
          if (!tab) {
            const economy: IEconomy = { year: (new Date()).getFullYear() }
            this.economy.push(economy);
            tab = economy;
            year = tab.year;
          }
        } else {
          const economy: IEconomy = { year: (new Date()).getFullYear() }
          this.economy = [economy];
        }
        this.changeActiveTab(year, tab);
      })
  }
}

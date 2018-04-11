import {
  Component, Input, OnInit, OnDestroy, Directive
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IShelter, IEconomy, IFile } from '../../../app/shared/types/interfaces'
import { Enums } from '../../../app/shared/types/enums'
import { ShelterService } from '../../../app/shelter/shelter.service'
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { BcSharedService } from '../../../app/shared/shared.service'
import { BcRevisionsService } from '../revisions.service';
import { RevisionBase } from '../shared/revision_base';
import { BcAuthService } from '../../../app/shared/auth.service';

@Directive({
  selector: "div[active]",
  host: {
    "[class.bc-revision-economy-tab-active]": "active"
  }
})
export class BcActiveTabStyler {
  @Input("active") active = false;
}

@Directive({
  selector: "div[disabled]",
  host: {
    "[class.disabled]": "disabled"
  }
})
export class BcDisableDivStyler {
  @Input("disabled") disabled = false;
}

@Component({
  moduleId: module.id,
  selector: 'bc-economy',
  templateUrl: 'economy.component.html',
  styleUrls: ['economy.component.scss'],
  providers: [ShelterService]
})
export class BcEconomyRevision extends RevisionBase implements OnDestroy {
  economy: [IEconomy] = <any>[];
  private files: IFile[] = [];
  private activeYear: Number;
  maskSaveSub: Subscription;
  name: String;
  activeTab: IEconomy;
  private balanceSheet = 0;
  private revenuesFiles: [IFile] = [] as [IFile];
  private outgosFiles: [IFile] = [] as [IFile];
  private revenues = 0;
  private outgos = 0;
  private statusChange = false;
  constructor(shelterService: ShelterService,
    authService: BcAuthService,
    _route: ActivatedRoute,
    shared: BcSharedService,
    router: Router,
    revisionService: BcRevisionsService) {
    super(shelterService, shared, revisionService, _route, router, authService);
    this.MENU_SECTION = Enums.MenuSection.economy;
    this.maskSaveSub = shared.maskSave$.subscribe(() => {
      this.disableSave = true;
      this.save(true);
    });

    shared.activeComponent = Enums.Routes.Routed_Component.economy;
  }

  isDisabled() {
    return this.activeTab.confirm;
  }

  save(confirm) {
    if (this.statusChange) {
      const shelter: IShelter = { _id: this._id, name: this.name };
      shelter.economy = this.economy;
      this.processSavePromise(shelter, "economy")
        .then(() => {
          this.displayError = false;
          if (confirm) {
            this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.economy);
          }
        })
        .catch(err => {
          this.abortSave();
          console.log(err);
        });

    } else {
      if (confirm) {
        this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.economy);
      }
    }
  }

  checkValidForm() {
    return true;
  }

  confirmEconomy(year) {
    this.statusChange = true;
    this.disableSave = true;
    this.economy.find(obj => obj.year === this.activeYear).confirm = true;
    let i = 0;
    const files: IFile[] = this.revenuesFiles.filter(obj => obj.invoice_year === this.activeYear)
      .concat(this.outgosFiles.filter(obj => obj.invoice_year === this.activeYear));

    if (files.length > 0) {
      for (const file of files) {
        file.invoice_confirmed = true;
        file.shelterId = this._id;
        this.shelterService.updateFile(file).subscribe((val) => {
          if (val) {
            i++;
            if (files.length === i) {
              this.shared.onSendMaskSave();
            }
          }
        });
        this.revisionService.onChildSaveFile(file);
      }
    } else {
      this.shared.onSendMaskSave();
    }
  }

  checkRole() {
    return this.userRole == Enums.Auth_Permissions.User_Type.sectional;
  }

  isActive(year) {
    return year === this.activeYear;
  }

  showTab(year) {
    if (year !== this.activeYear) {
      this.changeActiveTab(year, this.economy.find(obj => obj.year == year));
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

  ngOnDestroy() {
    if (!this.disableSave) {
      this.save(false);
    }
    if (this.maskSaveSub) {
      this.maskSaveSub.unsubscribe();
    }
    if (this.maskInvalidSub) {
      this.maskInvalidSub.unsubscribe();
    }
    if (this.maskValidSub) {
      this.maskValidSub.unsubscribe();
    }
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

  getFilesByYear(files: IFile[]): IFile[] {
    return files.filter(obj => obj.invoice_year === this.activeYear);
  }

  analyzeDocsYear(files: IFile[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      files.forEach(file => {
        if (!this.economy.find(obj => obj.year === file.invoice_year)) {
          this.economy.push({ year: file.invoice_year, confirm: false });
        }

      });
      this.economy = this.economy.sort((a, b) => { return a.year < b.year ? -1 : a.year > b.year ? +1 : 0; })
      resolve()
    });
  }

  protected initForm(shelter: IShelter) { }

  getEmptyObjData(section: any) {
    return {};
  }

  init(shelId) {
    Promise.all([
      this.getData(shelId, "economy")
        .then(shelter => {
          this.name = shelter.name;
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
          return Promise.resolve();
        }),
      this.getDocs(shelId, [Enums.Files.File_Type.invoice, Enums.Files.File_Type.contribution])
        .then(files => {
          return Promise.all([this.analyzeDocsYear(files), files])
        })
        .then((val) => {
          const files = val[1];
          this.files = files;
          this.revenuesFiles = files.filter(obj => obj.invoice_type &&
            Enums.Invoice_Type[obj.invoice_type].toString() === Enums.Invoice_Type.Attività.toString()) as [IFile];
          this.outgosFiles = files.filter(obj => obj.invoice_type &&
            Enums.Invoice_Type[obj.invoice_type].toString() === Enums.Invoice_Type.Passività.toString()) as [IFile];
          this.setBalanceSheetByYear((new Date()).getFullYear());
          return Promise.resolve();
        })
    ])
      .then(() => { });
  }
}

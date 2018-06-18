import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  OnChanges,
  ViewEncapsulation
} from '@angular/core';
import {
  IShelter
} from '../../../app/shared/types/interfaces';
import {
  Enums
} from '../../../app/shared/types/enums';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  ShelterService
} from '../../../app/shelter/shelter.service'
import {
  BcSharedService
} from '../../../app/shared/shared.service';
import {
  Subscription
} from 'rxjs';
import {
  BcAuthService
} from '../../../app/shared/auth.service';
import { Buffer } from 'buffer';

@Component({
  moduleId: module.id,
  selector: 'bc-mask-detail',
  templateUrl: 'mask-detail.component.html',
  styleUrls: ['mask-detail.component.scss'],
  providers: [ShelterService],
  host: {
    '[class.bc-mask]': 'true'
  },
  encapsulation: ViewEncapsulation.None
})
export class BcMask implements OnChanges {
  @Input() shelter: IShelter;
  private revisionPermission: Enums.Auth_Permissions.User_Type;
  private shelterInitialized: Boolean = false;
  private isCentral = false;
  constructor(
    private router: Router,
    private _route: ActivatedRoute,
    private shelterService: ShelterService,
    private shared: BcSharedService,
    private authService: BcAuthService) {

  }

  toggleMenu() {
    this.shared.onToggleMenu();
  }

  checkWinPlatform() {
    return (navigator.userAgent.toLowerCase().indexOf("win") === -1);
  }

  reviseCheck() {
    return this.authService.revisionCheck(this.revisionPermission);
  }

  csvCheck() {
    return this.authService.hasCSVGetPermission().subscribe(val => {
      this.isCentral = val;
    });
  }

  revision() {
    if (this.reviseCheck()) {
      const component = this.shared.activeComponent;
      this.shared.onActiveOutletChange(Enums.Routes.Routed_Outlet.revision);
      this.router.navigateByUrl("/shelter/" + this.shelter._id + "/(revision:" + component + ")");
    }
  }

  return() {
    this.router.navigateByUrl("list");
  }

  getCSV() {
    const getCSVSub = this.shelterService.getCSVData(this.shelter._id).subscribe(file => {
      const e = document.createEvent('MouseEvents');
      const data = Buffer.from((<any>file).buff);
      const blob = new Blob([data]);
      const a = document.createElement('a');
      a.download = this.shelter.name + ".csv";
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = [a.download, a.href].join(':');
      e.initEvent('click', true, false);
      a.dispatchEvent(e);
      if (getCSVSub) {
        getCSVSub.unsubscribe();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.shelterInitialized && this.shelter) {
      this.shelterInitialized = true;
      this.csvCheck();
      const permissionSub = this.authService.checkRevisionPermissionForShelter(this.shelter.idCai).subscribe(val => {
        if (!val) {
          this.return();
        } else {
          this.revisionPermission = val;
        }
        if (permissionSub) {
          permissionSub.unsubscribe();
        }
      });
    }
  }
}

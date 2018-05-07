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

  ngOnChanges(changes: SimpleChanges) {
    if (!this.shelterInitialized && this.shelter) {
      this.shelterInitialized = true;
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

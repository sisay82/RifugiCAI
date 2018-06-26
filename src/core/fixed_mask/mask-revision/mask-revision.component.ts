import {
  Component, Input, OnInit, OnDestroy, Directive, SimpleChanges, OnChanges, ViewEncapsulation
} from '@angular/core';
import { IShelter } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { ShelterService } from '../../../app/shelter/shelter.service'
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs';
import { BcAuthService } from '../../../app/shared/auth.service';
import { CUSTOM_PATTERN_VALIDATORS, createLengthValidator } from '../../inputs/input_base';

@Directive({
  selector: "[disabled]",
  host: {
    "[class.disabled]": "disable"
  }
})
export class BcDisableStyler {
  @Input('disabled') disable = false;
}

@Component({
  moduleId: module.id,
  selector: 'bc-mask-revision',
  templateUrl: 'mask-revision.component.html',
  styleUrls: ['mask-revision.component.scss'],
  providers: [ShelterService],
  host: {
    '[class.bc-mask]': 'true'
  },
  encapsulation: ViewEncapsulation.None
})
export class BcMaskRevision implements OnInit, OnDestroy, OnChanges {
  @Input() shelter: IShelter;
  maskForm: FormGroup;
  formValiditySub: Subscription;
  maskSaveTriggerSub: Subscription;
  displayErrorSub: Subscription;
  displayError = false;
  shelterInitialized: Boolean = false;
  revisionPermission: Enums.Auth_Permissions.User_Type;
  disableSave = false;
  saveDisabled = false;
  newShelter = false;
  isCentral: boolean;
  constructor(
    private router: Router,
    private _route: ActivatedRoute,
    private shelterService: ShelterService,
    private shared: BcSharedService,
    private fb: FormBuilder,
    private authService: BcAuthService) {

    this.maskForm = fb.group({
      name: ["", [Validators.required, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)]],
      alias: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
      idCai: ["", [Validators.required, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator), createLengthValidator(8, 10)]],
      type: ["", Validators.required],
      branch: ["", [Validators.required, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)]],
      owner: ["", [Validators.required, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)]],
      category: [""],
      regional_type: [""],
      status: [""]
    });

    this.maskSaveTriggerSub = this.shared.sendMaskSave$.subscribe(() => {
      this.save();
    });

    this.formValiditySub = this.maskForm.statusChanges.subscribe((value) => {
      if (value === "VALID") {
        shared.onMaskValid();
      } else if (value === "INVALID") {
        shared.onMaskInvalid();
      }
    });

    this.displayErrorSub = this.shared.displayError$.subscribe(() => {
      this.displayError = true;
    });

    this.saveDisabled = (this.shared.activeComponent === Enums.Routes.Routed_Component.contribution);
    this.shared.disableMaskSave$.subscribe((val) => {
      this.saveDisabled = val
    })
  }

  setMaskSaveDisabled(val) {
    this.saveDisabled = val;
  }

  toggleMenu() {
    this.shared.onToggleMenu();
  }

  checkWinPlatform() {
    return (navigator.userAgent.toLowerCase().indexOf("win") === -1);
  }

  remove() {
    if (this.isCentral) {
      const removeShelSub = this.shelterService.deleteShelter(this.shelter._id).subscribe((val) => {
        if (val) {
          this.return();
        } else {

          this.shared.onMaskInvalid();
        }
        if (removeShelSub) {
          removeShelSub.unsubscribe();
        }
      });
    }
  }

  private isCentralUser() {
    this.authService.hasDeletePermission().subscribe(val => {
      this.isCentral = val;
    });

  }

  processConfirm(shelter): Promise<String> {
    return new Promise<any>((resolve, reject) => {
      const maskConfirmSub = this.shared.maskConfirmSave$.subscribe(component => {
        if (maskConfirmSub) {
          maskConfirmSub.unsubscribe();
        }
        if (component) {
          const shelSub = this.shelterService.confirmShelter(shelter._id, true).subscribe(value => {
            if (shelSub) {
              shelSub.unsubscribe();
            }

            if (!value) {
              reject({ error: "Error in confirm" });
            } else {
              resolve(component);
            }
          });
        }
      });
      this.shared.onMaskSave(shelter);
    });
  }

  save() {
    if (this.revisionPermission && (this.revisionPermission != Enums.Auth_Permissions.User_Type.central || this.maskForm.valid)) {
      const shelter: IShelter = { _id: this.shelter._id };
      if (this.revisionPermission == Enums.Auth_Permissions.User_Type.central && this.maskForm.dirty) {

        for (const control in this.maskForm.controls) {
          if (this.maskForm.controls.hasOwnProperty(control)) {
            shelter[control] = this.maskForm.controls[control].value || null;
          }
        }

        const shelUpdateSub = this.shelterService.updateShelter(shelter, true).subscribe(value => {
          this.processConfirm(shelter)
            .then((component) => {
              if (shelUpdateSub) {
                shelUpdateSub.unsubscribe();
              }
              this.shared.onActiveOutletChange(Enums.Routes.Routed_Outlet.content);
              this.router.navigateByUrl("/shelter/" + shelter._id + "/(content:" + component + ")");
            })
            .catch((err) => {
              console.log(err);
            });
        });
      } else {
        this.processConfirm(shelter)
          .then((component) => {
            this.shared.onActiveOutletChange(Enums.Routes.Routed_Outlet.content);
            this.router.navigateByUrl("/shelter/" + this.shelter._id + "/(content:" + component + ")");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      this.displayError = true;
      this.shared.onMaskSave(null);
    }
  }

  return() {
    const cancelSub = this.shared.maskCancelConfirm$.subscribe(() => {
      const shelSub = this.shelterService.confirmShelter(this.shelter._id, false).subscribe(value => {
        if (!value) {
          console.log("Error in Cancel");
          if (shelSub) {
            shelSub.unsubscribe();
          }
          if (cancelSub) {
            cancelSub.unsubscribe();
          }
        } else {
          this.router.navigateByUrl("list");
          if (shelSub) {
            shelSub.unsubscribe();
          }
          if (cancelSub) {
            cancelSub.unsubscribe();
          }
        }

      });
    });
    this.shared.onMaskCancel();

  }

  initForm(permission) {
    this.revisionPermission = permission;
    if (this.shelter) {
      for (const control in this.maskForm.controls) {
        if (this.maskForm.controls.hasOwnProperty(control)) {
          this.maskForm.controls[control].setValue(this.shelter[control] || null);
        }
      }
    }

    this.authService.isCentralUser().subscribe(val => {
      if (!val) {
        this.maskForm.disable();
      }
    });

  }

  ngOnDestroy() {
    if (this.formValiditySub) {
      this.formValiditySub.unsubscribe();
    }
    if (this.displayErrorSub) {
      this.displayErrorSub.unsubscribe();
    }
    if (this.maskSaveTriggerSub) {
      this.maskSaveTriggerSub.unsubscribe();
    }
  }

  reviseCheck(permission?: Enums.Auth_Permissions.User_Type) {
    return this.authService.revisionCheck(permission || this.revisionPermission);
  }

  checkNewShelter(route): boolean {
    if (route.data && route.data.newShelter) {
      this.newShelter = true;
    } else {
      this.newShelter = false;
    }
    return true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.shelterInitialized && (this.newShelter || this.shelter)) {
      this.shelterInitialized = true;
      const authSub = this.authService.checkRevisionPermissionForShelter(this.shelter.idCai).subscribe(val => {
        if (val && this.reviseCheck(val)) {
          this.initForm(val);
        } else {
          this.return();
        }
        if (authSub) {
          authSub.unsubscribe();
        }
      });
    }
  }

  ngOnInit() {
    this.isCentralUser();
    if (this._route.snapshot.data && this._route.snapshot.data.newShelter) {
      this.newShelter = true;
    } else {
      this.newShelter = false;
    }

    if (!this.shelterInitialized && this.shelter) {
      this.shelterInitialized = true;

      const authSub = this.authService.checkRevisionPermissionForShelter(this.shelter.idCai).subscribe(val => {
        this.revisionPermission = val;
        if (!this.newShelter) {
          if (val && this.reviseCheck(val)) {
            this.initForm(val);
          } else {
            this.return();
          }
        }
        if (!val) {
          this.return();
        }
        if (authSub) {
          authSub.unsubscribe();
        }
      });
    }
  }

  cancel() {
    if (this.newShelter) {
      this.return();
    } else {
      const cancelSub = this.shared.maskCancelConfirm$.subscribe(() => {
        const shelSub = this.shelterService.confirmShelter(this.shelter._id, false).subscribe(value => {
          if (!value) {
            console.log("Error in Cancel");
            if (shelSub) {
              shelSub.unsubscribe();
            }
            if (cancelSub) {
              cancelSub.unsubscribe();
            }
          } else {
            if (this.newShelter) {
              this.router.navigateByUrl("list");
            } else {
              const component = this.shared.activeComponent;
              this.shared.onActiveOutletChange(Enums.Routes.Routed_Outlet.content);
              this.router.navigateByUrl("/shelter/" + this.shelter._id + "/(content:" + component + ")");
            }
            if (shelSub) {
              shelSub.unsubscribe();
            }
            if (cancelSub) {
              cancelSub.unsubscribe();
            }
          }

        });
      });
      this.shared.onMaskCancel();
    }
  }

}

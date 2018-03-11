import { ShelterService } from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shared/shared.service';
import { FormGroup, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { parseDate, validators } from '../../inputs/input_base';
import { Enums } from '../../../app/shared/types/enums';
import { OnInit } from '@angular/core';

const validObjectIDRegExp = validators.objectID;

export abstract class RevisionBase implements OnInit {
    protected _id: String;
    protected name: String;
    protected displayTagError = false;
    protected invalid = false;
    protected disableSave = false;
    protected maskSaveSub: Subscription;
    displayError = false;
    protected maskError = false;
    protected maskInvalidSub: Subscription;
    protected maskValidSub: Subscription;
    protected formValidSub: Subscription;
    protected userRole: Enums.Auth_Permissions.User_Type;
    protected permissionSub: Subscription;
    protected MENU_SECTION: Enums.MenuSection = Enums.MenuSection.detail;
    constructor(protected shelterService, protected shared, protected revisionService, private _route, private router, protected auth) {

        shared.onActiveOutletChange(Enums.Routes.Routed_Outlet.revision);

        this.maskInvalidSub = shared.maskInvalid$.subscribe(() => {
            this.maskError = true;
        });

        this.maskValidSub = shared.maskValid$.subscribe(() => {
            this.maskError = false;
            if (this.checkValidForm()) {
                this.displayError = false;
            }
        });

        const disableSaveSub = revisionService.childDisableSaveRequest$.subscribe(() => {
            this.disableSave = true;
            revisionService.onChildDisableSaveAnswer();
            if (disableSaveSub != undefined) {
                disableSaveSub.unsubscribe();
            }
        });

    }

    getRoute(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const sub = this._route.parent.params.subscribe(params => {
                this._id = params["id"];
                if (sub) {
                    sub.unsubscribe();
                }
                const id = params["id"];
                if (validObjectIDRegExp.test(id)) {
                    resolve(id);
                } else {
                    reject({ error: "Invalid ID" });
                }
            });
        });
    }

    getPermission(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const permissionSub = this.revisionService.fatherReturnPermissions$.subscribe(permissions => {
                resolve(permissions);
                if (permissionSub != undefined) {
                    permissionSub.unsubscribe();
                }
            });
            this.revisionService.onChildGetPermissions();
        });
    }

    ngOnInit() {
        let _id;
        const sub = this.getRoute()
            .then(id => {
                _id = id;
                return this.getUserPermission()
            })
            .then(() => this.getPermission())
            .then(permissions => {
                if (this.checkPermission(permissions)) {
                    this.init(_id);
                } else {
                    this.redirect('/list');
                }
            })
            .catch(err => {
                this.redirect('/pageNotFound');
            });
    }

    private getUserPermission(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const authSub = this.auth.checkUserPermission().subscribe(role => {
                this.userRole = role;
                if (authSub) {
                    authSub.unsubscribe();
                }
                resolve();
            });
        });
    }

    protected abstract init(shelID: String);

    redirect(url: any) {
        this.router.navigateByUrl(url);
    }

    protected getControlValue(control: FormGroup): any {
        if (control && control.valid) {
            return control.value || null;
        } else { return null; }
    }

    protected abortSave() {
        this.setDisplayError(true);
        this.shared.onMaskConfirmSave(null);
    }

    protected setDisplayError(value) {
        this.displayError = value;
    }

    protected processSavePromise(shelter, section): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.revisionService.onChildSave(shelter, section);
            const sub = this.shelterService.preventiveUpdateShelter(shelter, section).subscribe((returnVal) => {
                if (returnVal) {
                    resolve();
                } else {
                    reject(returnVal);
                }
                if (sub != undefined) {
                    sub.unsubscribe();
                }
            });
        });
    }

    protected processUrl(form: FormGroup) {
        const value = this.getControlValue(form);
        if (value != null && value != "") {
            let wSite = "http";
            if (value.toLowerCase().indexOf("://") == -1) {
                wSite += "://" + value;
            } else {
                wSite = value;
            }
            return wSite;
        } else {
            return null;
        }
    }

    protected processFormDate(form: FormGroup) {
        if (form && form.valid) {
            return parseDate(form.value) || null;
        } else { return null; }
    }

    protected processSimpleDate(value) {
        return parseDate(value);
    }

    protected getFormValues(form: FormGroup): any {
        const obj: any = {};
        for (const control in form.controls) {
            obj[control] = this.getControlValue(<FormGroup>form.controls[control]);
        }
        return obj;
    }

    protected getFormArrayValues(form_array: FormArray): any[] {
        const obj: any[] = [];
        for (const c of form_array.controls) {
            const p: any = {};
            const contr = <FormGroup>c;
            for (const prop in contr.controls) {
                p[prop] = this.getControlValue(<FormGroup>contr.controls[prop]);
            }
            obj.push(p);
        }
        return obj;
    }

    protected abstract checkValidForm();

    protected abstract save(confirm);

    protected checkPermission(permissions): boolean {
        if (permissions && permissions.length > 0) {
            if (permissions.find(obj => obj == this.MENU_SECTION) > -1) {
                return true;
            } else {
                return false;
            }
        }
    }

    protected toTitleCase(input: string): string {
        if (!input) {
            return '';
        } else {
            return input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1))).replace(/_/g, " ");
        }
    }
}

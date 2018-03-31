import {
    Component, Input, OnInit, OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IShelter, IUse } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums'
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ShelterService } from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { RevisionBase } from '../shared/revision_base';
import { BcAuthService } from '../../../app/shared/auth.service';

@Component({
    moduleId: module.id,
    selector: 'bc-fruition-revision',
    templateUrl: 'fruition.component.html',
    styleUrls: ['fruition.component.scss'],
    providers: [ShelterService]
})
export class BcFruitionRevision extends RevisionBase implements OnDestroy {
    useForm: FormGroup;
    constructor(shelterService: ShelterService,
        authService: BcAuthService,
        shared: BcSharedService,
        router: Router,
        revisionService: BcRevisionsService,
        private fb: FormBuilder,
        _route: ActivatedRoute) {
        super(shelterService, shared, revisionService, _route, router, authService);
        shared.activeComponent = Enums.Routes.Routed_Component.use;
        this.MENU_SECTION = Enums.MenuSection.economy;
        this.useForm = fb.group({
            stay_count_associate: [""],
            stay_count_reciprocity: [""],
            stay_count: [""],
            transit_count_associate: [""],
            transit_count_reciprocity: [""],
            transit_count: [""]
        });

        this.formValidSub = this.useForm.statusChanges.subscribe((value) => {
            if (value === "VALID") {
                if (!this.maskError) {
                    this.displayError = false;
                }
            }
        });

        this.maskSaveSub = shared.maskSave$.subscribe(() => {
            if (!this.maskError && this.useForm.valid) {
                if (this.useForm.dirty) {
                    this.disableSave = true;
                    this.save(true);
                } else {
                    this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.use);
                }
            } else {
                this.abortSave();
            }
        });
    }

    save(confirm) {
        if (!confirm || this.useForm.valid) {
            const shelter: IShelter = { _id: this._id, name: this.name };
            const use: IUse = <IUse>this.getFormValues(this.useForm);
            use.year = this.data.year;

            shelter.use = [use];
            this.processSavePromise(shelter, "use")
                .then(() => {
                    this.displayError = false;
                    if (confirm) {
                        this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.use);
                    }
                })
                .catch(err => {
                    this.abortSave();
                    console.log(err);
                });
        } else {
            this.abortSave();
        }
    }

    initForm(shelter: IShelter) {
        this.name = shelter.name;
        let use;
        if (shelter.use) {
            use = shelter.use.find(obj => obj.year === (new Date()).getFullYear());
            this.data = use;
        }
        if (!this.data) {
            this.data = { year: (new Date()).getFullYear() };
        }
        for (const control in use) {
            if (this.useForm.contains(control)) {
                this.useForm.controls[control].setValue(use[control] || null);
            }
        }
    }

    ngOnDestroy() {
        if (this.useForm.dirty) {
            if (!this.disableSave) {
                this.save(false);
            }

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

    init(shelId) {
        this.getData(shelId, "use")
            .then(shelter => {
                this.initForm(shelter);
            });
    }

    checkValidForm() {
        return true;
    }

    getEmptyObjData(section: any) {
        return {};
    }
}

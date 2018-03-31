import {
    Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IDrain, IEnergy, ICatastal, IShelter } from '../../../app/shared/types/interfaces'
import { Enums } from '../../../app/shared/types/enums'
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ShelterService } from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { BcAuthService } from '../../../app/shared/auth.service';
import { RevisionBase } from '../shared/revision_base';

function validateDate(c: FormControl) {
    if (c.value) {
        const date = Date.parse(c.value);
        if (!isNaN(date)) {
            return null;
        } else {
            return { valid: false };
        }
    }
    return null;
}

@Component({
    moduleId: module.id,
    selector: 'bc-catastal-revision',
    templateUrl: 'catastal.component.html',
    styleUrls: ['catastal.component.scss'],
    providers: [ShelterService]
})
export class BcCatastalRevisionComponent extends RevisionBase implements OnDestroy {
    catastalForm: FormGroup;
    energyForm: FormGroup;
    drainForm: FormGroup;
    private formCatValidSub: Subscription;
    private formEnergyValidSub: Subscription;
    private formDrainValidSub: Subscription;
    constructor(shared: BcSharedService,
        shelterService: ShelterService,
        authService: BcAuthService,
        router: Router,
        _route: ActivatedRoute,
        private fb: FormBuilder,
        revisionService: BcRevisionsService) {
        super(shelterService, shared, revisionService, _route, router, authService);
        this.catastalForm = fb.group({
            buildingRegulation: [""],
            buildYear: [""],
            rebuildYear: [""],
            class: [""],
            code: [""],
            typologicalCoherence: [""],
            matericalCoherence: [""],
            cityPlanRegulation: [""],
            mainBody: [""],
            secondaryBody: [""],
            fireRegulation: [""],
            ISO14001: [""]
        });

        this.energyForm = fb.group({
            class: [""],
            energy: [""],
            greenCertification: [""],
            powerGenerator: [""],
            photovoltaic: [""],
            heating_type: [""],
            sourceType: [""],
            sourceName: [""]
        });

        this.drainForm = fb.group({
            type: [""],
            regulation: [""],
            oilSeparator: [""],
            recycling: [""],
            water_type: [""],
            water_availability: [""],
            droughts: [""],
            water_certification: [""]
        });

        this.formCatValidSub = this.catastalForm.statusChanges.subscribe((value) => {
            if (value === "VALID") {
                if (this.drainForm.valid && this.energyForm.valid && !this.maskError) {
                    this.displayError = false;
                }
            }
        });

        this.formDrainValidSub = this.drainForm.statusChanges.subscribe((value) => {
            if (value === "VALID") {
                if (this.catastalForm.valid && this.energyForm.valid && !this.maskError) {
                    this.displayError = false;
                }
            }
        });

        this.formEnergyValidSub = this.energyForm.statusChanges.subscribe((value) => {
            if (value === "VALID") {
                if (this.drainForm.valid && this.catastalForm.valid && !this.maskError) {
                    this.displayError = false;
                }
            }
        });

        this.maskSaveSub = shared.maskSave$.subscribe(() => {
            if (!this.maskError && this.catastalForm.valid && this.energyForm.valid && this.drainForm.valid) {
                if (this.catastalForm.dirty || this.energyForm.dirty || this.drainForm.dirty) {
                    this.disableSave = true;
                    this.save(true);
                } else {
                    this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.catastal);
                }
            } else {
                this.abortSave();
            }
        });

        shared.activeComponent = Enums.Routes.Routed_Component.catastal;
    }

    checkValidForm() {
        return this.drainForm.valid && this.catastalForm.valid && this.energyForm.valid;
    }

    processSaveForm(form: FormGroup, section: string): Promise<any> {
        if (form.dirty) {
            const shelter: any = { _id: this._id, name: this.name };
            const obj: any = this.getFormValues(form);

            shelter[section] = obj;
            return this.processSavePromise(shelter, section);
        }
    }

    getBooleanNumeric(obj: boolean): number {
        return obj ? 1 : 0;
    }

    getTotalDirtyForms(): number {
        return 0 + this.getBooleanNumeric(this.catastalForm.dirty) +
            this.getBooleanNumeric(this.drainForm.dirty) +
            this.getBooleanNumeric(this.energyForm.dirty)
    }

    save(confirm) {
        if (!this.catastalForm.dirty && !this.drainForm.dirty && !this.energyForm.dirty) {
            this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.catastal);
        } else {
            if (!confirm || (this.catastalForm.valid && this.drainForm.valid && this.energyForm.valid)) {

                Promise.all([
                    this.processSaveForm(this.catastalForm, "catastal"),
                    this.processSaveForm(this.drainForm, "drain"),
                    this.processSaveForm(this.energyForm, "energy")
                ])
                    .then(() => {
                        if (confirm) {
                            this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.catastal);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        this.abortSave();
                    });

            } else {
                this.abortSave();
            }
        }
    }

    private initSingleForm(form: FormGroup, shelter, section) {
        this.data[section] = shelter[section];
        if (this.data[section]) {
            for (const prop in this.data[section]) {
                if (this.data[section].hasOwnProperty(prop)) {
                    if (form.contains(prop)) {
                        form.controls[prop].setValue(this.data[section][prop]);
                    }
                }
            }
        }
    }

    protected initForm(shelter: IShelter) {
        this.initSingleForm(this.catastalForm, shelter, "catastal");
        this.initSingleForm(this.drainForm, shelter, "drain");
        this.initSingleForm(this.energyForm, shelter, "energy");
    }

    ngOnDestroy() {
        if (this.catastalForm.dirty || this.energyForm.dirty || this.drainForm.dirty) {
            if (!this.disableSave) {
                this.save(false);
            }
        }
        if (this.permissionSub) {
            this.permissionSub.unsubscribe();
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
        Promise.all([
            this.getData(shelId, "catastal"),
            this.getData(shelId, "energy"),
            this.getData(shelId, "drain")
        ]).then(values => {
            const shelter = Object.assign({}, ...values);
            this.initForm(shelter);
        });
    }

    getEmptyObjData(section): any {
        return {};
    }

}

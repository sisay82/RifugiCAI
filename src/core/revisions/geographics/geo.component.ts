import {
    Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ITag, ILocation, IGeographic, IShelter } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ShelterService } from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shared/shared.service';
import { BcAuthService } from '../../../app/shared/auth.service';
import { Subscription } from 'rxjs/Subscription';
import { RevisionBase } from '../shared/revision_base';

@Component({
    moduleId: module.id,
    selector: 'bc-geo-revision',
    templateUrl: 'geo.component.html',
    styleUrls: ['geo.component.scss'],
    providers: [ShelterService]
})
export class BcGeoRevision extends RevisionBase {
    geoForm: FormGroup;
    private newTagForm: FormGroup;
    private data: IGeographic;
    private tagChange: boolean = false
    private hiddenTag: boolean = true;
    constructor(shelterService: ShelterService, authService: BcAuthService, shared: BcSharedService, _route: ActivatedRoute, router: Router, private fb: FormBuilder, revisionService: BcRevisionsService) {
        super(shelterService, shared, revisionService, _route, router, authService);
        this.geoForm = fb.group({
            region: [""],
            province: [""],
            municipality: [""],
            locality: [""],
            ownerRegion: [""],
            regional_commission: [""],
            authorityJurisdiction: [""],
            altitude: [""],//number
            latitude: [""],
            longitude: [""],
            massif: [""],
            valley: [""],
            ski_area: [""],
            protected_area: [""],
            site: [""],
            tags: fb.array([])
        });

        this.newTagForm = fb.group({
            newKey: ["Informazione"],
            newValue: ["Valore"]
        });

        this.formValidSub = this.geoForm.statusChanges.subscribe((value) => {
            if (value == "VALID") {
                if (!this.maskError) {
                    this.displayError = false;
                }
            }
        });

        this.maskSaveSub = shared.maskSave$.subscribe(() => {
            if (!this.maskError && this.geoForm.valid) {
                if (this.tagChange || this.geoForm.dirty) {
                    this.disableSave = true;
                    this.save(true);
                } else {
                    this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.geographic);
                }
            } else {
                this.abortSave();
            }
        });

        shared.activeComponent = Enums.Routes.Routed_Component.geographic;
    }

    checkValidForm() {
        return this.geoForm.valid;
    }

    isHiddenTag() {
        return this.hiddenTag;
    }

    toggleTag() {
        this.hiddenTag = !this.hiddenTag;
    }

    addTag(key: String, value: String) {
        const control = <FormArray>this.geoForm.controls['tags'];
        control.push(this.initTag(key, value));
    }

    removeTag(index) {
        this.tagChange = true;
        const control = <FormArray>this.geoForm.controls['tags'];
        control.removeAt(index);
    }

    addNewTag() {
        this.tagChange = true;
        if (this.newTagForm.controls['newKey'].valid && this.newTagForm.controls['newValue'].valid) {
            const control = <FormArray>this.geoForm.controls['tags'];
            for (let c of control.controls) {
                if (c.value.key.toLowerCase().indexOf(this.newTagForm.controls["newKey"].value.toLowerCase()) > -1) {
                    this.invalid = true;
                    return;
                }
            }
            this.invalid = false;
            control.push(this.initTag(this.newTagForm.controls["newKey"].value, this.newTagForm.controls["newValue"].value));
            this.resetTagForm();
        } else {
            this.invalid = true;
        }
    }

    resetTagForm() {
        this.newTagForm = this.fb.group({
            newKey: ["Informazione"],
            newValue: ["Valore"]
        });
        this.toggleTag();
    }

    initTag(key: String, value: String) {
        return this.fb.group({
            key: [key],
            value: [value]
        });
    }

    save(confirm) {
        if (!confirm || this.geoForm.valid) {
            const shelter: IShelter = { _id: this._id, name: this.name, geoData: { location: this.data.location } };
            const location: ILocation = <ILocation>this.getFormValues(this.geoForm);

            const a: any[] = this.getFormArrayValues(<FormArray>this.geoForm.controls.tags);
            const tags: ITag[] = a.filter(val => val.key && val.value);

            shelter.geoData.tags = tags as [ITag];
            shelter.geoData.location = location;
            this.processSavePromise(shelter, "geoData")
                .then(() => {
                    this.displayError = false;
                    if (confirm) {
                        this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.geographic);
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

    initForm(shelter) {
        this.name = shelter.name;
        this.data = shelter.geoData;

        if (this.data != undefined) {
            if (this.data.location != undefined) {
                for (let prop in this.data.location) {
                    if (this.data.location.hasOwnProperty(prop)) {
                        if (this.geoForm.contains(prop)) {
                            this.geoForm.controls[prop].setValue(this.data.location[prop]);
                            this.geoForm.controls[prop].markAsTouched();
                        }
                    }
                }
            }
            if (this.data.tags != undefined) {
                for (let tag of this.data.tags) {
                    this.addTag(tag.key, tag.value);
                }
            }
        }
    }

    ngOnDestroy() {
        if (this.tagChange || this.geoForm.dirty) {
            if (!this.disableSave) {
                this.save(false);
            }

        }
        if (this.maskSaveSub != undefined) {
            this.maskSaveSub.unsubscribe();
        }
        if (this.maskInvalidSub != undefined) {
            this.maskInvalidSub.unsubscribe();
        }
        if (this.maskValidSub != undefined) {
            this.maskValidSub.unsubscribe();
        }

    }

    getGeoData(id): Promise<IShelter> {
        return new Promise<IShelter>((resolve, reject) => {
            let revSub = this.revisionService.load$.subscribe(shelter => {
                if (shelter != null && shelter.geoData != undefined) {
                    if (revSub != undefined) {
                        revSub.unsubscribe();
                    }
                    resolve(shelter);
                } else {
                    let shelSub = this.shelterService.getShelterSection(id, "geoData").subscribe(shelter => {
                        if (shelter.geoData == undefined) shelter.geoData = { location: {}, tags: [] as [ITag] };
                        this.revisionService.onChildSave(shelter, "geoData");
                        if (shelSub != undefined) {
                            shelSub.unsubscribe();
                        }
                        if (revSub != undefined) {
                            revSub.unsubscribe();
                        }
                        resolve(shelter);
                    });
                }
            });
            this.revisionService.onChildLoadRequest("geoData");
        });
    }

    init(shelId) {
        this.getGeoData(shelId)
            .then((shelter) => {
                this.initForm(shelter);
            });
    }
}
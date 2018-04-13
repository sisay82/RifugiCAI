import {
    Component,
    Input,
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {
    ITag,
    ILocation,
    IGeographic,
    IShelter
} from '../../../app/shared/types/interfaces';
import {
    Enums
} from '../../../app/shared/types/enums';
import {
    FormGroup,
    FormBuilder,
    FormControl,
    FormArray,
    Validators
} from '@angular/forms';
import {
    ShelterService
} from '../../../app/shelter/shelter.service'
import {
    BcRevisionsService
} from '../revisions.service';
import {
    BcSharedService
} from '../../../app/shared/shared.service';
import {
    BcAuthService
} from '../../../app/shared/auth.service';
import {
    Subscription
} from 'rxjs/Subscription';
import {
    RevisionBase
} from '../shared/revision_base';
import { BcBaseInput, CUSTOM_PATTERN_VALIDATORS } from '../../inputs/input_base';

@Component({
    moduleId: module.id,
    selector: 'bc-geo-revision',
    templateUrl: 'geo.component.html',
    styleUrls: ['geo.component.scss'],
    providers: [ShelterService]
})
export class BcGeoRevisionComponent extends RevisionBase implements OnDestroy {
    geoForm: FormGroup;
    private newTagForm: FormGroup;
    private tagChange = false
    private hiddenTag = true;
    constructor(shelterService: ShelterService,
        authService: BcAuthService,
        shared: BcSharedService,
        _route: ActivatedRoute,
        router: Router,
        private fb: FormBuilder,
        revisionService: BcRevisionsService) {
        super(shelterService, shared, revisionService, _route, router, authService);
        this.geoForm = fb.group({
            region: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            province: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            municipality: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            locality: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            ownerRegion: [""],
            regional_commission: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            authorityJurisdiction: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            altitude: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            latitude: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            longitude: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            massif: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            valley: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            ski_area: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            protected_area: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            site: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            tags: fb.array([])
        });

        this.newTagForm = fb.group({
            newKey: ["Informazione", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            newValue: ["Valore", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)]
        });

        this.formValidSub = this.geoForm.statusChanges.subscribe((value) => {
            if (value === "VALID") {
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
        const control = <FormArray>this.geoForm.get('tags');
        control.push(this.initTag(key, value));
    }

    removeTag(index) {
        this.tagChange = true;
        const control = <FormArray>this.geoForm.get('tags');
        control.removeAt(index);
    }

    addNewTag() {
        this.tagChange = true;
        if (this.newTagForm.get('newKey').valid && this.newTagForm.get('newValue').valid) {
            const control = <FormArray>this.geoForm.get('tags');
            for (const c of control.controls) {
                if (c.value.key.toLowerCase().indexOf(this.newTagForm.get("newKey").value.toLowerCase()) > -1) {
                    this.invalid = true;
                    return;
                }
            }
            this.invalid = false;
            control.push(this.initTag(this.newTagForm.get("newKey").value, this.newTagForm.get("newValue").value));
            this.resetTagForm();
        } else {
            this.invalid = true;
        }
    }

    resetTagForm() {
        this.newTagForm = this.fb.group({
            newKey: ["Informazione", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            newValue: ["Valore", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)]
        });
        this.toggleTag();
    }

    initTag(key: String, value: String) {
        return this.fb.group({
            key: [key, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            value: [value, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)]
        });
    }

    save(confirm) {
        if (!confirm || this.geoForm.valid) {
            const shelter: IShelter = {
                _id: this._id,
                name: this.name,
                geoData: {
                    location: (this.data) ? this.data.location : null
                }
            };
            const location: ILocation = <ILocation>this.getFormValues(this.geoForm);

            const a: any[] = this.getFormArrayValues(<FormArray>this.geoForm.get('tags'));
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

    protected initForm(shelter: IShelter) {
        this.data = shelter.geoData;
        this.name = shelter.name;
        if (this.data) {
            if (this.data.location) {
                for (const prop in this.data.location) {
                    if (this.data.location.hasOwnProperty(prop)) {
                        if (this.geoForm.contains(prop)) {
                            this.geoForm.get(prop).setValue(this.data.location[prop]);
                            this.geoForm.get(prop).markAsTouched();
                        }
                    }
                }
            }
            if (this.data.tags) {
                for (const tag of this.data.tags) {
                    this.addTag(tag.key, tag.value);
                }
            }
        }
    }

    initGeoForm(shelter) {
        this.name = shelter.name;
        this.data = shelter.geoData;

        if (this.data) {
            if (this.data.location) {
                for (const prop in this.data.location) {
                    if (this.data.location.hasOwnProperty(prop)) {
                        if (this.geoForm.contains(prop)) {
                            this.geoForm.get(prop).setValue(this.data.location[prop]);
                            this.geoForm.get(prop).markAsTouched();
                        }
                    }
                }
            }
            if (this.data.tags) {
                for (const tag of this.data.tags) {
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

    getGeoData(id): Promise<IShelter> {
        return new Promise<IShelter>((resolve, reject) => {
            const revSub = this.revisionService.load$.subscribe(shelter => {
                if (shelter && shelter.geoData) {
                    if (revSub) {
                        revSub.unsubscribe();
                    }
                    resolve(shelter);
                } else {
                    const shelSub = this.shelterService.getShelterSection(id, "geoData").subscribe(shel => {
                        if (!shel.geoData) {
                            shel.geoData = {
                                location: {},
                                tags: [] as [ITag]
                            };
                        }
                        this.revisionService.onChildSave(shel, "geoData");
                        if (shelSub) {
                            shelSub.unsubscribe();
                        }
                        if (revSub) {
                            revSub.unsubscribe();
                        }
                        resolve(shel);
                    });
                }
            });
            this.revisionService.onChildLoadRequest("geoData");
        });
    }

    init(shelId) {
        this.getData(shelId, "geoData")
            .then((shelter) => {
                this.initForm(shelter);
            });
    }

    getEmptyObjData(section): any {
        return {
            location: {},
            tags: [] as [ITag]
        };
    }
}

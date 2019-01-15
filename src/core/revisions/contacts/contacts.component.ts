import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
    IOpening,
    IContacts,
    IShelter
} from "../../../app/shared/types/interfaces";
import { Enums } from "../../../app/shared/types/enums";
import {
    FormGroup,
    FormBuilder,
    FormControl,
    FormArray,
    Validators,
    ValidationErrors,
    AbstractControl
} from "@angular/forms";
import { ShelterService } from "../../../app/shelter/shelter.service";
import { BcRevisionsService } from "../revisions.service";
import { BcSharedService } from "../../../app/shared/shared.service";
import { Subscription } from "rxjs";
import { BcAuthService } from "../../../app/shared/auth.service";
import {
    trimYear,
    parseDate,
    CUSTOM_PATTERN_VALIDATORS,
    customDateValidator
} from "../../inputs/input_base";
import { RevisionBase } from "../shared/revision_base";

function uniqueTypeValidator(val: AbstractControl, openings?: AbstractControl[]): ValidationErrors {
    if(!openings) {
        openings = (<FormArray>(
            this.contactForm.controls.openingTime
        )).controls
    }
    const newOpening = this && this.newOpeningForm ? this.newOpeningForm.controls['newOpeningType'] : null;
        
    const count = openings.reduce((acc, v) => {
        return (<any>v).controls.type.value === val.value ? acc + 1 : acc;
    }, newOpening && newOpening.value === val.value ? 1 : 0);
    
    return count >= 2 ? { unique: false } : null;
}

@Component({
    moduleId: module.id,
    selector: "bc-contacts-revision",
    templateUrl: "contacts.component.html",
    styleUrls: ["contacts.component.scss"],
    providers: [ShelterService]
})
export class BcContactsRevision extends RevisionBase implements OnDestroy {
    contactForm: FormGroup;
    private newOpeningForm: FormGroup;
    private openingChange = false;
    private hiddenOpening = true;
    constructor(
        shared: BcSharedService,
        shelterService: ShelterService,
        authService: BcAuthService,
        router: Router,
        _route: ActivatedRoute,
        private fb: FormBuilder,
        revisionService: BcRevisionsService
    ) {
        super(
            shelterService,
            shared,
            revisionService,
            _route,
            router,
            authService
        );
        this.contactForm = fb.group({
            fixedPhone: [
                "",
                Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)
            ],
            mobilePhone: [
                "",
                Validators.pattern(CUSTOM_PATTERN_VALIDATORS.telephoneValidator)
            ],
            role: [""],
            emailAddress: [
                "",
                Validators.pattern(CUSTOM_PATTERN_VALIDATORS.mailValidator)
            ],
            prenotation_link: [
                "",
                Validators.pattern(CUSTOM_PATTERN_VALIDATORS.urlValidator)
            ],
            webAddress: [
                "",
                Validators.pattern(CUSTOM_PATTERN_VALIDATORS.urlValidator)
            ],
            openingTime: fb.array([])
        });

        this.newOpeningForm = fb.group({
            newOpeningStartDate: ["", customDateValidator],
            newOpeningEndDate: ["", customDateValidator],
            newOpeningType: [
                "",
                [
                    Validators.pattern(
                        CUSTOM_PATTERN_VALIDATORS.stringValidator
                    ),
                    uniqueTypeValidator.bind(this)
                ]
            ]
        });

        this.formValidSub = this.contactForm.statusChanges.subscribe(value => {
            if (value === "VALID") {
                if (!this.maskError) {
                    this.displayError = false;
                }
            }
        });

        this.maskSaveSub = shared.maskSave$.subscribe(() => {
            if (!this.maskError && this.contactForm.valid) {
                if (this.openingChange || this.contactForm.dirty) {
                    this.disableSave = true;
                    this.save(true);
                } else {
                    this.shared.onMaskConfirmSave(
                        Enums.Routes.Routed_Component.contacts
                    );
                }
            } else {
                this.abortSave();
            }
        });

        shared.activeComponent = Enums.Routes.Routed_Component.contacts;
    }

    getFormControls(controlName) {
        return (<FormGroup>this.contactForm.get(controlName)).controls;
    }

    checkValidForm() {
        return this.contactForm.valid;
    }

    toggleOpenings() {
        this.hiddenOpening = !this.hiddenOpening;
    }

    isHiddenOpenings() {
        return this.hiddenOpening;
    }

    removeOpening(index) {
        this.openingChange = true;
        const control = <FormArray>this.contactForm.get("openingTime");
        control.removeAt(index);
    }

    addNewOpening() {
        this.openingChange = true;
        const openingStartDate = this.newOpeningForm.get("newOpeningStartDate");
        const openingEndDate = this.newOpeningForm.get("newOpeningEndDate");
        const openingType = this.newOpeningForm.get("newOpeningType");

        if (
            openingStartDate.valid &&
            openingEndDate.valid &&
            openingType.valid &&
            uniqueTypeValidator(openingType,(<FormArray>(
                this.contactForm.controls.openingTime
            )).controls) === null
        ) {
            let startDate = null;
            let endDate = null;
            if (
                openingStartDate.value != null &&
                openingStartDate.value !== ""
            ) {
                startDate = parseDate(openingStartDate.value);
            }
            if (openingEndDate.value != null && openingEndDate.value !== "") {
                endDate = parseDate(openingEndDate.value);
            }
            this.invalid = false;
            const control = <FormArray>this.contactForm.get("openingTime");
            const opening: IOpening = {
                startDate: startDate,
                endDate: endDate,
                type: openingType.value
            };
            control.push(this.initOpening(opening));
            this.resetOpeningForm();
        } else {
            this.invalid = true;
        }
    }

    resetOpeningForm() {
        this.newOpeningForm = this.fb.group({
            newOpeningStartDate: ["", customDateValidator],
            newOpeningEndDate: ["", customDateValidator],
            newOpeningType: [
                "",
                Validators.compose([
                    Validators.pattern(
                        CUSTOM_PATTERN_VALIDATORS.stringValidator
                    ),
                    uniqueTypeValidator.bind(this)
                ])
            ]
        });
        this.toggleOpenings();
    }

    initOpening(opening: IOpening) {
        return this.fb.group({
            startDate: [trimYear(opening.startDate)],
            endDate: [trimYear(opening.endDate)],
            type: [
                opening.type,
                Validators.compose([
                    Validators.pattern(
                        CUSTOM_PATTERN_VALIDATORS.stringValidator
                    ),
                    uniqueTypeValidator.bind(this)
                ])
            ]
        });
    }

    save(confirm) {
        if (!confirm || this.contactForm.valid) {
            const shelter: any = {
                _id: this._id,
                name: this.name
            };

            const contacts: IContacts = this.getFormNotArrayValues(
                this.contactForm
            );
            const op = this.getFormArrayValues(<FormArray>(
                this.contactForm.get("openingTime")
            ));
            const openings = op.map(val => {
                if (val) {
                    if (val.startDate) {
                        val.startDate = this.processSimpleDate(val.startDate);
                    }
                    if (val.endDate) {
                        val.endDate = this.processSimpleDate(val.endDate);
                    }
                }
                return val;
            });

            shelter.openingTime = openings;
            shelter.contacts = contacts;
            this.processSavePromise(shelter, "openingTime")
                .then(() => this.processSavePromise(shelter, "contacts"))
                .then(() => {
                    this.displayError = false;
                    if (confirm) {
                        this.shared.onMaskConfirmSave(
                            Enums.Routes.Routed_Component.contacts
                        );
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
        this.data["contacts"] = shelter.contacts;
        this.data["openingTime"] = shelter.openingTime;
        if (this.data.contacts) {
            for (const prop in this.data.contacts) {
                if (
                    this.data.contacts.hasOwnProperty(prop) &&
                    this.data.contacts[prop]
                ) {
                    if (this.contactForm.contains(prop)) {
                        try {
                            this.contactForm
                                .get(prop)
                                .setValue(this.data.contacts[prop]);
                        } catch (e) {
                            console.log(prop);
                            console.error(e);
                        }
                    }
                }
            }
        }
        if (this.data.openingTime) {
            const control = <FormArray>this.contactForm.get("openingTime");
            for (const opening of this.data.openingTime) {
                control.push(this.initOpening(opening));
            }
        }
    }

    ngOnDestroy() {
        if (this.openingChange || this.contactForm.dirty) {
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
            this.getData(shelId, "contacts"),
            this.getData(shelId, "openingTime")
        ]).then(values => {
            const shelter = Object.assign({}, ...values);
            this.initForm(shelter);
        });
    }

    getEmptyObjData(section) {
        if (section === "openingTime") {
            return [];
        } else {
            return {};
        }
    }
}

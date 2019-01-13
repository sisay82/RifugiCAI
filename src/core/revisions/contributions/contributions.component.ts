import {
    Component, Input, OnInit, OnDestroy, Directive
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IShelter, IContribution, IFile, IContributionData, IFileRef } from '../../../app/shared/types/interfaces';
import { Enums } from '../../../app/shared/types/enums';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { ShelterService } from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs';
import { RevisionBase } from '../shared/revision_base';
import { BcAuthService } from '../../../app/shared/auth.service';
import { CUSTOM_PATTERN_VALIDATORS, createValueValidator } from '../../inputs/input_base';

@Directive({
    selector: "[data-bc-button],[bc-button]",
    host: {
        "[class.disabled]": "disable"
    }
})
export class BcDisableDataStyler {
    @Input("disabled") disable = false;
}

@Component({
    moduleId: module.id,
    selector: 'bc-contributions-revision',
    templateUrl: 'contributions.component.html',
    styleUrls: ['contributions.component.scss'],
    providers: [ShelterService]
})
export class BcContributionRevision extends RevisionBase implements OnDestroy {
    docs: IFile[] = <any>[];
    newAttachmentForm: FormGroup;
    contrForm: FormGroup;
    private accepted: boolean;
    filesEnum: String[] = [];
    maskSaveSub: Subscription;
    loading = false;
    name: String;
    statusChange = false;
    constructor(shelterService: ShelterService,
        _route: ActivatedRoute,
        router: Router,
        authService: BcAuthService,
        private fb: FormBuilder,
        shared: BcSharedService,
        revisionService: BcRevisionsService) {
        super(shelterService, shared, revisionService, _route, router, authService);
        this.MENU_SECTION = Enums.MenuSection.economy;
        this.contrForm = fb.group({
            handWorks: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            customizedWorks: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            safetyCharges: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            totWorks: [""],
            surveyorsCharges: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            connectionsCharges: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            technicalCharges: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            testCharges: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            taxes: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            totCharges: [""],
            IVAincluded: [""],
            totalProjectCost: [""],
            externalFinancing: ["", [Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator), createValueValidator(0, null, 0)]],
            selfFinancing: ["", [Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator), createValueValidator(0, null, 0)]],
            red: [""],
            attachments: fb.array([]),
            type: ["", Validators.required],
            value: [""]
        });

        this.newAttachmentForm = fb.group({
            newValue: [""],
        });

        this.formValidSub = this.contrForm.statusChanges.subscribe((value) => {
            if (value === "VALID") {
                if (!this.maskError) {
                    this.displayError = false;
                }
            }
        });

        this.maskSaveSub = shared.maskSave$.subscribe(() => {
            if (!this.maskError && this.contrForm.valid) {
                if (this.statusChange || this.contrForm.dirty) {
                    this.disableSave = true;
                    this.save(true);
                } else {
                    shared.onMaskConfirmSave(Enums.Routes.Routed_Component.contribution);
                }
            } else {
                this.abortSave();
            }
        });

        shared.activeComponent = Enums.Routes.Routed_Component.contribution;
        shared.onSetDisableMaskSave(true);
    }

    getFormControls(controlName) {
        return (<FormGroup>this.contrForm.controls[controlName]).controls;
    }

    getEnumValues() {
        return Enums.Contributions;
    }

    initAttachment(value: String, id: String) {
        return this.fb.group({
            value: [value],
            id: [id]
        });
    }

    addAttachment(value, id) {
        const control = <FormArray>this.contrForm.get('attachments');
        control.push(this.initAttachment(value, id));
    }

    removeAttachment(index) {
        this.statusChange = true;
        const control = <FormArray>this.contrForm.get('attachments');
        control.removeAt(index);
    }

    addNewAttachment() {
        this.statusChange = true;
        const control = <FormArray>this.contrForm.get('attachments');
        let name: String = this.newAttachmentForm.get("newValue").value;
        let id;
        if (name) {
            if (name.indexOf(":") > -1) {
                id = name.split(":")[1];
                name = name.split(":")[0];
            } else {
                id = this.docs.find(obj => obj.name === name)._id;
            }
            if (!control.controls.find(obj => obj.value.id == id)) {
                this.filesEnum.splice(this.filesEnum.indexOf(this.newAttachmentForm.get("newValue").value), 1)
                control.push(this.initAttachment(name, id));
                this.resetAttachmentForm();
            }
        }
    }

    resetAttachmentForm() {
        this.newAttachmentForm.reset();
    }

    accept(confirm) {
        if (this.contrForm.valid) {
            this.loading = true;
            this.accepted = confirm;
            this.statusChange = true;
            this.shared.onSendMaskSave();
        } else {
            this.displayError = true;
        }
    }

    getNumber(val): number {
        const n: number = <number>(Number(val));
        if (isNaN(n)) {
            return 0;
        } else {
            return n;
        }
    }

    getTotalWorks(): number {
        return (this.getNumber(this.contrForm.get('handWorks').value) +
            this.getNumber(this.contrForm.get('customizedWorks').value) +
            this.getNumber(this.contrForm.get('safetyCharges').value));
    }

    getTotalCharges(): number {
        return (this.getNumber(this.contrForm.get('surveyorsCharges').value) +
            this.getNumber(this.contrForm.get('connectionsCharges').value) +
            this.getNumber(this.contrForm.get('technicalCharges').value) +
            this.getNumber(this.contrForm.get('testCharges').value) +
            this.getNumber(this.contrForm.get('taxes').value));
    }

    getTotalCost(): number {
        return this.getTotalCharges() + this.getTotalWorks();
    }

    getRedValue(): number {
        return this.getTotalCost() - (
            this.getNumber(this.contrForm.get('externalFinancing').value) +
            this.getNumber(this.contrForm.get('selfFinancing').value)
        )
    }

    roundValue(value: number): number {
        return (Math.floor(value / 100) * 100);
    }

    checkRole() {
        return this.userRole == Enums.Auth_Permissions.User_Type.sectional || this.userRole == Enums.Auth_Permissions.User_Type.superUser;
    }

    initForm(shelter: IShelter) {
        let contribution = shelter.contributions ?
            shelter.contributions.filter(c => !c.accepted).reduce((acc, val) => {
                if (val.year > acc.year) {
                    acc = val;
                }
                return acc;
            }, { year: 0 })
            : null;

        this.data["contributions"] = shelter.contributions;
        let attachments: IFileRef[];

        if (contribution) {
            if (contribution.accepted) {
                contribution = null;
            } else {
                attachments = contribution.attachments;
                delete (contribution["attachments"]);
            }
        }

        if (this.checkRole()) {
            if (this.checkPermission && contribution && !contribution.accepted) {
                for (const control in contribution.data) {
                    if (this.contrForm.contains(control)) {
                        this.contrForm.get(control).setValue(contribution.data[control] || null);
                    }
                }
                for (const control in contribution) {
                    if (this.contrForm.contains(control)) {
                        this.contrForm.get(control).setValue(contribution[control] || null);
                    }
                }
                this.contrForm.get('totWorks').setValue(this.getTotalWorks());
                this.contrForm.get('totCharges').setValue(this.getTotalCharges());
                this.contrForm.get('totalProjectCost').setValue(this.getTotalCost());
                this.contrForm.get('red').setValue(this.getRedValue());
                this.contrForm.get('value').setValue(this.roundValue(this.getRedValue()));
                if (attachments) {
                    for (const att of attachments) {
                        (<FormArray>this.contrForm.get('attachments')).controls.push(this.initAttachment(att.name, att.id))
                    }
                }
            }
        } else {
            this.contrForm.disable();
            this.newAttachmentForm.disable();
        }

    }

    save(confirm) {
        if (!confirm || this.contrForm.valid) {
            const shelter: IShelter = { _id: this._id, contributions: this.data.contributions };
            const contr: IContribution = {
                year: (new Date()).getFullYear(),
                value: this.roundValue(this.getRedValue()),
                type: this.contrForm.value.type,
                accepted: this.accepted || false,
                data: this.getFormValues(this.contrForm),
                attachments: <[IFileRef]>this.getFormArrayValues(<FormArray>this.contrForm.get('attachments'))
                    .map(item => {
                        if (item) { return { name: item.value, id: item.id } }
                    })
            };

            contr.data.totWorks = this.getTotalWorks();
            contr.data.totCharges = this.getTotalCharges();
            contr.data.totalProjectCost = this.getTotalCost();
            contr.data.red = this.getRedValue();
            contr.value = this.roundValue(this.getRedValue());

            if (!shelter.contributions) {
                shelter.contributions = [contr];
            } else {
                const contribIndex = shelter.contributions ? shelter.contributions.findIndex(c => !c.accepted && c.year === contr.year) : -1;
                console.log(contribIndex);
                if (contribIndex >= 0) {
                    shelter.contributions.splice(contribIndex, 1);
                }
                shelter.contributions.push(contr);
            }

            console.log(shelter.contributions)

            this.processSavePromise(shelter, "contributions")
                .then(() => {
                    this.displayError = false;
                    if (confirm) {
                        this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.contribution);
                    }
                })
                .catch(err => {
                    console.log(err);
                    this.abortSave();
                });

        } else {
            this.loading = false;
            this.abortSave();
        }
    }

    checkValidForm() {
        return this.contrForm.valid;
    }

    ngOnDestroy() {
        this.shared.onSetDisableMaskSave(false);
        if (this.statusChange || this.contrForm.dirty) {
            if (!this.disableSave) {
                this.save(false);
            }
        }
        if (this.maskInvalidSub) {
            this.maskInvalidSub.unsubscribe();
        }
        if (this.maskSaveSub) {
            this.maskSaveSub.unsubscribe();
        }
        if (this.formValidSub) {
            this.formValidSub.unsubscribe();
        }
        if (this.maskValidSub) {
            this.maskValidSub.unsubscribe();
        }
    }

    initDocs(docs) {
        this.docs = docs;
        docs.forEach(doc => {
            if (docs.filter(obj => obj.name == doc.name).length > 1) {
                if (doc.name.indexOf(":") === -1) {
                    this.filesEnum.push(doc.name + ":" + doc._id);
                }
            } else {
                this.filesEnum.push(doc.name);
            }
        });
    }

    init(shelId) {
        Promise.all([
            this.getData(shelId, "contributions"),
            this.getDocs(shelId, [
                Enums.Files.File_Type.invoice,
                Enums.Files.File_Type.doc,
                Enums.Files.File_Type.map
            ]).then((docs) => {
                this.initDocs(docs);
                return Promise.resolve();
            })
        ])
            .then(values => {
                this.initForm(values[0]);
            });
    }

    getEmptyObjData(section: any) {
        return {};
    }
}

import { Component, Input, OnDestroy, Directive } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
    IShelter,
    IFile,
    IEconomy
} from "../../../app/shared/types/interfaces";
import { Enums } from "../../../app/shared/types/enums";
import {
    FormGroup,
    FormBuilder,
    FormControl,
    FormArray,
    Validators
} from "@angular/forms";
import { ShelterService } from "../../../app/shelter/shelter.service";
import { BcRevisionsService } from "../revisions.service";
import { BcSharedService } from "../../../app/shared/shared.service";
import { Subscription } from "rxjs";
import { BcAuthService } from "../../../app/shared/auth.service";
import { RevisionBase } from "../shared/revision_base";
import {
    CUSTOM_PATTERN_VALIDATORS,
    createFileNameValidator,
    FILE_SIZE_LIMIT,
    createfileSizeValidator
} from "../../inputs/input_base";
import { Buffer } from "buffer";

@Directive({
    selector: "div[disabled]",
    host: {
        "[class.disabled]": "disabled"
    }
})
export class BcDisableDivStyler {
    @Input("disabled") disabled = false;
}

@Component({
    moduleId: module.id,
    selector: "bc-doc-revision",
    templateUrl: "document.component.html",
    styleUrls: ["document.component.scss"],
    providers: [ShelterService]
})
export class BcDocRevision extends RevisionBase implements OnDestroy {
    private newDocForm: FormGroup;
    private newMapForm: FormGroup;
    private newInvoiceForm: FormGroup;
    invoicesForm: FormGroup;
    private invalidYearsInvoice = ".+";
    private initialData: IFile[] = [];
    private invoiceFormatBase =
        ".+(\\,|\\/|\\-|\\\\|\\.|\\||_).+(\\,|\\/|\\-|\\\\|\\.|\\||_).+(\\,|\\/|-|\\\\|\\.|\\||_)";
    invoiceFormatRegExp = /.+(\,|\/|\-|\\|\.|\||_).+(\,|\/|\-|\\|\.|\||_).+(\,|\/|\-|\\|\.|\||_).+/; //tipo, fornitore, numero, data
    docs: IFile[] = [];
    maps: IFile[] = [];
    private filesChange = false;
    private docFormValidSub: Subscription;
    private mapFormValidSub: Subscription;
    private invoicesFormValidSub: Subscription;
    private invoiceFormValidSub: Subscription;
    private invoiceTypeChangesSub: Subscription[];
    private invalidYears: Number[] = [];
    hiddenTag = true;
    uploading = false;
    disableSave = false;
    private currentFileToggle = -1;
    disableInvoiceGlobal = true;
    constructor(
        shelterService: ShelterService,
        authService: BcAuthService,
        shared: BcSharedService,
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
        this.MENU_SECTION = Enums.MenuSection.document;
        this.newDocForm = fb.group({
            file: ["", createfileSizeValidator(0, FILE_SIZE_LIMIT)]
        });

        this.newMapForm = fb.group({
            file: ["", createfileSizeValidator(0, FILE_SIZE_LIMIT)]
        });

        this.newInvoiceForm = fb.group({
            file: [
                "",
                [
                    createFileNameValidator(this.invoiceFormatRegExp),
                    createfileSizeValidator(0, FILE_SIZE_LIMIT)
                ]
            ]
        });

        this.invoicesForm = fb.group({
            files: fb.array([])
        });

        this.docFormValidSub = this.newDocForm.statusChanges.subscribe(
            value => {
                if (value === "VALID") {
                    if (
                        !this.maskError &&
                        this.newInvoiceForm.invalid &&
                        this.newMapForm.invalid &&
                        this.invoicesForm.invalid
                    ) {
                        this.displayError = false;
                    }
                }
            }
        );

        this.invoiceFormValidSub = this.newInvoiceForm.statusChanges.subscribe(
            value => {
                if (value === "VALID") {
                    if (
                        !this.maskError &&
                        this.newDocForm.invalid &&
                        this.newMapForm.invalid &&
                        this.invoicesForm.invalid
                    ) {
                        this.displayError = false;
                    }
                }
            }
        );

        this.invoicesFormValidSub = this.invoicesForm.statusChanges.subscribe(
            value => {
                if (value === "VALID") {
                    if (
                        !this.maskError &&
                        this.newInvoiceForm.invalid &&
                        this.newMapForm.invalid &&
                        this.newDocForm.invalid
                    ) {
                        this.displayError = false;
                    }
                }
            }
        );

        this.mapFormValidSub = this.newMapForm.statusChanges.subscribe(
            value => {
                if (value === "VALID") {
                    if (
                        !this.maskError &&
                        this.newInvoiceForm.invalid &&
                        this.newDocForm.invalid &&
                        this.invoicesForm.invalid
                    ) {
                        this.displayError = false;
                    }
                }
            }
        );

        this.maskSaveSub = shared.maskSave$.subscribe(() => {
            if (!this.maskError) {
                this.disableSave = true;
                if (
                    this.newDocForm.dirty ||
                    this.newInvoiceForm.dirty ||
                    this.newMapForm.dirty ||
                    this.invoicesForm.dirty ||
                    this.filesChange
                ) {
                    this.save(true);
                } else {
                    this.shared.onMaskConfirmSave(
                        Enums.Routes.Routed_Component.documents
                    );
                }
            } else {
                this.abortSave();
            }
        });

        shared.activeComponent = Enums.Routes.Routed_Component.documents;
    }

    getInvoicesFormControls(controlName: string, index?) {
        const control = <FormArray>this.invoicesForm.get(controlName);
        if (index != null) {
            return control.at(index);
        } else {
            return control.controls;
        }
    }

    checkValidForm() {
        return (
            this.newDocForm.valid &&
            this.newInvoiceForm.valid &&
            this.newMapForm.valid &&
            this.invoicesForm.valid
        );
    }

    getTotal(value, tax) {
        if (tax > 1) {
            return value * (tax / 100) + value;
        } else {
            return value * tax + value;
        }
    }

    getKeys(enumName) {
        return Object.keys(Enums.Files[enumName]);
    }

    isHiddenFile(value) {
        return this.currentFileToggle != value;
    }

    toggleFile(value: number) {
        if (this.currentFileToggle === value) {
            this.currentFileToggle = -1;
        } else {
            this.currentFileToggle = value;
        }
    }

    checkDocName(name) {
        return !(
            name &&
            this.docs.concat(this.maps).find(obj => obj && obj.name == name) &&
            !(<FormArray>this.invoicesForm.get("files")).controls.find(
                contr => contr.value && contr.value.name == name
            )
        );
    }

    toBuffer(ab) {
        const buf = new Buffer(ab.byteLength);
        const view = new Uint8Array(ab);
        for (let i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }

    removeDoc(id) {
        this.commitToFather({ _id: id, type: Enums.Files.File_Type.doc }, true);
        const removeFileSub = this.shelterService
            .removeFile(id, this._id)
            .subscribe(value => {
                if (value) {
                    this.docs.splice(
                        this.docs.findIndex(file => file._id == id),
                        1
                    );
                }
                if (removeFileSub) {
                    removeFileSub.unsubscribe();
                }
            });
    }

    isUploading() {
        return this.uploading;
    }

    removeMap(id) {
        this.commitToFather({ _id: id, type: Enums.Files.File_Type.map }, true);
        const removeFileSub = this.shelterService
            .removeFile(id, this._id)
            .subscribe(value => {
                if (value) {
                    this.maps.splice(
                        this.maps.findIndex(file => file._id == id),
                        1
                    );
                }
                if (removeFileSub) {
                    removeFileSub.unsubscribe();
                }
            });
    }

    removeInvoice(index, id) {
        if (!(<FormArray>this.invoicesForm.get("files")).at(index).disabled) {
            this.commitToFather(
                { _id: id, type: Enums.Files.File_Type.invoice },
                true
            );
            const removeFileSub = this.shelterService
                .removeFile(id, this._id)
                .subscribe(value => {
                    if (value) {
                        (<FormArray>this.invoicesForm.get("files")).removeAt(
                            index
                        );
                    }
                    if (removeFileSub) {
                        removeFileSub.unsubscribe();
                    }
                });
        }
    }

    cleanForms() {
        this.newDocForm.reset();
        this.newMapForm.reset();
        this.newInvoiceForm.reset();
        this.currentFileToggle = -1;
    }

    initInvoice(file: IFile) {
        const invoice = this.fb.group({
            _id: [file._id],
            contentType: [file.contentType],
            type: [file.type],
            description: [file.description],
            name: [file.name],
            size: [file.size],
            invoice_type: [
                file.invoice_type || "",
                [
                    Validators.required,
                    Validators.pattern(
                        CUSTOM_PATTERN_VALIDATORS.stringValidator
                    )
                ]
            ],
            invoice_tax: [
                file.invoice_tax || "",
                [
                    Validators.required,
                    Validators.pattern(
                        CUSTOM_PATTERN_VALIDATORS.stringValidator
                    )
                ]
            ],
            invoice_year: [file.invoice_year || "", Validators.required],
            contribution_type: [
                file.contribution_type || "",
                Validators.required
            ],
            value: [
                file.value || "",
                [
                    Validators.required,
                    Validators.pattern(
                        CUSTOM_PATTERN_VALIDATORS.stringValidator
                    )
                ]
            ]
        });

        invoice.get("invoice_type").valueChanges.subscribe((val: any) => {
            if (val === "Attività") {
                invoice
                    .get("contribution_type")
                    .setValidators([
                        Validators.required,
                        Validators.pattern(
                            CUSTOM_PATTERN_VALIDATORS.stringValidator
                        )
                    ]);
                if (!invoice.disabled) {
                    invoice.get("contribution_type").enable();
                }
            } else {
                invoice.get("contribution_type").setValidators(null);
                invoice.get("contribution_type").setValue(null);
                invoice.get("contribution_type").disable();
            }
        });

        if (invoice.get("invoice_type").value !== "Attività") {
            invoice.get("contribution_type").setValidators(null);
            invoice.get("contribution_type").disable();
        }

        return invoice;
    }

    updateInvalidYearsInvoice(confirmedEconomies?: IEconomy[]) {
        this.invalidYears = [];
        this.disableInvoiceGlobal = true;
        if (confirmedEconomies && confirmedEconomies.length > 0) {
            this.invalidYearsInvoice = "(?!.*(";
            confirmedEconomies.forEach(economy => {
                this.invalidYears.push(economy.year);
                this.invalidYearsInvoice += economy.year.toString() + "|";
            });
            this.invalidYearsInvoice = this.invalidYearsInvoice.slice(
                0,
                this.invalidYearsInvoice.length - 1
            );
            this.invalidYearsInvoice += ")).+";
        } else {
            this.invalidYearsInvoice = ".+";
        }
        this.invoiceFormatRegExp = new RegExp(
            this.invoiceFormatBase + this.invalidYearsInvoice
        );
        this.disableInvoiceGlobal = false;
    }

    initForm(shelter) {}

    initFile(file, type) {
        if (type === Enums.Files.File_Type.invoice) {
            (<FormArray>this.invoicesForm.get("files")).push(
                this.initInvoice(file)
            );
        } else if (type === Enums.Files.File_Type.doc) {
            this.docs.push(file);
        } else if (type === Enums.Files.File_Type.map) {
            this.maps.push(file);
        } else {
            return;
        }
    }

    addDoc() {
        this.addFile(this.newDocForm, Enums.Files.File_Type.doc);
    }

    addMap() {
        this.addFile(this.newMapForm, Enums.Files.File_Type.map);
    }

    addFile(form: FormGroup, type: Enums.Files.File_Type) {
        const f = <File>(<FormGroup>form.get("file")).value;
        if (f && form.valid && this.checkDocName(f.name)) {
            this.uploading = true;
            this.displayError = false;
            const fi = <File>(<FormGroup>form.get("file")).value;
            const file: IFile = {
                name: f.name,
                size: f.size,
                uploadDate: new Date(Date.now()),
                contentType: f.type,
                shelterId: this._id,
                type: type
            };
            const fileReader = new FileReader();
            fileReader.onloadend = (e: any) => {
                file.data = this.toBuffer(fileReader.result);
                const shelServiceSub = this.shelterService
                    .insertFile(file)
                    .subscribe(id => {
                        if (id) {
                            const f = file;
                            f._id = id;
                            this.filesChange = true;
                            this.initFile(f, type);
                            this.commitToFather(f);
                        }
                        this.uploading = false;
                        if (shelServiceSub) {
                            shelServiceSub.unsubscribe();
                        }
                        this.cleanForms();
                    });
            };
            fileReader.readAsArrayBuffer(f);
        } else {
            this.displayError = true;
        }
    }

    addInvoice() {
        this.addFile(this.newInvoiceForm, Enums.Files.File_Type.invoice);
    }

    commitToFather(file: IFile, remove?: Boolean) {
        const f: IFile = file;
        delete f.data;
        this.revisionService.onChildSaveFile(f, remove);
    }

    getEnumValues(): String[] {
        const currentYear = new Date().getFullYear();
        return [currentYear, currentYear - 1]
            .filter(val => {
                return this.invalidYears.indexOf(val) === -1;
            })
            .map(String);
    }

    save(confirm) {
        if (
            this.filesChange ||
            (this.invoicesForm.valid && this.invoicesForm.dirty)
        ) {
            this.displayError = false;
            let i = 0;
            if (this.invoicesForm.dirty) {
                const filesToUpdate = (<FormArray>(
                    this.invoicesForm.get("files")
                )).controls.filter(obj => obj.dirty);
                if (filesToUpdate.length > 0) {
                    for (const file of filesToUpdate) {
                        if (
                            file.dirty &&
                            this.invalidYears.indexOf(file.value.year) === -1
                        ) {
                            const updFile: IFile = {
                                _id: file.value._id,
                                name: file.value.name,
                                size: file.value.size,
                                type: file.value.type,
                                value: Number(
                                    this.getControlValue(<FormGroup>(
                                        (<FormGroup>file).get("value")
                                    ))
                                ),
                                contentType: file.value.contentType,
                                description: this.getControlValue(<FormGroup>(
                                    (<FormGroup>file).get("description")
                                )),
                                shelterId: this._id,
                                invoice_tax: Number(
                                    this.getControlValue(<FormGroup>(
                                        (<FormGroup>file).get("invoice_tax")
                                    ))
                                ),
                                invoice_type: file.value.invoice_type,
                                invoice_year: Number(file.value.invoice_year),
                                contribution_type: file.value.contribution_type
                            };
                            if (<any>updFile.invoice_type !== "Attività") {
                                updFile.contribution_type = null;
                            }
                            const updateSub = this.shelterService
                                .updateFile(updFile)
                                .subscribe(val => {
                                    if (val) {
                                        i++;
                                        if (
                                            filesToUpdate.length === i &&
                                            confirm
                                        ) {
                                            this.shared.onMaskConfirmSave(
                                                Enums.Routes.Routed_Component
                                                    .documents
                                            );
                                        }
                                    }
                                    if (updateSub) {
                                        updateSub.unsubscribe();
                                    }
                                });
                            this.commitToFather(updFile);
                        }
                    }
                } else {
                    if (confirm) {
                        this.shared.onMaskConfirmSave(
                            Enums.Routes.Routed_Component.documents
                        );
                    }
                }
            } else {
                this.displayError = false;
                if (confirm) {
                    this.shared.onMaskConfirmSave(
                        Enums.Routes.Routed_Component.documents
                    );
                }
            }
        } else {
            this.abortSave();
        }
    }

    downloadFile(id) {
        if (id && this.initialData.findIndex(obj => obj._id == id) > -1) {
            this.shelterService.downloadFile(id);
        }
    }

    ngOnDestroy() {
        if (this.invoiceTypeChangesSub) {
            this.invoiceTypeChangesSub.forEach(sub => sub.unsubscribe());
        }
        if (!this.disableSave) {
            this.save(false);
        }
        if (this.maskSaveSub) {
            this.maskSaveSub.unsubscribe();
        }
        if (this.permissionSub) {
            this.permissionSub.unsubscribe();
        }
        if (this.docFormValidSub) {
            this.docFormValidSub.unsubscribe();
        }
        if (this.mapFormValidSub) {
            this.mapFormValidSub.unsubscribe();
        }
        if (this.invoiceFormValidSub) {
            this.invoiceFormValidSub.unsubscribe();
        }
        if (this.maskInvalidSub) {
            this.maskInvalidSub.unsubscribe();
        }
        if (this.maskValidSub) {
            this.maskValidSub.unsubscribe();
        }
        if (this.docFormValidSub) {
            this.docFormValidSub.unsubscribe();
        }
        if (this.mapFormValidSub) {
            this.mapFormValidSub.unsubscribe();
        }
        if (this.invoiceFormValidSub) {
            this.invoiceFormValidSub.unsubscribe();
        }
    }

    initData(files: any[]) {
        this.initialData = files;
        for (const file of files) {
            if (file.type != null) {
                if (file.type === Enums.Files.File_Type.doc) {
                    this.docs.push(file);
                } else if (file.type === Enums.Files.File_Type.map) {
                    this.maps.push(file);
                } else if (file.type === Enums.Files.File_Type.invoice) {
                    const control = this.initInvoice(file);
                    if (file.invoice_confirmed) {
                        control.disable();
                    }
                    (<FormArray>this.invoicesForm.get("files")).push(control);
                }
            }
        }
    }

    init(shelId) {
        Promise.all([
            this.getData(shelId, "economy"),
            this.getDocs(shelId, [
                Enums.Files.File_Type.doc,
                Enums.Files.File_Type.map,
                Enums.Files.File_Type.invoice
            ])
        ]).then(values => {
            this.initData(values[1]);
            if (values[0].economy) {
                this.updateInvalidYearsInvoice(
                    values[0].economy.filter(obj => obj.confirm)
                );
            }
        });
    }

    getEmptyObjData(section: any) {
        return {};
    }
}

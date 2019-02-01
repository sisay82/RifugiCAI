import {
  Component, Input, OnInit, OnDestroy, Pipe, PipeTransform
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IShelter, IFile } from '../../../app/shared/types/interfaces';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { ShelterService } from '../../../app/shelter/shelter.service';
import { Enums } from '../../../app/shared/types/enums';
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs';
import { BcAuthService } from '../../../app/shared/auth.service';
import { RevisionBase } from '../shared/revision_base';
import { CUSTOM_PATTERN_VALIDATORS } from '../../inputs/input_base';
import { Buffer } from 'buffer';

const maxImages: Number = 10;

@Component({
  moduleId: module.id,
  selector: 'bc-img-revision',
  templateUrl: 'images.component.html',
  styleUrls: ['images.component.scss'],
  providers: [ShelterService]
})
export class BcImgRevision extends RevisionBase implements OnDestroy {
  private newDocForm: FormGroup;
  docsForm: FormGroup;
  private uploading = false;
  private newDocFormValidSub: Subscription;
  private docsFormValidSub: Subscription;
  private hiddenImage = true;
  constructor(shelterService: ShelterService,
    authService: BcAuthService,
    shared: BcSharedService,
    router: Router,
    _route: ActivatedRoute,
    private fb: FormBuilder,
    revisionService: BcRevisionsService) {
    super(shelterService, shared, revisionService, _route, router, authService);
    this.MENU_SECTION = Enums.MenuSection.document;
    this.newDocForm = fb.group({
      file: [],
      description: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)]
    });

    this.docsForm = fb.group({
      files: fb.array([])
    });

    this.newDocFormValidSub = this.newDocForm.statusChanges.subscribe(value => {
      if (value === "VALID") {
        if (!this.maskError && this.docsForm.valid) {
          this.displayError = false;
        }
      }
    });

    this.docsFormValidSub = this.docsForm.statusChanges.subscribe(value => {
      if (value === "VALID") {
        if (!this.maskError && this.newDocForm.valid) {
          this.displayError = false;
        }
      }
    });

    this.maskSaveSub = shared.maskSave$.subscribe(() => {
      if (!this.maskError) {
        if (this.newDocForm.dirty || this.docsForm.dirty) {
          this.disableSave = true;
          this.save(true);
        } else {
          this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.images);
        }
      } else {
        this.abortSave();
      }
    });

    shared.activeComponent = Enums.Routes.Routed_Component.images;
  }

  getFormControls(controlName) {
    return (<FormGroup>this.docsForm.get(controlName)).controls;
  }

  checkValidForm() {
    return this.docsForm.valid;
  }

  initFile(file: IFile) {
    return this.fb.group({
      type: [file.type],
      id: [file._id],
      contentType: [file.contentType],
      name: [file.name],
      size: [file.size],
      description: [file.description, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)]
    });
  }

  isUploading() {
    return this.uploading;
  }

  toBuffer(ab) {
    const buf = new Buffer(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
    }
    return buf;
  }

  toggle() {
    this.hiddenImage = !this.hiddenImage;
  }

  isHidden() {
    return this.hiddenImage;
  }

  removeFile(id) {
    this.commitToFather({ _id: id, type: Enums.Files.File_Type.image }, true);
    const removeFileSub = this.shelterService.removeFile(id, this._id).subscribe(value => {
      if (value) {
        (<FormArray>this.docsForm.get('files')).controls
          .splice((<FormArray>this.docsForm.get('files')).controls
            .findIndex(f => f.value.id == id), 1);
      }
      if (removeFileSub) {
        removeFileSub.unsubscribe();
      }
    });
  }

  getContentType() {
    return Object.keys(Enums.Files.Image_Type);
  }

  addDoc() {
    if (this.newDocForm.valid && (<FormArray>this.docsForm.get('files')).controls.length < maxImages) {
      this.uploading = true;
      this.displayError = false;
      const f = <File>(<FormGroup>(this.newDocForm.get('file'))).value;
      const file: IFile = {
        name: f.name,
        size: f.size,
        uploadDate: new Date(Date.now()),
        contentType: f.type,
        shelterId: this._id,
        description: this.getControlValue(<FormGroup>(<FormGroup>this.newDocForm).get('description')),
        type: Enums.Files.File_Type.image
      }
      const fileReader = new FileReader();
      fileReader.onloadend = (e: any) => {
        file.data = this.toBuffer(fileReader.result);
        const shelServiceSub = this.shelterService.insertFile(file).subscribe(id => {
          if (id) {
            const f = file;
            f._id = id;
            (<FormArray>this.docsForm.get('files')).push(this.initFile(f));
            this.commitToFather(f);
          }
          this.uploading = false;
          this.cleanForm();
          if (confirm) {
            this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.images);
          }
          if (shelServiceSub) {
            shelServiceSub.unsubscribe();
          }
        });
      }
      fileReader.readAsArrayBuffer(f);
    } else {
      this.displayError = true;
    }
  }

  cleanForm() {
    this.newDocForm.reset();
    this.toggle();
  }

  save(confirm) {
    if (!confirm || this.docsForm.valid) {
      this.displayError = false;
      let i = 0;
      for (const file of (<FormArray>this.docsForm.get('files')).controls) {
        if (file.dirty) {
          const updFile: IFile = {
            _id: file.value.id,
            shelterId: this._id,
            description: this.getControlValue(<FormGroup>(<FormGroup>file).get('description'))
          }
          const updateSub = this.shelterService.updateFile(updFile).subscribe((val) => {
            if (val) {
              i++;
              if ((<FormArray>this.docsForm.get('files')).controls.length === i && confirm) {
                this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.images);
              }
            }
            if (updateSub) {
              updateSub.unsubscribe();
            }
          });
          const f: IFile = {
            name: file.value.name,
            size: file.value.size,
            _id: updFile._id,
            type: file.value.type,
            value: file.value.value,
            contentType: file.value.contentType,
            description: updFile.description
          };

          this.revisionService.onChildSaveFile(f);
        } else {
          i++;
          if ((<FormArray>this.docsForm.get('files')).controls.length === i && confirm) {
            this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.images);
          }
        }
      }
    } else {
      this.abortSave();
    }
  }

  commitToFather(file: IFile, remove?: Boolean) {
    this.revisionService.onChildSaveFile({
      name: file.name, size: file.size,
      _id: file._id,
      type: file.type,
      value: file.value,
      contentType: file.contentType,
      description: file.description
    }, remove)
  }

  downloadFile(id) {
    this.shelterService.downloadFile(id);
  }

  ngOnDestroy() {
    if (!this.disableSave && this.docsForm.dirty) {
      this.save(false);
    }
    if (this.permissionSub) {
      this.permissionSub.unsubscribe();
    }
    if (this.maskSaveSub) {
      this.maskSaveSub.unsubscribe();
    }
    if (this.newDocFormValidSub) {
      this.newDocFormValidSub.unsubscribe();
    }
    if (this.docsFormValidSub) {
      this.docsFormValidSub.unsubscribe();
    }
    if (this.maskInvalidSub) {
      this.maskInvalidSub.unsubscribe();
    }
    if (this.maskValidSub) {
      this.maskValidSub.unsubscribe();
    }
  }

  initForm(shelter) { }

  initDocs(files: IFile[]) {
    for (const file of files) {
      (<FormArray>this.docsForm.get('files')).push(this.initFile(file));
    }
  }

  init(shelId) {
    this.getDocs(shelId, [Enums.Files.File_Type.image])
      .then(files => {
        this.initDocs(files);
      })
  }

  getEmptyObjData(section: any) {
    return {};
  }

}

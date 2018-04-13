import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { CUSTOM_PATTERN_VALIDATORS } from '../../inputs/input_base';
import { Enums } from '../../../app/shared/types/enums';
import { OnInit } from '@angular/core';
import { IShelter, IFile } from 'app/shared/types/interfaces';
import { BcDetailsService } from '../details.service';
import { ShelterService } from 'app/shelter/shelter.service';

const validObjectIDRegExp = CUSTOM_PATTERN_VALIDATORS.objectID;

export abstract class DetailBase implements OnInit {
    _id: String;
    constructor(protected _route,
        protected shared,
        protected router,
        protected detailsService,
        protected shelterService) {
        shared.onActiveOutletChange(Enums.Routes.Routed_Outlet.content);
    }

    getEmptyObjData(section) {
        return {};
    }

    getDocs(shelId, categories: Enums.Files.File_Type[]): Promise<IFile[]> {
        return new Promise<IFile[]>((resolve, reject) => {
            const loadServiceSub = this.detailsService.loadFiles$.subscribe(files => {
                if (!files) {
                    const queryFileSub = this.shelterService.getFilesByShelterIdAndType(shelId, categories).subscribe(fs => {
                        this.detailsService.onChildSaveFiles(fs);
                        if (queryFileSub) {
                            queryFileSub.unsubscribe();
                        }
                        resolve(fs.filter(obj => categories.indexOf(obj.type) > -1));
                    });
                } else {
                    resolve(files.filter(obj => categories.indexOf(obj.type) > -1));
                }
                if (loadServiceSub) {
                    loadServiceSub.unsubscribe();
                }
            });
            this.detailsService.onChildLoadFilesRequest(categories);
        });
    }

    getData(id, section): Promise<IShelter> {
        return new Promise<IShelter>((resolve, reject) => {
            const revSub = this.detailsService.load$.subscribe(shelter => {
                if (shelter != null && shelter[section]) {
                    if (revSub) {
                        revSub.unsubscribe();
                    }
                    resolve(shelter);
                } else {
                    const shelSub = this.shelterService.getShelterSection(id, section).subscribe(shel => {
                        if (!shel[section]) { shel[section] = this.getEmptyObjData(section) }
                        this.detailsService.onChildSave(shel, section);
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
            this.detailsService.onChildLoadRequest(section);
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

    ngOnInit() {
        const sub = this.getRoute()
            .then(id => {
                this.init(id);
            })
            .catch(err => {
                this.redirect('/pageNotFound');
            });
    }

    protected abstract init(shelID: String);

    redirect(url: any) {
        if (url) {
            this.router.navigateByUrl(url);
        }
    }
}

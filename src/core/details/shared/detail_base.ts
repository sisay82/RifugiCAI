import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { validators } from '../../inputs/input_base';
import { Enums } from '../../../app/shared/types/enums';
import { OnInit } from '@angular/core';

const validObjectIDRegExp = validators.objectID;

export abstract class DetailBase implements OnInit {
    _id: String;
    constructor(protected _route, protected shared, protected router) {
        shared.onActiveOutletChange(Enums.Routes.Routed_Outlet.content);
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

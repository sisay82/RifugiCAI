import {
    Component,
    OnInit
} from '@angular/core';
import {
    ShelterService
} from '../shelter.service'
import {
    IShelter
} from '../../shared/types/interfaces';
import {
    Enums
} from '../../shared/types/enums';
import {
    BcSharedService
} from '../../shared/shared.service';
import {
    BcAuthService
} from '../../shared/auth.service';
import {
    Subscription
} from 'rxjs';
import { Tools } from '../../shared/tools/common.tools';

function getProperty(item, prop: String) {
    const props = prop.split('.');
    let retItem = item;
    for (const p of props) {
        retItem = retItem[p];
    }
    return retItem;
}

@Component({
    moduleId: module.id,
    selector: 'bc-shelters-List',
    templateUrl: 'shelterList.component.html',
    styleUrls: ['shelterList.component.scss'],
    providers: [ShelterService, BcSharedService]
})
export class BcShelterList implements OnInit {
    filterText = "";
    filteredShelter: IShelter[] = [];
    rifugiSample: IShelter[] = [];
    private profile: Tools.IUserProfile;
    isCentral: boolean;
    constructor(private shelterService: ShelterService, private shared: BcSharedService, private authService: BcAuthService) { }

    private isCentralUser() {
        this.authService.hasInsertPermission().subscribe(val => {
            this.isCentral = val;
        });
    }

    getAuth() {
        return (this.profile != null)
    }

    ngOnInit() {
        const permissionSub = this.authService.getUserProfile().subscribe(profile => {
            this.profile = profile;

            const processedProfile = this.authService.processUserProfileCode(profile);
            if (!processedProfile) {
                return;
            }

            this.isCentralUser();
            const shelSub = this.shelterService.getShelters().subscribe(shelters => {
                this.rifugiSample = shelters;
                this.filteredShelter = shelters;
                this.filterChanged("");

                if (shelSub) {
                    shelSub.unsubscribe();
                }
                if (permissionSub) {
                    permissionSub.unsubscribe();
                }
            });
        });
        this.filterText = "";
    }

    createShel() {
        if (this.isCentral) {
            const newShelSub = this.shelterService.getNewId().subscribe((obj) => {
                this.shared.activeOutlet = Enums.Routes.Routed_Outlet.revision;
                this.shared.activeComponent = Enums.Routes.Routed_Component.geographic;
                if (newShelSub) {
                    newShelSub.unsubscribe();
                }
                location.href = "newShelter/" + obj.id + "/(revision:geographic)";
            });
        }
    }

    filterChanged(event: any) {
        const data = this.filterText;
        if (data && this.rifugiSample) {
            const props = ['name', 'branch', 'idCai', 'type', 'geoData.location.region'];
            this.filteredShelter = this.rifugiSample.filter((item: any) => {
                let match = false;
                for (const prop of props) {
                    const it = getProperty(item, prop);
                    if (it && it.toString().toUpperCase().indexOf(data.toUpperCase()) > -1) {
                        match = true;
                        break;
                    }
                }
                return match;
            });
        } else {
            this.filteredShelter = this.rifugiSample;
        }
        this.filteredShelter = this.filteredShelter.sort((a: IShelter, b: IShelter) => {
            return a.name.localeCompare(<string>b.name);
        });
    }
}

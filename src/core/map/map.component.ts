import {
    Component,
    OnInit,
    Input,
    ViewEncapsulation,
    Optional,
    OnDestroy,
    AfterContentInit
} from '@angular/core';
import {
    Subject,
    Subscription
} from 'rxjs';
import {
    ShelterService
} from '../../app/shelter/shelter.service';
import {
    Router
} from '@angular/router';
import * as L from 'leaflet';
import {
    Map
} from 'leaflet';
import {
    IMarker,
    IShelter
} from '../../app/shared/types/interfaces';
import {
    Enums
} from '../../app/shared/types/enums';
import {
    BcAuthService
} from '../../app/shared/auth.service';
import {
    BcMapService
} from './map.service';

function getRegionMarkerHtml(content, size) {
    return `<div style="font-size:` + size + `px" class="fa fa-map-marker bc-marker">
                <div class="bc-marker-content">
                    <div style="font-size:20%;transform: translateY(35%);">` + content + `</div>
                </div>
            </div>`;
}

function getNormalMarkerHtml(size) {
    return `<div style="font-size:` + size + `px" class="fa fa-map-marker bc-marker bc-marker-tiny"></div>`;
}

function getTooltip(name, municipality, province, region) {
    return `<div class="bc-tooltip">
    <div class="bc-tooltip-head">
        <div style="top:20%;position:relative">` + (name ? (name) : '---') + `</div>
    </div>
    <div class="bc-tooltip-line">
        <div class="bc-tooltip-line-content">` + (municipality ? (municipality) : '---') + `, `
        + (province ? (province) : '---') + `</br>` + (region ? (region) : '---') + `</div>
    </div>
</div>`;
}

interface Region_Marker {
    region: string;
    marker: L.Marker;
}

function getTooltipEventHandler(shelId): (event: any) => any {
    return function (clickEvent: any) {
        const isOpen = clickEvent.target.isTooltipOpen();
        const tooltip = clickEvent.target.getTooltip();
        const clickPosition = clickEvent.latlng;
        if (isOpen) {
            location.href = "/shelter/" + shelId + "/(content:geographic)";
        } else {
            this.map.eachLayer((layer) => layer.closeTooltip());
            const bound = (5000 / this.map.getZoom());
            if (clickPosition.distanceTo(<L.LatLng>this.map.getCenter()) > bound) {
                this.map.off('moveend');
                this.map.on('moveend', (ev) => {
                    ev.target.openTooltip(tooltip);
                    this.map.off('moveend');
                    this.map.on("moveend", this.moveEvent, this);

                });
                this.map.setView(clickEvent.target._latlng);
                clickEvent.target.toggleTooltip();
            } else {
                clickEvent.target.openTooltip(tooltip);
            }
        }
    }
}


@Component({
    moduleId: module.id,
    selector: 'bc-map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    providers: [ShelterService],
    encapsulation: ViewEncapsulation.None
})
export class BcMap implements OnInit, OnDestroy, AfterContentInit {
    @Input() enableExpansion = false;
    @Input() normalIconSize = 26;
    @Input() regionIconSize = 60;
    @Input() initialZoom = 6;
    @Input() openTooltipCenter = false;
    increaseRatio = 10;
    private _toggle = false;
    private countryShelters: Region_Marker[] = [];
    private normalIcon;
    expanded = false;
    private markerPane = L.featureGroup();
    private base_url = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    private map: Map;
    private divIcon;
    private currentCenterSub: Subscription;
    private initCenter: L.LatLng | L.LatLngExpression;
    private DEFAULT_CENTER: L.LatLng = new L.LatLng(
        (<any>Enums.Defaults.Region_LanLng.lazio)[0], (<any>Enums.Defaults.Region_LanLng.lazio)[1]
    );

    private checkUser(code: String): any {
        return code.substr(0, 2)
    }

    private getRegion(code: String) {
        return code.substr(2, 2);
    }

    private getSection(code: String) {
        return code.substr(4, 3);
    }

    constructor(
        private authService: BcAuthService,
        @Optional() private mapService: BcMapService,
        private router: Router,
        public shelterService: ShelterService
    ) {
        this.normalIcon = L.divIcon({
            className: '',
            iconSize: null,
            iconAnchor: [this.normalIconSize / 4, this.normalIconSize],
            popupAnchor: [0, 0],
            html: getNormalMarkerHtml(this.normalIconSize)
        });

        if (this.mapService) {
            this.currentCenterSub = this.mapService.currentcenter$.subscribe(newCenter => {
                if (newCenter[0] != null && newCenter[1] != null) {
                    this.map.setView(newCenter, this.initialZoom);
                    if (!this.initCenter) {
                        this.initCenter = newCenter;
                    }
                }
            });
        }
    }

    ngOnDestroy() {
        if (this.currentCenterSub) {
            this.currentCenterSub.unsubscribe();
        }

    }

    /**
     * Leaflet has problem if map container size check is done too early
     */
    ngAfterContentInit() {
        setTimeout(() => {
            this.map.invalidateSize()
        }, 0);
    }

    ngOnInit() {
        this.initMap('map');
        this.map.invalidateSize();
        this.map.setView(this.DEFAULT_CENTER, this.initialZoom);
    }

    addMarker(marker: L.Marker) {
        this.markerPane.addLayer(marker);
    }

    initMap(mapElement: string) {
        this.map = new L.Map(mapElement);
        L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="https://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        }).addTo(this.map);
        this.map.on("click", function (e: any) {
            e.target.eachLayer(function (layer) {
                layer.closeTooltip()
            })
        });
        this.markerPane.addTo(this.map);
        if (this.enableExpansion) {
            this.map.on("click", this.clickEvent, this);
        }
        this.map.on("moveend", this.moveEvent, this);
    }

    createRegionDivIcon(num: number): L.DivIcon {
        const regionIcon = L.divIcon({
            className: '',
            iconSize: null,
            iconAnchor: [this.regionIconSize / 4, this.regionIconSize],
            html: getRegionMarkerHtml(num, this.regionIconSize)
        });
        return regionIcon;
    }

    getShelterForRegion(country: string) {
        if (country && Enums.Defaults.Region_LanLng[country.toLowerCase()]) {
            const savedMarkers = this.countryShelters.find(obj => obj.region.indexOf(country) > -1);
            const coordinateMarker: L.LatLng = Enums.Defaults.Region_LanLng[country.toLowerCase()];

            if (!savedMarkers) {
                const newCountryMarker: Region_Marker = {
                    marker: null,
                    region: country
                };
                this.countryShelters.push(newCountryMarker);

                const countryMarkerSub = this.shelterService.getConutryMarkersNumber(country).subscribe(obj => {
                    if (obj && obj.num && obj.num > 0) {
                        const mark: L.Marker = L.marker(coordinateMarker, {
                            icon: this.createRegionDivIcon(obj.num)
                        });
                        this.countryShelters.find(obj => obj == newCountryMarker).marker = mark;
                        this.addMarker(mark.on("click", this.openPopupRegion, this));
                    } else {
                        this.countryShelters.push({
                            marker: null,
                            region: country
                        });
                    }
                    if (countryMarkerSub != undefined) {
                        countryMarkerSub.unsubscribe();
                    }
                });
            } else {
                if (savedMarkers.marker) {
                    this.addMarker(savedMarkers.marker.on("click", this.openPopupRegion, this));
                }
            }
        }
    }

    markRegions() {
        const permissionSub = this.authService.getUserProfile().subscribe(profile => {
            const processedUser = this.authService.processUserProfileCode(profile);
            if (processedUser) {
                const regions = this.authService.getRegions(profile.role, profile.code);
                for (const region of regions) {
                    this.getShelterForRegion(region);
                }
            } else {
                return;
            }

            if (permissionSub) {
                permissionSub.unsubscribe();
            }
        });
    }

    openPopupRegion(event: any) {
        this.map.setView(event.target._latlng, 9);
    }

    removeMarkers() {
        this.markerPane.clearLayers();
    }

    moveEvent(event: any) {
        this.removeMarkers();

        if (event.target.getZoom() > 7) {
            this.setMarkersAround(event.target.getCenter());
        } else {
            this.markRegions();
        }
    }

    getIncreaseRatio() {
        return 1 + this.increaseRatio / this.map.getZoom()
    }

    createTooltip(shelter: IShelter): L.Tooltip {
        const popup: string = getTooltip(
            shelter.name,
            shelter.geoData.location.municipality,
            shelter.geoData.location.province,
            shelter.geoData.location.region
        );
        const tooltip = L.tooltip({
            permanent: true,
            direction: "right",
            offset: [25, -50],
            interactive: true
        }).setContent(popup);

        tooltip.on("click", function (event: Event) {
            this.router.navigateByUrl("/shelter/" + shelter._id);
        });

        return tooltip;
    }

    createShelterSingleMarker(shelter: IShelter) {
        if (shelter.geoData != undefined && shelter.geoData.location != undefined) {
            const tooltip: L.Tooltip = this.createTooltip(shelter);

            const mark = L.marker([<number>shelter.geoData.location.latitude, <number>shelter.geoData.location.longitude], {
                icon: this.normalIcon
            })
                .bindTooltip(tooltip)
                .on("click", getTooltipEventHandler(shelter._id), this);

            this.addMarker(mark);

            if (!this.openTooltipCenter || !this.initCenter || !tooltip.getLatLng().equals(this.initCenter)) {
                this.map.closeTooltip(tooltip);
            } else {
                this.initCenter = null;
            }
        }
    }

    setMarkersAround(point: L.LatLng) {
        const sheltersAroundSub = this.shelterService.getSheltersAroundPoint(point, this.getIncreaseRatio()).subscribe(shelters => {
            for (const shelter of shelters) {
                this.createShelterSingleMarker(shelter);

            }
            if (sheltersAroundSub != undefined) {
                sheltersAroundSub.unsubscribe();
            }
        });
    }

    clickEvent(event: MouseEvent) {
        if (!this._toggle) {
            if (!this.expanded) {
                this.expanded = true;
                this._toggle = true;
                document.getElementById("map").style.width = "100%";
                document.getElementById("map").style.height = "100%";
                document.getElementById("map").style.position = "relative";
                this.map.closeTooltip();
                this.map.invalidateSize();
            } else {
                this.expanded = false;
            }
        }
    }
}

import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { IMarker, IShelter } from '../../shared/interfaces';

@Injectable()
export class ShelterService{
     shelters:IShelter[]=[
        {id:"id1",name:"Shelter1",registry:{address:{via:"via",number:1,cap:1,city:"city",collective:"Comune1",country:"Regione1",district:"Provincia1"}},geographic_data:{coordinates:{latitude:43.14,longitude:11.25}}},
        {id:"id2",name:"Shelter2",geographic_data:{coordinates:{latitude:43.4,longitude:11.5}},registry:{address:{via:"via",number:1,cap:1,city:"city",collective:"Comune1",country:"Regione1",district:"Provincia1"}}},
        {id:"id3",name:"Shelter3",geographic_data:{coordinates:{latitude:43.14,longitude:11.42}}, registry:{address:{via:"via",number:1,cap:1,city:"city",collective:"Comune1",country:"Regione1",district:"Provincia1"}}}
    ];

    getByName(name:string):IShelter{
        return this.shelters[0];
    }

    /**
     * Return shelters in the area around @point
     * @param point
     */
    getShelters(point:L.LatLng,area:number):IShelter[]{
        return this.shelters;
    }

    /**
     * Return markers of shelters of the given country.
     * @param country
     */
    getConutryMarkers(country:string):IShelter[]{
        return this.shelters;
    }
}
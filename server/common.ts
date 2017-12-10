import { IShelter, IService, IFile } from "../src/app/shared/types/interfaces";
import * as mongoose from 'mongoose';
import * as path from 'path';
import { Enums } from "../src/app/shared/types/enums";
import Auth_Permissions = Enums.Auth_Permissions;
import {DISABLE_AUTH} from './API/auth.api';
export interface IServiceExtended extends IService,mongoose.Document {
    _id:String;
}

export interface IShelterExtended extends IShelter,mongoose.Document {
    _id:String;
}

export interface IFileExtended extends IFile,mongoose.Document{
    _id:String;
}

export interface Updating_Shelter {
    watchDog:Date;
    shelter:IShelterExtended;
    files:any[];
    isNew?:Boolean;
}

export interface User_Data {
    id:String;
    resource:String;
    ticket?:String;
    uuid?:String;
    code?:String;
    role?:Auth_Permissions.User_Type;
    redirections:number;
    checked:boolean;
}

export const SheltersToUpdate:Updating_Shelter[] = [];
export const OUT_DIR=path.join(__dirname,"../dist");
export const ObjectId = mongoose.Types.ObjectId;
export const MONTHS=["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const DISABLE_LOG:boolean=false;

const maxTime = 1000*60*10;

function cleanSheltersToUpdate(){
    SheltersToUpdate.forEach(obj=>{
        const diff=Date.now()-obj.watchDog.valueOf();
        if(diff>maxTime){
            SheltersToUpdate.splice(SheltersToUpdate.indexOf(obj),1);
        }
    });
}

function getArea(code:String):String{
    return code.substr(2,2);
}

function getRegion(code:String):String{
    return code.substr(2,2);
}

function getSection(code:String):String{
    return code.substr(4,3);
}

function getAreaRegions(area:string):any{
    return Auth_Permissions.Regions_Area[Auth_Permissions.Area_Code[area]];
}

export function checkUserData(user:User_Data):{section:String,regions:any[]}{
    if(user&&user.code&&user.role){
        let regions:any[]=[];
        let section:String;
        if(user.role==Auth_Permissions.User_Type.area){
            regions=getAreaRegions(<string>getArea(user.code))
        }else if(user.role==Auth_Permissions.User_Type.regional||
                user.role==Auth_Permissions.User_Type.sectional){
            regions=[getRegion(user.code)];
        }
        if(user.role==Auth_Permissions.User_Type.sectional){
            section=getSection(user.code);
        }
        return {section:section,regions:regions};
    }else{
        return null;
    }
}

export function logger(log?:any, ...other){
    if(!DISABLE_AUTH){
        console.log(log,...other);   
    }
}

export function toTitleCase(input:string): string{
    if (!input) {
        return '';
    } else {
        return input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1) )).replace(/_/g," ");
    }
}

setInterval(cleanSheltersToUpdate,1500);

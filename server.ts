import * as path from 'path';
import * as mongoose from 'mongoose';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as express from "express";
import { IShelter, IService, IFile, IOpening,IContribution } from "./src/app/shared/types/interfaces";
import { Schema } from "./src/app/shared/types/schema";
import { Enums } from "./src/app/shared/types/enums";
import https = require('https');
import multer = require('multer');
import request = require('request');
import xmldom = require('xmldom');
import * as pdf from "html-pdf"
import fs = require('fs');

interface IServiceExtended extends IService,mongoose.Document {
    _id:String;
}
interface IShelterExtended extends IShelter,mongoose.Document {
    _id:String;
}
interface IFileExtended extends IFile,mongoose.Document{
    _id:String;
}

(<any>mongoose.Promise)=global.Promise;
var DOMParser = xmldom.DOMParser;
var casBaseUrl = "https://accesso.cai.it";
var authUrl = "https://services.cai.it/cai-integration-ws/secured/users/";
var serverUrl = "app-cai.herokuapp.com";
var portUrl=process.env.PORT || 8080;
var appBaseUrl = "http://"+serverUrl;
var app = express();
var parsedUrl=encodeURIComponent(appBaseUrl+"/j_spring_cas_security_check");
var userList:{id:String,resource:String,ticket?:String,uuid?:String,code?:String,role?:Enums.User_Type,redirections:number,checked:boolean}[]=[];
var centralRole="ROLE_RIFUGI_ADMIN";
var regionalRoleName="PGR";
var sectionalPRoleName="Responsabile Esterno Sezione";
var sectionalURoleName="Operatore Sezione Esteso"; 
var ObjectId = mongoose.Types.ObjectId;
var Services = mongoose.model<IServiceExtended>("Services",Schema.serviceSchema);
var Shelters = mongoose.model<IShelterExtended>("Shelters",Schema.shelterSchema);
var Files = mongoose.model<IFileExtended>("Files",Schema.fileSchema);
var SheltersToUpdate:{watchDog:Date, shelter:IShelterExtended, files:any[]}[] = [];
var maxTime = 1000*60*10;
var stop:boolean=false;
var maxImages=10;

/**
 * SECTION AUTH
 */

function getChildByName(node:Node,name:String):Node{
    for(let i=0;i<node.childNodes.length;i++){
        if(node.childNodes.item(i).localName==name){
            return node.childNodes.item(i);
        }
        if(node.childNodes.item(i).hasChildNodes()){
            let n = getChildByName(node.childNodes.item(i),name);
            if(n){
                return n;
            }
        }
    }
    return null;
}

function getChildsByName(node:Node,name:String):Node[]{
    let nodes:Node[]=[];
    for(let i=0;i<node.childNodes.length;i++){
        if(node.childNodes.item(i).localName==name){
            nodes.push(node.childNodes.item(i));
        }
        if(node.childNodes.item(i).hasChildNodes()){
            let n = getChildsByName(node.childNodes.item(i),name);
            if(n){
                nodes=nodes.concat(n);
            }
        }
    }
    return nodes;
}

function getTargetNodesByName(node:Node,name:String,target:String):Node[]{
    let nodes:Node[]=[];
    for(let n of getChildsByName(node,name)){
        let child=getChildByName(n,target);
        if(child){
            nodes.push(child);
        }        
    }
    return nodes;
}

function getRole(data):Enums.User_Type{
    if(data.aggregatedAuthorities&&data.aggregatedAuthorities.find(obj=>obj.role==centralRole)){
        return Enums.User_Type.central;
    }else if(data.userGroups){
        if(data.userGroups.find(obj=>obj.name==regionalRoleName)){
            return Enums.User_Type.regional;
        }else if(data.userGroups.find(obj=>obj.name==sectionalPRoleName||obj.name==sectionalURoleName)){
            return Enums.User_Type.sectional;
        }else{
            return null;
        }
    }else{
        return null;
    }
}

function checkUserPromise(uuid):Promise<{role:Enums.User_Type,code:String}>{
    console.log("CHECKUSER");
    return new Promise<{role:Enums.User_Type,code:String}>((resolve,reject)=>{
        request.get({
            url:authUrl+uuid+'/full',
            method:"GET",
            headers:{
                "Authorization":"Basic YXBwcmlmdWdpQGNhaS5pdDpiZXN1Z1U3UjJHdWc="
            },
        },function(err,response,body){
            try{
                let data=JSON.parse(body);     
                let role=getRole(data); 

                if(role){
                    let code;
                    if(role==Enums.User_Type.sectional){
                        if(data.sectionCode){
                            code=data.sectionCode;
                        }   
                    }else{
                        if(data.regionaleGroupCode){
                            let tmpCode = data.regionaleGroupCode;
                            if(tmpCode){
                                code = tmpCode.substr(0,2)+tmpCode.substr(5,2)+tmpCode.substr(2,3);                        
                            }
                        }
                    }
                    if(code){
                        resolve({role:role,code:code});                                                  
                    }else{
                        reject("Error code");
                    }
                }else{
                    reject("User not authorized");
                }
            }catch(e){
                reject(e);
            }
        });
    });
}

function validationPromise(ticket):Promise<String>{
    return new Promise((resolve,reject)=>{
        request.get({
            url:casBaseUrl+"/cai-cas/serviceValidate?service="+parsedUrl+"&ticket="+ticket,
            method:"GET"
        },function(err,response,body){
            try {
                var el:Node=(new DOMParser()).parseFromString(body,"text/xml").firstChild;
                let res:boolean=false;
                let user:String;
                if(getChildByName(el,'authenticationSuccess')){
                    res=true;
                    user=getChildByName(el,'uuid').textContent;
                }
                if(res){
                    resolve(user);
                }else{
                    reject(null);
                }
            } catch (e) {
                reject(e);
            }
        });
    });
}



function toTitleCase(input:string): string{
    if (!input) {
        return '';
    } else {
        return input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1) )).replace(/_/g," ");
    }
}

/**
 * QUERY
 */

function getAllIdsHead(region?:String,section?:String):Promise<IShelterExtended[]>{
    let query:any={};
    if(region||section){
        let regionQuery;
        query.$and=[];
        query.$and.push({idCai:{'$ne':null}})
        if(region&&region.length==2){
            regionQuery={idCai:new RegExp("^[0-9-]{2,2}"+region+"[0-9-]{4,6}")};
            query.$and.push(regionQuery);
        }

        let sectionQuery;
        if(section&&section.length==3){
            sectionQuery={idCai:new RegExp("^[0-9-]{4,4}"+section+"[0-9-]{1,3}")};
            query.$and.push(sectionQuery);
        }
    }

    return new Promise<IShelterExtended[]>((resolve,reject)=>{
    Shelters.find(query,'name idCai type branch owner category insertDate updateDate geoData.location.region geoData.location.locality').exec((err,ris)=>{
            if(err){
                console.log(err);
                reject(err);
            }else{
                resolve(ris);
            }
        });
    });
}

function queryShelPage(pageNumber,pageSize):Promise<IShelterExtended[]>{
    return new Promise<IShelterExtended[]>((resolve,reject)=>{
        Shelters.find({},'name idCai type branch owner category insertDate updateDate geoData.location.region geoData.location.locality').skip(Number(pageNumber*pageSize)).limit(Number(pageSize)).exec((err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        });
    });
}

function countContributionFilesByShelter(shelID):Promise<Number>{
    return new Promise<Number>((resolve,reject)=>{
        Files.count({"shelterId":shelID,type:Enums.File_Type.contribution}).exec((err,res)=>{
            if(err){
                reject(err);
            }else{
                resolve(res);
            }
        })
    });
}

function queryFileById(id):Promise<IFileExtended>{
    return new Promise<IFileExtended>((resolve,reject)=>{
        Files.findById(id).exec((err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        })
    });
}

function queryFilesByShelterId(id):Promise<IFileExtended[]>{
    return new Promise<IFileExtended[]>((resolve,reject)=>{
        Files.find({"shelterId":id,type:{$not:{$in:[Enums.File_Type.image]}}},"name size contentType type description value invoice_tax invoice_year invoice_confirmed contribution_type invoice_type").exec((err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        })
    });
}

function queryImagesByShelterId(id):Promise<IFileExtended[]>{
    return new Promise<IFileExtended[]>((resolve,reject)=>{
        Files.find({"shelterId":id,type:Enums.File_Type.image},"name size contentType type description").exec((err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        })
    });
}

function queryAllFiles():Promise<IFileExtended[]>{
    return new Promise<IFileExtended[]>((resolve,reject)=>{
        Files.find({type:{$not:{$in:[Enums.File_Type.image]}}},"name size contentType type description value invoice_tax invoice_year invoice_confirmed contribution_type invoice_type").exec((err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        })
    });
}

function queryAllImages():Promise<IFileExtended[]>{
    return new Promise<IFileExtended[]>((resolve,reject)=>{
        Files.find({type:Enums.File_Type.image},"name size contentType type description").exec((err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        })
    });
}

function queryShelById(id):Promise<IShelterExtended>{
    return new Promise<IShelterExtended>((resolve,reject)=>{
        Shelters.findById(id).populate("services").exec((err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        });
    });
}

function queryShelSectionById(id,section):Promise<IShelterExtended>{
    return new Promise<IShelterExtended>((resolve,reject)=>{
        Shelters.findOne({_id:id},"name "+section).populate("services").exec((err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        });
    });        
}

function queryShelByRegion(region:string,regionFilter:String,sectionFilter:String):Promise<number>{
    return new Promise<number>((resolve,reject)=>{
        let query:any={};
        if(region&&/[0-9]{2,2}/g.test(region)){
            region=Enums.Region_Code[region];
        }
        if(region){
            query['geoData.location.region']={$in:[region.toLowerCase(),region.toUpperCase(),toTitleCase(region),region]};        
        }else if(regionFilter&&regionFilter.length==2){
            let regionQuery;
            query.$and=[];
            query.$and.push({'idCai':{'$ne':null}});
            regionQuery={'idCai':new RegExp("^[0-9-]{2,2}"+regionFilter+"[0-9-]{4,6}")};
            query.$and.push(regionQuery);

            let sectionQuery;
            if(sectionFilter&&sectionFilter.length==3){
                sectionQuery={'idCai':new RegExp("^[0-9-]{4,4}"+sectionFilter+"[0-9-]{1,3}")};
                query.$and.push(sectionQuery);
            }
        }else{
            reject(<any>{error:"Parameter error"});
        }
    
        Shelters.count(query).exec((err,ris:number)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);                                
            }
        });
        
    });
}

function queryShelAroundPoint(point:{lat:number,lng:number},range:number,regionFilter:String,sectionFilter:String):Promise<IShelterExtended[]>{
    return new Promise<IShelterExtended[]>((resolve,reject)=>{
        let query:any={};
        query.$and=[
            {"geoData.location.latitude":{$gt:(point.lat-range),$lt:(point.lat+range)}},
            {"geoData.location.longitude":{$gt:(point.lng-range),$lt:(point.lng+range)}}
        ];

        if(regionFilter||sectionFilter){
            query.$and.push({'idCai':{'$ne':null}});

            let regionQuery;            
            if(regionFilter&&regionFilter.length==2){
                regionQuery={'idCai':new RegExp("^[0-9-]{2,2}"+regionFilter+"[0-9-]{4,6}")};
                query.$and.push(regionQuery);    
            }
            
            let sectionQuery;
            if(sectionFilter&&sectionFilter.length==3){
                sectionQuery={'idCai':new RegExp("^[0-9-]{4,4}"+sectionFilter+"[0-9-]{1,3}")};
                query.$and.push(sectionQuery);
            }
        }
        Shelters.find(query,'name idCai type branch owner category insertDate updateDate geoData.location.longitude geoData.location.latitude geoData.location.municipality geoData.location.region geoData.location.province').exec((err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        });
    });
}

function queryServById(id):Promise<IServiceExtended>{
    return new Promise<IServiceExtended>((resolve,reject)=>{
        Services.findById(id,function(err,serv){
            if(err){
                reject(err);
            }else{
                resolve(serv);
            }
        });
    });
}

function queryServWithParams(params):Promise<Array<IServiceExtended>>{
    return new Promise<Array<IServiceExtended>>((resolve,reject)=>{
        Services.find(params).populate("services").exec(function(err,ris){
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        });
    });
}

/**
 * INSERT
 */

function insertNewFile(file:IFileExtended):Promise<IFileExtended>{
    return new Promise<IFileExtended>((resolve,reject)=>{
        file.data=Buffer.from(file.data);
        Files.create(file,(err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        })
    });
}

function insertNewShelter(params):Promise<IShelterExtended>{
    return new Promise<IShelterExtended>((resolve,reject)=>{
        let services:IServiceExtended[]=params.services;
        params.services=[];
        var shelter=new Shelters(params);
        shelter.save(function(err,shel){
            if(err){
                reject(err)
            }else{
                if(services){
                    for(let serv of services){
                        insertNewService(serv)
                        .then((ser)=>{
                            shel.services.push(<any>ser._id);
                            
                            if(shel.services.length==services.length){
                                shel.save();
                                resolve(shel);
                            }
                        })
                        .catch((err)=>{
                            reject(err);
                        })
                    }
                }else{
                    resolve(shel);
                }
            }
        })
    });
}

function insertNewService(params):Promise<IServiceExtended>{
    return new Promise<IServiceExtended>((resolve,reject)=>{
        var shelter=new Services(params);
        shelter.save(function(err,serv:IServiceExtended){
            if(err){
                reject(err)
            }else{
                resolve(serv);
            }
        })
    });
}

/**
 * UPDATE
 */

function updateFile(id:any,file):Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
        let query={
            $set:{
                contribution_type:file.contribution_type||null,
                invoice_year:file.invoice_year||null,
                invoice_tax:file.invoice_tax||null,
                invoice_type:file.invoice_type||null,
                invoice_confirmed:file.invoice_confirmed||null,
                value:file.value||null
            }
        }

        Files.findByIdAndUpdate(id,query).exec((err,res)=>{
            if(err){
                reject(err);
            }else{
                resolve(true);
            }
        });
    });
}

function resolveServicesInShelter(shelter,services):Promise<IShelterExtended>{
    return new Promise<IShelterExtended>((resolve,reject)=>{
        if(services){
            let count=0;
            for(let serv of services){
                let c=0;
                for (var k in serv) {
                    if (serv.hasOwnProperty(k)) {
                        ++c;
                    }
                }
                if(serv.hasOwnProperty("_id") && c==1){
                    deleteService(serv._id)
                    .then(()=>{
                        count++;
                        if(count==services.length){
                            shelter.save();
                            resolve(shelter);
                        }
                    })
                    .catch((err)=>{
                        reject(err);
                    })
                }else{
                    if(serv._id){
                        updateService(serv._id,serv)
                        .then(()=>{
                            count++;
                            if(count==services.length){
                                shelter.save();
                                resolve(shelter);
                            }
                        })
                        .catch((err)=>{
                            reject(err);
                        })
                    }else{
                        insertNewService(serv)
                        .then((ser)=>{
                            shelter.services.push(ser._id);
                            count++;
                            if(count==services.length){
                                shelter.save();
                                resolve(shelter);
                            }
                        })
                        .catch((err)=>{
                            reject(err);
                        })
                    }
                }
            }
        }else{
            resolve(shelter);
        }
    });
}

function createPDF(shelId:any,data:IContribution):Promise<{name:String,id:any}>{
    return new Promise<{name:String,id:any}>((resolve,reject)=>{
        let document = `<html><head></head><body>
        <div>Richiesta di contributi di tipo: `+data.type+`</div><h4>Contributi richiesti:</h4>`;

        data.data.handWorks?(document+="<div>Lavori a corpo (€): "+data.data.handWorks+"</div>"):null;
        data.data.customizedWorks?(document+="<div>Lavori a misura (€): "+data.data.customizedWorks+"</div>"):null;
        data.data.safetyCharges?(document+="<div>Oneri di sicurezza (€): "+data.data.safetyCharges+"</div>"):null;
        data.data.totWorks?(document+="<div>Totale Lavori (€): "+data.data.totWorks+"</div>"):null;
        data.data.surveyorsCharges?(document+="<div>Spese per indagini, rilievi, ecc. (€): "+data.data.surveyorsCharges+"</div>"):null;
        data.data.connectionsCharges?(document+="<div>Spese per allacciamenti a reti di distribuzione (€): "+data.data.connectionsCharges+"</div>"):null;
        data.data.technicalCharges?(document+="<div>Spese tecniche (€): "+data.data.technicalCharges+"</div>"):null;
        data.data.testCharges?(document+="<div>Spese di collaudo (€): "+data.data.testCharges+"</div>"):null;
        data.data.taxes?(document+="<div>Tasse ed Oneri (€): "+data.data.taxes+"</div>"):null;
        data.data.totCharges?(document+="<div>Totale Spese (€): "+data.data.totCharges+"</div>"):null;
        if(data.data.IVAincluded){
            document+="<div>IVA compresa poiché non recuperabile: SI</div>";
        }else{
            document+="<div>IVA compresa poiché non recuperabile: NO</div>";
        }
        data.data.totalProjectCost?(document+="<div>Costo totale del progetto (€): "+data.data.totalProjectCost+"</div>"):null;
        data.data.externalFinancing?(document+="<div>Finanziamento esterno (€): "+data.data.externalFinancing+"</div>"):null;
        data.data.selfFinancing?(document+="<div>Autofinanziamento (€): "+data.data.selfFinancing+"</div>"):null;
        data.data.red?(document+="<div>Scoperto (€): "+data.data.red+"</div>"):null;
        data.value?(document+="<div>RICHIESTO (€): "+data.value+"</div>"):null;

        if(data.attachments&&data.attachments.length>0){
            document+="<h5>Allegati:</h5>";
            data.attachments.forEach(file=>{
                let content="<div>"+file.name+"</div>";
                document+=content;
            });
        }
       
        document+="</body></html>";

        let result = pdf.create(document,{
            "directory": "/tmp",
            "header": {
                "height": "45mm",
                "contents": '<div style="text-align: center;">Author: CAIDEV</div>'
            },
            "footer": {
                "height": "28mm",
                "contents": {
                  first: (new Date()).toDateString(),
                  default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                  last: 'Last Page'
                }
            },
        });

        /*result.toFile("./doc.pdf",function(err,res){
            resolve(null);
        });*/

        result.toStream(function(err,res){
            if(err){
                console.log(err);
            }else{
                countContributionFilesByShelter(shelId)
                .then(num=>{
                    var bufs = [];
                    num+=<any>1;
                    res.on('data', function(d){ bufs.push(d); });
                    res.on("end",()=>{
                        let buff = Buffer.concat(bufs);
                        let file={
                            size:buff.length,
                            shelterId:shelId,
                            uploadDate:new Date(),
                            name:data.year+"_"+data.type+"_"+num+".pdf",
                            data:buff,
                            contribution_type:data.type,
                            contentType:"application/pdf",
                            type:Enums.File_Type.contribution,
                            invoice_year:data.year,
                            value:data.value
                        }
                        insertNewFile(<any>file)
                        .then(f=>{
                            resolve({name:f.name,id:f._id});
                        })
                        .catch(err=>{
                            reject(err);
                        });
                    });
                    res.on('error',function(err){
                        reject(err);
                    });
                })
                .catch(err=>{
                    reject(err);
                });
            }
        })
    }); 
}

function resolveEconomyInShelter(shelter:IShelterExtended,uses:any[],contributions:any,economies:any[]):Promise<IShelterExtended>{
    return new Promise<IShelterExtended>((resolve,reject)=>{
        try{
            if(uses!=undefined){
                for(let use of uses){
                    let u = shelter.use.filter(obj=>obj.year==use.year)[0];
                    if(u!=undefined){
                        shelter.use.splice(shelter.use.indexOf(u),1);
                    }
                    shelter.use.push(use);
                    
                }
            }
            
            if(economies!=undefined){
                for(let economy of economies){
                    let e = shelter.economy.filter(obj=>obj.year==economy.year)[0];
                    if(e!=undefined){
                        shelter.economy.splice(shelter.economy.indexOf(e),1);
                    }
                    shelter.economy.push(economy);
                    
                }
            }
            if(contributions!=undefined){
                shelter.contributions=contributions;
                if(contributions.accepted){
                    createPDF(shelter._id,contributions)
                    .then(file=>{
                        delete(shelter.contributions)
                        resolve(shelter);
                    })
                    .catch((e)=>{
                        reject(e);
                    });
                }else{
                    resolve(shelter);
                }
            }else{
                resolve(shelter);
            }
            

        }catch(e){
            reject(e);
        }
    });
}

function updateShelter(id:any,params:IShelterExtended):Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
        let services:any[]=params.services;
        let use:any[]=params.use;
        let contributions=params.contributions;
        let economy:any[]=params.economy;
        delete(params.services);
        delete(params.use);
        delete(params.economy);
        delete(params.contributions);
        let options:any={setDefaultsOnInsert:true,upsert:true};
        if(params.updateDate==undefined){
            params.updateDate=new Date(Date.now());
        }
        Shelters.findByIdAndUpdate(id,{$set:params},options,function(err,shel){
            if(err){
                reject(err);
            }else{
                resolveServicesInShelter(shel,services)
                .then((shelter)=>{
                    resolveEconomyInShelter(shelter,use,contributions,economy)
                    .then((shelter)=>{
                        shelter.save();
                        resolve(true);
                    })
                    .catch((err)=>{
                        reject(err);
                    });
                })
                .catch((err)=>{
                    reject(err);
                });
            }
        })
    });
}

function confirmShelter(id:any):Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
        let shelToUpdate=SheltersToUpdate.filter(obj=>obj.shelter._id==id)[0];
        updateShelter(id,shelToUpdate.shelter)
        .then(()=>{
            SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToUpdate),1);
            resolve(true);
        })
        .catch((err)=>{
            reject(err);
        });
    });
}

function addOpening(id,opening:IOpening):Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
        Shelters.findById(id,'openingTime',function(err,shelter){
            if(err) reject(err);
            else{
                shelter.openingTime.push(opening);
                shelter.save(function(err){
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve(true);
                    }
                });
            }
        });
    });
}

function updateService(id,params:IServiceExtended):Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
        Services.update({_id:id},params,{upsert:true},function(err){
            if(err){
                reject(err);
            }else{
                resolve(true);
            }
        })
    });
}

/**
 * DELETE
 */

function deleteFile(id):Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
        if(id){
            Files.remove({_id:id},function(err){
                if(err){
                    reject(err);
                }else{
                    resolve(true);
                }
            });
        }else{
            reject(new Error("Invalid id"));
        }
    });
}

function deleteShelter(id):Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
        if(id){
            Shelters.remove({_id:id},function(err){
                if(err){
                    reject(err);
                }else{
                    resolve(true);
                }
            })
        }else{
            reject(new Error("Invalid id"));
        }
    });
}

function deleteShelterService(shelterId,serviceId):Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
        queryShelById(shelterId)
        .then((shelter)=>{
            deleteService(serviceId)
            .then(()=>{
                shelter.save();
                resolve(true);
                
            })
            .catch((err)=>{
                reject(err);
            })
        });
    });
}

function deleteService(id):Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
        if(id){
            Services.remove({_id:id},function(err){
                if(err){
                    reject(err);
                }else{
                    resolve(true);
                }
            })
        }
    });
}

function cleanSheltersToUpdate(){
    if(!stop){
        stop=true;
        SheltersToUpdate.forEach(obj=>{
            var diff=Date.now()-obj.watchDog.valueOf();
            if(diff>maxTime){
                SheltersToUpdate.splice(SheltersToUpdate.indexOf(obj),1);
            }
        });
        stop=false;
    }
}

/**
 * APP SETUP
 */

function checkPermissionAppAPI(req,res,next){
    let user=req.body.user;
    if(user){
        if(req.method=="GET"){
           next(); 
        }else{
            if(req.method=="DELETE"||req.method=="POST"){
                if(user.role==Enums.User_Type.central){
                    next();
                }else{
                    res.status(500).send({error:"Unauthorized"});
                }
            }else if(req.method=="PUT"){
                if(Enums.DetailRevisionPermission.find(obj=>obj==user.role)){
                    next();
                }else{
                    res.status(500).send({error:"Unauthorized"});
                }
            }else{
                res.status(501).send({error:"Not Implemented method "+req.method});
            }
        }
    }else{
        res.status(500).send({error:"Error request"});
    }
}

function checkPermissionFileAPI(req,res,next){
    let user=req.body.user;
    if(user){
        if(req.method=="GET"){
           next(); 
        }else{
            if(req.method=="DELETE"||req.method=="POST"||req.method=="PUT"){
                if(Enums.DocRevisionPermission.find(obj=>obj==user.role)){
                    next();
                }else{
                    res.status(500).send({error:"Unauthorized"});
                }
            }else{
                res.status(501).send({error:"Not Implemented method "+req.method});
            }
        }
    }else{
        res.status(500).send({error:"Error request"});
    }
}

var app = express();
var appRoute = express.Router();
appRoute.all("*",checkPermissionAppAPI);
var fileRoute = express.Router();
fileRoute.all("*",checkPermissionFileAPI);
var authRoute = express.Router();

setInterval(cleanSheltersToUpdate,1500);

/**
 * ROUTE SECTION
 */

fileRoute.route("/shelters/file")
.post(function(req,res){
    var upload = multer().single("file")
    upload(req,res,function(err){
        if(err){
            res.status(500).send({error:"Error in file upload"})
        }else{
            stop=true;
            let file=JSON.parse(req.file.buffer.toString());
            if(file.size<1024*1024*16){
                insertNewFile(file)
                .then((file)=>{
                    res.status(200).send({_id:file._id,name:file.name,size:file.size,type:file.type,contentType:file.contentType});
                })
                .catch((err)=>{
                    res.status(500).send(err);
                })
            }
        }
    });
});

fileRoute.route("/shelters/file/all")
.get(function(req,res){
    queryAllFiles()
    .then((file)=>{
        res.status(200).send(file);
    })
    .catch((err)=>{
        res.status(500).send(err);
    })
});

fileRoute.route("/shelters/image/all")
.get(function(req,res){
    queryAllImages()
    .then((file)=>{
        res.status(200).send(file);
    })
    .catch((err)=>{
        res.status(500).send(err);
    })
});

fileRoute.route("/shelters/file/confirm")
.post(function(req,res){
    try{
        var upload = multer().single("file")
        upload(req,res,function(err){
            if(err){
                res.status(500).send({error:"Error in file upload"})
            }else{
                stop=true;
                let file=JSON.parse(req.file.buffer.toString());
                if(file.size<1024*1024*16){
                    let id=file.shelterId;
                    let fileId=new ObjectId();
                    let shelUpdate=SheltersToUpdate.filter(obj=>obj.shelter._id==id);
                    file._id=fileId;
                    file.new=true;
                    if(file.type==Enums.File_Type.image){
                        let shelFiles=queryFilesByShelterId(id)
                        .then(files=>{
                            if(shelUpdate!=undefined&&shelUpdate.length>0){
                                if(files.length<maxImages&&(shelUpdate[0].files==undefined||files.length+shelUpdate[0].files.length<maxImages)){
                                    if(shelUpdate[0].files!=undefined){
                                        shelUpdate[0].files.push(file);
                                    }else{
                                        shelUpdate[0].files=[file];
                                    }
                                    shelUpdate[0].watchDog=new Date(Date.now());
                                    res.status(200).send(fileId);
                                }else{
                                    res.status(500).send({error:"Max "+maxImages+" images"});
                                }
                            }else{
                                if(files.length<maxImages){
                                    let newShelter:any={_id:id};
                                    SheltersToUpdate.push({watchDog:new Date(Date.now()),shelter:newShelter,files:[file]});
                                    res.status(200).send(fileId);
                                }else{
                                    res.status(500).send({error:"Max "+maxImages+" images"});
                                }
                            }
                            stop=false;
                        })
                        .catch(err=>{
                            if(shelUpdate!=undefined&&shelUpdate.length>0){
                                if(shelUpdate[0].files==undefined||shelUpdate[0].files.length<maxImages){
                                    if(shelUpdate[0].files!=undefined){
                                        shelUpdate[0].files.push(file);
                                    }else{
                                        shelUpdate[0].files=[file];
                                    }
                                    shelUpdate[0].watchDog=new Date(Date.now());
                                    res.status(200).send(fileId);
                                }else{
                                    res.status(500).send({error:"Max "+maxImages+" images"});
                                }
                            }else{
                                let newShelter:any={_id:id};
                                SheltersToUpdate.push({watchDog:new Date(Date.now()),shelter:newShelter,files:[file]});
                                res.status(200).send(fileId);
                            }
                            stop=false;
                        });
                    }else{
                        if(shelUpdate!=undefined&&shelUpdate.length>0){
                            if(shelUpdate[0].files!=undefined){
                                shelUpdate[0].files.push(file);
                            }else{
                                shelUpdate[0].files=[file];
                            }
                            shelUpdate[0].watchDog=new Date(Date.now());
                        }else{
                            let newShelter:any={_id:id};
                            SheltersToUpdate.push({watchDog:new Date(Date.now()),shelter:newShelter,files:[file]});
                        }
                        stop=false;
                        res.status(200).send(fileId);
                    }
                }else{
                    res.status(500).send({error:"File size over limit"});
                }
            }
        });
    }catch(e){
        res.status(500).send({error:"Error undefined"});
    }
});

fileRoute.route("/shelters/file/confirm/:fileId/:shelId")
.delete(function(req,res){
    let shelUpdate=SheltersToUpdate.filter(obj=>obj.shelter._id==req.params.shelId);
    if(shelUpdate!=undefined&&shelUpdate.length>0){
        let fileToDelete=shelUpdate[0].files.filter(f=>f._id==req.params.fileId);
        if(fileToDelete!=undefined&&fileToDelete.length>0){
            shelUpdate[0].files.splice(shelUpdate[0].files.indexOf(fileToDelete[0]),1);
            delete(fileToDelete[0].data);
            fileToDelete[0].remove=true;
        }else{
            shelUpdate[0].files.push({_id:req.params.fileId,remove:true});
        }
        res.status(200).send(true);
    }else{
        let newShelter:any={};
        newShelter._id=req.params.shelId;
        SheltersToUpdate.push({watchDog:new Date(Date.now()),shelter:newShelter,files:[{_id:req.params.fileId,remove:true}]});
        res.status(200).send(true);
    }
    
})

fileRoute.route("/shelters/file/:id")
.get(function(req,res){
    queryFileById(req.params.id)
    .then((file)=>{
        res.status(200).send(file);
    })
    .catch((err)=>{
        res.status(500).send(err);
    })
})
.put(function(req,res){
    try{
        let updFile:IFile=req.body.file;  
        if(updFile){
            let shel = SheltersToUpdate.filter(obj=>obj.shelter._id&&(<any>obj.shelter._id)==updFile.shelterId)[0];
            if(shel!=undefined){
                let file = shel.files.filter(f=>f._id==req.params.id)[0];
                if(file!=undefined){
                    for(let prop in updFile){
                        file[prop]=updFile[prop];
                    }
                    file.update=true;
                }else{
                    let newF:any={};
                    for(let prop in updFile){
                        newF[prop]=updFile[prop];
                    }
                    newF.update=true;
                    shel.files.push(newF);
                }
            }else{
                let shelter:any={_id:updFile.shelterId};
                let newF:any={};
                for(let prop in updFile){
                    newF[prop]=updFile[prop];
                }
                newF.update=true;
                SheltersToUpdate.push({
                    watchDog:new Date(Date.now()),
                    shelter:shelter,
                    files:[newF]
                });
            }
            res.status(200).send(true);
        }else{
            res.status(500).send({error:"Incorrect request"});
        }
    }catch(e){
        res.status(500).send({error:e});
    }
})
.delete(function(req,res){
    deleteFile(req.params.id)
    .then(()=>{
        res.status(200).send(true);
    })
    .catch(err=>{
        res.status(500).send(err);
    });
});

appRoute.route("/shelters/file/byshel/:id")
.get(function(req,res){
    let shel=SheltersToUpdate.filter(obj=>obj.shelter._id==req.params.id)[0];
    if(shel==undefined){
        queryFilesByShelterId(req.params.id)
        .then((file)=>{
            res.status(200).send(file);
        })
        .catch((err)=>{
            res.status(500).send(err);
        });
    }else{
        queryFilesByShelterId(req.params.id)
        .then((file)=>{
            if(shel.files!=null){
                for(let f of shel.files.filter(f=>f.type!=Enums.File_Type.image)){
                    if(f.remove){
                        let fi=file.filter(file=>file._id==f._id)[0];
                        file.splice(file.indexOf(fi),1);
                    }else if(f.new){
                        file.push(f);
                    }else{
                        let fi=file.filter(file=>file._id==f._id)[0];
                        file[file.indexOf(fi)]=f;
                    }
                }
                res.status(200).send(file);
            }else{
                res.status(200).send(file);
            }
        })
        .catch((err)=>{
            res.status(500).send(err);
        });
    }
});

appRoute.route("/shelters/image/byshel/:id")
.get(function(req,res){
    let shel=SheltersToUpdate.filter(obj=>obj.shelter._id==req.params.id)[0];
    if(shel==undefined){
        queryImagesByShelterId(req.params.id)
        .then((file)=>{
            res.status(200).send(file);
        })
        .catch((err)=>{
            res.status(500).send(err);
        });
    }else{
        queryImagesByShelterId(req.params.id)
        .then((file)=>{
            if(shel.files!=null){
                for(let f of shel.files.filter(f=>f.type==Enums.File_Type.image)){
                    if(f.remove){
                        let fi=file.filter(file=>file._id==f._id)[0];
                        file.splice(file.indexOf(fi),1);
                    }else if(f.new){
                        file.push(f);
                    }else{
                        let fi=file.filter(file=>file._id==f._id)[0];
                        file[file.indexOf(fi)]=f;
                    }
                }
                res.status(200).send(file);
            }else{
                res.status(200).send(file);
            }
        })
        .catch((err)=>{
            res.status(500).send(err);
        });
    }
});

appRoute.route("/shelters")
.get(function(req,res){
    try{
        getAllIdsHead(req.query.region,req.query.section)
        .then((rif)=>{
            if(rif){
                res.status(200).send(rif);
            }else{
                res.status(404).send({error:"No Matcching Rifugio"});
            }
        })
        .catch((err)=>{
            res.status(500).send(err);
        });
    }catch(e){
        res.status(500).send({error:"Error Undefined"});
    }
})
.post(function(req,res){
    insertNewShelter(req.body)
    .then((shelter)=>{
        let id=shelter._id;
        delete(shelter._id);
        res.status(200).send({id:id,shelter:shelter});
    })
    .catch((err)=>{
        res.status(500).send(err);
    });
});

appRoute.route("/shelters/country")
.get(function(req,res){
    try{
        if(req.query.name||req.query.region){
            queryShelByRegion(req.query.name,req.query.region,req.query.section)
            .then((ris)=>{
                res.status(200).send({num:ris});
            })
            .catch((err)=>{
                console.log(err);
                res.status(500).send(err);
            });
        }else{
            res.status(500).send({error:"Error parameters"});
        }
        
    }catch(e){
        console.log(e);
        res.status(500).send({error:"Error Undefined"});
    }
});

appRoute.route("/shelters/point")
.get(function(req,res){
    try{
        if(req.query.lat&&req.query.lng&&req.query.range){
            queryShelAroundPoint({lat:Number(req.query.lat),lng:Number(req.query.lng)},Number(req.query.range),req.query.region,req.query.section)
            .then((ris)=>{
                res.status(200).send(ris);
            })
            .catch((err)=>{
                res.status(500).send(err);
            });
        }else{
            res.status(500).send({error:"Query error, parameters not found"});
        }
    }catch(e){
        console.log(e);
        res.status(500).send({error:"Error Undefined"});
    }
});

appRoute.route("/shelters/:id")
.get(function(req,res){
    try{
        if(ObjectId.isValid(req.params.id)){ 
            queryShelById(req.params.id)
            .then((rif)=>{
                if(rif!=null){
                    res.status(200).send(rif);
                }else{
                    res.status(200).send({_id:req.params.id});
                }
            })
            .catch((err)=>{
                res.status(500).send(err);
            });
        }
        else {
            res.status(500).send({error:"Error ID"});
        }
    }catch(e){
        res.status(500).send({error:"Error Undefined"});
    }
})
.put(function(req,res){
    let shelUpdate = SheltersToUpdate.filter(shelter=>shelter.shelter._id==req.params.id);
    if(shelUpdate.length>0){
        for(let param in req.body){
            if(shelUpdate[0].shelter.hasOwnProperty(param)){
                shelUpdate[0].shelter[param]=req.body[param];
            }
        }
        shelUpdate[0].watchDog=new Date(Date.now());
    }
    updateShelter(req.params.id,req.body)
    .then(()=>{
        res.status(200).send(true);
    })
    .catch((err)=>{
        res.status(500).send(err);
    });
})
.delete(function(req,res){
    deleteShelter(req.params.id)
    .then(()=>{
        res.status(200).send(true);
    })
    .catch((err)=>{
        res.status(500).send(err);
    });
});

appRoute.route("/shelters/confirm/:id")
.put(function(req,res){
    try{
        if(req.body.confirm!=undefined){
            let shelToConfirm = SheltersToUpdate.filter(shelter=>shelter.shelter._id==req.params.id)[0];
            if(shelToConfirm!=undefined){
                if(req.body.confirm){
                    confirmShelter(req.params.id)
                    .then((ris)=>{
                        if(shelToConfirm.files!=null){
                            let i=shelToConfirm.files.length;
                            let j=0;
                            for(let file of shelToConfirm.files){
                                if(file.remove!=undefined&&file.remove){
                                    deleteFile(file._id)
                                    .then(()=>{
                                        j++;
                                        if(j==i){
                                            SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToConfirm),1);
                                            res.status(200).send(true);
                                        }
                                    })
                                    .catch(err=>{
                                        res.status(500).send(err);
                                    });
                                }else{
                                    if(!file.new&&file.update!=undefined&&file.update){
                                        updateFile(file._id,file)
                                        .then(value=>{
                                            j++;
                                            if(j==i){
                                                SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToConfirm),1);
                                                res.status(200).send(true);
                                            }
                                        })
                                        .catch(err=>{
                                            res.status(500).send(err);
                                        });
                                    }else{
                                        insertNewFile(file)
                                        .then(f=>{
                                            j++;
                                            if(j==i){
                                                SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToConfirm),1);
                                                res.status(200).send(true);
                                            }
                                        })
                                        .catch(err=>{
                                            res.status(500).send(err);
                                        });
                                    }
                                }
                            }
                        }else{
                            SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToConfirm),1);
                            res.status(200).send(true);
                        }
                    })
                    .catch((err)=>{
                        res.status(500).send(err);
                    });
                }else{
                    SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelToConfirm),1);
                    res.status(200).send(true);
                }
            }else{
                res.status(200).send(true);
            }
        }
        if(req.body.new!=undefined){
            if(req.body.new){
                res.status(200).send({id:new ObjectId()});
            }else{
                res.status(500).send({error:"command not found"});
            }
        }
        
    }catch(e){
        res.status(500).send({error:"Error Undefined"});
    }
});

appRoute.route("/shelters/confirm/:section/:id")
.put(function(req,res){
    try{
        stop=true;
        let shelUpdate=SheltersToUpdate.filter(obj=>obj.shelter._id==req.params.id);
        if(shelUpdate.length>0){
            shelUpdate[0].shelter[req.params.section]=req.body[req.params.section];
            shelUpdate[0].watchDog=new Date(Date.now());
        }else{
            let newShelter:IShelterExtended=req.body;
            newShelter._id=req.params.id;
            SheltersToUpdate.push({watchDog:new Date(Date.now()),shelter:newShelter,files:null});
        }
        stop=false;
        res.status(200).send(true);
    }catch(e){
        res.status(500).send({error:"Error Undefined"});
    }
})

appRoute.route("/shelters/page/:pageSize")
.get(function(req,res){
    try{
        queryShelPage(0,req.params.pageSize)
        .then((ris)=>{
            res.status(200).send(ris);
        })
        .catch((err)=>{
            res.status(500).send(err);
        })
    }catch(e){
        res.status(500).send({error:"Error Undefined"});
    }
});

appRoute.route("/shelters/page/:pageNumber/:pageSize")
.get(function(req,res){
    try{
        queryShelPage(req.params.pageNumber,req.params.pageSize)
        .then((ris)=>{
            res.status(200).send(ris);
        })
        .catch((err)=>{
            res.status(500).send(err);
        })
    }catch(e){
        res.status(500).send({error:"Error Undefined"});
    }
});

appRoute.route("/shelters/:id/:name")
.get(function(req,res){
    try{
        stop=true;
        let shelUpdate=SheltersToUpdate.filter(obj=>obj.shelter._id==req.params.id);
        if(shelUpdate.length>0&&shelUpdate[0].shelter[req.params.name]!=undefined){
            shelUpdate[0].watchDog=new Date(Date.now());
            res.status(200).send(shelUpdate[0].shelter);
            stop=false;
        }else{
            queryShelSectionById(req.params.id,req.params.name)
            .then((ris)=>{
                if(ris!=null){
                    res.status(200).send(ris);
                }else{
                    res.status(200).send({_id:req.params.id});
                    //res.status(404).send(ris);
                }                
            })
            .catch((err)=>{
                res.status(500).send(err);
            });
        }
    }catch(e){
        res.status(500).send({error:"Error Undefined"});
    }
})
.delete(function(req,res){
    deleteService(req.params.name)
    .then(()=>{
        res.status(200).send(true);
    })
    .catch((err)=>{
        res.status(500).send(err);
    });
});

/** AUTH INIT */

authRoute.get('/logout',function(req,res){
    let user=userList.findIndex(obj=>obj.id==req.session.id);
    console.log("Logging out");

    if(user>-1){
        userList.splice(user,1);
    }
    res.redirect(casBaseUrl+"/cai-cas/logout");
});

authRoute.get('/j_spring_cas_security_check',function(req,res){
    let user=userList.find(obj=>obj.id==req.session.id);
    if(user){
        user.ticket=req.query.ticket;
        res.redirect(user.resource.toString());
    }else{
        console.log("Invalid user request");
        userList.push({id:req.session.id,resource:appBaseUrl,redirections:0,checked:false});
        res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);
    }
});

authRoute.get('/user',function(req,res,next){
    let user=userList.find(obj=>obj.id==req.session.id);
    console.log("User permissions request (UUID): ",user.uuid);    
    if(user!=undefined&&user.uuid!=undefined){
        if(user.code==undefined||user.role==undefined){
            if(user.checked){
                user.checked=false;
                res.status(500).send({error:"Invalid user or request"});
            }else{
                checkUserPromise(user.uuid)
                .then(usr=>{
                    user.code=usr.code;
                    user.role=usr.role;
                    res.status(200).send(usr);
                })
                .catch(()=>{
                    res.status(500).send({error:"Invalid user or request"});
                });
            }
        }else{
            res.status(200).send({code:user.code,role:user.role});
        }
    }else{
        console.log("User not logged");
        userList.push({id:req.session.id,resource:appBaseUrl+'/list',redirections:0,checked:false});
        res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);
    }
})

authRoute.get('/',function(req,res,next){
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.redirect("/list");
});

authRoute.use(express.static(__dirname + '/dist'));
  
authRoute.get('/*', function(req, res) {
    console.log(req.method+" REQUEST: "+JSON.stringify(req.query));
    console.log(req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    
    let user=userList.find(obj=>obj.id==req.session.id);
    if(!user){
      console.log("User not logged");
      userList.push({id:req.session.id,resource:req.path,redirections:0,checked:false});
      res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);
    }else{
      if(user.ticket){
        console.log("Checking ticket: ",user.ticket);
        validationPromise(user.ticket)
        .then((usr)=>{
            console.log("Valid ticket");
            user.checked=true;            
            user.redirections=0;
            if(user.code==undefined||user.role==undefined){
                user.uuid=usr;
                checkUserPromise(usr)
                .then(us=>{
                    console.log("Access granted with role and code: ",Enums.User_Type[us.role],us.code);
                    user.code=us.code;
                    user.role=us.role;
                    
                    res.sendFile(path.join(__dirname + '/dist/index.html'));                
                })
                .catch(()=>{
                    console.log("Access denied");
                    res.sendFile(path.join(__dirname + '/dist/index.html'));
                });
            }else{
                if(user.role){
                    console.log("Access granted with role and code: ",user.role,user.code);
                    res.sendFile(path.join(__dirname + '/dist/index.html'));
                }else{
                    res.sendFile(path.join(__dirname + '/dist/index.html'));
                }
            }
        })
        .catch((err)=>{
            console.log("Invalid ticket");
            user.redirections++;
            user.checked=false;
            user.resource=req.path;
            if(user.redirections>=3){
                let index=userList.findIndex(obj=>obj.id==user.id);
                userList.splice(index,1);
                res.status(500).send(`Error, try logout <a href='`+casBaseUrl+"/cai-cas/logout"+`'>here</a> before try again.
                <br>Error info:<br><br>`+err);
            }else{
                res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);                
            }
        });
      }else{
        console.log("Invalid user ticket");
        user.resource=req.path;
        user.redirections++;
        if(user.redirections>=3){
            let index=userList.findIndex(obj=>obj.id==user.id);
            userList.splice(index,1);
            res.status(500).send("Error, try logout <a href='"+casBaseUrl+"/cai-cas/logout"+"'>here</a> before try again");
        }else{
            res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);                
        }
      }
    }
    
});

/**
 * APP INIT
 */
  
app.use(bodyParser.urlencoded({
    extended: true
}),session({
    secret: 'ytdv6w4a2wzesdc7564uybi6n0m9pmku4esx', // just a long random string
    resave: false,
    saveUninitialized: true
}),bodyParser.json());

app.use('/api',function(req,res,next){
    console.log("SessionID: "+req.sessionID+", METHOD: "+req.method+", QUERY: "+JSON.stringify(req.query)+", PATH: "+req.path);
    if (req.method === 'OPTIONS') {
        var headers = {};
        headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
        headers["Access-Control-Allow-Headers"] = "Content-Type";
        headers["content-type"] = 'application/json; charset=utf-8';    
        res.writeHead(200, headers);
        res.end();
    } else {
        let user=userList.find(obj=>obj.id==req.session.id);
        if(user!=undefined&&user.checked&&user.role!=undefined&&user.code!=undefined){
            req.body.user=user;
            next();
        }else{
            res.status(500).send({error:"Unauthenticated user"});
        }
    }
    /*
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('content-type', 'application/json; charset=utf-8');
    */
},fileRoute,appRoute);

app.use('/',authRoute);

app.use(function(req,res,next){
    console.log("SessionID: "+req.sessionID+", METHOD: "+req.method+", QUERY: "+JSON.stringify(req.query)+", PATH: "+req.path);
    next();
});

app.use('/*', function(req, res) {
    if (req.method === 'OPTIONS') {
        var headers = {};
        headers["Access-Control-Allow-Headers"] = "Content-Type";
        headers["content-type"] = 'text/html; charset=UTF-8';    
        res.writeHead(200, headers);
        res.end();
    } else {
        res.sendFile(path.join(__dirname + '/dist/index.html'));
    }
    /*
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');    
    res.setHeader('content-type', 'text/html; charset=UTF-8');    
    res.sendFile(path.join(__dirname + '/dist/index.html'));
    */
});

var server = app.listen(portUrl, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

//"mongodb://localhost:27017/ProvaDB",process.env.MONGODB_URI
mongoose.connect(process.env.MONGODB_URI||"mongodb://localhost:27017/CaiDB",{
    useMongoClient: true
},function(err){
    if(err) {
        console.log("Error connection: "+err);
        server.close(()=>{
            console.log("Server Closed");
            process.exit(-1);
            return;
        });
    }
});

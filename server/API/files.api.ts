import * as express from "express";
import { Enums } from "../../src/app/shared/types/enums";
import Auth_Permissions = Enums.Auth_Permissions;
import Files_Enum = Enums.Files;
import multer = require('multer');
import { SheltersToUpdate,IFileExtended,ObjectId, Updating_Shelter,logger } from '../common'; 
import * as mongoose from 'mongoose';
import { IFile } from "../../src/app/shared/types/interfaces";
import { Schema } from "../../src/app/shared/types/schema";

const Files = mongoose.model<IFileExtended>("Files",Schema.fileSchema);
const maxImages=10;

export function countContributionFilesByShelter(shelID):Promise<Number>{
    return new Promise<Number>((resolve,reject)=>{
        Files.count({"shelterId":shelID,type:Files_Enum.File_Type.contribution}).exec((err,res)=>{
            if(err){
                reject(err);
            }else{
                resolve(res);
            }
        })
    });
}

export function insertNewFile(file:IFileExtended):Promise<IFileExtended>{
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

function resolveFile(file):Promise<any>{
    return new Promise<any>((resolve,reject)=>{
        if(file.remove!=undefined&&file.remove){
            deleteFile(file._id)
            .then(()=>{
                resolve();
            })
            .catch(err=>{
                reject(err);
            });
        }else{
            if(!file.new&&file.update!=undefined&&file.update){
                updateFile(file._id,file)
                .then(value=>{
                    resolve();
                })
                .catch(err=>{
                    reject(err);
                });
            }else{
                insertNewFile(file)
                .then(f=>{
                    resolve();
                })
                .catch(err=>{
                    reject(err);
                });
            }
        }
    })
}

export function resolveFilesForShelter(shelter:Updating_Shelter):Promise<any>{
    return new Promise<any>((resolve,reject)=>{
        if(shelter.files!=null){
            const i=shelter.files.length;
            let j=0;
            for(const file of shelter.files){
                resolveFile(file)
                .then(()=>{
                    j++;
                    if(j==i){
                        SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelter),1);
                        resolve();
                    }
                })
                .catch(err=>{
                    logger(err);
                    reject(err);
                });
            }
        }else{
            SheltersToUpdate.splice(SheltersToUpdate.indexOf(shelter),1);
            resolve();
        }
    })
}

function queryAllFiles():Promise<IFileExtended[]>{
    return new Promise<IFileExtended[]>((resolve,reject)=>{
        Files.find({type:{$not:{$in:[Files_Enum.File_Type.image]}}},"name size contentType type description value invoice_tax invoice_year invoice_confirmed contribution_type invoice_type").exec((err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
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
        Files.find({"shelterId":id,type:{$not:{$in:[Files_Enum.File_Type.image]}}},"name size contentType type description value invoice_tax invoice_year invoice_confirmed contribution_type invoice_type").exec((err,ris)=>{
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
        Files.find({"shelterId":id,type:Files_Enum.File_Type.image},"name size contentType type description").exec((err,ris)=>{
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
        Files.find({type:Files_Enum.File_Type.image},"name size contentType type description").exec((err,ris)=>{
            if(err){
                reject(err);
            }else{
                resolve(ris);
            }
        })
    });
}

function updateFile(id:any,file):Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
        const query={
            $set:{
                contribution_type:file.contribution_type||null,
                invoice_year:file.invoice_year||null,
                invoice_tax:file.invoice_tax||null,
                invoice_type:file.invoice_type||null,
                invoice_confirmed:file.invoice_confirmed||null,
                value:file.value||null,
                description:file.description||null
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

function checkPermissionAPI(req,res,next){
    const user=req.body.user;
    if(user){
        if(req.method=="GET"){
           next(); 
        }else{
            if(req.method=="DELETE"||req.method=="POST"||req.method=="PUT"){
                if(Auth_Permissions.Revision.DocRevisionPermission.find(obj=>obj==user.role)){
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

export const fileRoute = express.Router();
fileRoute.all("*",checkPermissionAPI);

fileRoute.route("/shelters/file")
.post(function(req,res){
    const upload = multer().single("file")
    upload(req,res,function(err){
        if(err){
            res.status(500).send({error:"Error in file upload"})
        }else{
            const file=JSON.parse(req.file.buffer.toString());
            if(file.size<1024*1024*16){
                insertNewFile(file)
                .then((file)=>{
                    res.status(200).send({_id:file._id,name:file.name,size:file.size,type:file.type,contentType:file.contentType});
                })
                .catch((err)=>{
                    logger(err);
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
        logger(err);
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
        logger(err);
        res.status(500).send(err);
    })
});

fileRoute.route("/shelters/file/confirm")
.post(function(req,res){
    try{
        const upload = multer().single("file")
        upload(req,res,function(err){
            if(err){
                res.status(500).send({error:"Error in file upload"})
            }else{
                const file=JSON.parse(req.file.buffer.toString());
                if(file.size<1024*1024*16){
                    const id=file.shelterId;
                    const fileId=new ObjectId();
                    const shelUpdate=SheltersToUpdate.filter(obj=>obj.shelter._id==id);
                    file._id=fileId;
                    file.new=true;
                    if(file.type==Files_Enum.File_Type.image){
                        const shelFiles=queryFilesByShelterId(id)
                        .then(files=>{
                            const images=files.filter(obj=>obj.type==Files_Enum.File_Type.image);
                            if(shelUpdate!=undefined&&shelUpdate.length>0){
                                if(images.length<maxImages&&(shelUpdate[0].files==undefined||images.length+shelUpdate[0].files.length<maxImages)){
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
                                if(images.length<maxImages){
                                    const newShelter:any={_id:id};
                                    SheltersToUpdate.push({watchDog:new Date(Date.now()),shelter:newShelter,files:[file]});
                                    res.status(200).send(fileId);
                                }else{
                                    res.status(500).send({error:"Max "+maxImages+" images"});
                                }
                            }
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
                                const newShelter:any={_id:id};
                                SheltersToUpdate.push({watchDog:new Date(Date.now()),shelter:newShelter,files:[file]});
                                res.status(200).send(fileId);
                            }
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
                            const newShelter:any={_id:id};
                            SheltersToUpdate.push({watchDog:new Date(Date.now()),shelter:newShelter,files:[file]});
                        }
                        res.status(200).send(fileId);
                    }
                }else{
                    res.status(500).send({error:"File size over limit"});
                }
            }
        });
    }catch(e){
        logger(e);
        res.status(500).send({error:"Error undefined"});
    }
});

fileRoute.route("/shelters/file/confirm/:fileId/:shelId")
.delete(function(req,res){
    const shelUpdate=SheltersToUpdate.filter(obj=>obj.shelter._id==req.params.shelId);
    if(shelUpdate!=undefined&&shelUpdate.length>0){
        let fileToDelete;
        if(shelUpdate[0].files){
            fileToDelete=shelUpdate[0].files.filter(f=>f._id==req.params.fileId);
        }else{
            shelUpdate[0].files=[];
        }
        if(fileToDelete!=undefined&&fileToDelete.length>0){
            shelUpdate[0].files.splice(shelUpdate[0].files.indexOf(fileToDelete[0]),1);
            delete(fileToDelete[0].data);
            fileToDelete[0].remove=true;
        }else{
            shelUpdate[0].files.push({_id:req.params.fileId,remove:true});
        }
        res.status(200).send(true);
    }else{
        const newShelter:any={};
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
        logger(err);
        res.status(500).send(err);
    })
})
.put(function(req,res){
    try{
        const updFile:IFile=req.body.file;  
        if(updFile){
            const shel = SheltersToUpdate.filter(obj=>obj.shelter._id&&(<any>obj.shelter._id)==updFile.shelterId)[0];
            if(shel!=undefined){
                const file = shel.files.filter(f=>f._id==req.params.id)[0];
                if(file!=undefined){
                    for(const prop in updFile){
                        file[prop]=updFile[prop];
                    }
                    file.update=true;
                }else{
                    const newF:any={};
                    for(const prop in updFile){
                        newF[prop]=updFile[prop];
                    }
                    newF.update=true;
                    shel.files.push(newF);
                }
            }else{
                const shelter:any={_id:updFile.shelterId};
                const newF:any={};
                for(const prop in updFile){
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
        logger(e);
        res.status(500).send({error:e});
    }
})
.delete(function(req,res){
    deleteFile(req.params.id)
    .then(()=>{
        res.status(200).send(true);
    })
    .catch(err=>{
        logger(err);
        res.status(500).send(err);
    });
});

fileRoute.route("/shelters/file/byshel/:id")
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
                for(let f of shel.files.filter(f=>f.type!=Files_Enum.File_Type.image)){
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

fileRoute.route("/shelters/image/byshel/:id")
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
                for(let f of shel.files.filter(f=>f.type==Files_Enum.File_Type.image)){
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
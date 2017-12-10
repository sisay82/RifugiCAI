import { Enums } from "../../src/app/shared/types/enums";
import * as express from "express";
import Auth_Permissions = Enums.Auth_Permissions;
import { logger,User_Data } from '../common';
import request = require('request');
import {PARSED_URL,APP_BASE_URL} from '../server';
import xmldom = require('xmldom');
import * as path from 'path';
const DOMParser = xmldom.DOMParser;

export const DISABLE_AUTH:boolean=false;

const OUT_DIR=path.join(__dirname,"../../dist");
const centralRole:String[]=["ROLE_RIFUGI_ADMIN"];
const regionalRoleName:String[]=["PGR"];
const sectionalRoleName:String[]=["ROLE_MEMBERS_VIEW","ROLE_MEMBERSHIP"/*,"Responsabile Esterno Sezione","Operatore Sezione Esteso"*/];
const casBaseUrl = "https://accesso.cai.it";
const authUrl = "https://services.cai.it/cai-integration-ws/secured/users/";
export const userList:User_Data[]=[];

function getChildByName(node:Node,name:String):Node{
    for(let i=0;i<node.childNodes.length;i++){
        if(node.childNodes.item(i).localName==name){
            return node.childNodes.item(i);
        }
        if(node.childNodes.item(i).hasChildNodes()){
            const n = getChildByName(node.childNodes.item(i),name);
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
            const n = getChildsByName(node.childNodes.item(i),name);
            if(n){
                nodes=nodes.concat(n);
            }
        }
    }
    return nodes;
}

function getTargetNodesByName(node:Node,name:String,target:String):Node[]{
    const nodes:Node[]=[];
    for(const n of getChildsByName(node,name)){
        const child=getChildByName(n,target);
        if(child){
            nodes.push(child);
        }        
    }
    return nodes;
}

function checkInclude(source:any[],target:any[],attribute):boolean{
    if(source){
        return source.reduce((ret,item)=>{
            if(target.find(obj=>obj.indexOf(item[attribute])>-1)){
                return true;
            }else{
                return ret;                
            }
        },false);
    }else{
        return false;        
    }
}

function getRole(data):Auth_Permissions.User_Type {
    if(data){
        if(checkInclude(data.aggregatedAuthorities,centralRole,"role")){
            return Auth_Permissions.User_Type.central;
        }else if(checkInclude(data.userGroups,regionalRoleName,"name")){
            return Auth_Permissions.User_Type.regional;
        }else if(checkInclude(data.aggregatedAuthorities,sectionalRoleName,"role")){
            return Auth_Permissions.User_Type.sectional;
        }else{
            return null;
        }
    }else{
        return null;
    }
}

function getCode(type:Auth_Permissions.User_Type,data):String{
    let code=null;
    if(type){
        if(type==Auth_Permissions.User_Type.sectional){
            if(data.sectionCode){
                code = data.sectionCode;
            }   
        }else{
            if(data.regionaleGroupCode){
                const tmpCode = data.regionaleGroupCode;
                if(tmpCode){
                    code = tmpCode.substr(0,2)+tmpCode.substr(5,2)+tmpCode.substr(2,3);                        
                }
            }
        }
    }
    return code;
}

function getUserPermissions(data):{role:Auth_Permissions.User_Type,code:String}{
    let role = getRole(data);
    const code = getCode(role,data);
    if(role==Auth_Permissions.User_Type.regional&&code.substr(0,2)=="93"){
        role=Auth_Permissions.User_Type.area;
    }
    return {role:role,code:code};
}

function checkUserPromise(uuid):Promise<{role:Auth_Permissions.User_Type,code:String}>{
    logger("CHECKUSER");
    return new Promise<{role:Auth_Permissions.User_Type,code:String}>((resolve,reject)=>{
        if(DISABLE_AUTH){
            resolve({role:Auth_Permissions.User_Type.superUser,code:"9999999"});
        }else{
            request.get({
                url:authUrl+uuid+'/full',
                method:"GET",
                headers:{
                    "Authorization":"Basic YXBwcmlmdWdpQGNhaS5pdDpiZXN1Z1U3UjJHdWc="
                },
            },function(err,response,body){
                try{
                    const data=JSON.parse(body);     
                    const user:{role:Auth_Permissions.User_Type,code:String}=getUserPermissions(data); 
                    
                    if(user.role){
                        if(user.code){
                            resolve(user);                                                  
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
        }
    });
}

function validationPromise(ticket):Promise<String>{
    return new Promise((resolve,reject)=>{
        if(DISABLE_AUTH){
            resolve(null)
        }else{
            request.get({
                url:casBaseUrl+"/cai-cas/serviceValidate?service="+PARSED_URL+"&ticket="+ticket,
                method:"GET"
            },function(err,response,body){
                if(err){
                    logger("Error in CAS request: "+err);
                    reject(err);
                }else{
                    const parser=new DOMParser({
                        locator:{},
                        errorHandler:{
                            warning:function(w){
                                reject(w);
                            }
                        }
                    });
                    const el:Document=parser.parseFromString(body,"text/xml");
                    if(el){
                        const doc=el.firstChild;
                        let res:boolean=false;
                        let user:String;
                        if(getChildByName(el,'authenticationSuccess')){
                            res=true;
                            user=getChildByName(el,'uuid').textContent;
                        }
                        if(res){
                            resolve(user);
                        }else{
                            reject({error:"Authentication error"});
                        }
                    }else{
                        reject({error:"Document parsing error"});
                    }
                }
            });
        }
    });
}

export const authRoute = express.Router();

authRoute.get('/logout',function(req,res){
    if(DISABLE_AUTH){
        res.redirect('/list');
    }else{
        const user=userList.findIndex(obj=>obj.id==req.session.id);
        logger("Logging out");
    
        if(user>-1){
            userList.splice(user,1);
        }
        res.redirect(casBaseUrl+"/cai-cas/logout");
    }
});

authRoute.get('/j_spring_cas_security_check',function(req,res){
    if(DISABLE_AUTH){
        res.redirect("/list");
    }else{
        const user=userList.find(obj=>obj.id==req.session.id);        
        if(user){
            user.ticket=req.query.ticket;
            res.redirect(user.resource.toString());
        }else{
            logger("Invalid user request");
            userList.push({id:req.session.id,resource:APP_BASE_URL,redirections:0,checked:false});
            res.redirect(casBaseUrl+"/cai-cas/login?service="+PARSED_URL);
        }
    }
});

authRoute.get('/user',function(req,res,next){
    if(DISABLE_AUTH){
        res.status(200).send({code:"9999999",role:Auth_Permissions.User_Type.superUser});
    }else{
        let user=userList.find(obj=>obj.id==req.session.id);
        logger("User permissions request (UUID): ",user.uuid);
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
            logger("User not logged");
            userList.push({id:req.session.id,resource:APP_BASE_URL+'/list',redirections:0,checked:false});
            res.redirect(casBaseUrl+"/cai-cas/login?service="+PARSED_URL);
        }
    }
})

authRoute.get('/',function(req,res,next){
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.redirect("/list");
});

authRoute.use(express.static(OUT_DIR));
  
authRoute.get('/*', function(req, res) {
    logger(req.method+" REQUEST: "+JSON.stringify(req.query));
    logger(req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    
    if(DISABLE_AUTH){
        res.sendFile(path.join(OUT_DIR + '/index.html'));
    }else{
        const user=userList.find(obj=>obj.id==req.session.id);
        if(!user){
            logger("User not logged");
            userList.push({id:req.session.id,resource:req.path,redirections:0,checked:false});
            res.redirect(casBaseUrl+"/cai-cas/login?service="+PARSED_URL);
        }else{
            if(user.ticket){
                logger("Checking ticket: ",user.ticket);
                validationPromise(user.ticket)
                .then((usr)=>{
                    logger("Valid ticket");
                    user.checked=true;            
                    user.redirections=0;
                    if(user.code==undefined||user.role==undefined){
                        user.uuid=usr;
                        checkUserPromise(usr)
                        .then(us=>{
                            logger("Access granted with role and code: ",Auth_Permissions.User_Type[us.role],us.code);
                            user.code=us.code;
                            user.role=us.role;
                            
                            res.sendFile(path.join(OUT_DIR + '/index.html'));                
                        })
                        .catch(()=>{
                            logger("Access denied");
                            res.sendFile(path.join(OUT_DIR + '/index.html'));
                        });
                    }else{
                        if(user.role){
                            logger("Access granted with role and code: ",user.role,user.code);
                            res.sendFile(path.join(OUT_DIR + '/index.html'));
                        }else{
                            res.sendFile(path.join(OUT_DIR + '/index.html'));
                        }
                    }
                })
                .catch((err)=>{
                    logger("Invalid ticket",err);
                    user.redirections++;
                    user.checked=false;
                    user.resource=req.path;
                    if(user.redirections>=3){
                        const index=userList.findIndex(obj=>obj.id==user.id);
                        userList.splice(index,1);
                        res.status(500).send(`Error, try logout <a href='`+casBaseUrl+"/cai-cas/logout"+`'>here</a> before try again.
                        <br>Error info:<br><br>`+err);
                    }else{
                        res.redirect(casBaseUrl+"/cai-cas/login?service="+PARSED_URL);                
                    }
                });
            }else{
                logger("Invalid user ticket");
                user.resource=req.path;
                user.redirections++;
                if(user.redirections>=3){
                    const index=userList.findIndex(obj=>obj.id==user.id);
                    userList.splice(index,1);
                    res.status(500).send("Error, try logout <a href='"+casBaseUrl+"/cai-cas/logout"+"'>here</a> before try again");
                }else{
                    res.redirect(casBaseUrl+"/cai-cas/login?service="+PARSED_URL);                
                }
            }
        }
    }
});
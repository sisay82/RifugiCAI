import path = require('path');
import session = require('express-session');
import xmldom = require('xmldom');
import request = require('request');
import express = require('express');
import bodyParser = require('body-parser');
import { Enums } from './src/app/shared/types/enums';
import querystring = require('querystring');

var DOMParser = xmldom.DOMParser;
var casBaseUrl = "https://prova.cai.it";
var authUrl = "http://prova.cai.it/cai-auth-ws/AuthService/getUserDataByUuid";
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

function getRole(node:Node):Enums.User_Type{
    for(let n of getTargetNodesByName(node,"aggregatedAuthorities","role")){
        if(n.textContent==centralRole){
            return Enums.User_Type.central;
        }
    }
    let userGroups=getChildByName(node,"userGroups");
    if(userGroups){
        let name=getChildByName(userGroups,"name");        
        if(name){
            if(name.textContent==regionalRoleName){
                return Enums.User_Type.regional;
            }else{
                if(name.textContent==sectionalPRoleName||name.textContent==sectionalURoleName){
                    return Enums.User_Type.sectional
                }else{
                    return null;
                }
            }
        }else{
            return null;
        }
    }else{
        return null;
    }
}

function validationPromise(ticket):Promise<String>{
    return new Promise((resolve,reject)=>{
        request.post({
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

function checkUserPromise(uuid):Promise<{role:Enums.User_Type,code:String}>{
    console.log("CHECKUSER");
    return new Promise<{role:Enums.User_Type,code:String}>((resolve,reject)=>{
        var post_data=`<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <n:getUserDataByUuid xmlns:n="http://service.core.ws.auth.cai.it/">
                    <arg0>`+uuid+`</arg0>
                </n:getUserDataByUuid>
            </soap:Body>
        </soap:Envelope>`;

        request.post({
            url:authUrl,
            method:"POST",
            headers:{
                "Content-Type":"text/xml"
            },
            body:post_data
        },function(err,response,body){
            var el:Node=(new DOMParser()).parseFromString(body,"text/xml");
            let role=getRole(el);
            let user:{role:Enums.User_Type,code:String}={role:null,code:null};
            user.role=role;
            if(!role){
                reject();
            }else{
                let code;
                if(role==Enums.User_Type.sectional){
                    let child=getChildByName(el,'sectionCode');
                    if(child){
                        code = getChildByName(el,'sectionCode').textContent;
                    }
                }else{
                    let child=getChildByName(el,'regionaleGroupCode');
                    if(child){
                        let tmpCode = child.textContent;
                        if(tmpCode){
                            code = tmpCode.substr(0,2)+tmpCode.substr(5,2)+tmpCode.substr(2,3);                        
                        }
                    }
                }
                if(code){
                    user.code=code;
                    resolve(user);                 
                }else{
                    reject();
                }
            }
        
        });
    });
}

app.use(bodyParser.urlencoded({
    extended: true
}),session({
    secret: '24e9v81i3ourgfhsd8i7vg1or3f5', // just a long random string
    resave: false,
    saveUninitialized: true
}));

var server = app.listen(portUrl,function(){
    let port = server.address().port;
    console.log("App now running on " + appBaseUrl);
});

app.get('/logout',function(req,res){
    let user=userList.findIndex(obj=>obj.id==req.session.id);
    console.log("Logging out");

    if(user>-1){
        userList.splice(user,1);
    }
    res.redirect(casBaseUrl+"/cai-cas/logout");
});

app.get('/j_spring_cas_security_check',function(req,res){
    let user=userList.find(obj=>obj.id==req.session.id);
    if(user){
        user.ticket=req.query.ticket;
        console.log("Got j spring request and redirect to: "+user.resource)
        res.redirect(user.resource);
    }else{
        console.log("Invalid user request");
        userList.push({id:req.session.id,resource:appBaseUrl,redirections:0,checked:false});
        res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);
    }
});

app.get('/user',function(req,res,next){
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

app.get('/',function(req,res,next){
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.redirect("/list");
});

app.use(express.static(__dirname + '/dist'));
  
app.get('/*', function(req, res) {
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
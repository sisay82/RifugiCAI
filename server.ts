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
var serverUrl = "localhost";
var portUrl=4200;
var appBaseUrl = "http://"+serverUrl+":"+portUrl;
var app = express();
var parsedUrl=encodeURIComponent(appBaseUrl+"/j_spring_cas_security_check");
var userList:{id:String,resource:String,ticket?:String,uuid?:String,code?:String,role?:Enums.User_Type}[]=[];

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

function validationPromise(ticket):Promise<{uuid:String,role:Enums.User_Type}>{
    return new Promise((resolve,reject)=>{
        request.post({
            url:casBaseUrl+"/cai-cas/serviceValidate?service="+parsedUrl+"&ticket="+ticket,
            method:"GET"
        },function(err,response,body){
            try {
                var el:Node=(new DOMParser()).parseFromString(body,"text/xml").firstChild;
                let res:boolean=false;
                let user:any={};
                if(getChildByName(el,'authenticationSuccess')){
                    res=true;
                    user.uuid=getChildByName(el,'uuid').textContent;
                    /**
                     * SET ROLE
                     */
                    //DEV
                    user.role=Enums.User_Type.sectional;
                    /** */
                }
                if(res){
                    resolve(user);
                }else{
                    reject(null);
                }
            } catch (e) {
                console.log(e);
                reject(null);
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

var server = app.listen(portUrl,serverUrl,function(){
    let port = server.address().port;
    console.log("App now running on " + appBaseUrl);
});

app.get('/logout',function(req,res){
    let user=userList.findIndex(obj=>obj.id==req.session.id);
    console.log("Logging out");
    //var parsedUrl=encodeURIComponent(appBaseUrl);
    if(user>-1){
        userList.splice(user,1);
    }
    res.redirect(casBaseUrl+"/cai-cas/logout?service="+parsedUrl);
});

app.get('/j_spring_cas_security_check',function(req,res){
    let user=userList.find(obj=>obj.id==req.session.id);
    if(user){
        user.ticket=req.query.ticket;
        res.redirect(user.resource);
    }else{
        console.log("Invalid user request");
        userList.push({id:req.session.id,resource:appBaseUrl});
        res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);
    }
});

app.get('/user',function(req,res,next){
    let user=userList.find(obj=>obj.id==req.session.id);
    console.log("User permissions request (UUID): ",user.uuid);    
    if(user!=undefined&&user.uuid!=undefined){
        if(user.code==undefined||user.role==undefined){
            var post_data=`<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <n:getUserDataByUuid xmlns:n="http://service.core.ws.auth.cai.it/">
                        <arg0>`+user.uuid+`</arg0>
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
                let code = getChildByName(el,'sectionCode').textContent;
                if(code){
                    user.code=code;
                    res.status(200).send({code:user.code,role:user.role});                    
                }else{
                    res.status(500).send({'error':'Error user request'});
                }
            });
        }else{
            res.status(200).send({code:user.code,role:user.role});
        }
    }else{
        console.log("User not logged");
        userList.push({id:req.session.id,resource:appBaseUrl+'/list'});
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
      userList.push({id:req.session.id,resource:req.path});
      res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);
    }else{
      if(user.ticket){
        console.log("Checking ticket: ",user.ticket);
        validationPromise(user.ticket)
        .then((usr)=>{
            console.log("Valid ticket");
            user.uuid=usr.uuid;
            user.role=usr.role;
            res.sendFile(path.join(__dirname + '/dist/index.html'));
        })
        .catch((err)=>{
            console.log("Invalid ticket");
            user.resource=req.path;
            res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);
        });
      }else{
        console.log("Invalid user ticket");
        user.resource=req.path;
        res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);
      }
    }
    
});
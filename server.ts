import path = require('path');
import https = require('https');
import session = require('express-session');
import xmldom = require('xmldom');
import express = require('express');

var DOMParser = xmldom.DOMParser;
var casBaseUrl = "https://prova.cai.it";
var appBaseUrl = "http://localhost:4200";
var app = express();
var parsedUrl=encodeURIComponent(appBaseUrl+"/j_spring_cas_security_check");
var userList:{id:String,resource:String,ticket?:String}[]=[];

function validationPromise(ticket):Promise<Node>{
    return new Promise((resolve,reject)=>{
        var options={
            host:"prova.cai.it",
            method:'GET',
            path:"/cai-cas/serviceValidate?service="+parsedUrl+"&ticket="+ticket
        }
        https.get(options,(res)=>{
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    var el:Node=(new DOMParser()).parseFromString(rawData,"text/html").firstChild;
                    let res:boolean=false;
                    console.log(rawData);
                    for(let i=0;i<el.childNodes.length;i++){
                        if(el.childNodes.item(i).localName){
                            if(el.childNodes.item(i).localName=="authenticationSuccess"){
                                res=true;
                            }
                        }
                    }
                    if(res){
                        resolve(el);
                    }else{
                        reject(null);
                    }
                } catch (e) {
                    reject(null);
                }
            });
        }).on('error',function(e){
            console.log(e);
            reject(null);
        });
    });
}

app.use(session({
    secret: '24e9v81i3ourgfhsd8i7vg1or3f5', // just a long random string
    resave: false,
    saveUninitialized: true
}));

var server = app.listen(process.env.PORT || 4200,function(){
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

app.get('/',function(req,res,next){
    console.log(req.method+" REQUEST: "+JSON.stringify(req.query));
    console.log(req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    //res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    
    let user=userList.find(obj=>obj.id==req.session.id);
    if(!user){
      console.log("User not logged");
      userList.push({id:req.session.id,resource:"/list"});
      res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);
    }else{
      if(user.ticket){
        console.log("Checking ticket");
        console.log(user.ticket);
        validationPromise(user.ticket)
        .then((response)=>{
            console.log("Valid ticket");
            next();
            
        })
        .catch((err)=>{
            console.log("Invalid ticket");
            let userIndex=userList.findIndex(obj=>obj.id==user.id);
            if(userIndex>-1){
                userList.splice(userIndex,1);
            }
            res.redirect(casBaseUrl+"/cai-cas/logout?service="+parsedUrl);
          //res.redirect(casBaseUrl+"/login?service="+parsedUrl);
        });
      }else{
        console.log("Invalid user ticket");
        let userIndex=this.userList.findIndex(obj=>obj.id==user.id);
        if(userIndex>-1){
            userList.splice(userIndex,1);
        }
        res.redirect(casBaseUrl+"/cai-cas/logout?service="+parsedUrl);
        //res.redirect(casBaseUrl+"/login?service="+parsedUrl);
      }
    }
})

app.use(express.static(__dirname + '/dist'));
  
app.get('/*', function(req, res) {
    console.log(req.method+" REQUEST: "+JSON.stringify(req.query));
    console.log(req.path);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    //res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    
    let user=userList.find(obj=>obj.id==req.session.id);
    if(!user){
      console.log("User not logged");
      userList.push({id:req.session.id,resource:req.path});
      res.redirect(casBaseUrl+"/cai-cas/login?service="+parsedUrl);
    }else{
      if(user.ticket){
        console.log("Checking ticket");
        console.log(user.ticket);
        validationPromise(user.ticket)
        .then((response)=>{
            console.log("Valid ticket");
            res.sendFile(path.join(__dirname + '/dist/index.html'));
            
        })
        .catch((err)=>{
            console.log("Invalid ticket");
            let userIndex=userList.findIndex(obj=>obj.id==user.id);
            if(userIndex>-1){
                userList.splice(userIndex,1);
            }
            res.redirect(casBaseUrl+"/cai-cas/logout?service="+parsedUrl);
          //res.redirect(casBaseUrl+"/login?service="+parsedUrl);
        });
      }else{
        console.log("Invalid user ticket");
        let userIndex=this.userList.findIndex(obj=>obj.id==user.id);
        if(userIndex>-1){
            userList.splice(userIndex,1);
        }
        res.redirect(casBaseUrl+"/cai-cas/logout?service="+parsedUrl);
        //res.redirect(casBaseUrl+"/login?service="+parsedUrl);
      }
    }
    
});
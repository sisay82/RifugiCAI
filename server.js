const express = require('express');
const path = require('path');
const http = require('http');
const session = require('express-session');
var casBaseUrl = "https://prova.cai.it/cai-cas";
var appBaseUrl = "http://localhost:4200";
const app = express();

var userList=[];
// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + '/dist'),session({
  secret: '327v9gdsyb32jec0s8aduicvb4', // just a long random string
  resave: false,
  saveUninitialized: true
}));
// Start the app by listening on the default
// Heroku port
var server = app.listen(process.env.PORT || 4200,function(){
  var port = server.address().port;
  console.log("App now running on port", port);
});

function validationPromise(url,ticket){
  return new Promise((resolve,reject)=>{
    http.get(casBaseUrl+"/serviceValidate?service="+url+"&ticket"+ticket,(res)=>{
      if(!res){
        reject();
      }else{
        resolve();
      }
    });
  });
}

app.get('/*/j_spring_cas_security_check',function(req,res){
  console.log("Session ID: "+req.session.id);
  console.log(req.method+" REQUEST: "+JSON.stringify(req.query));
  console.log(req.path);
  let user=userList.find(obj=>obj.id==req.session.id);
  if(req.query.ticket!=undefined){
    if(user!=undefined){
      user.logged=true;
      user.ticket=req.query.ticket;
      /*validationPromise(parsedUrl,user.ticket)
      .then(()=>{
        res.status(200).location(appBaseUrl+user.resource);
      })
      .catch(()=>{
        user.logged=false;
        res.status(302).location(casBaseUrl+"/login?service="+parsedUrl);
      });*/
      res.end();
    }else{
      res.status(500).send({err:"No user info found"});
    }
  }else{
    res.status(500).send({err:"No user info found"});
  }
});

app.get('/*', function(req, res) {
  console.log("Session ID: "+req.session.id);
  console.log(req.method+" REQUEST: "+JSON.stringify(req.query));
  console.log(req.path);
  let user=userList.find(obj=>obj.id==req.session.id);
  if(user==undefined||!user.logged){
    console.log("User not logged");
    var parsedUrl=encodeURIComponent(appBaseUrl+req.path);
    userList.push({id:req.session.id,resource:req.path,logged:false});
    res.status(302).location(casBaseUrl+"/login?service="+parsedUrl);
  }else{
    var parsedUrl=encodeURIComponent(appBaseUrl+req.path);
    validationPromise(parsedUrl,user.ticket)
    .then(()=>{
      res.sendFile(path.join(__dirname + '/dist/index.html'));
    })
    .catch(()=>{
      user.logged=false;
      res.status(302).location(casBaseUrl+"/login?service="+parsedUrl);
    });
    
  //  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  //  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // res.header('Access-Control-Allow-Origin', '*');
  // res.setHeader('content-type', 'text/html; charset=utf-8');

  }
});


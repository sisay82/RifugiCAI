const express = require('express');
const path = require('path');
const https = require('https');
const session = require('express-session');
var casBaseUrl = "https://prova.cai.it/cai-cas";
var appBaseUrl = "http://localhost:4200";
const app = express();
const DOMParser = require('xmldom').DOMParser;

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
var server = app.listen(process.env.PORT || 4200,"localhost",function(){
  var port = server.address().port;
  appBaseUrl="http://"+server.address().address+":"+port;
  console.log("App now running on " + appBaseUrl);
});

function validationPromise(ticket){
  var url = parsedUrl=encodeURIComponent(appBaseUrl+"/j_spring_cas_security_check")
  return new Promise((resolve,reject)=>{
    https.get(casBaseUrl+"/serviceValidate?service="+url+"&ticket="+ticket,(res)=>{
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          var el=(new DOMParser()).parseFromString(rawData,"text/html").firstChild;
          for(let i=0;i<el.childNodes.length;i++){
            if(el.childNodes.item(i).localName){
              if(el.childNodes.item(i).localName=="authenticationSuccess"){
                resolve(el);
              }
              if(el.childNodes.item(i).localName=="authenticationFailure"){
                reject(null);
              }
            }
          }
          reject(null);
        } catch (e) {
          reject(null);
        }
      });
    }).on('error',function(e){
      reject(null);
    });
  });
}

app.get('/logout',function(req,res){
  let user=userList.findIndex(obj=>obj.id==req.session.id);
  console.log("Logging out");
  var parsedUrl=encodeURIComponent(appBaseUrl);
  if(user>-1){
    userList.splice(user,1);
  }
  res.redirect(casBaseUrl+"/logout?service="+parsedUrl);
});

app.get('/j_spring_cas_security_check',function(req,res){
  let user=userList.find(obj=>obj.id==req.session.id);
  var parsedUrl=encodeURIComponent(appBaseUrl);
  if(user){
    /*console.log("Checking ticket: "+req.query.ticket);
    validationPromise(parsedUrl,req.query.ticket)
    .then((response)=>{
      console.log("Valid Ticket");
      user.ticket=req.query.ticket;
      res.redirect(user.resource);
    })
    .catch((err)=>{
      console.log("Invalid Ticket");
      res.redirect(casBaseUrl+"/login?service="+parsedUrl);
    });*/
    user.ticket=req.query.ticket;
    res.redirect(user.resource);
  }else{
    console.log("Invalid user request");
    userList.push({id:req.session.id,resource:req.path});
    res.redirect('/logout');
    res.redirect(casBaseUrl+"/login?service="+parsedUrl);
  }
});

app.get('/*', function(req, res) {
  console.log("Session ID: "+req.session.id);
  console.log(req.method+" REQUEST: "+JSON.stringify(req.query));
  console.log(req.path);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  //res.header('Access-Control-Allow-Origin', '*');
  res.setHeader('content-type', 'text/html; charset=utf-8');
  let user=userList.find(obj=>obj.id==req.session.id);
  var parsedUrl=encodeURIComponent(appBaseUrl+"/j_spring_cas_security_check");
  if(!user){
    console.log("User not logged");
    userList.push({id:req.session.id,resource:req.path});
    res.redirect(casBaseUrl+"/login?service="+parsedUrl);
  }else{
    if(user.ticket){
      console.log("Checking user");
      console.log(user.ticket);
      validationPromise(user.ticket)
      .then((response)=>{
        console.log("User authenticated");
        res.sendFile(path.join(__dirname + '/dist/index.html'));
        //res.redirect(user.request);
      })
      .catch((err)=>{
        console.log("Invalid user");
        user.resource=req.path;
        res.redirect(casBaseUrl+"/login?service="+parsedUrl);
      });
    }else{
      console.log("Invalid user ticket");
      res.redirect(casBaseUrl+"/login?service="+parsedUrl);
    }
  }
  
});


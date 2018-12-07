var fs = require('fs'); 
var https = require('https'); 
var http = require('http'); 
var request=require('request');



var options = { 
    hostname: 'server.citypay.org.ua', 
 //   hostname: '192.168.10.27', 
    port: 9919, 
   // headers: {"Content-Type": "application/json"},
    path: '/api/v1/account/getBLANK2016/1071055063', 
    method: 'GET', 
    key: fs.readFileSync('./cert/userB.key'), 
    cert: fs.readFileSync('./cert/userB.crt'),
    ca: fs.readFileSync('./cert/ca.crt'),
    requestCert: true,                   
    rejectUnauthorized: false,
 }; 

 request.get('https://'+options.hostname+':'+options.port+options.path, options, function(err,res,body){
        
  if(err){ console.log(err)} else {console.log(body)} //TODO: handle err
 // if(res.statusCode !== 200 ) //etc

});

 /*client.get('http://'+options.hostname+':'+options.port+options.path,  function (data, response) {
    // parsed response body as js object
    console.log(data);
    // raw response
    //console.log(response);
});*/



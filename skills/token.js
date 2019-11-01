var request = require("request");
var fs = require('fs');
var a = "";
var token = "";
var options = { 
  method: 'POST',
  url: 'https://login.microsoftonline.com/c990bb7a-51f4-439b-bd36-9c07fb1041c0/oauth2/token',
  headers: 
   { 'cache-control': 'no-cache',
     Connection: 'keep-alive',
     Cookie: 'x-ms-gateway-slice=prod; stsservicecookie=ests; fpc=Ag-uScbRN1lLgIIZnM5DN6ieRkyGAgAAAGxVLNUOAAAA',
     'Content-Length': '215',
     'Accept-Encoding': 'gzip, deflate',
     Host: 'login.microsoftonline.com',
     'Postman-Token': '71695bc8-dc8f-4f7c-9ebc-8ea06f697840,eed1cdb6-6786-4594-af25-fa80c0c1fd3b',
     'Cache-Control': 'no-cache',
     Accept: '*/*',
     'User-Agent': 'PostmanRuntime/7.17.1',
     'Content-Type': 'application/x-www-form-urlencoded' },
  form: 
   { grant_type: 'client_credentials',
     client_id: '11e483e9-f160-4a2c-a927-9f612b286962',
     redirect_uri: 'http://localhost:3000',
     resource: 'https://api.loganalytics.io',
     client_secret: 'Bc]OB8]4LfmLqOdDu0z:oI1lIjgD.Lft' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  var len = body.length;
  var start = body.indexOf("access_token");
  token = body.substring(start+15,len-2);
  fs.writeFile('token.txt', token, function(err) {
        if (err) {
			console.log("error in buffering token.");
        }
    });   
});

function get_token(){
	var token = fs.readFileSync('token.txt');
	output = token.toString();
	return output;
}

module.exports = {
 get_token
}
	
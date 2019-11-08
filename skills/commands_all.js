/*********************************************************************

READ ME
@Yangkai
Please keep the comments and organization 

TO-DOs
- Alerts: Shift in Latency, saturation, traffic, etc.
- Reports
  - https://botkit.ai/docs/v0/storage.html
  - https://www.npmjs.com/package/node-schedule
- Add more help commands - double check reports/hits for most/least called operations

**********************************************************************/

/*********************************************************************************
                          AJAX LOG ANALYTICS API CALLS
**********************************************************************************/
var request = require("request");
var options = {
  method: "POST",
  url:
    "https://login.microsoftonline.com/c990bb7a-51f4-439b-bd36-9c07fb1041c0/oauth2/token",
  headers: {
    "cache-control": "no-cache",
    Connection: "keep-alive",
    Cookie:
      "x-ms-gateway-slice=prod; stsservicecookie=ests; fpc=Ag-uScbRN1lLgIIZnM5DN6ieRkyGAgAAAGxVLNUOAAAA",
    "Content-Length": "215",
    "Accept-Encoding": "gzip, deflate",
    Host: "login.microsoftonline.com",
    "Postman-Token":
      "71695bc8-dc8f-4f7c-9ebc-8ea06f697840,eed1cdb6-6786-4594-af25-fa80c0c1fd3b",
    "Cache-Control": "no-cache",
    Accept: "*/*",
    "User-Agent": "PostmanRuntime/7.17.1",
    "Content-Type": "application/x-www-form-urlencoded"
  },
  form: {
    grant_type: "client_credentials",
    client_id: "11e483e9-f160-4a2c-a927-9f612b286962",
    redirect_uri: "http://localhost:3000",
    resource: "https://api.loganalytics.io",
    client_secret: "Bc]OB8]4LfmLqOdDu0z:oI1lIjgD.Lft"
  }
};

var timeout;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = new JSDOM("<script></script>").window;
global.document = document;
var $ = (jQuery = require("jquery")(window));

// Checks to see if any data was returned from the AJAX call.
// If no data was returned, an error message is returned
// If the first data value is an empty string, the function will get the data from the next row
function checkResult(result, row_num, is_unit = false) {
  try {
    var r = result["tables"][0]["rows"][0][row_num];
    if (r === "") {
      r = result["tables"][0]["rows"][1][row_num];
    }
  } catch (err) {
    var r = "not available right now because no data was found.";
  }
  if (is_unit === true) {
    r = appendUnit(r);
  }
  console.log(r);
  return r;
}

// Adds ms to a string if a value is associated with the string
function appendUnit(string) {
  if (string != "not available right now because no data was found.") {
    string += " ms.";
  }
  return string;
}

function increaseOrDecrease(one, two) {
  if (one > two) {
    return "decreased";
  } else {
    return "increased";
  }
}

// Formats the product usage data into a human-readable form
function formatProductUsage(result, product = null) {
  var date_index = 0;
  var count_index = 1;
  if (product != null) {
    date_index++;
    count_index++;
  }

  var week_4_count = result["tables"][0]["rows"][1][count_index]; // Most recent week
  var week_3_count = result["tables"][0]["rows"][2][count_index];
  var week_2_count = result["tables"][0]["rows"][3][count_index];
  var week_1_count = result["tables"][0]["rows"][4][count_index]; // Least recent week

  var week_4_date = result["tables"][0]["rows"][1][date_index]; // Most recent week
  var week_3_date = result["tables"][0]["rows"][2][date_index];
  var week_2_date = result["tables"][0]["rows"][3][date_index];
  var week_1_date = result["tables"][0]["rows"][4][date_index]; // Least recent week

  if (product == "trusted-services") {
    var message =
      "Here is a summary of product usage for 'trusted-services' over the past 4 weeks: \n";
  } else if (product == "trusted-consumer") {
    var message =
      "Here is a summary of product usage for 'trusted-consumer' over the past 4 weeks: \n";
  } else {
    var message =
      "Here is a summary of product usage for all products over the past 4 weeks: \n";
  }

  message +=
    "- For the week of " +
    week_1_date +
    ", there were " +
    week_1_count +
    " hits.\n";
  message +=
    "- For the week of " +
    week_2_date +
    ", the number of hits " +
    increaseOrDecrease(week_1_count, week_2_count) +
    " to " +
    week_2_count +
    " hits.\n";
  message +=
    "- For the week of " +
    week_3_date +
    ", the number of hits " +
    increaseOrDecrease(week_2_count, week_3_count) +
    " to " +
    week_3_count +
    " hits.\n";
  message +=
    "- For the week of " +
    week_4_date +
    ", the number of hits " +
    increaseOrDecrease(week_3_count, week_4_count) +
    " to " +
    week_4_count +
    " hits.\n";

  return message;
}

/*********************************************************************************
                              FUZZY STRING STUFF
**********************************************************************************/
var fuzzyset = require("./fuzzyset.js-master/lib/fuzzyset.js");
var all_commands = [];

/////////////////////////
//    Basic Commands
/////////////////////////

// Hello
var hellos = [
  "hello",
  "hey",
  "hi",
  "good morning",
  "good afternoon",
  "good evening",
  "to meet you",
  "yo"
];
all_commands = all_commands.concat(hellos);

// Help
var helps = ["help", "aid", "assist", "support", "advise", "instructions"];
all_commands = all_commands.concat(helps);
var commands = [
  "What is my least called API?",
  "What is my most called API?",
  "What are my least 5 called APIs?",
  "What are my top 5 called APIs?",
  "What is my least called operation [for {product_name | api_name}]?",
  "What is my most called operation [for {product_name | api_name}]?",
  "What are my least 5 called operations?",
  "What are my top 5 called operations?",
  "What is the average response time for {operation_name} [of the API {api_name}]?",
  "How is my product usage trending week over week [for {product_name}]?"
];

// Thank you
var thankyous = ["thank", "appreciate"];
all_commands = all_commands.concat(thankyous);

// Goodbye
var goodbyes = [
  "see you",
  "bye",
  "goodbye",
  "farewell",
  "have a good",
  "take care",
  "see ya",
  "later",
  "peace"
];
all_commands = all_commands.concat(goodbyes);

/////////////////////////
//       APIs
/////////////////////////

// Least called API
var least_called_api = [
  "least called API",
  "least called application programming interface",
  "What is my least called API?",
  "What is my least called application programming interface?"
];
all_commands = all_commands.concat(least_called_api);

// 5 Least called APIs
var least_called_apis = [
  "least 5 called API",
  "least five called API",
  "least 5 called application programming interface",
  "least five called application programming interface",
  "5 least called api",
  "five least called api",
  "What are my least 5 called APIs?",
  "What are my least 5 called application programming interfaces?",
  "What are my least five called APIs?",
  "What are my least five called application programming interfaces?",
  "What are my 5 least called APIs?",
  "What are my 5 least called application programming interfaces?",
  "What are my five least called APIs?",
  "What are my five least called application programming interfaces?",
  "5 least called API",
  "five least called API",
  "5 least called application programming interface",
  "five least five called application programming interface",
  "5 least called api",
  "five least called api",
  "What are my 5 least called APIs?",
  "What are my 5 least called application programming interfaces?"
];
all_commands = all_commands.concat(least_called_apis);

// most called API
var most_called_api = [
  "most called API",
  "most called application programming interface",
  "What is my most called API?",
  "What is my most called application programming interface?",
  "top called API",
  "top called application programming interface",
  "What is my top called API?",
  "What is my top called application programming interface?"
];
all_commands = all_commands.concat(most_called_api);

// 5 most called APIs
var most_called_apis = [
  "most 5 called API",
  "most five called API",
  "most 5 called application programming interface",
  "most five called application programming interface",
  "top 5 API",
  "top 5 called API",
  "top 5 called application programming interface",
  "top 5 called called application programming interface",
  "What are my top 5 called APIs?",
  "What are my top 5 called application programming interfaces?",
  "What are my top five called APIs?",
  "What are my top five called application programming interfaces?",
  "What are my 5 top called APIs?",
  "What are my 5 top called application programming interfaces?",
  "What are my five top called APIs?",
  "What are my five top called application programming interfaces?",
  "What are my most 5 called APIs?",
  "What are my most 5 called application programming interfaces?",
  "What are my most five called APIs?",
  "What are my most five called application programming interfaces?",
  "What are my 5 most called APIs?",
  "What are my 5 most called application programming interfaces?",
  "What are my five most called APIs?",
  "What are my five most called application programming interfaces?"
];
all_commands = all_commands.concat(most_called_apis);

/////////////////////////
//      Operations
/////////////////////////

// Least called operation
var least_called_operation = [
  "least called operation",
  "What is my least called operation?"
];
all_commands = all_commands.concat(least_called_operation);

// least called operation for 'sessions'
var least_called_operation_sessions = [
  "least called operation for sessions",
  "What is my least called operation for sessions?"
];
all_commands = all_commands.concat(least_called_operation_sessions);

// least called operation for 'vehicles'
var least_called_operation_vehicles = [
  "least called operation for vehicles",
  "What is my least called operation for vehicles?"
];
all_commands = all_commands.concat(least_called_operation_vehicles);

// least called operation for 'client-gateway-users'
var least_called_operation_cgu = [
  "least called operation for client-gateway-users",
  "What is my least called operation for client-gateway-users?"
];
all_commands = all_commands.concat(least_called_operation_cgu);

// least called operation for 'trusted-consumer'
var least_called_operation_tc = [
  "least called operation for trusted-consumer",
  "What is my least called operation for trusted-consumer?"
];
all_commands = all_commands.concat(least_called_operation_tc);

// least called operation for 'trusted-services'
var least_called_operation_ts = [
  "least called operation for trusted-services",
  "What is my least called operation for trusted-services?"
];
all_commands = all_commands.concat(least_called_operation_ts);

// 5 Least called operations
var least_called_operations = [
  "least 5 called operation",
  "least five called operation",
  "What are my least 5 called operations?",
  "What are my least five called operations?",
  "5 least called operation",
  "five least called operation",
  "What are my 5 least called operations?",
  "What are my five least called operations?"
];
all_commands = all_commands.concat(least_called_operations);

// Most called operation
var most_called_operation = [
  "most called operation",
  "top called operation",
  "What is my most called operation?",
  "What is my top called operation?"
];
all_commands = all_commands.concat(most_called_operation);

// Most called operation for 'sessions'
var most_called_operation_sessions = [
  "top called operation for sessions",
  "most called operation for sessions",
  "What is my top called operation for sessions?",
  "What is my most called operation for sessions?"
];
all_commands = all_commands.concat(most_called_operation_sessions);

// Most called operation for 'vehicles'
var most_called_operation_vehicles = [
  "top called operation for vehicles",
  "most called operation for vehicles",
  "What is my top called operation for vehicles?",
  "What is my most called operation for vehicles?"
];
all_commands = all_commands.concat(most_called_operation_vehicles);

// Most called operation for 'client-gateway-users'
var most_called_operation_cgu = [
  "top called operation for client-gateway-users",
  "most called operation for client-gateway-users",
  "What is my top called operation for client-gateway-users?",
  "What is my most called operation for client-gateway-users?"
];
all_commands = all_commands.concat(most_called_operation_cgu);

// Most called operation for 'trusted-consumer'
var most_called_operation_tc = [
  "top called operation for trusted-consumer",
  "most called operation for trusted-consumer",
  "What is my top called operation for trusted-consumer?",
  "What is my most called operation for trusted-consumer?"
];
all_commands = all_commands.concat(most_called_operation_tc);

// Most called operation for 'trusted-services'
var most_called_operation_ts = [
  "top called operation for trusted-services",
  "most called operation for trusted-services",
  "What is my top called operation for trusted-services?",
  "What is my most called operation for trusted-services?"
];
all_commands = all_commands.concat(most_called_operation_ts);

// 5 Most called operations
var most_called_operations = [
  "5 most called operation",
  "five most called operation",
  "What are my top 5 called operations?",
  "What are my least five called operations?",
  "What are my most 5 called operations?",
  "What are my most five called operations?",
  "5 top called operation",
  "five top called operation",
  "most 5 called operations"
];
all_commands = all_commands.concat(most_called_operations);

/////////////////////////
// Average Response Time
/////////////////////////

// Average response time for the operation 'GetVehicle'
var avg_response_time_gv = [
  "average response time for GetVehicle",
  "What is the average response time for GetVehicle?"
];
all_commands = all_commands.concat(avg_response_time_gv);

// Average response time for the operation 'GetVehicle' of the API, 'sessions'
var avg_response_time_gv_sessions = [
  "average response time for the operation GetVehicle of the API sessions",
  "What is the average response time for GetVehicle of the API sessions?"
];
all_commands = all_commands.concat(avg_response_time_gv_sessions);

// Average response time for the operation 'GetVehicle' of the API, 'client-gateway-users'
var avg_response_time_gv_cgu = [
  "average response time for the operation GetVehicle of the API client-gateway-users",
  "What is the average response time for GetVehicle of the API client-gateway-users?"
];
all_commands = all_commands.concat(avg_response_time_gv_cgu);

// Average response time for the operation 'GetVehicle' of the API, 'vehicles'
var avg_response_time_gv_v = [
  "average response time for the operation GetVehicle of the API vehicles",
  "What is the average response time for GetVehicle of the API vehicles?"
];
all_commands = all_commands.concat(avg_response_time_gv_v);

// Average response time for the operation 'GetAuthorizationStatus'
var avg_response_time_gas = [
  "average response time for GetAuthorizationStatus",
  "What is the average response time for GetAuthorizationStatus?"
];
all_commands = all_commands.concat(avg_response_time_gas);

// Average response time for the operation 'GetAuthorizationStatus' of the API, 'sessions'
var avg_response_time_gas_sessions = [
  "average response time for GetAuthorizationStatus of the API sessions",
  "What is the average response time for GetAuthorizationStatus of the API sessions?"
];
all_commands = all_commands.concat(avg_response_time_gas_sessions);

// Average response time for the operation 'GetAuthorizationStatus' of the API, 'client-gateway-users'
var avg_response_time_gas_cgu = [
  "average response time for GetAuthorizationStatus of the API client-gateway-users",
  "What is the average response time for GetAuthorizationStatus of the API client-gateway-users?"
];
all_commands = all_commands.concat(avg_response_time_gas_cgu);

// Average response time for the operation 'GetAuthorizationStatus' of the API, 'vehicles'
var avg_response_time_gas_v = [
  "average response time for GetAuthorizationStatus of the API vehicles",
  "What is the average response time for GetAuthorizationStatus of the API vehicles?"
];
all_commands = all_commands.concat(avg_response_time_gas_v);

// Average response time for the operation 'GetUserProfile'
var avg_response_time_gup = [
  "average response time for GetUserProfile",
  "What is the average response time for GetUserProfile?"
];
all_commands = all_commands.concat(avg_response_time_gup);

// Average response time for the operation 'GetUserProfile' of the API, 'sessions'
var avg_response_time_gup_sessions = [
  "average response time for GetUserProfile of the API sessions",
  "What is the average response time for GetUserProfile of the API sessions?"
];
all_commands = all_commands.concat(avg_response_time_gup_sessions);

// Average response time for the operation 'GetUserProfile' of the API, 'client-gateway-users'
var avg_response_time_gup_cgu = [
  "average response time for tGetUserProfile of the API client-gateway-users",
  "What is the average response time for GetUserProfile of the API client-gateway-users?"
];
all_commands = all_commands.concat(avg_response_time_gup_cgu);

// Average response time for the operation 'GetUserProfile' of the API, 'vehicles'
var avg_response_time_gup_v = [
  "average response time for GetUserProfile of the API vehicles",
  "What is the average response time for GetUserProfile of the API vehicles?"
];
all_commands = all_commands.concat(avg_response_time_gup_v);

// Average response time for the operation 'GetSecurityQuestions'
var avg_response_time_gsq = [
  "average response time for GetSecurityQuestions",
  "What is the average response time for GetSecurityQuestions?"
];
all_commands = all_commands.concat(avg_response_time_gsq);

// Average response time for the operation 'GetSecurityQuestions' of the API, 'sessions'
var avg_response_time_gsq_sessions = [
  "average response time for GetSecurityQuestions of the API sessions",
  "What is the average response time for GetSecurityQuestions of the API sessions?"
];
all_commands = all_commands.concat(avg_response_time_gsq_sessions);

// Average response time for the operation 'GetSecurityQuestions' of the API, 'client-gateway-users'
var avg_response_time_gsq_cgu = [
  "average response time for GetSecurityQuestions of the API client-gateway-users",
  "What is the average response time for GetSecurityQuestions of the API client-gateway-users?"
];
all_commands = all_commands.concat(avg_response_time_gsq_cgu);

// Average response time for the operation 'GetSecurityQuestions' of the API, 'vehicles'
var avg_response_time_gsq_v = [
  "average response time for GetSecurityQuestions of the API vehicles",
  "What is the average response time for GetSecurityQuestions of the API vehicles?"
];
all_commands = all_commands.concat(avg_response_time_gsq_v);

// Average response time for the operation 'Login'
var avg_response_time_l = [
  "average response time for Login",
  "What is the average response time for Login?"
];
all_commands = all_commands.concat(avg_response_time_l);

// Average response time for the operation 'Login' of the API, 'sessions'
var avg_response_time_l_sessions = [
  "average response time for Login of the API sessions",
  "What is the average response time for Login of the API sessions?"
];
all_commands = all_commands.concat(avg_response_time_l_sessions);

// Average response time for the operation 'Login' of the API, 'client-gateway-users'
var avg_response_time_l_cgu = [
  "average response time for Login of the API client-gateway-users",
  "What is the average response time for Login of the API client-gateway-users?"
];
all_commands = all_commands.concat(avg_response_time_l_cgu);

// Average response time for the operation 'Login' of the API, 'vehicles'
var avg_response_time_l_v = [
  "average response time for Login of the API vehicles",
  "What is the average response time for Login of the API vehicles?"
];
all_commands = all_commands.concat(avg_response_time_l_v);

/////////////////////////
//     Product Usage
/////////////////////////

// How is my product usage trending week over week [for {product_name}]
var product_usage = [
  "How is my product usage trending week over week?",
  "What is my product usage like week over week?",
  "How is my product usage trending over the past month?",
  "What is my product usage like over the past month?"
];
all_commands = all_commands.concat(product_usage);

// How is my product usage trending week over week for 'trusted-consumer'
var product_usage_tc = [
  "How is my product usage trending week over week for trusted-consumer?",
  "What is my product usage like week over week for trusted-consumer?",
  "How is my product usage trending over the past month for trusted-consumer?",
  "What is my product usage like over the past month for trusted-consumer?",
  "How is my product usage for trusted-consumer trending over the past month?",
  "What is my product usage for trusted-consumer like over the past month?"
];
all_commands = all_commands.concat(product_usage_tc);

// How is my product usage trending week over week for 'trusted-services'
var product_usage_ts = [
  "How is my product usage trending week over week for trusted-services?",
  "What is my product usage like week over week for trusted-services?",
  "How is my product usage trending over the past month for trusted-services?",
  "What is my product usage like over the past month for trusted-services?",
  "How is my product usage for trusted-services trending over the past month?",
  "What is my product usage for trusted-services like over the past month?"
];
all_commands = all_commands.concat(product_usage_ts);

/////////////////////////
//    Traffic Shift (Alerts)
/////////////////////////

var traffic_shift = [
  "How is my traffic",
  "traffic",
  "requests",
  "How is my traffic shift",
  "what is the shift of my traffic"
];
all_commands = all_commands.concat(traffic_shift);

/////////////////////////
//    Reports
/////////////////////////

var reports = [
  "Report",
  "Reports",
  "Report for the past 28 days",
  "Reports for the past 4 weeks",
  "Reports for the past month"
];
all_commands = all_commands.concat(reports);

// fuzzy gets all commands above
var fuzzy = fuzzyset(all_commands);

var result1 = "", result2 = "", result3 = "", result4 = "", result5 = "", result6 = "", 
    result7 = "", result8 = "", result9 = "", result10 = "", result11 = "", result12 = "",
    result13 = "", result14 = "", result15 = "", result16 = "", result17 = "", result18 = "",
    result19 = "", result20 = "", result21 = "", result22 ="", result23 = "", result24 = "",
    result25 = "", result26 = "", result27 = "", result28 ="", result29 = "", result30 = "",
    result31 = "", result32 = "", result33 = "", result34 ="", result35 = "", result36 = "",
    result37 = "", result38 = "", result39 = "", result40 ="", result41 = "", result42 = "",
    result43 = "", result44 = "", result45 = "", result46 = "", result47 = "", result48 = "";   
var newresult = "",
    oldresult = "",
    newresult2 = "",
    oldresult2 = "",
    newresult3 = "",
    oldresult3 = "",
    newresult1 = "",
    oldresult1 = "",
    newresult4 = "",
    oldresult4 = "";

/*********************************************************************************
                                    CHATBOT
**********************************************************************************/
module.exports = function(controller) {
  controller.hears(
    ".*",
    "direct_message,direct_mention",
    async (bot, message) => {
      "use strict";

      request(options, function(error, response, body) {
        //using request function to get the token and use it for all queries
        if (error) throw new Error(error);
        var len = body.length;
        var start = body.indexOf("access_token");
        var token = body.substring(start + 15, len - 2);
        console.log("token using:" + token);
        var settings = {
          async: true,
          crossDomain: true,
          url:
            "https://api.loganalytics.io/v1/workspaces/188e060f-1491-4080-acee-d92acbff84f3/query",
          type: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
            "Postman-Token":
              "cef60051-9b20-4953-a83f-3da83fee0fd2,1499eec5-079a-4aab-aef5-6190439ece14"
          },
          processData: false,
          timeout: 100000
        };

        /////////////////////////
        //       APIs
        /////////////////////////

        // Least called API
        settings.data =
          "{ \r\n\t\"query\": \"let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) and apiId_s != 'apim-availability-test' and apiId_s != 'tyler-test' | top 2 by count_ asc;\", \"timespan\": \"PT24H\"\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result1 = checkResult(response, 1);
        });

        // 5 Least called APIs
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) and apiId_s != 'apim-availability-test' and apiId_s != 'tyler-test' | top 6 by count_ asc;\", \"timespan\": \"PT24H\"\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          var ops = response["tables"][0]["rows"].length;
          if (ops > 5) {
            ops = 5;
          }
          for (var i = 0; i < ops; i++) {
            if (response["tables"][0]["rows"][i][1] == "") {
              ops = 6;
            } else {
              result2 += response["tables"][0]["rows"][i][1];
              if (i != ops - 2 && i != ops - 1) {
                result2 += ", ";
              } else if (i != ops - 1) {
                result2 += ", & ";
              } else {
              }
            }
          }
          //result2 = "";
        });

        // Most called API
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) and apiId_s != 'apim-availability-test' and apiId_s != 'tyler-test' | top 2 by count_ ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result3 = checkResult(response, 1);
        });

        // 5 most called APIs
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) and apiId_s != 'apim-availability-test' and apiId_s != 'tyler-test' | top 6 by count_ ;\", \"timespan\": \"PT24H\"\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          var ops = response["tables"][0]["rows"].length;
          if (ops > 5) {
            ops = 5;
          }
          for (var i = 0; i < ops; i++) {
            if (response["tables"][0]["rows"][i][1] == "") {
              ops = 6;
            } else {
              result4 += response["tables"][0]["rows"][i][1];
              if (i != ops - 2 && i != ops - 1) {
                result4 += ", ";
              } else if (i != ops - 1) {
                result4 += ", & ";
              } else {
              }
            }
          }
          console.log("*****test*****" + result4);
        });

        /////////////////////////
        //       Operations
        /////////////////////////

        // least called operation
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | top 2 by count_ asc;", "timespan": "PT24H"\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result5 = checkResult(response, 1);
        });

        // least called operation for 'sessions'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s,apiId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where apiId_s==\'sessions\'  | top 2 by count_ asc;", "timespan": "PT24H"\r\n\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result6 = checkResult(response, 1);
        });

        // least called operation for 'vehicles'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s,apiId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where apiId_s==\'vehicles\'  | top 2 by count_ asc;", "timespan": "PT24H"\r\n\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result7 = checkResult(response, 1);
        });

        // least called operation for 'client-gateway-users'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s,apiId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where apiId_s==\'client-gateway-users\'  | top 2 by count_ asc;", "timespan": "PT24H"\r\n\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result8 = checkResult(response, 1);
        });

        // least called operation for 'trusted-consumer'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s, productId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where productId_s==\'trusted-consumer\'  | top 2 by count_ asc;", "timespan": "PT24H"\r\n\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result9 = checkResult(response, 1);
        });

        // least called operation for 'trusted-services'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s, productId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where productId_s==\'trusted-services\'  | top 2 by count_ asc;", "timespan": "PT24H"\r\n\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result10 = checkResult(response, 1);
        });

        // 5 least called operations
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | top 6 by count_ asc;", "timespan": "PT24H"\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          var ops = response["tables"][0]["rows"].length;
          if (ops > 5) {
            ops = 5;
          }
          for (var i = 0; i < ops; i++) {
            if (response["tables"][0]["rows"][i][1] == "") {
              ops = 6;
            } else {
              result11 += response["tables"][0]["rows"][i][1];
              if (i != ops - 2 && i != ops - 1) {
                result11 += ", ";
              } else if (i != ops - 1) {
                result11 += ", & ";
              } else {
              }
            }
          }
        });

        // Most called operation
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | top 2 by count_ ;", "timespan": "PT24H"\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result12 = checkResult(response, 1);
        });

        // Most called operation for 'sessions'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s,apiId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where apiId_s==\'sessions\'  | top 2 by count_ ;", "timespan": "PT24H"\r\n\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result13 = checkResult(response, 1);
        });

        // Most called operation for 'vehicles'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s,apiId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where apiId_s==\'vehicles\'  | top 2 by count_ ;", "timespan": "PT24H"\r\n\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result14 = checkResult(response, 1);
        });

        // Most called operation for 'client-gateway-users'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s,apiId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where apiId_s==\'client-gateway-users\'  | top 2 by count_ ;", "timespan": "PT24H"\r\n\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result15 = checkResult(response, 1);
        });

        // Most called operation for 'trusted-consumer'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s, productId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where productId_s==\'trusted-consumer\'  | top 2 by count_ ;", "timespan": "PT24H"\r\n\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result16 = checkResult(response, 1);
        });

        // Most called operation for 'trusted-services'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s, productId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where productId_s==\'trusted-services\'  | top 2 by count_ ;", "timespan": "PT24H"\r\n\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result17 = checkResult(response, 1);
        });

        // 5 Most called operations
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count() by bin(TimeGenerated, 24h), operationId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | top 6 by count_ ;", "timespan": "PT24H"\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          var ops = response["tables"][0]["rows"].length;
          if (ops > 5) {
            ops = 5;
          }
          for (var i = 0; i < ops; i++) {
            if (response["tables"][0]["rows"][i][1] == "") {
              ops = 6;
            } else {
              result18 += response["tables"][0]["rows"][i][1];
              if (i != ops - 2 && i != ops - 1) {
                result18 += ", ";
              } else if (i != ops - 1) {
                result18 += ", & ";
              } else {
              }
            }
          }
        });

        /////////////////////////
        // Average Response Time
        /////////////////////////

        // Average response time for the operation 'GetVehicle'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where operationId_s==\'GetVehicle\' ;", "timespan": "PT24H"\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result19 = checkResult(response, 3, true);
        });

        // Average response time for the operation 'GetVehicle' of the API, 'sessions'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetVehicle' and apiId_s=='sessions' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result20 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'GetVehicle' of the API, 'client-gateway-users'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetVehicle' and apiId_s=='client-gateway-users' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result21 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'GetVehicle' of the API, 'vehicles'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetVehicle' and apiId_s=='vehicles' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result22 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'GetAuthorizationStatus'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where operationId_s==\'GetAuthorizationStatus\' ;", "timespan": "PT24H"\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result23 = checkResult(response, 3, true);
        });

        // Average response time for the operation 'GetAuthorizationStatus' of the API, 'sessions'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetAuthorizationStatus' and apiId_s=='sessions' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result24 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'GetAuthorizationStatus' of the API, 'client-gateway-users'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetAuthorizationStatus' and apiId_s=='client-gateway-users' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result25 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'GetAuthorizationStatus' of the API, 'vehicles'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetAuthorizationStatus' and apiId_s=='vehicles' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result26 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'GetUserProfile'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where operationId_s==\'GetUserProfile\' ;", "timespan": "PT24H"\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result27 = checkResult(response, 3, true);
        });

        // Average response time for the operation 'GetUserProfile' of the API, 'sessions'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetUserProfile' and apiId_s=='sessions' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result28 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'GetUserProfile' of the API, 'client-gateway-users'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetUserProfile' and apiId_s=='client-gateway-users' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result29 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'GetUserProfile' of the API, 'vehicles'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetUserProfile' and apiId_s=='vehicles' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result30 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'GetSecurityQuestions'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where operationId_s==\'GetSecurityQuestions\' ;", "timespan": "PT24H"\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result31 = checkResult(response, 3, true);
        });

        // Average response time for the operation 'GetSecurityQuestions' of the API, 'sessions'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetSecurityQuestions' and apiId_s=='sessions' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result32 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'GetSecurityQuestions' of the API, 'client-gateway-users'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetSecurityQuestions' and apiId_s=='client-gateway-users' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result33 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'GetSecurityQuestions' of the API, 'vehicles'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='GetSecurityQuestions' and apiId_s=='vehicles' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result34 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'Login'
        settings.data =
          '{ \r\n"query": "let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s | where datetime_part(\'day\', dt) == datetime_part(\'day\', TimeGenerated) | where operationId_s==\'Login\' ;", "timespan": "PT24H"\t\r\n}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result35 = checkResult(response, 3, true);
        });

        // Average response time for the operation 'Login' of the API, 'sessions'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='Login' and apiId_s=='sessions' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result36 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'Login' of the API, 'client-gateway-users'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='Login' and apiId_s=='client-gateway-users' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result37 = checkResult(response, 4, true);
        });

        // Average response time for the operation 'Login' of the API, 'vehicles'
        settings.data =
          "{ \r\n\"query\": \"let dt = now(); AzureDiagnostics | summarize count(), round(avg(DurationMs),3) by bin(TimeGenerated, 24h), operationId_s, apiId_s | where datetime_part('day', dt) == datetime_part('day', TimeGenerated) | where operationId_s=='Login' and apiId_s=='vehicles' ;\", \"timespan\": \"PT24H\"\r\n\t\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result38 = checkResult(response, 4, true);
        });

        /////////////////////////
        //   Product Usage
        /////////////////////////

        // Product usage week over week for all products
        settings.data =
          "{ \r\n\"query\": \"AzureDiagnostics | summarize count() by bin(TimeGenerated, 7d), productId_s, apiId_s  | where apiId_s != 'tyler-test' and apiId_s != 'fordpass-recall-service-api' and apiId_s != 'apim-availability-test'| summarize sum(count_) by format_datetime(TimeGenerated,'MM-dd-yy') | sort by TimeGenerated desc;\", \"timespan\": \"P4W\"\r\n\r\n\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result39 = formatProductUsage(response);
        });

        // Product usage week over week for 'trusted-consumer'
        settings.data =
          "{ \r\n\"query\": \"AzureDiagnostics | summarize count() by bin(TimeGenerated, 7d), productId_s, apiId_s  | where apiId_s != 'tyler-test' and apiId_s != 'fordpass-recall-service-api' and apiId_s != 'apim-availability-test' and productId_s == 'trusted-consumer' | summarize sum(count_) by productId_s, format_datetime(TimeGenerated,'MM-dd-yy') | sort by TimeGenerated desc;\", \"timespan\": \"P4W\"\r\n\r\n\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result40 = formatProductUsage(response, "trusted-consumer");
        });

        // Product usage week over week for 'trusted-services'
        settings.data =
          "{ \r\n\"query\": \"AzureDiagnostics | summarize count() by bin(TimeGenerated, 7d), productId_s, apiId_s  | where apiId_s != 'tyler-test' and apiId_s != 'fordpass-recall-service-api' and apiId_s != 'apim-availability-test' and productId_s == 'trusted-services' | summarize sum(count_) by productId_s, format_datetime(TimeGenerated,'MM-dd-yy') | sort by TimeGenerated desc;\", \"timespan\": \"P4W\"\r\n\r\n\r\n}";
        var r = $.ajax(settings);
        r.done(function(response) {
          result41 = formatProductUsage(response, "trusted-services");
        });

        /////////////////////////
        //   Operation hits
        /////////////////////////

        // Operation hits - most
        settings.data =
          '{ "query": "AzureDiagnostics | summarize count() by bin(TimeGenerated, 28d), operationId_s, apiId_s  | where apiId_s != \'tyler-test\' and apiId_s != \'fordpass-recall-service-api\' and apiId_s != \'apim-availability-test\' | sort by count_ desc;", "timespan": "P27D"}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result44 = checkResult(response, 3);
        });

        // Operation hits - least
        settings.data =
          '{ "query": "AzureDiagnostics | summarize count() by bin(TimeGenerated, 28d), operationId_s, apiId_s  | where apiId_s != \'tyler-test\' and apiId_s != \'fordpass-recall-service-api\' and apiId_s != \'apim-availability-test\' | sort by count_ asc;", "timespan": "P27D"}';
        var r = $.ajax(settings);
        r.done(function(response) {
          result45 = checkResult(response, 3);
        });

        /////////////////////////
        //   Traffic Shift
        /////////////////////////

        // Traffic shifts in the last 24 hours
        settings.data =
          '{ \r\n\t"query": "AzureDiagnostics | where TimeGenerated > ago(24h) | summarize count() by bin(TimeGenerated, 24h) | sort by TimeGenerated;" \r\n}';
        var r = $.ajax(settings);
        var last24h = "";
        var newrate = "";
        r.done(function(response) {
          last24h = response["tables"][0]["rows"][1][1];
          newrate = response["tables"][0]["rows"][0][1];
          result43 =
            "In the last 24 hours the total traffic of requests shifted from " +
            last24h +
            " to " +
            newrate +
            ".";
        });

        var command = message["text"];
        var command_result = fuzzy.get(command);
        console.log(command_result);
        console.log(command_result[0][1]);

        // If the user's message has 50% accuracy
        if (command_result != null && command_result[0][0] > 0.5) {
          /////////////////////////
          //Basic Commands & Alerts
          /////////////////////////

          // Checks if user is saying hello
          if (hellos.includes(command_result[0][1]) == true) {
            var text = "Hello from the other side! This is glitch version.";
            /**************************************************************************
                    alert for sudden shift of traffic/latency/errors
            ***************************************************************************/
            timeout = setInterval(() => {
              const date = new Date().toLocaleString();

              /////////////////////////////traffic of requests//////////////////////////////
              settings.data =
                '{ \r\n\t"query": "AzureDiagnostics | where TimeGenerated > ago(1h) | summarize count() by bin(TimeGenerated, 1m) | sort by TimeGenerated; "\r\n}';
              var r = $.ajax(settings);
              r.done(function(response) {
                try {
                  newresult = response["tables"][0]["rows"][0][1];
                  console.log(response["tables"][0]["rows"][0]);
                  console.log(response["tables"][0]["rows"][1]);   
                } catch (err) {
                  bot.reply(message, "Time tracked: " + date + " **error**");
                }
                var checker = response["tables"][0]["rows"];
                if (
                  oldresult != newresult &&
                  oldresult != "" &&
                  Math.abs(Number(newresult) - Number(oldresult)) >= 5000
                ) {
                  bot.reply(
                    message,
                    "**ALERT: There is a sudden shift on traffic from " +
                      oldresult +
                      " to " +
                      newresult +
                      " in last few minutes!**"
                  );
                }
                oldresult = newresult;
              });

              /////////////////////// latency for api client-gateway-users ///////////////////
              settings.data =
                '{ \r\n\t"query": "AzureDiagnostics | where TimeGenerated > ago(1h) | summarize by bin(TimeGenerated,2ms), DurationMs,apiId_s | where apiId_s == \'client-gateway-users\' |  sort by TimeGenerated;"\r\n}';
              var r = $.ajax(settings);
              r.done(function(response) {
                newresult1 = response["tables"][0]["rows"][0][1];
                console.log(response["tables"][0]["rows"][0]);
                console.log(response["tables"][0]["rows"][1]);
                if (
                  oldresult1 != newresult1 &&
                  oldresult1 != "" &&
                  Math.abs(Number(newresult1) - Number(oldresult1)) >= 1000
                ) {
                  bot.reply(
                    message,
                    "**ALERT: There is a sudden shift on lantency of api 'client-gateway-users' from " +
                      oldresult1 +
                      " to " +
                      newresult1 +
                      "**"
                  );
                }
                oldresult1 = newresult1;
              });

              //////////////////////////////latency for api 'session'///////////////////////////
              settings.data =
                '{ \r\n\t"query": "AzureDiagnostics | where TimeGenerated > ago(1h) | summarize by bin(TimeGenerated,2ms), DurationMs,apiId_s | where apiId_s == \'sessions\' |  sort by TimeGenerated;"\r\n}';
              var r = $.ajax(settings);
              r.done(function(response) {
                newresult2 = response["tables"][0]["rows"][0][1];
                console.log(response["tables"][0]["rows"][0]);
                console.log(response["tables"][0]["rows"][1]);
                if (
                  oldresult2 != newresult2 &&
                  oldresult2 != "" &&
                  Math.abs(Number(newresult2) - Number(oldresult2)) >= 5000
                ) {
                  bot.reply(
                    message,
                    "**ALERT: There is a sudden shift on lantency of api 'sessions' from " +
                      oldresult2 +
                      " to " +
                      newresult2 +
                      "**"
                  );
                }
                oldresult2 = newresult2;
              });
              /////////////////////////////latency for api 'vehicle'/////////////////////////////
              settings.data =
                '{ \r\n\t"query": "AzureDiagnostics | where TimeGenerated > ago(1h) | summarize by bin(TimeGenerated,2ms), DurationMs,apiId_s | where apiId_s == \'vehicles\' |  sort by TimeGenerated;"\r\n}';
              var r = $.ajax(settings);
              r.done(function(response) {
                newresult3 = response["tables"][0]["rows"][0][1];
                console.log(response["tables"][0]["rows"][0]);
                console.log(response["tables"][0]["rows"][1]);
                if (
                  oldresult3 != newresult3 &&
                  oldresult3 != "" &&
                  Math.abs(Number(newresult3) - Number(oldresult3)) >= 5000
                ) {
                  bot.reply(
                    message,
                    "**ALERT: There is a sudden shift on lantency of api 'sessions' from " +
                      oldresult3 +
                      " to " +
                      newresult3 +
                      "**"
                  );
                }
                oldresult3 = newresult3;
              });
              ////////////////////////////////// errors /////////////////////////////////////
              settings.data =
                '{ \r\n\t"query": "AzureDiagnostics | where TimeGenerated > ago(1h) | summarize count() by bin(TimeGenerated,1m), responseCode_d | where responseCode_d == \'500\' | sort by TimeGenerated; "\r\n}';
              var r = $.ajax(settings);
              r.done(function(response) {
                newresult4 = response["tables"][0]["rows"][0][1];
                console.log(response["tables"][0]["rows"][0]);
                console.log(response["tables"][0]["rows"][1]);
                if (
                  oldresult4 != newresult4 &&
                  oldresult4 != "" &&
                  Math.abs(Number(newresult4) - Number(oldresult4)) >= 100
                ) {
                  bot.reply(
                    message,
                    "**ALERT: There has " +
                      newresult4 +
                      " errors occured in last few minutes!**"
                  );
                }
                oldresult4 = newresult4;
              });
            }, 5000); ///the timer stops
          } //for command 'hello'

          // Checks if user is asking for help
          else if (helps.includes(command_result[0][1]) == true) {
            var text = "Here are the different questions I can answer:";
            for (var i = 0; i < commands.length; i++) {
              text += "\n- " + bot.enrichCommand(message, commands[i]);
            }
          }

          // Checks if user is saying thank you
          else if (thankyous.includes(command_result[0][1]) == true) {
            var text = "You are welcome!";
          }

          // Checks if user is saying goodbye
          else if (goodbyes.includes(command_result[0][1]) == true) {
            var text = "Goodbye. Have a great day!";
          }

          /////////////////////////
          //        APIs
          /////////////////////////

          // Checks if user is asking for the least called API
          else if (least_called_api.includes(command_result[0][1]) == true) {
            var text = "Your least called API is " + result1 + ".";
          }

          // Checks if user is asking for the 5 least called APIs
          else if (least_called_apis.includes(command_result[0][1]) == true) {
            var commas = 1;
            for (var i = 0; i < result2.length; i++) {
              if (result2[i] == ",") {
                commas++;
              }
            }
            var text = "";
            if (commas != 5) {
              text +=
                "I'm sorry. I was not able to find 5 APIs, but I was able to find the " +
                commas +
                " least called APIs. ";
            }
            text +=
              "Your least " + commas + " called APIs are " + result2 + ".";
            //result2 =";"
          }

          // Checks if user is asking for the most called API
          else if (most_called_api.includes(command_result[0][1]) == true) {
            var text = "Your most called API is " + result3 + ".";
          }

          // Checks if user is asking for the 5 most called APIs
          else if (most_called_apis.includes(command_result[0][1]) == true) {
            var commas = 1;
            for (var i = 0; i < result4.length; i++) {
              if (result4[i] == ",") {
                commas++;
              }
            }
            var text = "";
            if (commas != 5) {
              text +=
                "I'm sorry. I was not able to find 5 APIs, but I was able to find the " +
                commas +
                " most called APIs. ";
            }
            text += "Your " + commas + " most called APIs are " + result4 + ".";
          }

          /////////////////////////
          //    Operations
          /////////////////////////

          // Checks if user is asking for the least called operation
          else if (
            least_called_operation.includes(command_result[0][1]) == true
          ) {
            var text =
              "Your least called operation is " +
              result5 +
              " with " +
              result45 +
              " hits in the past 28 days.";
          }

          // Checks if user is asking for the least called operation for 'sessions'
          else if (
            least_called_operation_sessions.includes(command_result[0][1]) ==
            true
          ) {
            var text =
              "Your least called operation for 'sessions' is " + result6 + ".";
          }

          // Checks if user is asking for the least called operation for 'vehicles'
          else if (
            least_called_operation_vehicles.includes(command_result[0][1]) ==
            true
          ) {
            var text =
              "Your least called operation for 'vehicles' is " + result7 + ".";
          }

          // Checks if user is asking for the least called operation for 'client-gateway-users'
          else if (
            least_called_operation_cgu.includes(command_result[0][1]) == true
          ) {
            var text =
              "Your least called operation for 'client-gateway-users' is " +
              result8 +
              ".";
          }

          // Checks if user is asking for the least called operation for 'trusted-consumer'
          else if (
            least_called_operation_tc.includes(command_result[0][1]) == true
          ) {
            var text =
              "Your least called operation for 'trusted-consumer' is " +
              result9 +
              ".";
          }

          // Checks if user is asking for the least called operation for 'trusted-services'
          else if (
            least_called_operation_ts.includes(command_result[0][1]) == true
          ) {
            var text =
              "Your least called operation for 'trusted-services' is " +
              result10 +
              ".";
          }

          // Checks if user is asking for the 5 least called operations
          else if (
            least_called_operations.includes(command_result[0][1]) == true
          ) {
            var commas = 1;
            for (var i = 0; i < result11.length; i++) {
              if (result11[i] == ",") {
                commas++;
              }
            }
            var text = "";
            if (commas != 5) {
              text +=
                "I'm sorry. I was not able to find 5 operations, but I was able to find the " +
                commas +
                " least called operations. ";
            }
            text +=
              "Your least " +
              commas +
              " called operations are " +
              result11 +
              ".";
          }

          // Checks if user is asking for the most called operation
          else if (
            most_called_operation.includes(command_result[0][1]) == true
          ) {
            var text =
              "Your most called operation is " +
              result12 +
              " with " +
              result44 +
              " hits in the past 28 days.";
          }

          // Checks if user is asking for the most called operation for 'sessions'
          else if (
            most_called_operation_sessions.includes(command_result[0][1]) ==
            true
          ) {
            var text =
              "Your most called operation for 'sessions' is " + result13 + ".";
          }

          // Checks if user is asking for the most called operation for 'vehicles'
          else if (
            most_called_operation_vehicles.includes(command_result[0][1]) ==
            true
          ) {
            var text =
              "Your most called operation for 'vehicles' is " + result14 + ".";
          }

          // Checks if user is asking for the most called operation for 'client-gateway-users'
          else if (
            most_called_operation_cgu.includes(command_result[0][1]) == true
          ) {
            var text =
              "Your most called operation for 'client-gateway-users' is " +
              result15 +
              ".";
          }

          // Checks if user is asking for the most called operation for 'trusted-consumer'
          else if (
            most_called_operation_tc.includes(command_result[0][1]) == true
          ) {
            var text =
              "Your most called operation for 'trusted-consumer' is " +
              result16 +
              ".";
          }

          // Checks if user is asking for the most called operation for 'trusted-services'
          else if (
            most_called_operation_ts.includes(command_result[0][1]) == true
          ) {
            var text =
              "Your most called operation for 'trusted-services' is " +
              result17 +
              ".";
          }

          // Checks if user is asking for the 5 most called operations
          else if (
            most_called_operations.includes(command_result[0][1]) == true
          ) {
            var commas = 1;
            for (var i = 0; i < result18.length; i++) {
              if (result18[i] == ",") {
                commas++;
              }
            }
            var text = "";
            if (commas != 5) {
              text +=
                "I'm sorry. I was not able to find 5 operations, but I was able to find the " +
                commas +
                " most called operations. ";
            }
            text +=
              "Your " +
              commas +
              " most called operations are " +
              result18 +
              ".";
          }

          /////////////////////////
          // Average Response Time
          /////////////////////////

          // Checks if user is asking for the Average response time for the operation 'GetVehicle'
          else if (
            avg_response_time_gv.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetVehicle' is " +
              result19;
          }

          // Checks if user is asking for the Average response time for the operation 'GetVehicle' of the API 'sessions'
          else if (
            avg_response_time_gv_sessions.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetVehicle' of the API 'sessions' is " +
              result20;
          }

          // Checks if user is asking for the Average response time for the operation 'GetVehicle' of the API 'client-gateway-users'
          else if (
            avg_response_time_gv_cgu.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetVehicle' of the API 'client-gateway-users' is " +
              result21;
          }

          // Checks if user is asking for the Average response time for the operation 'GetVehicle' of the API 'vehicles'
          else if (
            avg_response_time_gv_v.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetVehicle' of the API 'vehicles' is " +
              result22;
          }

          // Checks if user is asking for the Average response time for the operation 'GetAuthorizationStatus'
          else if (
            avg_response_time_gas.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetAuthorizationStatus' is " +
              result23;
          }

          // Checks if user is asking for the Average response time for the operation 'GetAuthorizationStatus' of the API 'sessions'
          else if (
            avg_response_time_gas_sessions.includes(command_result[0][1]) ==
            true
          ) {
            var text =
              "The average response time for the operation 'GetAuthorizationStatus' of the API 'sessions' is " +
              result24;
          }

          // Checks if user is asking for the Average response time for the operation 'GetAuthorizationStatus' of the API 'client-gateway-users'
          else if (
            avg_response_time_gas_cgu.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetAuthorizationStatus' of the API 'client-gateway-users' is " +
              result25;
          }

          // Checks if user is asking for the Average response time for the operation 'GetAuthorizationStatus' of the API 'vehicles'
          else if (
            avg_response_time_gas_v.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetAuthorizationStatus' of the API 'vehicles' is " +
              result26;
          }

          // Checks if user is asking for the Average response time for the operation 'GetUserProfile'
          else if (
            avg_response_time_gup.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetUserProfile' is " +
              result27;
          }

          // Checks if user is asking for the Average response time for the operation 'GetUserProfile' of the API 'sessions'
          else if (
            avg_response_time_gup_sessions.includes(command_result[0][1]) ==
            true
          ) {
            var text =
              "The average response time for the operation 'GetUserProfile' of the API 'sessions' is " +
              result28;
          }

          // Checks if user is asking for the Average response time for the operation 'GetUserProfile' of the API 'client-gateway-users'
          else if (
            avg_response_time_gup_cgu.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetUserProfile' of the API 'client-gateway-users' is " +
              result29;
          }

          // Checks if user is asking for the Average response time for the operation 'GetUserProfile' of the API 'vehicles'
          else if (
            avg_response_time_gup_v.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetUserProfile' of the API 'vehicles' is " +
              result30;
          }

          // Checks if user is asking for the Average response time for the operation 'GetSecurityQuestions'
          else if (
            avg_response_time_gsq.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetSecurityQuestions' is " +
              result31;
          }

          // Checks if user is asking for the Average response time for the operation 'GetSecurityQuestions' of the API 'sessions'
          else if (
            avg_response_time_gsq_sessions.includes(command_result[0][1]) ==
            true
          ) {
            var text =
              "The average response time for the operation 'GetSecurityQuestions' of the API 'sessions' is " +
              result32;
          }

          // Checks if user is asking for the Average response time for the operation 'GetSecurityQuestions' of the API 'client-gateway-users'
          else if (
            avg_response_time_gsq_cgu.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetSecurityQuestions' of the API 'client-gateway-users' is " +
              result33;
          }

          // Checks if user is asking for the Average response time for the operation 'GetSecurityQuestions' of the API 'vehicles'
          else if (
            avg_response_time_gsq_v.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'GetSecurityQuestions' of the API 'vehicles' is " +
              result34;
          }

          // Checks if user is asking for the Average response time for the operation 'Login'
          else if (avg_response_time_l.includes(command_result[0][1]) == true) {
            var text =
              "The average response time for the operation 'Login' is " +
              result35;
          }

          // Checks if user is asking for the Average response time for the operation 'Login' of the API 'sessions'
          else if (
            avg_response_time_l_sessions.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'Login' of the API 'sessions' is " +
              result36;
          }

          // Checks if user is asking for the Average response time for the operation 'Login' of the API 'client-gateway-users'
          else if (
            avg_response_time_l_cgu.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'Login' of the API 'client-gateway-users' is " +
              result37;
          }

          // Checks if user is asking for the Average response time for the operation 'Login' of the API 'vehicles'
          else if (
            avg_response_time_l_v.includes(command_result[0][1]) == true
          ) {
            var text =
              "The average response time for the operation 'Login' of the API 'vehicles' is " +
              result38;
          }

          /////////////////////////
          //     Product Usage
          /////////////////////////
          // Checks if user is asking for product usage trending week over week
          else if (product_usage.includes(command_result[0][1]) == true) {
            var text = " " + result39;
          }

          // Checks if user is asking for product usage trending week over week for trusted-consumer
          else if (product_usage_tc.includes(command_result[0][1]) == true) {
            var text = " " + result40;
          }

          // Checks if user is asking for product usage trending week over week for trusted-services
          else if (product_usage_ts.includes(command_result[0][1]) == true) {
            var text = " " + result41;
          }

          /////////////////////////
          //     Traffic Shift
          /////////////////////////
          else if (traffic_shift.includes(command_result[0][1]) == true) {
            var text = result43;
          }

          /////////////////////////
          //     Reports
          /////////////////////////
          // Checks if user is asking for a report
          else if (reports.includes(command_result[0][1]) == true) {
            var text = "Your least called API is " + result1 + ".  \n";
            text += "Your most called API is " + result3 + ".  \n";
            text +=
              "Your least called operation is " +
              result5 +
              " with " +
              result45 +
              " hits in the past 28 days.  \n";
            text +=
              "Your most called operation is " +
              result12 +
              " with " +
              result44 +
              " hits in the past 28 days.";
          }

          // User is not specific enough
          else {
            var text =
              "I'm sorry, could you be more specific? Here is a list of my commands: ";
            for (var i = 0; i < commands.length; i++) {
              text += "\n- " + bot.enrichCommand(message, commands[i]);
            }
          }
        }

        // Prompt user to try again
        else {
          var text =
            "I'm sorry, I did not understand. Here is a list of my commands: ";
          for (var i = 0; i < commands.length; i++) {
            text += "\n- " + bot.enrichCommand(message, commands[i]);
          }
        }

        bot.reply(message, text);

        result1 = "", result2 = "", result3 = "", result4 = "", result5 = "", result6 = "", 
        result7 = "", result8 = "", result9 = "", result10 = "", result11 = "", result12 = "",
        result13 = "", result14 = "", result15 = "", result16 = "", result17 = "", result18 = "",
        result19 = "", result20 = "", result21 = "", result22 ="", result23 = "", result24 = "",
        result25 = "", result26 = "", result27 = "", result28 ="", result29 = "", result30 = "",
        result31 = "", result32 = "", result33 = "", result34 ="", result35 = "", result36 = "",
        result37 = "", result38 = "", result39 = "", result40 ="", result41 = "", result42 = "",
        result43 = "", result44 = "", result45 = "", result46 = "", result47 = "", result48 = "",      
        newresult = "", oldresult = "", newresult1 = "",oldresult1 = "", newresult2 = "", oldresult2 = "",
        newresult3 = "", oldresult3 = "", newresult4 = "", oldresult4 = "";  
      }); // end of request
    }
  ); // end of bot hears
}; // end of controller

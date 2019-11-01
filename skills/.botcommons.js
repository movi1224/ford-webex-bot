//
// Command: bot commons
//
var a = 1;
module.exports = function (controller) {
  
  function sendAlertToBot(alert_message) {
    controller.spawn({}, function(bot) {
      bot.say(alert_message);
    });
  }
    
    controller.hears(["^\.about", "^\.commons", "^\.bot", "^ping"], 'direct_message,direct_mention', function (bot, message) {
        var metadata = '{\n'
            + '   "owner"       : "' + bot.commons["owner"] + '",\n'
            + '   "support"     : "' + bot.commons["support"] + '",\n'
            + '   "up-since"    : "' + bot.commons["up-since"] + '",\n'
            + '   "healthcheck" : "' + bot.commons["healthcheck"] + '",\n'
            + '   "version"     : "' + bot.commons["version"] + '",\n'
            + '   "code"        : "' + bot.commons["code"] + '"\n'
            + '}\n';
        bot.reply(message, '```json\n' + metadata + '\n```');
        sendAlertToBot("ok");
        
        a = 2;
        console.log(a);
    });
  
    if (a == 2) {
      controller.spawn({}, function(bot) {
        console.log("alert triggered");
        bot.say("alert_message");
        console.log("alert triggered completely");
      });
    }
    
}

var re1 = /\+/g;
var re2 = /\t/g;
var re3 = /\s+/g;
var re4 = /(’|‘)/g;
var re5 = /(“|”)/g;
var re6 = /(–|—)/g;
var re7 = /[^\x00-\x7F]/g;
var re8 = /[\+]{1}/g;
var re9 = /<plus>/g;
var re10 = /\d,\d/g;
var re11 = /_/g;

// TODO, fix the paths
var tasks = [
  {'key':'_sys', content: require('./data/systemessentials')},
  {'key':'_extra', content: require('./data/substitutes')},
  {'key':'_contractions', content: require('./data/contractions')},
  {'key':'_interjections', content: require('./data/interjections')},
  {'key':'_britsh', content: require('./data/british')},
  {'key':'_spellfix', content: require('./data/spellfix')},
  {'key':'_texting', content: require('./data/texting')}
];

var reSet = {};

var readSubstitutes = function(content, lineHandle) {
  var data = content.split("\n");

  for (var i = 0; i < data.length; i++) {
    var line = data[i];
    var nline = line.trim();

    // Lets allow comments with '#'
    var pos = nline.indexOf('#');
    
    if (pos === -1) {
      var parts = nline.split(" ");

      if (parts[1] === undefined) {
        lineHandle(parts[0], "");
      } else {

        lineHandle(parts[0], parts[1]);
      }
      
    } else if (pos > 0) {
      nline = nline.slice(0, pos);
      var parts = nline.split(" ");
      lineHandle(parts[0], parts[1]);
    }
  }
};

function handleTask (item) {
  var lineHandle = function(key, replacer) {

    if (reSet[item.key] === undefined) {
      reSet[item.key] = {};
    }
    
    if (reSet[item.key][key] === undefined) {
      reSet[item.key][key] = [];
    }
    
    // Add RegEx
    var startM, endM, lookup = key;
    if (key[0] == '<') {
      startM = true;
      lookup = key.substring(1);
    }

    if (key.slice(-1) == '>') {
      endM = true;
      lookup = lookup.substring(0, lookup.length - 1);
    }

    var qm = quotemeta(lookup.replace(re11, " "));

    if (startM && endM) {
      reSet[item.key][key].push({re: new RegExp("^" + qm + "$", "g"), r: replacer });
    } else if (startM) {
      reSet[item.key][key].push({re: new RegExp("^" + qm + "$", "g"), r: replacer });
      reSet[item.key][key].push({re: new RegExp("^" + qm + "(\\W+)", "g"), r: replacer + "$1"});
    } else if (endM) {

      reSet[item.key][key].push({re: new RegExp("(\\W+)" + qm + "$", "g"), r: "$1" + replacer });
      if (item.key == "_sys") {
        reSet[item.key][key].push({re: new RegExp(qm + "$", "g"), r: replacer });
      }
    } else {
      reSet[item.key][key].push({re: new RegExp("^" + qm + "$", "g"), r: replacer });
      reSet[item.key][key].push({re: new RegExp("^" + qm + "(\\W+)", "g"), r: replacer + "$1" });
      reSet[item.key][key].push({re: new RegExp("(\\W+)" + qm + "(\\W+)", "g"), r: "$1" + replacer + "$2" });
      reSet[item.key][key].push({re: new RegExp("(\\W+)" + qm + "$", "g"), r: "$1" + replacer });
    }
  };
  
  readSubstitutes(item.content, lineHandle);
}

tasks.forEach(handleTask)

function quotemeta (string) {
  var unsafe = "\\.+*?[^]$(){}=!<>|:";
  for (var i = 0; i < unsafe.length; i++) {
    string = string.replace(new RegExp("\\" + unsafe.charAt(i), "g"), "\\" + unsafe.charAt(i));
  }
  return string;
}

exports.clean = function(msg){
  msg = msg.toLowerCase()
  msg = msg.replace(re1, "<plus>");
  msg = msg.replace(re2, " ");
  msg = msg.replace(re3, " ");
  msg = msg.replace(re4, "'");
  msg = msg.replace(re5, '"');
  msg = msg.replace(re6, "—");
  msg = msg.replace(re7, "");

  Object.keys(reSet).map(function (item1) {
    Object.keys(reSet[item1]).map(function (item2) {
      var reArray = reSet[item1][item2];
      reArray.map(function (item3) {
        msg = msg.replace(item3.re, item3.r);
      });
    });
  });

  msg = msg.replace(re8, " ");
  msg = msg.replace(re9, "+");
  msg = msg.replace(re10, function(v) { return v.replace(",",""); });

  return msg.trim();
};

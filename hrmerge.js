console.log("starting");

var xml2object = require('xml2object');
var program = require('commander');
var sprintf = require('sprintf').sprintf;
var dateFormat = require('dateformat');

var timeZone = 'CET';
var fileName1;
var fileName2;
program
    .version('0.0.1');
program
    .command('merge <file1> <file2>')
    .description('merge the given files')
    .action(function (file1, file2) {
        console.log(file1);
        fileName1 = file1;
        fileName2 = file2;
    });
program.parse(process.argv);

console.log('using %s and %s', fileName1, fileName2);
function getCetTime(dateString) {
    var date = new Date(dateString);
    var hours = date.getHours();
    //date.setHours(hours - date.getTimezoneOffset()/60);
    return date;
}
var exercises = [];
var file1parser = new xml2object([ 'exercise' ], fileName1);
file1parser.on('object', function(name, obj) {
    console.log('Found an exercise. Created: %s. Time: %s', obj.created, obj.time);
    exercises.push(obj);
    /* var exercise = {};
    exercise.created = getCetTime(obj.created);
    exercise.time = getCetTime(obj.time);
    var result = obj.result;
    exercise.distance = parseInt(result.distance);
    exercise.calories = parseInt(result.calories);
    var split = result.duration.split(":");
    var hours = sprintf("%02s", split[0]);
    var minutes = sprintf("%02s", split[1]);
    var split = split[2].split(".");
    var seconds = sprintf("%02s", split[0]);
    var miliseconds = parseInt(split[1]);
    miliseconds += parseInt(split[0])*1000;
    miliseconds += parseInt(minutes)*60*1000;
    miliseconds += parseInt(hours)*60*60*1000;
    exercise.duration = new Date(miliseconds);
    var user_settings = obj.result["user-settings"];
    var userSettings = {};
    userSettings.resting = parseInt(user_settings["heart-rate"]["resting"]);
    userSettings.maximum = parseInt(user_settings["heart-rate"]["maximum"]);
    userSettings.vo2max = parseInt(user_settings.vo2max);
    userSettings.weight = parseInt(user_settings.weight);
    userSettings.height = parseInt(user_settings.height);
    console.log(userSettings); */
    
});
function mergeMaxInt(val1, val2) {
    var max1 = parseInt(val1);
    var max2 = parseInt(val2);
    return max1 > max2 ? max1 : max2;
}
function mergeAvgInt(val1, val2) {
    return (parseInt(val1) + parseInt(val2))/2;
}
function mergeMaxFloat(val1, val2) {
    var max1 = parseFloat(val1);
    var max2 = parseFloat(val2);
    return max1 > max2 ? max1 : max2;
}
function mergeMinFloat(val1, val2) {
    var min1 = parseFloat(val1);
    var min2 = parseFloat(val2);
    return min1 < min2 ? min1 : min2;
}
function mergeAvgFloat(val1, val2) {
    return (parseFloat(val1) + parseFloat(val2))/2;
}
file1parser.on('end', function(name, obj) {
    console.log('Finished parsing xml!');
    console.log('got %d exercices.', exercises.length);
    var merged = exercises[0];
    merged.created = dateFormat(new Date(), "yyyy-mm-hh HH:MM:ss.l");
    //TODO add duration, distance, calories
    //HR
    merged.result["heart-rate"].average = mergeAvgInt(merged.result["heart-rate"].average, exercises[1].result["heart-rate"].average);
    merged.result["heart-rate"].maximum = mergeMaxInt(merged.result["heart-rate"].maximum, exercises[1].result["heart-rate"].maximum);
    //FAT
    merged.result["fat-consumption"] = sprintf("%.2d", mergeAvgInt(merged.result["fat-consumption"], exercises[1].result["fat-consumption"]));
    //speed
    merged.result.speed.speed.average = mergeAvgFloat(merged.result.speed.speed.average, exercises[1].result.speed.speed.average);
    merged.result.speed.speed.maximum = mergeMaxFloat(merged.result.speed.speed.maximum, exercises[1].result.speed.speed.maximum);
    //cad
    merged.result.speed.cadence.average = mergeAvgInt(merged.result.speed.cadence.average, exercises[1].result.speed.cadence.average);
    merged.result.speed.cadence.maximum = mergeMaxInt(merged.result.speed.cadence.maximum, exercises[1].result.speed.cadence.maximum);
    //altitude
    merged.result.altitude.maximum = mergeMaxFloat(merged.result.altitude.maximum,exercises[1].result.altitude.maximum);
    merged.result.altitude.average = mergeAvgFloat(merged.result.altitude.average, exercises[1].result.altitude.average);
    merged.result.altitude.minimum = mergeMinFloat(merged.result.altitude.minimum, exercises[1].result.altitude.minimum);
    //ascent/descent
    merged.result["altitude-info"].ascent = parseFloat(merged.result["altitude-info"]
    .ascent) + parseFloat(exercises[1].result["altitude-info"].ascent);
    merged.result["altitude-info"].descent = parseFloat(merged.result["altitude-info"]
    .descent) + parseFloat(exercises[1].result["altitude-info"].descent);
    //temp
    merged.result.temperature.maximum = mergeMaxFloat(merged.result.temperature.maximum,exercises[1].result.temperature.maximum);
    merged.result.temperature.average = mergeAvgFloat(merged.result.temperature.average, exercises[1].result.temperature.average);
    merged.result.temperature.minimum = mergeMinFloat(merged.result.temperature.minimum, exercises[1].result.temperature.minimum);
    //TODO add zone
    //HR
    merged.result.samples.sample[0].values = merged.result.samples.sample[0].values + "," + exercises[1].result.samples.sample[0].values;
    //SPEED
    merged.result.samples.sample[1].values = merged.result.samples.sample[1].values + "," + exercises[1].result.samples.sample[1].values;
    //CAD
    merged.result.samples.sample[2].values = merged.result.samples.sample[2].values + "," + exercises[1].result.samples.sample[2].values;
    //ALTITUDE
    merged.result.samples.sample[3].values = merged.result.samples.sample[3].values + "," + exercises[1].result.samples.sample[3].values;
    //TEMP
    merged.result.samples.sample[4].values = merged.result.samples.sample[4].values + "," + exercises[1].result.samples.sample[4].values;
    //DISTANCE
    merged.result.samples.sample[5].values = merged.result.samples.sample[5].values + "," + exercises[1].result.samples.sample[5].values;
    //console.log(merged.result.samples.sample[0].values);
});
file1parser.start();

console.log(exercises);
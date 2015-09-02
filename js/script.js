/**
 * Created by verenka on 30/08/15.
 */

// load the measurements so far from local storage
if (localStorage.getItem("measurements") != null) {
    measurements = JSON.parse(localStorage.getItem("measurements"));
} else {
    measurements = [];
}

$(document).ready(function(){
// when the page is loaded the following needs to happen
// - show form, hide day overview
// - date/time form field filled with current date/time
// - onclick listeners for save and cancel
// - onchange listeners for fields that trigger calculated fields (prandial, bolus gesamt)

    showForm();

    $('#timestamp').datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        todayBtn: 'linked',
        language: 'de',
        startView: '0'
    }).val();

    $("#save").click(function(){
        saveMeasurements();
    });
    $("#cancel").click(function() {
        cancelMeasurements();
    });

    $("#menu_measure").click(function(){
        showForm();
    });

    $("#menu_dayview").click(function(){
        showOverview();
        //find out which day it is and show corresponding data
    });

    $("#be").change(function () {
        calcPrandial();
    });

    $("#iebe").change(function () {
        calcPrandial();
    });

    $("#corr").change(function () {
        calcBolus();
    });

});


function saveMeasurements() {
    // save needs to do the following:
// - hide form - ok
// - show day overview - ok
// - save data into offline storage - ok
// - save data into database
// - get data from storage / database
// - display data for that day
    showOverview();
    saveToLocal();

}


function cancelMeasurements() {
    // cancel needs to do:
// - hide form
// - empty form fields
// - show day overview
// - display data for that day

    showOverview()
}

function displayData(day){
// take the relvant date and retrieve all data matching it from local storage
// attach matching data from local storage to table

    var all_data = JSON.parse(localStorage.getItem("measurements"));
    var today = [];

    $.each(all_data, function(key, value) {
        // if the day matches, add the entry to the array today
        if (value.day == day) {
        today[today.length] = value;
        }
    });

    //for each entry for today, display a row
    $.each(today, function(key, value) {
        console.log(value);
        $('#display_table tr:last').after(
            "<tr>" +
            "<td>" + value.time + "</td>" +
            "<td>" + value.bloodsugar + "</td>" +
            "<td>" + value.be + "</td>" +
            "<td>" + value.iebe + "</td>" +
            "<td>" + value.prandial + "</td>" +
            "<td>" + value.corr + "</td>" +
            "<td>" + value.bolus + "</td>" +
            "<td>" + value.basal + "</td>" +
            "<td>" + value.comment + "</td>" +
            "</tr>"
        );
    });

    //display today's date
    $('#table_date').html(today[0].day);

}

function saveToLocal() {
    var day = $("#timestamp").val().substr(0,10);
    var time =$("#timestamp").val().substr(11,15);
    var bloodsugar = $("#bloodsugar").val();
    var be = $("#be").val();
    var iebe = $("#iebe").val();
    var prandial = calcPrandial();
    var corr = $("#corr").val();
    var bolus = calcBolus();
    var basal = $("#basal").val();
    var comment = $("#comment").val();

    var entry = {"day": day, "time":time, "bloodsugar": bloodsugar, "be": be, "iebe": iebe, "prandial": prandial,
                 "corr": corr, "bolus": bolus, "basal": basal, "comment": comment};
    measurements[measurements.length] = entry;

    localStorage.setItem("measurements", JSON.stringify(measurements));

    //call display data here, because relevant date is passed on
    displayData(day);
}


function showForm() {
    $("#dayview").hide();
    $("#measure").show();
    $("#menu_measure").attr('class','active');
    $("#menu_dayview").removeAttr('class');
}

function showOverview() {
    $("#dayview").show();
    $("#measure").hide();
    $("#menu_dayview").attr('class','active');
    $("#menu_measure").removeAttr('class');

}

function calcPrandial() {
    var be = $("#be").val();
    var iebe = $("#iebe").val();
    if (be > 0 && iebe > 0) {
        var prandial = Math.round(be * iebe);
        $("#prandial").html(prandial);
    } else {
        $("#prandial").html(" 0");
    }
    return prandial
}

function calcBolus() {
    var prandial = $("#prandial").html()-0; // minus zero added, so js will treat it as numbers
    var corr = $("#corr").val()-0;
    if (prandial > 0 && corr > 0) {
        var total = prandial + corr;
        $("#bolus").html(total);
    } else {
        $("#bolus").html("0");
    }
    return total;
}
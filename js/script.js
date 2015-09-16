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
// - show form, hide day overview - ok
// - date/time form field filled with current date/time - ok
// - onclick listeners for save and cancel - ok
// - onchange listeners for fields that trigger calculated fields (prandial, bolus gesamt) - ok

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

    $("#menu_export").click(function() {
       showExport();
    });

    $("#menu_measure").click(function(){
        showForm();
    });

    $("#menu_dayview").click(function(){
        showOverview();
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

    $("#start_export").click(function() {

        // JSON to CSV parser parses the array of JSON Objects and turns into csv file
        var csv = Papa.unparse(measurements, {
            quotes: true
        });

        // Because of problems with the export, here I replace the line breaks included by Papaparse with others
        // and finally create a file to be downloaded
        // also: thanks stackoverflow for this code

        var csvNewLine = csv.replace("\r\n", "%0A");
       
        $("#csv").append(csvNewLine);
        var a         = document.createElement('a');
        a.href        = 'data:attachment/csv,' + csvNewLine;
        a.target      = '_blank';
        a.download    = 'myFile.csv';

        document.body.appendChild(a);
        a.click();

    });

    //set up the links to go forward and backward one day in the overview
    $("#back").click(function(){

        //Date Magic thanks to Stackvoerflow
        var currentDate = new Date($("#table_date").html());
        var yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);

        //for formating
        var dd = yesterday.getDate();
        var mm = yesterday.getMonth()+1; //January is 0!

        var yyyy = yesterday.getFullYear();

        if(dd<10) {dd ='0'+ dd}
        if(mm<10) {mm='0'+mm}
        yesterday = yyyy+'-'+mm+'-'+dd;
        displayData(yesterday);
    });

    $("#forward").click(function(){

        //date magic, thanks stackoverflow

        var currentDate = new Date($("#table_date").html());
        var tomorrow = new Date(currentDate);

        tomorrow.setDate(currentDate.getDate() + 1);

        var dd = tomorrow.getDate();
        var mm = tomorrow.getMonth()+1; //January is 0!

        var yyyy = tomorrow.getFullYear();

        if(dd<10) {dd ='0'+ dd}
        if(mm<10) {mm='0'+mm}
        tomorrow = yyyy+'-'+mm+'-'+dd;

        displayData(tomorrow);
    });

});


function saveMeasurements() {
// save needs to do the following:
// - hide form - ok
// - show day overview - ok
// - save data into offline storage - ok
// - display data for that day - ok
// - empty form fields for next measuring - ok
// - TO DO: save data into database
// - TO DO: get data from storage / database

    //first check if required fields are filled
    //Date/Time always need to be filled!
    if ($("#timestamp").val() == "") {
        alert("Bitte Datum/Uhrzeit angeben!");
    } else
    //both be and iebe need to be filled or both need to be empty
    if (($("#be").val() == "" && $("#iebe").val() != "") || ($("#be").val() != "" && $("#iebe").val() == "")) {
       alert("Bitte sowohl BE als auch IE/BE ausfüllen!");
    }
    else {
        saveToLocal();
        showOverview();
        emptyFormFields();
    }
}

function showExport() {

    $("#dayview").hide();
    $("#measure").hide();
    $("#exportview").show();
    $("#menu_export").attr('class','active');
    $("#menu_dayview").removeAttr('class');
    $("#menu_measure").removeAttr('class');
    emptyFormFields();
}

function cancelMeasurements() {
// cancel needs to do:
// - hide form - ok
// - empty form fields - ok
// - show day overview - ok
// - display data for that day - ok

    showOverview();
    emptyFormFields();

}

function displayData(day){
    // take the relvant date and retrieve all data matching it from local storage
    // attach matching data from local storage to table
    // catch if no data to display, yet

    var all_data = JSON.parse(localStorage.getItem("measurements"));
    var today = [];

    $.each(all_data, function(key, value) {
        // if the day matches, add the entry to the array today
        if (value.day == day) {
        today[today.length] = value;
        }
    });

    //for each entry for today, display a row
    if (today.length != 0) {

        //first remove rows (except header)
        $(".display_row").remove();

        //then loop through entries

        $.each(today, function (key, value) {

            $('#display_table tr:last').after(
                "<tr class='display_row'>" +
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
    } else

    // if no entry for today exists - display a row saying that
    {
        //first remove rows (except header)
        $(".display_row").remove();

        //then display an empty row

        $('#display_table tr:last').after(
            "<tr class='display_row'>" +
            "<td colspan='10'>" + "Für dieses Datum gibt es noch keinen Eintrag."+
            "</td>" +
            "</tr>"
        );
    }

    //display today's date at the top of the table
    $('#table_date').html(day);

}

function saveToLocal() {
    //check if mandatory fields are filled is done in onclick function

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

    measurements[measurements.length] = {"day": day, "time":time, "bloodsugar": bloodsugar, "be": be, "iebe": iebe, "prandial": prandial,
                 "corr": corr, "bolus": bolus, "basal": basal, "comment": comment};
    console.log(measurements);

    localStorage.setItem("measurements", JSON.stringify(measurements));

    //call display data here, because relevant date is passed on
    displayData(day);
}


function showForm() {
    $("#dayview").hide();
    $("#exportview").hide();
    $("#measure").show();
    $("#menu_measure").attr('class','active');
    $("#menu_dayview").removeAttr('class');
    $("#menu_export").removeAttr('class');
}

function showOverview() {
    $("#dayview").show();
    $("#measure").hide();
    $("#exportview").hide();
    $("#menu_dayview").attr('class','active');
    $("#menu_measure").removeAttr('class');
    $("#menu_export").removeAttr('class');
    //get todays's date and show corresponding data (or error msg if none exists)
    var todayDate = $.datepicker.formatDate('yy-mm-dd', new Date());
    displayData(todayDate);
}

function calcPrandial() {

    var be = $("#be").val();
    var iebe = $("#iebe").val();

    if (be == "" && iebe == "") {
        var prandial = "";
    }
    else {
        prandial = Math.round(be * iebe);
    }

    $("#prandial").html(prandial);
    return prandial;
}

function calcBolus() {
    var prandial = $("#prandial").html()-0; // minus zero added, so js will treat it as numbers
    var corr = $("#corr").val()-0;
    if (prandial != "" && corr != "") {
        var bolus_calc = prandial + corr;
    } else if (prandial != "" && corr == "")
    {
        bolus_calc = prandial;
    } else
    {
        bolus_calc = "";
    }
    $("#bolus").html(bolus_calc);
    return bolus_calc;
}

function emptyFormFields() {
    $("#timestamp").val("");
    $("#bloodsugar").val("");
    $("#be").val("");
    $("#iebe").val("");
    $("#prandial").html("");
    $("#corr").val("");
    $("#bolus").html("");
    $("#basal").val("");
    $("#comment").val("");

}
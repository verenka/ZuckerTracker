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

    showOverview();

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
    //check if mandatory fields are filled

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

    //get todays's date and show corresponding data (or error msg if none exists)
    var todayDate = $.datepicker.formatDate('yy-mm-dd', new Date());
    displayData(todayDate);
}

function calcPrandial() {
    //both be and ie/be need to be filled or both need to be empty
    // TO DO: impractical, move check to save click!

    var be = $("#be").val();
    var iebe = $("#iebe").val();

    if (be == "" && iebe == "") {
        var prandial = "";
    } else if (be == "" && iebe != "") {
        alert("bitte das Feld BE ausfüllen!");
    } else if (be != "" && iebe == "") {
        alert("bitte das Feld IE/BE ausfüllen!");
    }
    else if (be != "" && iebe != "") {
        var prandial = Math.round(be * iebe);
    }

    $("#prandial").html(prandial);
    return prandial;
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
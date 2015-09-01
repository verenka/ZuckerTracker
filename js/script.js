/**
 * Created by verenka on 30/08/15.
 */

// when the page is loaded the following needs to happen
// - show form, hide day overview
// - date/time form field filled with current date/time
// - onclick listeners for save and cancel
// - onchange listeners for fields that trigger calculated fields (prandial, bolus gesamt)
$(document).ready(function(){

    showForm();

    $('#timestamp').datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        todayBtn: 'linked',
        language: 'de',
        startView: '0'
    }).val();

    $("#save").click(saveMeasurements());
    $("#cancel").click(cancelMeasurements());

});

function saveMeasurements() {
    showOverview();
}

function cancelMeasurements() {
    showOverview()
}

function showForm() {
    $("#dayview").hide();
    $("#measure").show();
}

function showOverview() {
    $("#dayview").show();
    $("#measure").hide();
}

// save needs to do the following:
// - hide form
// - show day overview
// - save data into offline storage
// - save data into database
// - get data from storage / database
// - display data for that day

// cancel needs to do:
// - hide form
// - empty form fields
// - show day overview
// - display data for that day
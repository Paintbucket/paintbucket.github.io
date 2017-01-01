// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '113847408515-ps1k6pnrv2b0g4olu6suqdd9bcpa235n.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

var chart = null;
var dashboard = null;

var schedule = [];

google.charts.load('current', { 'packages': ['gantt', 'controls'] });
google.charts.setOnLoadCallback(prepareChart);

function prepareChart() {
    chart = new google.visualization.Gantt(document.getElementById('chart_div'));
}

window.onresize = function (event) {
    drawChart();
};

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    gapi.auth.authorize(
      {
          'client_id': CLIENT_ID,
          'scope': SCOPES.join(' '),
          'immediate': true
      }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        authorizeDiv.style.display = 'none';
        loadSheetsApi();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        authorizeDiv.style.display = 'inline';
    }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
    gapi.auth.authorize(
      { client_id: CLIENT_ID, scope: SCOPES, immediate: false },
      handleAuthResult);
    return false;
}

/**
 * Load Sheets API client library.
 */
function loadSheetsApi() {
    var discoveryUrl =
        'https://sheets.googleapis.com/$discovery/rest?version=v4';
    gapi.client.load(discoveryUrl).then(loadScheduleData);
}


/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function loadScheduleData() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1kHGXZvnoYrNJeuHbpJY6Q8bDKLl5qyYqq2_e6qk_p2g', //'1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Schema!A2:D',
    }).then(function (response) {
        var range = response.result;
        if (range.values.length > 0) {
            appendPre('Task, Start, End, Resource:');
            for (i = 0; i < range.values.length; i++) {
                var row = range.values[i];
                // Print columns A and E, which correspond to indices 0 and 4.
                appendPre(row[0] + ', ' + row[1] + ', ' + row[2] + ", " + row[3]);
                schedule.push(row);
            }

            //google.charts.load('current', { 'packages': ['gantt'] });
            //google.charts.setOnLoadCallback(drawChart);

            drawChart();

        } else {
            appendPre('No data found.');
        }
    }, function (response) {
        appendPre('Error: ' + response.result.error.message);
    });
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}







function daysToMilliseconds(days) {
    return days * 24 * 60 * 60 * 1000;
}

function drawChart() {

    //var content = [
    //    ["Hej", "2017-01-01", "2017-01-05"],
    //    ["Blah", "2017-01-02", "2017-01-05"],
    //    ["Sort", "2017-02-11", "2017-03-05"],
    //];

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Task ID');
    data.addColumn('string', 'Task Name');
    data.addColumn('string', 'Resource');
    data.addColumn('date', 'Start Date');
    data.addColumn('date', 'End Date');
    data.addColumn('number', 'Duration');
    data.addColumn('number', 'Percent Complete');
    data.addColumn('string', 'Dependencies');
    

    for (var i = 0; i < schedule.length; i++) {
        var row = schedule[i];
        var id = row[0];
        var name = row[0];
        var resource = row[3];
        var startDate = new Date(row[1]);//Date.parse(row[1]);
        var endDate = new Date(row[2]);//Date.parse(row[2]);
        var duration = null;//1;//daysToMilliseconds(1);
        var percent = 0;
        var dependencies = null;
        data.addRow([id, name, resource, startDate, endDate, null, 0, null]);
    }

    var options = {
        title: "Primalimpros schema!",
        width: '100%',
        height: '100%',
        chartArea: {
            left: "3%",
            top: "3%",
            height: "94%",
            width: "94%"
        },
        explorer: {}
        
    };

    // Resizing: http://jsfiddle.net/toddlevy/pyAz5/, http://stackoverflow.com/questions/23593514/google-visualization-chart-size-in-percentage
    // Filtering: http://stackoverflow.com/questions/14196204/category-filter-control-for-linechart-in-google-chart-tools, http://jsfiddle.net/asgallant/WaUu2/
    chart.draw(data, options);
}
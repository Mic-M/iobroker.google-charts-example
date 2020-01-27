/****************************************************************************************************
 * Script, um mittels Google Charts einen Wetter-Graph anzuzeigen
 * --------------------------------------------------------------------------------------------------
 * Aktuelle Version: https://github.com/Mic-M/iobroker.google-charts-example/
 * Support:          https://forum.iobroker.net/topic/22779/vorlage-google-charts-beispiel
 * Autor:            Mic (ioBroker-Forum) / Mic-M (Github)
 * --------------------------------------------------------------------------------------------------
 * Change Log:
 *  0.2 Mic + Fix/improve file creation.
 *  0.1 Mic - Initial Release
 ******************************************************************************/


/*******************************************************************************
 * Konfiguration
 ******************************************************************************/

// Der Pfad der HTML-Datei, einfach entsprechend anpassen.
// Die Datei wird abgelegt unterhalb von '/opt/iobroker/iobroker-data/files/vis.0/'
const FILE_PATH = 'M3/googleChartWeatherGraph.html';

// Schedule
const M_SCHEDULE = '5 1 * * *'; // Um 1:05 Uhr jeden Tag

// Ausgaben für Debug
const LOG_DEBUG = false;

/*******************************************************************************
 * Global constants/variables
 *******************************************************************************/
let mSchedule; // for the schedule


/*******************************************************************************
 * Executed on every script start.
 *******************************************************************************/
main();
function main() {
    
    // Write the file initially on script start
    writeGoogleHtml(function(success) {
        if (LOG_DEBUG) log('[Debug] We are now in the callback of writeWeatherHtml().');
        if (success) {
            if (LOG_DEBUG) log('[Debug] Successfully executed writeWeatherHtml(), so we schedule the updates.');
            clearSchedule(mSchedule);
            mSchedule = schedule(M_SCHEDULE, writeGoogleHtml);
        } else {
            log('File not successfully created/updated, so we stop at this point.', 'error');
        }
    });

}

/**
 * Writing Google html file.
 * @param {object} [callback]   Optional: A callback function which is executed after proceeding this function.
 */
function writeGoogleHtml(callback = undefined) {
    let result = writeFile('vis.0', FILE_PATH, buildHTML(), function (error) {
        if (error) {
            log('[Error] Error while executing writeFile(): ' + error);
            if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                if (LOG_DEBUG) log('[Debug] Function to callback parameter was provided');
                return callback(false);
            } else {
                return;
            }
        } else {
            if (LOG_DEBUG) log('[Debug] File successfully written: [' + FILE_PATH + ']');
            if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                if (LOG_DEBUG) log('[Debug] Function to callback parameter was provided');
                return callback(true);
            } else {
                return;
            }
        }
    }) 
    return result;
}

function buildHTML() {
    let html = '';
    html += '<html>\n';
    html += '<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>\n';
    html += '<script type="text/javascript">\n';
    html += "google.charts.load('current', {'packages':['corechart']});\n";
    html += "google.charts.setOnLoadCallback(drawChart);\n";
    html += "function drawChart() {"; + "\n";

    html += "var data = new google.visualization.DataTable();\n";
    html += "data.addColumn('string', 'Temperature');\n";
    html += "data.addColumn('number', 'Minimum');\n";
    html += "data.addColumn({type: 'number', role: 'annotation'});\n";
    html += "data.addColumn('number', 'Maximum');\n";
    html += "data.addColumn({type: 'number', role: 'annotation'});\n";
    for (let i = 1; i <= 7; i++) {
        let day = (i === 1) ? 'Heute' : getState('daswetter.0.NextDays.Location_1.Day_' + i + '.Tag_value').val.substr(0, 2);
        let tHigh = getState('daswetter.0.NextDays.Location_1.Day_' + i + '.Maximale_Temperatur_value').val;
        let tLow  = getState('daswetter.0.NextDays.Location_1.Day_' + i + '.Minimale_Temperatur_value').val;
        html += "    data.addRow(['" + day + "', " + tLow + ", " + tLow + ", " + tHigh + ", " + tHigh + "]);\n";
    }
    // See: https://developers.google.com/chart/interactive/docs/gallery/linechart#configuration-options
    html += "var options = {\n";
    html += "    curveType: 'function', backgroundColor: 'transparent', pointSize: 4,\n";
    html += "    hAxis: {textStyle:{color:'white'}},\n";
    html += "    vAxis: { textPosition: 'none', textStyle:{color:'red'},\n";
    html += "    baselineColor:'transparent', gridlines:{count:0} }, legend: { position: 'none' },\n";
    html += "    annotations: { stem: { length: 5, color: 'transparent' }, textStyle: {fontSize: 10, alwaysOutside: true, bold: false} }\n";
    html += "};\n";
    html += "var chart = new google.visualization.LineChart(document.getElementById('mychart'));\n";
    html += "chart.draw(data, options);\n";
    html += "}\n";
    html += "</script>\n";
    html += '<div id="mychart" style="width: 420px; height: 210px;"></div>\n';
    html += '</html>\n';
    return html;
}



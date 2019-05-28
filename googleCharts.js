/*******************************************************************************
  * Script, um mittels Google Charts einen Wetter-Graph anzuzeigen
  * ----------------------------------------------------
 * Change Log:
 *  0.1 Mic - Initial Release
 * ----------------------------------------------------
 * Autor: Mic (ioBroker-Forum) / Mic-M (Github)
 * Quelle: https://github.com/Mic-M/iobroker.google-charts-example/
 * Support:
 ******************************************************************************/


/*******************************************************************************
 * Konfiguration
 ******************************************************************************/

// Der Pfad der HTML-Datei, einfach entsprechend anpassen.
// In VIS dann etwa folgenden Pfad im iFrame-Widget einfügen: '/vis.0/M3/googleChartWeatherGraph.html', 
// also nur den hinteren Abschnitt ab '/vis.....'
const FILE_PATH = '/opt/iobroker/iobroker-data/files/vis.0/M3/googleChartWeatherGraph.html';

// Schedule
const M_SCHEDULE = '5 1 * * *'; // Um 1:05 Uhr jeden Tag


/*******************************************************************************
 * Ab hier nichts mehr ändern / Stop editing here!
 ******************************************************************************/



/*******************************************************************************
 * Executed on every script start.
 *******************************************************************************/
let mSchedule;
main();
function main() {
    
    // Write the file initially on script start
    writeWeatherHtml();

    // Update file per schedule
    clearSchedule(mSchedule);
    mSchedule = schedule(M_SCHEDULE, writeWeatherHtml);

}

function writeWeatherHtml() {
    // Requiring fs module in which writeFile function is defined. 
    const fs = require('fs');
    // Write data in 'Output.txt' . 
    fs.writeFile(FILE_PATH, buildHTML(), (err) => { 
        if (err) throw err; // In case of a error throw err. 
    }) 
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


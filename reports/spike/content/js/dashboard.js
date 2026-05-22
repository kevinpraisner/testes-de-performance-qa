/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.3477855767439, "KoPercent": 0.6522144232561029};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7573247406475951, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6331627680311891, 500, 1500, "TX-01: Home Page"], "isController": true}, {"data": [0.804013875123885, 500, 1500, "TX-02: Buscar Voos"], "isController": true}, {"data": [0.8020701842968947, 500, 1500, "POST /reserve.php - Buscar Voos"], "isController": false}, {"data": [0.7964173640167364, 500, 1500, "POST /confirmation.php - Confirmar Compra"], "isController": false}, {"data": [0.6329891838741396, 500, 1500, "GET / - Home Page"], "isController": false}, {"data": [0.8001773948302078, 500, 1500, "POST /purchase.php - Escolher Voo"], "isController": false}, {"data": [0.7985987261146497, 500, 1500, "TX-04: Confirmar Compra"], "isController": true}, {"data": [0.8001773948302078, 500, 1500, "TX-03: Escolher Voo"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 16099, 105, 0.6522144232561029, 689.4103981613707, 0, 5279, 441.0, 1408.0, 2445.0, 3674.0, 132.31039810644663, 783.6307222279866, 34.63738997419376], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["TX-01: Home Page", 4104, 105, 2.5584795321637426, 835.6045321637445, 0, 4957, 559.0, 1591.0, 2577.0, 3662.449999999998, 33.63961999688522, 154.90236472225183, 3.7773106746776612], "isController": true}, {"data": ["TX-02: Buscar Voos", 4036, 0, 0.0, 630.4628344895929, 0, 4981, 386.0, 1286.800000000001, 2415.1499999999996, 3602.670000000001, 33.353166732778, 235.3798163783593, 7.793357412319847], "isController": true}, {"data": ["POST /reserve.php - Buscar Voos", 3961, 0, 0.0, 634.3857611714209, 242, 4981, 390.0, 1281.6000000000004, 2400.0, 3477.7800000000034, 33.226520820051675, 238.9259539334337, 7.91076899766802], "isController": false}, {"data": ["POST /confirmation.php - Confirmar Compra", 3824, 0, 0.0, 641.4877092050203, 237, 4986, 392.0, 1306.0, 2331.0, 3636.5, 32.73243969664287, 184.7593121929194, 14.707561552543956], "isController": false}, {"data": ["GET / - Home Page", 4068, 105, 2.5811209439528024, 834.7561455260595, 372, 4957, 560.0, 1550.1999999999998, 2551.849999999998, 3655.4099999999994, 33.49498974895225, 155.60130088471894, 3.7943543074984976], "isController": false}, {"data": ["POST /purchase.php - Escolher Voo", 3946, 0, 0.0, 638.6046629498236, 235, 4739, 392.5, 1209.9000000000005, 2399.4999999999964, 3690.0599999999995, 33.40331154979176, 219.046328339273, 9.061863794314833], "isController": false}, {"data": ["TX-04: Confirmar Compra", 3925, 0, 0.0, 639.9640764331198, 0, 5279, 387.0, 1313.4, 2406.3999999999996, 3846.4799999999996, 33.21317357162199, 182.64868844985446, 14.53954767412588], "isController": true}, {"data": ["TX-03: Escolher Voo", 3946, 0, 0.0, 638.6046629498236, 235, 4739, 392.5, 1209.9000000000005, 2399.4999999999964, 3690.0599999999995, 33.40331154979176, 219.046328339273, 9.061863794314833], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.622 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.141 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.663 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.205 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.072 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.749 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.049 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.182 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.031 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.051 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.294 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.123 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.528 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.966 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.145 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.350 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.056 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.686 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.054 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, 1.9047619047619047, 0.012423131871544816], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.363 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.311 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.526 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.462 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.045 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.342 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.410 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, 1.9047619047619047, 0.012423131871544816], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.928 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.709 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.034 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.605 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.252 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.804 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.490 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.948 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.849 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.388 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 3, 2.857142857142857, 0.018634697807317226], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.957 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.757 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.121 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.362 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.256 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.310 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.575 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.652 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, 1.9047619047619047, 0.012423131871544816], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.546 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.354 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.079 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.523 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.872 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.298 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.126 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.401 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.632 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.810 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.475 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.694 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, 1.9047619047619047, 0.012423131871544816], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.001 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.260 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.367 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.937 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.281 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.674 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.216 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.059 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.120 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.255 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, 1.9047619047619047, 0.012423131871544816], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.436 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.376 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.926 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.258 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.104 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.482 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.218 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.239 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.338 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.472 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.003 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.111 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.865 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.070 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, 1.9047619047619047, 0.012423131871544816], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.451 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.880 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.056 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.688 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, 1.9047619047619047, 0.012423131871544816], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.144 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.320 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.045 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.181 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.682 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.709 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.207 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.491 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.300 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.023 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.977 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.457 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 0.9523809523809523, 0.006211565935772408], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 16099, 105, "A opera&ccedil;&atilde;o tomou muito tempo: levou 3.388 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 3, "A opera&ccedil;&atilde;o tomou muito tempo: levou 3.694 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, "A opera&ccedil;&atilde;o tomou muito tempo: levou 3.255 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, "A opera&ccedil;&atilde;o tomou muito tempo: levou 3.054 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, "A opera&ccedil;&atilde;o tomou muito tempo: levou 3.070 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / - Home Page", 4068, 105, "A opera&ccedil;&atilde;o tomou muito tempo: levou 3.388 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 3, "A opera&ccedil;&atilde;o tomou muito tempo: levou 3.694 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, "A opera&ccedil;&atilde;o tomou muito tempo: levou 3.255 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, "A opera&ccedil;&atilde;o tomou muito tempo: levou 3.054 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, "A opera&ccedil;&atilde;o tomou muito tempo: levou 3.070 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

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

    var data = {"OkPercent": 98.29971181556196, "KoPercent": 1.7002881844380404};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8079104260578741, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6725512528473804, 500, 1500, "TX-01: Home Page"], "isController": true}, {"data": [0.8444316877152698, 500, 1500, "TX-02: Buscar Voos"], "isController": true}, {"data": [0.8432400932400932, 500, 1500, "POST /reserve.php - Buscar Voos"], "isController": false}, {"data": [0.86810551558753, 500, 1500, "POST /confirmation.php - Confirmar Compra"], "isController": false}, {"data": [0.6723940435280642, 500, 1500, "GET / - Home Page"], "isController": false}, {"data": [0.8514619883040936, 500, 1500, "POST /purchase.php - Escolher Voo"], "isController": false}, {"data": [0.8669402110199297, 500, 1500, "TX-04: Confirmar Compra"], "isController": true}, {"data": [0.8514619883040936, 500, 1500, "TX-03: Escolher Voo"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3470, 59, 1.7002881844380404, 712.1544668587904, 0, 9498, 414.0, 995.9000000000001, 1748.2499999999955, 7675.989999999999, 19.093210080334543, 113.44405877730549, 5.0293022484043135], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["TX-01: Home Page", 878, 30, 3.416856492027335, 843.3337129840545, 0, 9498, 538.0, 1200.0000000000002, 1738.2499999999989, 7698.290000000005, 4.859608242515484, 22.446786848685193, 0.5473675161756322], "isController": true}, {"data": ["TX-02: Buscar Voos", 871, 23, 2.640642939150402, 664.401836969001, 0, 9004, 363.0, 919.8000000000008, 2096.199999999998, 6990.919999999986, 4.839372826171506, 34.27956727964463, 1.1349767789278928], "isController": true}, {"data": ["POST /reserve.php - Buscar Voos", 858, 23, 2.6806526806526807, 667.3927738927736, 243, 9004, 367.0, 912.1000000000003, 2019.3999999999978, 6819.189999999998, 4.816274291872958, 34.63285775782224, 1.1466740236940487], "isController": false}, {"data": ["POST /confirmation.php - Confirmar Compra", 834, 5, 0.5995203836930456, 638.1306954436445, 237, 9345, 360.5, 742.5, 1419.5, 7865.249999999999, 4.766095573360154, 26.90237540431806, 2.141588737813311], "isController": false}, {"data": ["GET / - Home Page", 873, 30, 3.4364261168384878, 845.5819014891177, 375, 9498, 539.0, 1187.6000000000004, 1723.4999999999998, 7705.739999999999, 4.852021675698207, 22.540104600875363, 0.5496430804501875], "isController": false}, {"data": ["POST /purchase.php - Escolher Voo", 855, 0, 0.0, 681.2467836257313, 235, 8591, 354.0, 853.7999999999997, 2052.7999999999884, 7842.999999999972, 4.878438443236088, 31.990931783525713, 1.323494851963643], "isController": false}, {"data": ["TX-04: Confirmar Compra", 853, 5, 0.5861664712778429, 646.5814771395071, 0, 9345, 355.0, 754.2000000000002, 1639.3, 7923.780000000003, 4.822642106810498, 26.615212312154416, 2.1187288514705385], "isController": true}, {"data": ["TX-03: Escolher Voo", 855, 0, 0.0, 681.2467836257313, 235, 8591, 354.0, 853.7999999999997, 2052.7999999999884, 7842.999999999972, 4.878438443236088, 31.990931783525713, 1.323494851963643], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 6.854 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 6.832 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.724 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 7.816 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.114 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 8.906 milisegundos, mas n&atilde;o deveria ter levado mais do que 8.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 9.345 milisegundos, mas n&atilde;o deveria ter levado mais do que 8.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.806 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.914 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.658 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 8.148 milisegundos, mas n&atilde;o deveria ter levado mais do que 8.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.552 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 6.393 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 7.874 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 8.082 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 8.278 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.329 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 8.215 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 7.986 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 6.718 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 7.594 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 9.217 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.453 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 7.797 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 6.795 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["Assertion failed", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.381 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.094 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.480 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.386 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 6.331 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.905 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.466 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 7.343 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 7.656 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 8.092 milisegundos, mas n&atilde;o deveria ter levado mais do que 8.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.169 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 6.313 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 7.667 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 8.421 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 8.118 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.713 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 7.661 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.515 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.382 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 7.572 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 6.043 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 8.604 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 8.387 milisegundos, mas n&atilde;o deveria ter levado mais do que 8.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.383 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.212 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.311 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 9.498 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 5.528 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 8.124 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 4.848 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, 3.389830508474576, 0.05763688760806916], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 9.004 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}, {"data": ["A opera&ccedil;&atilde;o tomou muito tempo: levou 3.276 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, 1.694915254237288, 0.02881844380403458], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3470, 59, "A opera&ccedil;&atilde;o tomou muito tempo: levou 4.848 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, "A opera&ccedil;&atilde;o tomou muito tempo: levou 6.854 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 6.832 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 5.724 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 7.816 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["TX-02: Buscar Voos", 16, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST /reserve.php - Buscar Voos", 858, 23, "A opera&ccedil;&atilde;o tomou muito tempo: levou 6.043 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 6.854 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 6.718 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 5.114 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 5.169 milisegundos, mas n&atilde;o deveria ter levado mais do que 5.000 milisegundos", 1], "isController": false}, {"data": ["POST /confirmation.php - Confirmar Compra", 834, 5, "A opera&ccedil;&atilde;o tomou muito tempo: levou 8.092 milisegundos, mas n&atilde;o deveria ter levado mais do que 8.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 8.906 milisegundos, mas n&atilde;o deveria ter levado mais do que 8.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 9.345 milisegundos, mas n&atilde;o deveria ter levado mais do que 8.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 8.387 milisegundos, mas n&atilde;o deveria ter levado mais do que 8.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 8.148 milisegundos, mas n&atilde;o deveria ter levado mais do que 8.000 milisegundos", 1], "isController": false}, {"data": ["GET / - Home Page", 873, 30, "A opera&ccedil;&atilde;o tomou muito tempo: levou 4.848 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 2, "A opera&ccedil;&atilde;o tomou muito tempo: levou 6.832 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 5.724 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 7.656 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1, "A opera&ccedil;&atilde;o tomou muito tempo: levou 7.816 milisegundos, mas n&atilde;o deveria ter levado mais do que 3.000 milisegundos", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

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
$(document).ready(function() {

    $(".click-title").mouseenter( function(    e){
        e.preventDefault();
        this.style.cursor="pointer";
    });
    $(".click-title").mousedown( function(event){
        event.preventDefault();
    });

    // Ugly code while this script is shared among several pages
    try{
        refreshHitsPerSecond(true);
    } catch(e){}
    try{
        refreshResponseTimeOverTime(true);
    } catch(e){}
    try{
        refreshResponseTimePercentiles();
    } catch(e){}
});


var responseTimePercentilesInfos = {
        data: {"result": {"minY": 2840.0, "minX": 0.0, "maxY": 82866.0, "series": [{"data": [[0.0, 2840.0], [0.1, 2840.0], [0.2, 2840.0], [0.3, 2840.0], [0.4, 2840.0], [0.5, 2840.0], [0.6, 2840.0], [0.7, 2840.0], [0.8, 2840.0], [0.9, 2840.0], [1.0, 3011.0], [1.1, 3011.0], [1.2, 3011.0], [1.3, 3011.0], [1.4, 3011.0], [1.5, 3011.0], [1.6, 3011.0], [1.7, 3011.0], [1.8, 3011.0], [1.9, 3011.0], [2.0, 3024.0], [2.1, 3024.0], [2.2, 3024.0], [2.3, 3024.0], [2.4, 3024.0], [2.5, 3024.0], [2.6, 3024.0], [2.7, 3024.0], [2.8, 3024.0], [2.9, 3024.0], [3.0, 3030.0], [3.1, 3030.0], [3.2, 3030.0], [3.3, 3030.0], [3.4, 3030.0], [3.5, 3030.0], [3.6, 3030.0], [3.7, 3030.0], [3.8, 3030.0], [3.9, 3030.0], [4.0, 3039.0], [4.1, 3039.0], [4.2, 3039.0], [4.3, 3039.0], [4.4, 3039.0], [4.5, 3039.0], [4.6, 3039.0], [4.7, 3039.0], [4.8, 3039.0], [4.9, 3039.0], [5.0, 3040.0], [5.1, 3040.0], [5.2, 3040.0], [5.3, 3040.0], [5.4, 3040.0], [5.5, 3040.0], [5.6, 3040.0], [5.7, 3040.0], [5.8, 3040.0], [5.9, 3040.0], [6.0, 3046.0], [6.1, 3046.0], [6.2, 3046.0], [6.3, 3046.0], [6.4, 3046.0], [6.5, 3046.0], [6.6, 3046.0], [6.7, 3046.0], [6.8, 3046.0], [6.9, 3046.0], [7.0, 3052.0], [7.1, 3052.0], [7.2, 3052.0], [7.3, 3052.0], [7.4, 3052.0], [7.5, 3052.0], [7.6, 3052.0], [7.7, 3052.0], [7.8, 3052.0], [7.9, 3052.0], [8.0, 3072.0], [8.1, 3072.0], [8.2, 3072.0], [8.3, 3072.0], [8.4, 3072.0], [8.5, 3072.0], [8.6, 3072.0], [8.7, 3072.0], [8.8, 3072.0], [8.9, 3072.0], [9.0, 3073.0], [9.1, 3073.0], [9.2, 3073.0], [9.3, 3073.0], [9.4, 3073.0], [9.5, 3073.0], [9.6, 3073.0], [9.7, 3073.0], [9.8, 3073.0], [9.9, 3073.0], [10.0, 4249.0], [10.1, 4249.0], [10.2, 4249.0], [10.3, 4249.0], [10.4, 4249.0], [10.5, 4249.0], [10.6, 4249.0], [10.7, 4249.0], [10.8, 4249.0], [10.9, 4249.0], [11.0, 5204.0], [11.1, 5204.0], [11.2, 5204.0], [11.3, 5204.0], [11.4, 5204.0], [11.5, 5204.0], [11.6, 5204.0], [11.7, 5204.0], [11.8, 5204.0], [11.9, 5204.0], [12.0, 6163.0], [12.1, 6163.0], [12.2, 6163.0], [12.3, 6163.0], [12.4, 6163.0], [12.5, 6163.0], [12.6, 6163.0], [12.7, 6163.0], [12.8, 6163.0], [12.9, 6163.0], [13.0, 7119.0], [13.1, 7119.0], [13.2, 7119.0], [13.3, 7119.0], [13.4, 7119.0], [13.5, 7119.0], [13.6, 7119.0], [13.7, 7119.0], [13.8, 7119.0], [13.9, 7119.0], [14.0, 8036.0], [14.1, 8036.0], [14.2, 8036.0], [14.3, 8036.0], [14.4, 8036.0], [14.5, 8036.0], [14.6, 8036.0], [14.7, 8036.0], [14.8, 8036.0], [14.9, 8036.0], [15.0, 8984.0], [15.1, 8984.0], [15.2, 8984.0], [15.3, 8984.0], [15.4, 8984.0], [15.5, 8984.0], [15.6, 8984.0], [15.7, 8984.0], [15.8, 8984.0], [15.9, 8984.0], [16.0, 10280.0], [16.1, 10280.0], [16.2, 10280.0], [16.3, 10280.0], [16.4, 10280.0], [16.5, 10280.0], [16.6, 10280.0], [16.7, 10280.0], [16.8, 10280.0], [16.9, 10280.0], [17.0, 11159.0], [17.1, 11159.0], [17.2, 11159.0], [17.3, 11159.0], [17.4, 11159.0], [17.5, 11159.0], [17.6, 11159.0], [17.7, 11159.0], [17.8, 11159.0], [17.9, 11159.0], [18.0, 12094.0], [18.1, 12094.0], [18.2, 12094.0], [18.3, 12094.0], [18.4, 12094.0], [18.5, 12094.0], [18.6, 12094.0], [18.7, 12094.0], [18.8, 12094.0], [18.9, 12094.0], [19.0, 13066.0], [19.1, 13066.0], [19.2, 13066.0], [19.3, 13066.0], [19.4, 13066.0], [19.5, 13066.0], [19.6, 13066.0], [19.7, 13066.0], [19.8, 13066.0], [19.9, 13066.0], [20.0, 14018.0], [20.1, 14018.0], [20.2, 14018.0], [20.3, 14018.0], [20.4, 14018.0], [20.5, 14018.0], [20.6, 14018.0], [20.7, 14018.0], [20.8, 14018.0], [20.9, 14018.0], [21.0, 15051.0], [21.1, 15051.0], [21.2, 15051.0], [21.3, 15051.0], [21.4, 15051.0], [21.5, 15051.0], [21.6, 15051.0], [21.7, 15051.0], [21.8, 15051.0], [21.9, 15051.0], [22.0, 16260.0], [22.1, 16260.0], [22.2, 16260.0], [22.3, 16260.0], [22.4, 16260.0], [22.5, 16260.0], [22.6, 16260.0], [22.7, 16260.0], [22.8, 16260.0], [22.9, 16260.0], [23.0, 17149.0], [23.1, 17149.0], [23.2, 17149.0], [23.3, 17149.0], [23.4, 17149.0], [23.5, 17149.0], [23.6, 17149.0], [23.7, 17149.0], [23.8, 17149.0], [23.9, 17149.0], [24.0, 18529.0], [24.1, 18529.0], [24.2, 18529.0], [24.3, 18529.0], [24.4, 18529.0], [24.5, 18529.0], [24.6, 18529.0], [24.7, 18529.0], [24.8, 18529.0], [24.9, 18529.0], [25.0, 19333.0], [25.1, 19333.0], [25.2, 19333.0], [25.3, 19333.0], [25.4, 19333.0], [25.5, 19333.0], [25.6, 19333.0], [25.7, 19333.0], [25.8, 19333.0], [25.9, 19333.0], [26.0, 20266.0], [26.1, 20266.0], [26.2, 20266.0], [26.3, 20266.0], [26.4, 20266.0], [26.5, 20266.0], [26.6, 20266.0], [26.7, 20266.0], [26.8, 20266.0], [26.9, 20266.0], [27.0, 21761.0], [27.1, 21761.0], [27.2, 21761.0], [27.3, 21761.0], [27.4, 21761.0], [27.5, 21761.0], [27.6, 21761.0], [27.7, 21761.0], [27.8, 21761.0], [27.9, 21761.0], [28.0, 22557.0], [28.1, 22557.0], [28.2, 22557.0], [28.3, 22557.0], [28.4, 22557.0], [28.5, 22557.0], [28.6, 22557.0], [28.7, 22557.0], [28.8, 22557.0], [28.9, 22557.0], [29.0, 23425.0], [29.1, 23425.0], [29.2, 23425.0], [29.3, 23425.0], [29.4, 23425.0], [29.5, 23425.0], [29.6, 23425.0], [29.7, 23425.0], [29.8, 23425.0], [29.9, 23425.0], [30.0, 24578.0], [30.1, 24578.0], [30.2, 24578.0], [30.3, 24578.0], [30.4, 24578.0], [30.5, 24578.0], [30.6, 24578.0], [30.7, 24578.0], [30.8, 24578.0], [30.9, 24578.0], [31.0, 25708.0], [31.1, 25708.0], [31.2, 25708.0], [31.3, 25708.0], [31.4, 25708.0], [31.5, 25708.0], [31.6, 25708.0], [31.7, 25708.0], [31.8, 25708.0], [31.9, 25708.0], [32.0, 26908.0], [32.1, 26908.0], [32.2, 26908.0], [32.3, 26908.0], [32.4, 26908.0], [32.5, 26908.0], [32.6, 26908.0], [32.7, 26908.0], [32.8, 26908.0], [32.9, 26908.0], [33.0, 27894.0], [33.1, 27894.0], [33.2, 27894.0], [33.3, 27894.0], [33.4, 27894.0], [33.5, 27894.0], [33.6, 27894.0], [33.7, 27894.0], [33.8, 27894.0], [33.9, 27894.0], [34.0, 29139.0], [34.1, 29139.0], [34.2, 29139.0], [34.3, 29139.0], [34.4, 29139.0], [34.5, 29139.0], [34.6, 29139.0], [34.7, 29139.0], [34.8, 29139.0], [34.9, 29139.0], [35.0, 30016.0], [35.1, 30016.0], [35.2, 30016.0], [35.3, 30016.0], [35.4, 30016.0], [35.5, 30016.0], [35.6, 30016.0], [35.7, 30016.0], [35.8, 30016.0], [35.9, 30016.0], [36.0, 30952.0], [36.1, 30952.0], [36.2, 30952.0], [36.3, 30952.0], [36.4, 30952.0], [36.5, 30952.0], [36.6, 30952.0], [36.7, 30952.0], [36.8, 30952.0], [36.9, 30952.0], [37.0, 31831.0], [37.1, 31831.0], [37.2, 31831.0], [37.3, 31831.0], [37.4, 31831.0], [37.5, 31831.0], [37.6, 31831.0], [37.7, 31831.0], [37.8, 31831.0], [37.9, 31831.0], [38.0, 33123.0], [38.1, 33123.0], [38.2, 33123.0], [38.3, 33123.0], [38.4, 33123.0], [38.5, 33123.0], [38.6, 33123.0], [38.7, 33123.0], [38.8, 33123.0], [38.9, 33123.0], [39.0, 34013.0], [39.1, 34013.0], [39.2, 34013.0], [39.3, 34013.0], [39.4, 34013.0], [39.5, 34013.0], [39.6, 34013.0], [39.7, 34013.0], [39.8, 34013.0], [39.9, 34013.0], [40.0, 35344.0], [40.1, 35344.0], [40.2, 35344.0], [40.3, 35344.0], [40.4, 35344.0], [40.5, 35344.0], [40.6, 35344.0], [40.7, 35344.0], [40.8, 35344.0], [40.9, 35344.0], [41.0, 36267.0], [41.1, 36267.0], [41.2, 36267.0], [41.3, 36267.0], [41.4, 36267.0], [41.5, 36267.0], [41.6, 36267.0], [41.7, 36267.0], [41.8, 36267.0], [41.9, 36267.0], [42.0, 37162.0], [42.1, 37162.0], [42.2, 37162.0], [42.3, 37162.0], [42.4, 37162.0], [42.5, 37162.0], [42.6, 37162.0], [42.7, 37162.0], [42.8, 37162.0], [42.9, 37162.0], [43.0, 38101.0], [43.1, 38101.0], [43.2, 38101.0], [43.3, 38101.0], [43.4, 38101.0], [43.5, 38101.0], [43.6, 38101.0], [43.7, 38101.0], [43.8, 38101.0], [43.9, 38101.0], [44.0, 39047.0], [44.1, 39047.0], [44.2, 39047.0], [44.3, 39047.0], [44.4, 39047.0], [44.5, 39047.0], [44.6, 39047.0], [44.7, 39047.0], [44.8, 39047.0], [44.9, 39047.0], [45.0, 40446.0], [45.1, 40446.0], [45.2, 40446.0], [45.3, 40446.0], [45.4, 40446.0], [45.5, 40446.0], [45.6, 40446.0], [45.7, 40446.0], [45.8, 40446.0], [45.9, 40446.0], [46.0, 41626.0], [46.1, 41626.0], [46.2, 41626.0], [46.3, 41626.0], [46.4, 41626.0], [46.5, 41626.0], [46.6, 41626.0], [46.7, 41626.0], [46.8, 41626.0], [46.9, 41626.0], [47.0, 42594.0], [47.1, 42594.0], [47.2, 42594.0], [47.3, 42594.0], [47.4, 42594.0], [47.5, 42594.0], [47.6, 42594.0], [47.7, 42594.0], [47.8, 42594.0], [47.9, 42594.0], [48.0, 43799.0], [48.1, 43799.0], [48.2, 43799.0], [48.3, 43799.0], [48.4, 43799.0], [48.5, 43799.0], [48.6, 43799.0], [48.7, 43799.0], [48.8, 43799.0], [48.9, 43799.0], [49.0, 44712.0], [49.1, 44712.0], [49.2, 44712.0], [49.3, 44712.0], [49.4, 44712.0], [49.5, 44712.0], [49.6, 44712.0], [49.7, 44712.0], [49.8, 44712.0], [49.9, 44712.0], [50.0, 45990.0], [50.1, 45990.0], [50.2, 45990.0], [50.3, 45990.0], [50.4, 45990.0], [50.5, 45990.0], [50.6, 45990.0], [50.7, 45990.0], [50.8, 45990.0], [50.9, 45990.0], [51.0, 47320.0], [51.1, 47320.0], [51.2, 47320.0], [51.3, 47320.0], [51.4, 47320.0], [51.5, 47320.0], [51.6, 47320.0], [51.7, 47320.0], [51.8, 47320.0], [51.9, 47320.0], [52.0, 48309.0], [52.1, 48309.0], [52.2, 48309.0], [52.3, 48309.0], [52.4, 48309.0], [52.5, 48309.0], [52.6, 48309.0], [52.7, 48309.0], [52.8, 48309.0], [52.9, 48309.0], [53.0, 49121.0], [53.1, 49121.0], [53.2, 49121.0], [53.3, 49121.0], [53.4, 49121.0], [53.5, 49121.0], [53.6, 49121.0], [53.7, 49121.0], [53.8, 49121.0], [53.9, 49121.0], [54.0, 50093.0], [54.1, 50093.0], [54.2, 50093.0], [54.3, 50093.0], [54.4, 50093.0], [54.5, 50093.0], [54.6, 50093.0], [54.7, 50093.0], [54.8, 50093.0], [54.9, 50093.0], [55.0, 51267.0], [55.1, 51267.0], [55.2, 51267.0], [55.3, 51267.0], [55.4, 51267.0], [55.5, 51267.0], [55.6, 51267.0], [55.7, 51267.0], [55.8, 51267.0], [55.9, 51267.0], [56.0, 52027.0], [56.1, 52027.0], [56.2, 52027.0], [56.3, 52027.0], [56.4, 52027.0], [56.5, 52027.0], [56.6, 52027.0], [56.7, 52027.0], [56.8, 52027.0], [56.9, 52027.0], [57.0, 53279.0], [57.1, 53279.0], [57.2, 53279.0], [57.3, 53279.0], [57.4, 53279.0], [57.5, 53279.0], [57.6, 53279.0], [57.7, 53279.0], [57.8, 53279.0], [57.9, 53279.0], [58.0, 54521.0], [58.1, 54521.0], [58.2, 54521.0], [58.3, 54521.0], [58.4, 54521.0], [58.5, 54521.0], [58.6, 54521.0], [58.7, 54521.0], [58.8, 54521.0], [58.9, 54521.0], [59.0, 55414.0], [59.1, 55414.0], [59.2, 55414.0], [59.3, 55414.0], [59.4, 55414.0], [59.5, 55414.0], [59.6, 55414.0], [59.7, 55414.0], [59.8, 55414.0], [59.9, 55414.0], [60.0, 55925.0], [60.1, 55925.0], [60.2, 55925.0], [60.3, 55925.0], [60.4, 55925.0], [60.5, 55925.0], [60.6, 55925.0], [60.7, 55925.0], [60.8, 55925.0], [60.9, 55925.0], [61.0, 56765.0], [61.1, 56765.0], [61.2, 56765.0], [61.3, 56765.0], [61.4, 56765.0], [61.5, 56765.0], [61.6, 56765.0], [61.7, 56765.0], [61.8, 56765.0], [61.9, 56765.0], [62.0, 57616.0], [62.1, 57616.0], [62.2, 57616.0], [62.3, 57616.0], [62.4, 57616.0], [62.5, 57616.0], [62.6, 57616.0], [62.7, 57616.0], [62.8, 57616.0], [62.9, 57616.0], [63.0, 58364.0], [63.1, 58364.0], [63.2, 58364.0], [63.3, 58364.0], [63.4, 58364.0], [63.5, 58364.0], [63.6, 58364.0], [63.7, 58364.0], [63.8, 58364.0], [63.9, 58364.0], [64.0, 58887.0], [64.1, 58887.0], [64.2, 58887.0], [64.3, 58887.0], [64.4, 58887.0], [64.5, 58887.0], [64.6, 58887.0], [64.7, 58887.0], [64.8, 58887.0], [64.9, 58887.0], [65.0, 59554.0], [65.1, 59554.0], [65.2, 59554.0], [65.3, 59554.0], [65.4, 59554.0], [65.5, 59554.0], [65.6, 59554.0], [65.7, 59554.0], [65.8, 59554.0], [65.9, 59554.0], [66.0, 60337.0], [66.1, 60337.0], [66.2, 60337.0], [66.3, 60337.0], [66.4, 60337.0], [66.5, 60337.0], [66.6, 60337.0], [66.7, 60337.0], [66.8, 60337.0], [66.9, 60337.0], [67.0, 60911.0], [67.1, 60911.0], [67.2, 60911.0], [67.3, 60911.0], [67.4, 60911.0], [67.5, 60911.0], [67.6, 60911.0], [67.7, 60911.0], [67.8, 60911.0], [67.9, 60911.0], [68.0, 61787.0], [68.1, 61787.0], [68.2, 61787.0], [68.3, 61787.0], [68.4, 61787.0], [68.5, 61787.0], [68.6, 61787.0], [68.7, 61787.0], [68.8, 61787.0], [68.9, 61787.0], [69.0, 62459.0], [69.1, 62459.0], [69.2, 62459.0], [69.3, 62459.0], [69.4, 62459.0], [69.5, 62459.0], [69.6, 62459.0], [69.7, 62459.0], [69.8, 62459.0], [69.9, 62459.0], [70.0, 63067.0], [70.1, 63067.0], [70.2, 63067.0], [70.3, 63067.0], [70.4, 63067.0], [70.5, 63067.0], [70.6, 63067.0], [70.7, 63067.0], [70.8, 63067.0], [70.9, 63067.0], [71.0, 63886.0], [71.1, 63886.0], [71.2, 63886.0], [71.3, 63886.0], [71.4, 63886.0], [71.5, 63886.0], [71.6, 63886.0], [71.7, 63886.0], [71.8, 63886.0], [71.9, 63886.0], [72.0, 64533.0], [72.1, 64533.0], [72.2, 64533.0], [72.3, 64533.0], [72.4, 64533.0], [72.5, 64533.0], [72.6, 64533.0], [72.7, 64533.0], [72.8, 64533.0], [72.9, 64533.0], [73.0, 65089.0], [73.1, 65089.0], [73.2, 65089.0], [73.3, 65089.0], [73.4, 65089.0], [73.5, 65089.0], [73.6, 65089.0], [73.7, 65089.0], [73.8, 65089.0], [73.9, 65089.0], [74.0, 65716.0], [74.1, 65716.0], [74.2, 65716.0], [74.3, 65716.0], [74.4, 65716.0], [74.5, 65716.0], [74.6, 65716.0], [74.7, 65716.0], [74.8, 65716.0], [74.9, 65716.0], [75.0, 66338.0], [75.1, 66338.0], [75.2, 66338.0], [75.3, 66338.0], [75.4, 66338.0], [75.5, 66338.0], [75.6, 66338.0], [75.7, 66338.0], [75.8, 66338.0], [75.9, 66338.0], [76.0, 67217.0], [76.1, 67217.0], [76.2, 67217.0], [76.3, 67217.0], [76.4, 67217.0], [76.5, 67217.0], [76.6, 67217.0], [76.7, 67217.0], [76.8, 67217.0], [76.9, 67217.0], [77.0, 67787.0], [77.1, 67787.0], [77.2, 67787.0], [77.3, 67787.0], [77.4, 67787.0], [77.5, 67787.0], [77.6, 67787.0], [77.7, 67787.0], [77.8, 67787.0], [77.9, 67787.0], [78.0, 68665.0], [78.1, 68665.0], [78.2, 68665.0], [78.3, 68665.0], [78.4, 68665.0], [78.5, 68665.0], [78.6, 68665.0], [78.7, 68665.0], [78.8, 68665.0], [78.9, 68665.0], [79.0, 69227.0], [79.1, 69227.0], [79.2, 69227.0], [79.3, 69227.0], [79.4, 69227.0], [79.5, 69227.0], [79.6, 69227.0], [79.7, 69227.0], [79.8, 69227.0], [79.9, 69227.0], [80.0, 69850.0], [80.1, 69850.0], [80.2, 69850.0], [80.3, 69850.0], [80.4, 69850.0], [80.5, 69850.0], [80.6, 69850.0], [80.7, 69850.0], [80.8, 69850.0], [80.9, 69850.0], [81.0, 70728.0], [81.1, 70728.0], [81.2, 70728.0], [81.3, 70728.0], [81.4, 70728.0], [81.5, 70728.0], [81.6, 70728.0], [81.7, 70728.0], [81.8, 70728.0], [81.9, 70728.0], [82.0, 71305.0], [82.1, 71305.0], [82.2, 71305.0], [82.3, 71305.0], [82.4, 71305.0], [82.5, 71305.0], [82.6, 71305.0], [82.7, 71305.0], [82.8, 71305.0], [82.9, 71305.0], [83.0, 71918.0], [83.1, 71918.0], [83.2, 71918.0], [83.3, 71918.0], [83.4, 71918.0], [83.5, 71918.0], [83.6, 71918.0], [83.7, 71918.0], [83.8, 71918.0], [83.9, 71918.0], [84.0, 72539.0], [84.1, 72539.0], [84.2, 72539.0], [84.3, 72539.0], [84.4, 72539.0], [84.5, 72539.0], [84.6, 72539.0], [84.7, 72539.0], [84.8, 72539.0], [84.9, 72539.0], [85.0, 73154.0], [85.1, 73154.0], [85.2, 73154.0], [85.3, 73154.0], [85.4, 73154.0], [85.5, 73154.0], [85.6, 73154.0], [85.7, 73154.0], [85.8, 73154.0], [85.9, 73154.0], [86.0, 74024.0], [86.1, 74024.0], [86.2, 74024.0], [86.3, 74024.0], [86.4, 74024.0], [86.5, 74024.0], [86.6, 74024.0], [86.7, 74024.0], [86.8, 74024.0], [86.9, 74024.0], [87.0, 74598.0], [87.1, 74598.0], [87.2, 74598.0], [87.3, 74598.0], [87.4, 74598.0], [87.5, 74598.0], [87.6, 74598.0], [87.7, 74598.0], [87.8, 74598.0], [87.9, 74598.0], [88.0, 75480.0], [88.1, 75480.0], [88.2, 75480.0], [88.3, 75480.0], [88.4, 75480.0], [88.5, 75480.0], [88.6, 75480.0], [88.7, 75480.0], [88.8, 75480.0], [88.9, 75480.0], [89.0, 76063.0], [89.1, 76063.0], [89.2, 76063.0], [89.3, 76063.0], [89.4, 76063.0], [89.5, 76063.0], [89.6, 76063.0], [89.7, 76063.0], [89.8, 76063.0], [89.9, 76063.0], [90.0, 76680.0], [90.1, 76680.0], [90.2, 76680.0], [90.3, 76680.0], [90.4, 76680.0], [90.5, 76680.0], [90.6, 76680.0], [90.7, 76680.0], [90.8, 76680.0], [90.9, 76680.0], [91.0, 77563.0], [91.1, 77563.0], [91.2, 77563.0], [91.3, 77563.0], [91.4, 77563.0], [91.5, 77563.0], [91.6, 77563.0], [91.7, 77563.0], [91.8, 77563.0], [91.9, 77563.0], [92.0, 78140.0], [92.1, 78140.0], [92.2, 78140.0], [92.3, 78140.0], [92.4, 78140.0], [92.5, 78140.0], [92.6, 78140.0], [92.7, 78140.0], [92.8, 78140.0], [92.9, 78140.0], [93.0, 78753.0], [93.1, 78753.0], [93.2, 78753.0], [93.3, 78753.0], [93.4, 78753.0], [93.5, 78753.0], [93.6, 78753.0], [93.7, 78753.0], [93.8, 78753.0], [93.9, 78753.0], [94.0, 79379.0], [94.1, 79379.0], [94.2, 79379.0], [94.3, 79379.0], [94.4, 79379.0], [94.5, 79379.0], [94.6, 79379.0], [94.7, 79379.0], [94.8, 79379.0], [94.9, 79379.0], [95.0, 79991.0], [95.1, 79991.0], [95.2, 79991.0], [95.3, 79991.0], [95.4, 79991.0], [95.5, 79991.0], [95.6, 79991.0], [95.7, 79991.0], [95.8, 79991.0], [95.9, 79991.0], [96.0, 80865.0], [96.1, 80865.0], [96.2, 80865.0], [96.3, 80865.0], [96.4, 80865.0], [96.5, 80865.0], [96.6, 80865.0], [96.7, 80865.0], [96.8, 80865.0], [96.9, 80865.0], [97.0, 81433.0], [97.1, 81433.0], [97.2, 81433.0], [97.3, 81433.0], [97.4, 81433.0], [97.5, 81433.0], [97.6, 81433.0], [97.7, 81433.0], [97.8, 81433.0], [97.9, 81433.0], [98.0, 82304.0], [98.1, 82304.0], [98.2, 82304.0], [98.3, 82304.0], [98.4, 82304.0], [98.5, 82304.0], [98.6, 82304.0], [98.7, 82304.0], [98.8, 82304.0], [98.9, 82304.0], [99.0, 82866.0], [99.1, 82866.0], [99.2, 82866.0], [99.3, 82866.0], [99.4, 82866.0], [99.5, 82866.0], [99.6, 82866.0], [99.7, 82866.0], [99.8, 82866.0], [99.9, 82866.0]], "isOverall": false, "label": "HTTP Request", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 100.0, "title": "Response Time Percentiles"}},
        getOptions: function() {
            return {
                series: {
                    points: { show: false }
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentiles'
                },
                xaxis: {
                    tickDecimals: 1,
                    axisLabel: "Percentiles",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Percentile value in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : %x.2 percentile was %y ms"
                },
                selection: { mode: "xy" },
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentiles"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesPercentiles"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesPercentiles"), dataset, prepareOverviewOptions(options));
        }
};

/**
 * @param elementId Id of element where we display message
 */
function setEmptyGraph(elementId) {
    $(function() {
        $(elementId).text("No graph series with filter="+seriesFilter);
    });
}

// Response times percentiles
function refreshResponseTimePercentiles() {
    var infos = responseTimePercentilesInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimePercentiles");
        return;
    }
    if (isGraph($("#flotResponseTimesPercentiles"))){
        infos.createGraph();
    } else {
        var choiceContainer = $("#choicesResponseTimePercentiles");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesPercentiles", "#overviewResponseTimesPercentiles");
        $('#bodyResponseTimePercentiles .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimeDistributionInfos = {
        data: {"result": {"minY": 1.0, "minX": 2800.0, "maxY": 9.0, "series": [{"data": [[2800.0, 1.0], [3000.0, 9.0], [4200.0, 1.0], [65700.0, 1.0], [66300.0, 1.0], [67700.0, 1.0], [70700.0, 1.0], [71300.0, 1.0], [71900.0, 1.0], [72500.0, 1.0], [73100.0, 1.0], [74500.0, 1.0], [77500.0, 1.0], [78100.0, 1.0], [78700.0, 1.0], [79300.0, 1.0], [79900.0, 1.0], [5200.0, 1.0], [82300.0, 1.0], [6100.0, 1.0], [7100.0, 1.0], [8000.0, 1.0], [8900.0, 1.0], [10200.0, 1.0], [11100.0, 1.0], [12000.0, 1.0], [13000.0, 1.0], [14000.0, 1.0], [15000.0, 1.0], [16200.0, 1.0], [17100.0, 1.0], [18500.0, 1.0], [19300.0, 1.0], [20200.0, 1.0], [21700.0, 1.0], [22500.0, 1.0], [23400.0, 1.0], [24500.0, 1.0], [25700.0, 1.0], [26900.0, 1.0], [27800.0, 1.0], [29100.0, 1.0], [30000.0, 1.0], [30900.0, 1.0], [31800.0, 1.0], [33100.0, 1.0], [34000.0, 1.0], [35300.0, 1.0], [36200.0, 1.0], [37100.0, 1.0], [38100.0, 1.0], [39000.0, 1.0], [40400.0, 1.0], [41600.0, 1.0], [42500.0, 1.0], [43700.0, 1.0], [44700.0, 1.0], [45900.0, 1.0], [47300.0, 1.0], [48300.0, 1.0], [49100.0, 1.0], [50000.0, 1.0], [51200.0, 1.0], [52000.0, 1.0], [53200.0, 1.0], [54500.0, 1.0], [55400.0, 1.0], [55900.0, 1.0], [56700.0, 1.0], [57600.0, 1.0], [58300.0, 1.0], [58800.0, 1.0], [59500.0, 1.0], [60300.0, 1.0], [60900.0, 1.0], [61700.0, 1.0], [62400.0, 1.0], [63000.0, 1.0], [63800.0, 1.0], [64500.0, 1.0], [65000.0, 1.0], [67200.0, 1.0], [68600.0, 1.0], [69200.0, 1.0], [69800.0, 1.0], [74000.0, 1.0], [75400.0, 1.0], [76000.0, 1.0], [76600.0, 1.0], [80800.0, 1.0], [81400.0, 1.0], [82800.0, 1.0]], "isOverall": false, "label": "HTTP Request", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 100, "maxX": 82800.0, "title": "Response Time Distribution"}},
        getOptions: function() {
            var granularity = this.data.result.granularity;
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    barWidth: this.data.result.granularity
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " responses for " + label + " were between " + xval + " and " + (xval + granularity) + " ms";
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimeDistribution"), prepareData(data.result.series, $("#choicesResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshResponseTimeDistribution() {
    var infos = responseTimeDistributionInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeDistribution");
        return;
    }
    if (isGraph($("#flotResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var syntheticResponseTimeDistributionInfos = {
        data: {"result": {"minY": 50.0, "minX": 2.0, "ticks": [[0, "Requests having \nresponse time <= 500ms"], [1, "Requests having \nresponse time > 500ms and <= 1,500ms"], [2, "Requests having \nresponse time > 1,500ms"], [3, "Requests in error"]], "maxY": 50.0, "series": [{"data": [], "color": "#9ACD32", "isOverall": false, "label": "Requests having \nresponse time <= 500ms", "isController": false}, {"data": [], "color": "yellow", "isOverall": false, "label": "Requests having \nresponse time > 500ms and <= 1,500ms", "isController": false}, {"data": [[2.0, 50.0]], "color": "orange", "isOverall": false, "label": "Requests having \nresponse time > 1,500ms", "isController": false}, {"data": [[3.0, 50.0]], "color": "#FF6347", "isOverall": false, "label": "Requests in error", "isController": false}], "supportsControllersDiscrimination": false, "maxX": 3.0, "title": "Synthetic Response Times Distribution"}},
        getOptions: function() {
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendSyntheticResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times ranges",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                    tickLength:0,
                    min:-0.5,
                    max:3.5
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    align: "center",
                    barWidth: 0.25,
                    fill:.75
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " " + label;
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            options.xaxis.ticks = data.result.ticks;
            $.plot($("#flotSyntheticResponseTimeDistribution"), prepareData(data.result.series, $("#choicesSyntheticResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshSyntheticResponseTimeDistribution() {
    var infos = syntheticResponseTimeDistributionInfos;
    prepareSeries(infos.data, true);
    if (isGraph($("#flotSyntheticResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerSyntheticResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var activeThreadsOverTimeInfos = {
        data: {"result": {"minY": 11.5, "minX": 1.76520858E12, "maxY": 93.06666666666665, "series": [{"data": [[1.76520864E12, 54.0], [1.7652087E12, 11.5], [1.76520858E12, 93.06666666666665]], "isOverall": false, "label": "Shoppers (Race Condition)", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7652087E12, "title": "Active Threads Over Time"}},
        getOptions: function() {
            return {
                series: {
                    stack: true,
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 6,
                    show: true,
                    container: '#legendActiveThreadsOverTime'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                selection: {
                    mode: 'xy'
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : At %x there were %y active threads"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesActiveThreadsOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotActiveThreadsOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewActiveThreadsOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Active Threads Over Time
function refreshActiveThreadsOverTime(fixTimestamps) {
    var infos = activeThreadsOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotActiveThreadsOverTime"))) {
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesActiveThreadsOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotActiveThreadsOverTime", "#overviewActiveThreadsOverTime");
        $('#footerActiveThreadsOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var timeVsThreadsInfos = {
        data: {"result": {"minY": 2840.0, "minX": 1.0, "maxY": 82866.0, "series": [{"data": [[2.0, 82304.0], [3.0, 81433.0], [4.0, 80865.0], [5.0, 79991.0], [6.0, 79379.0], [7.0, 78753.0], [8.0, 78140.0], [9.0, 77563.0], [10.0, 76680.0], [11.0, 76063.0], [12.0, 75480.0], [13.0, 74598.0], [14.0, 74024.0], [15.0, 73154.0], [16.0, 72539.0], [17.0, 71918.0], [18.0, 71305.0], [19.0, 70728.0], [20.0, 69850.0], [21.0, 69227.0], [22.0, 68665.0], [23.0, 67787.0], [24.0, 67217.0], [25.0, 66338.0], [26.0, 65716.0], [27.0, 65089.0], [28.0, 64533.0], [29.0, 63886.0], [30.0, 63067.0], [31.0, 62459.0], [33.0, 60911.0], [32.0, 61787.0], [35.0, 59554.0], [34.0, 60337.0], [37.0, 58364.0], [36.0, 58887.0], [39.0, 56765.0], [38.0, 57616.0], [41.0, 55414.0], [40.0, 55925.0], [43.0, 53279.0], [42.0, 54521.0], [45.0, 51267.0], [44.0, 52027.0], [47.0, 49121.0], [46.0, 50093.0], [49.0, 47320.0], [48.0, 48309.0], [51.0, 44712.0], [50.0, 45990.0], [53.0, 42594.0], [52.0, 43799.0], [55.0, 40446.0], [54.0, 41626.0], [57.0, 38101.0], [56.0, 39047.0], [59.0, 36267.0], [58.0, 37162.0], [61.0, 34013.0], [60.0, 35344.0], [63.0, 31831.0], [62.0, 33123.0], [67.0, 27894.0], [66.0, 29139.0], [65.0, 30016.0], [64.0, 30952.0], [71.0, 23425.0], [70.0, 24578.0], [69.0, 25708.0], [68.0, 26908.0], [75.0, 19333.0], [74.0, 20266.0], [73.0, 21761.0], [72.0, 22557.0], [79.0, 15051.0], [78.0, 16260.0], [77.0, 17149.0], [76.0, 18529.0], [83.0, 11159.0], [82.0, 12094.0], [81.0, 13066.0], [80.0, 14018.0], [87.0, 7119.0], [86.0, 8036.0], [85.0, 8984.0], [84.0, 10280.0], [90.0, 4249.0], [89.0, 5204.0], [88.0, 6163.0], [95.0, 3046.0], [94.0, 3024.0], [93.0, 3052.0], [92.0, 3072.5], [99.0, 3039.0], [98.0, 3040.0], [97.0, 3011.0], [96.0, 3030.0], [100.0, 2840.0], [1.0, 82866.0]], "isOverall": false, "label": "HTTP Request", "isController": false}, {"data": [[50.51, 42872.939999999995]], "isOverall": false, "label": "HTTP Request-Aggregated", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 100.0, "title": "Time VS Threads"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: { noColumns: 2,show: true, container: '#legendTimeVsThreads' },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s: At %x.2 active threads, Average response time was %y.2 ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesTimeVsThreads"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotTimesVsThreads"), dataset, options);
            // setup overview
            $.plot($("#overviewTimesVsThreads"), dataset, prepareOverviewOptions(options));
        }
};

// Time vs threads
function refreshTimeVsThreads(){
    var infos = timeVsThreadsInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTimeVsThreads");
        return;
    }
    if(isGraph($("#flotTimesVsThreads"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTimeVsThreads");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTimesVsThreads", "#overviewTimesVsThreads");
        $('#footerTimeVsThreads .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var bytesThroughputOverTimeInfos = {
        data : {"result": {"minY": 97.4, "minX": 1.76520858E12, "maxY": 624.75, "series": [{"data": [[1.76520864E12, 418.3666666666667], [1.7652087E12, 121.0], [1.76520858E12, 97.4]], "isOverall": false, "label": "Bytes received per second", "isController": false}, {"data": [[1.76520864E12, 624.75], [1.7652087E12, 218.16666666666666], [1.76520858E12, 148.75]], "isOverall": false, "label": "Bytes sent per second", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7652087E12, "title": "Bytes Throughput Over Time"}},
        getOptions : function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity) ,
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Bytes / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendBytesThroughputOverTime'
                },
                selection: {
                    mode: "xy"
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y"
                }
            };
        },
        createGraph : function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesBytesThroughputOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotBytesThroughputOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewBytesThroughputOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Bytes throughput Over Time
function refreshBytesThroughputOverTime(fixTimestamps) {
    var infos = bytesThroughputOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotBytesThroughputOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesBytesThroughputOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotBytesThroughputOverTime", "#overviewBytesThroughputOverTime");
        $('#footerBytesThroughputOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimesOverTimeInfos = {
        data: {"result": {"minY": 4066.5333333333338, "minX": 1.76520858E12, "maxY": 75705.68181818182, "series": [{"data": [[1.76520864E12, 40647.158730158735], [1.7652087E12, 75705.68181818182], [1.76520858E12, 4066.5333333333338]], "isOverall": false, "label": "HTTP Request", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7652087E12, "title": "Response Time Over Time"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average response time was %y ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Times Over Time
function refreshResponseTimeOverTime(fixTimestamps) {
    var infos = responseTimesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotResponseTimesOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesOverTime", "#overviewResponseTimesOverTime");
        $('#footerResponseTimesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var latenciesOverTimeInfos = {
        data: {"result": {"minY": 4066.0, "minX": 1.76520858E12, "maxY": 75705.68181818182, "series": [{"data": [[1.76520864E12, 40647.11111111111], [1.7652087E12, 75705.68181818182], [1.76520858E12, 4066.0]], "isOverall": false, "label": "HTTP Request", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7652087E12, "title": "Latencies Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response latencies in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendLatenciesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average latency was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesLatenciesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotLatenciesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewLatenciesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Latencies Over Time
function refreshLatenciesOverTime(fixTimestamps) {
    var infos = latenciesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyLatenciesOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotLatenciesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesLatenciesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotLatenciesOverTime", "#overviewLatenciesOverTime");
        $('#footerLatenciesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var connectTimeOverTimeInfos = {
        data: {"result": {"minY": 0.9090909090909088, "minX": 1.76520858E12, "maxY": 36.4, "series": [{"data": [[1.76520864E12, 3.730158730158729], [1.7652087E12, 0.9090909090909088], [1.76520858E12, 36.4]], "isOverall": false, "label": "HTTP Request", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7652087E12, "title": "Connect Time Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getConnectTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average Connect Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendConnectTimeOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average connect time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesConnectTimeOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotConnectTimeOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewConnectTimeOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Connect Time Over Time
function refreshConnectTimeOverTime(fixTimestamps) {
    var infos = connectTimeOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyConnectTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotConnectTimeOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesConnectTimeOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotConnectTimeOverTime", "#overviewConnectTimeOverTime");
        $('#footerConnectTimeOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var responseTimePercentilesOverTimeInfos = {
        data: {"result": {"minY": 2840.0, "minX": 1.76520858E12, "maxY": 54521.0, "series": [{"data": [[1.76520864E12, 54521.0], [1.76520858E12, 8036.0]], "isOverall": false, "label": "Max", "isController": false}, {"data": [[1.76520864E12, 50680.0], [1.76520858E12, 8036.0]], "isOverall": false, "label": "90th percentile", "isController": false}, {"data": [[1.76520864E12, 54521.0], [1.76520858E12, 8036.0]], "isOverall": false, "label": "99th percentile", "isController": false}, {"data": [[1.76520864E12, 52966.0], [1.76520858E12, 8036.0]], "isOverall": false, "label": "95th percentile", "isController": false}, {"data": [[1.76520864E12, 8984.0], [1.76520858E12, 2840.0]], "isOverall": false, "label": "Min", "isController": false}, {"data": [[1.76520864E12, 31391.5], [1.76520858E12, 5683.5]], "isOverall": false, "label": "Median", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76520864E12, "title": "Response Time Percentiles Over Time (successful requests only)"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Response Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentilesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Response time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentilesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimePercentilesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimePercentilesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Time Percentiles Over Time
function refreshResponseTimePercentilesOverTime(fixTimestamps) {
    var infos = responseTimePercentilesOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotResponseTimePercentilesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimePercentilesOverTime", "#overviewResponseTimePercentilesOverTime");
        $('#footerResponseTimePercentilesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var responseTimeVsRequestInfos = {
    data: {"result": {"minY": 2840.0, "minX": 1.0, "maxY": 69227.0, "series": [{"data": [[1.0, 27894.0], [2.0, 36714.5], [10.0, 2840.0]], "isOverall": false, "label": "Successes", "isController": false}, {"data": [[2.0, 68818.5], [1.0, 69227.0], [10.0, 3040.0]], "isOverall": false, "label": "Failures", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 10.0, "title": "Response Time Vs Request"}},
    getOptions: function() {
        return {
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Response Time in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: {
                noColumns: 2,
                show: true,
                container: '#legendResponseTimeVsRequest'
            },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median response time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesResponseTimeVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotResponseTimeVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewResponseTimeVsRequest"), dataset, prepareOverviewOptions(options));

    }
};

// Response Time vs Request
function refreshResponseTimeVsRequest() {
    var infos = responseTimeVsRequestInfos;
    prepareSeries(infos.data);
    if (isGraph($("#flotResponseTimeVsRequest"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeVsRequest");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimeVsRequest", "#overviewResponseTimeVsRequest");
        $('#footerResponseRimeVsRequest .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var latenciesVsRequestInfos = {
    data: {"result": {"minY": 2832.0, "minX": 1.0, "maxY": 69227.0, "series": [{"data": [[1.0, 27894.0], [2.0, 36714.5], [10.0, 2832.0]], "isOverall": false, "label": "Successes", "isController": false}, {"data": [[2.0, 68818.5], [1.0, 69227.0], [10.0, 3040.0]], "isOverall": false, "label": "Failures", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 10.0, "title": "Latencies Vs Request"}},
    getOptions: function() {
        return{
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Latency in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: { noColumns: 2,show: true, container: '#legendLatencyVsRequest' },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median Latency time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesLatencyVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotLatenciesVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewLatenciesVsRequest"), dataset, prepareOverviewOptions(options));
    }
};

// Latencies vs Request
function refreshLatenciesVsRequest() {
        var infos = latenciesVsRequestInfos;
        prepareSeries(infos.data);
        if(isGraph($("#flotLatenciesVsRequest"))){
            infos.createGraph();
        }else{
            var choiceContainer = $("#choicesLatencyVsRequest");
            createLegend(choiceContainer, infos);
            infos.createGraph();
            setGraphZoomable("#flotLatenciesVsRequest", "#overviewLatenciesVsRequest");
            $('#footerLatenciesVsRequest .legendColorBox > div').each(function(i){
                $(this).clone().prependTo(choiceContainer.find("li").eq(i));
            });
        }
};

var hitsPerSecondInfos = {
        data: {"result": {"minY": 1.6666666666666667, "minX": 1.76520858E12, "maxY": 1.6666666666666667, "series": [{"data": [[1.76520858E12, 1.6666666666666667]], "isOverall": false, "label": "hitsPerSecond", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76520858E12, "title": "Hits Per Second"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of hits / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendHitsPerSecond"
                },
                selection: {
                    mode : 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y.2 hits/sec"
                }
            };
        },
        createGraph: function createGraph() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesHitsPerSecond"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotHitsPerSecond"), dataset, options);
            // setup overview
            $.plot($("#overviewHitsPerSecond"), dataset, prepareOverviewOptions(options));
        }
};

// Hits per second
function refreshHitsPerSecond(fixTimestamps) {
    var infos = hitsPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if (isGraph($("#flotHitsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesHitsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotHitsPerSecond", "#overviewHitsPerSecond");
        $('#footerHitsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var codesPerSecondInfos = {
        data: {"result": {"minY": 0.1, "minX": 1.76520858E12, "maxY": 0.7333333333333333, "series": [{"data": [[1.76520864E12, 0.7333333333333333], [1.76520858E12, 0.1]], "isOverall": false, "label": "200", "isController": false}, {"data": [[1.76520864E12, 0.31666666666666665], [1.7652087E12, 0.36666666666666664], [1.76520858E12, 0.15]], "isOverall": false, "label": "500", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7652087E12, "title": "Codes Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendCodesPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "Number of Response Codes %s at %x was %y.2 responses / sec"
                }
            };
        },
    createGraph: function() {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesCodesPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotCodesPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewCodesPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Codes per second
function refreshCodesPerSecond(fixTimestamps) {
    var infos = codesPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotCodesPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesCodesPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotCodesPerSecond", "#overviewCodesPerSecond");
        $('#footerCodesPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var transactionsPerSecondInfos = {
        data: {"result": {"minY": 0.1, "minX": 1.76520858E12, "maxY": 0.7333333333333333, "series": [{"data": [[1.76520864E12, 0.7333333333333333], [1.76520858E12, 0.1]], "isOverall": false, "label": "HTTP Request-success", "isController": false}, {"data": [[1.76520864E12, 0.31666666666666665], [1.7652087E12, 0.36666666666666664], [1.76520858E12, 0.15]], "isOverall": false, "label": "HTTP Request-failure", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7652087E12, "title": "Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTransactionsPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                }
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTransactionsPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTransactionsPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewTransactionsPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Transactions per second
function refreshTransactionsPerSecond(fixTimestamps) {
    var infos = transactionsPerSecondInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTransactionsPerSecond");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotTransactionsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTransactionsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTransactionsPerSecond", "#overviewTransactionsPerSecond");
        $('#footerTransactionsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var totalTPSInfos = {
        data: {"result": {"minY": 0.1, "minX": 1.76520858E12, "maxY": 0.7333333333333333, "series": [{"data": [[1.76520864E12, 0.7333333333333333], [1.76520858E12, 0.1]], "isOverall": false, "label": "Transaction-success", "isController": false}, {"data": [[1.76520864E12, 0.31666666666666665], [1.7652087E12, 0.36666666666666664], [1.76520858E12, 0.15]], "isOverall": false, "label": "Transaction-failure", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7652087E12, "title": "Total Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTotalTPS"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                },
                colors: ["#9ACD32", "#FF6347"]
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTotalTPS"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTotalTPS"), dataset, options);
        // setup overview
        $.plot($("#overviewTotalTPS"), dataset, prepareOverviewOptions(options));
    }
};

// Total Transactions per second
function refreshTotalTPS(fixTimestamps) {
    var infos = totalTPSInfos;
    // We want to ignore seriesFilter
    prepareSeries(infos.data, false, true);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotTotalTPS"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTotalTPS");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTotalTPS", "#overviewTotalTPS");
        $('#footerTotalTPS .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

// Collapse the graph matching the specified DOM element depending the collapsed
// status
function collapse(elem, collapsed){
    if(collapsed){
        $(elem).parent().find(".fa-chevron-up").removeClass("fa-chevron-up").addClass("fa-chevron-down");
    } else {
        $(elem).parent().find(".fa-chevron-down").removeClass("fa-chevron-down").addClass("fa-chevron-up");
        if (elem.id == "bodyBytesThroughputOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshBytesThroughputOverTime(true);
            }
            document.location.href="#bytesThroughputOverTime";
        } else if (elem.id == "bodyLatenciesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesOverTime(true);
            }
            document.location.href="#latenciesOverTime";
        } else if (elem.id == "bodyCustomGraph") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCustomGraph(true);
            }
            document.location.href="#responseCustomGraph";
        } else if (elem.id == "bodyConnectTimeOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshConnectTimeOverTime(true);
            }
            document.location.href="#connectTimeOverTime";
        } else if (elem.id == "bodyResponseTimePercentilesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimePercentilesOverTime(true);
            }
            document.location.href="#responseTimePercentilesOverTime";
        } else if (elem.id == "bodyResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeDistribution();
            }
            document.location.href="#responseTimeDistribution" ;
        } else if (elem.id == "bodySyntheticResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshSyntheticResponseTimeDistribution();
            }
            document.location.href="#syntheticResponseTimeDistribution" ;
        } else if (elem.id == "bodyActiveThreadsOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshActiveThreadsOverTime(true);
            }
            document.location.href="#activeThreadsOverTime";
        } else if (elem.id == "bodyTimeVsThreads") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTimeVsThreads();
            }
            document.location.href="#timeVsThreads" ;
        } else if (elem.id == "bodyCodesPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCodesPerSecond(true);
            }
            document.location.href="#codesPerSecond";
        } else if (elem.id == "bodyTransactionsPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTransactionsPerSecond(true);
            }
            document.location.href="#transactionsPerSecond";
        } else if (elem.id == "bodyTotalTPS") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTotalTPS(true);
            }
            document.location.href="#totalTPS";
        } else if (elem.id == "bodyResponseTimeVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeVsRequest();
            }
            document.location.href="#responseTimeVsRequest";
        } else if (elem.id == "bodyLatenciesVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesVsRequest();
            }
            document.location.href="#latencyVsRequest";
        }
    }
}

/*
 * Activates or deactivates all series of the specified graph (represented by id parameter)
 * depending on checked argument.
 */
function toggleAll(id, checked){
    var placeholder = document.getElementById(id);

    var cases = $(placeholder).find(':checkbox');
    cases.prop('checked', checked);
    $(cases).parent().children().children().toggleClass("legend-disabled", !checked);

    var choiceContainer;
    if ( id == "choicesBytesThroughputOverTime"){
        choiceContainer = $("#choicesBytesThroughputOverTime");
        refreshBytesThroughputOverTime(false);
    } else if(id == "choicesResponseTimesOverTime"){
        choiceContainer = $("#choicesResponseTimesOverTime");
        refreshResponseTimeOverTime(false);
    }else if(id == "choicesResponseCustomGraph"){
        choiceContainer = $("#choicesResponseCustomGraph");
        refreshCustomGraph(false);
    } else if ( id == "choicesLatenciesOverTime"){
        choiceContainer = $("#choicesLatenciesOverTime");
        refreshLatenciesOverTime(false);
    } else if ( id == "choicesConnectTimeOverTime"){
        choiceContainer = $("#choicesConnectTimeOverTime");
        refreshConnectTimeOverTime(false);
    } else if ( id == "choicesResponseTimePercentilesOverTime"){
        choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        refreshResponseTimePercentilesOverTime(false);
    } else if ( id == "choicesResponseTimePercentiles"){
        choiceContainer = $("#choicesResponseTimePercentiles");
        refreshResponseTimePercentiles();
    } else if(id == "choicesActiveThreadsOverTime"){
        choiceContainer = $("#choicesActiveThreadsOverTime");
        refreshActiveThreadsOverTime(false);
    } else if ( id == "choicesTimeVsThreads"){
        choiceContainer = $("#choicesTimeVsThreads");
        refreshTimeVsThreads();
    } else if ( id == "choicesSyntheticResponseTimeDistribution"){
        choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        refreshSyntheticResponseTimeDistribution();
    } else if ( id == "choicesResponseTimeDistribution"){
        choiceContainer = $("#choicesResponseTimeDistribution");
        refreshResponseTimeDistribution();
    } else if ( id == "choicesHitsPerSecond"){
        choiceContainer = $("#choicesHitsPerSecond");
        refreshHitsPerSecond(false);
    } else if(id == "choicesCodesPerSecond"){
        choiceContainer = $("#choicesCodesPerSecond");
        refreshCodesPerSecond(false);
    } else if ( id == "choicesTransactionsPerSecond"){
        choiceContainer = $("#choicesTransactionsPerSecond");
        refreshTransactionsPerSecond(false);
    } else if ( id == "choicesTotalTPS"){
        choiceContainer = $("#choicesTotalTPS");
        refreshTotalTPS(false);
    } else if ( id == "choicesResponseTimeVsRequest"){
        choiceContainer = $("#choicesResponseTimeVsRequest");
        refreshResponseTimeVsRequest();
    } else if ( id == "choicesLatencyVsRequest"){
        choiceContainer = $("#choicesLatencyVsRequest");
        refreshLatenciesVsRequest();
    }
    var color = checked ? "black" : "#818181";
    if(choiceContainer != null) {
        choiceContainer.find("label").each(function(){
            this.style.color = color;
        });
    }
}


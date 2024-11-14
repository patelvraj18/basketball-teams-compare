(function () {
    var instance = null;
    var filterLine;
    var filterRadar;
    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init() {
        // Creating instances for each visualization
        //var lineChart = new LineChart();
        //var radarChart = new RadarChart();
        var lineChart = new LineChart();
        var radarChart = new RadarChart();
        currentChart = lineChart;

        // Listen for changes in the radio button selection
        var chartTypeRadioButtons = document.getElementsByName('chartType');
        chartTypeRadioButtons.forEach(function (radioButton) {
            radioButton.addEventListener('change', function () {
                // Update the currentChart based on the selected radio button
                if (radioButton.value === 'lineChart') {
                    currentChart = lineChart;
                } else if (radioButton.value === 'radarChart') {
                    currentChart = radarChart;
                    // console.log("current chart is radar")
                }

                updateChartVisibility();
            });
        });

        window.onload = function () {
            var dropdownTrigger = document.getElementById("dropdownTrigger");
            if (dropdownTrigger) {
                dropdownTrigger.addEventListener("click", toggleDropdown);
            }
        };

        // Load data and initialize the chart initially
        loadDataAndInitialize(currentChart);
        initWelcomeModal();
    }

    // function init() {
    //     //Creating instances for each visualization
    //     var lineChart = new LineChart();

    //     var radarChart = new RadarChart();

    //     d3.csv("data/features.csv")
    //         .then(function(featuresData) {
    //         // Filter features that have lineChart set to true
    //         var lineChartFeatures = featuresData.filter(function(feature) {
    //             return feature.lineChart === "true";
    //         });

    //         // Extract the names of lineChart features
    //         var features = lineChartFeatures.map(function(d) {
    //             return d.Abbreviation;
    //         });

    //         //console.log("features in main.js --> ",features);

    //         var filter = new filterSelection(lineChart,features);

    //         // Read team data from "teams.csv"
    //         d3.csv("data/teams.csv")
    //             .then(function(teamData) {
    //                 var teamNames = teamData.map(function(d) {
    //                     return d.Team;
    //                 });

    //                 // Call the update function with the team names and lineChart features
    //                 filter.update(teamNames);
    //             });
    //     });
    // }

    /**
    * Load data and initialize the chart with the given data
    * @param {Chart} chartInstance - The chart instance to initialize
    */
    function loadDataAndInitialize(chartInstance) {

        if (chartInstance instanceof LineChart) {
            if (filterRadar != null) {
                console.log(filterRadar.teamName1);
                console.log(filterRadar.teamName2);
            }
            d3.csv("data/features.csv")
                .then(function (featuresData) {
                    // Filter features that have lineChart set to true
                    var lineChartFeatures = featuresData.filter(function (feature) {
                        return feature.lineChart === "true";
                    });

                    // var radarChartFeatures = featuresData.filter(function(feature){
                    //     return feature.radarChart == "true"
                    // })

                    // Extract the names of lineChart features

                    var features = lineChartFeatures.map(function (d) {
                        return {
                            Abbreviation: d.Abbreviation,
                            Explanation: d.Explanation
                        };
                    });



                    //console.log("features in main.js --> ",features);

                    filterLine = new filterSelectionLine(chartInstance, features);

                    // Read team data from "teams.csv"
                    d3.csv("data/teams.csv")
                        .then(function (teamData) {
                            var teamNames = teamData.map(function (d) {
                                return d.Team;
                            });
                            if (filterRadar != null) {
                                // Call the update function with the team names and lineChart features
                                filterLine.update(teamNames, filterRadar.teamName1, filterRadar.teamName2);
                            }
                            else {
                                filterLine.update(teamNames);
                            }
                        });
                });
        } else {
            // console.log(filterLine.teamName1);
            // console.log(filterLine.teamName2);
            d3.csv("data/features.csv")
                .then(function (featuresData) {

                    var radarChartFeatures = featuresData.filter(function (feature) {
                        return feature.radarChart == "true"
                    })
                    // Extract the names of lineChart featuress
                    var features = radarChartFeatures.map(function (d) {
                        return d.Abbreviation;
                    });

                    // console.log("features in main.js --> ", features);

                    filterRadar = new filterSelectionRadar(chartInstance, features);

                    // Read team data from "teams.csv"
                    d3.csv("data/teams.csv")
                        .then(function (teamData) {
                            // var teamNames = teamData.map(function(d) {
                            //     return d.Team;
                            // });

                            // Call the update function with the team names and lineChart features
                            //console.log("radar chart will be shown")
                            filterRadar.update(teamData, filterLine.teamName1, filterLine.teamName2);
                        });
                });
        }

    }

    /**
     * Update the visibility of chart containers based on the selected chart type
     */
    function updateChartVisibility() {
        // console.log('Current Chart:', currentChart);

        var lineChartContainer = document.getElementById('lineChartContainer');
        var radarChartContainer = document.getElementById('radarChartContainer');

        // Hide/show containers based on the selected chart type
        if (currentChart instanceof LineChart) {
            lineChartContainer.style.display = 'inline-flex';
            radarChartContainer.style.display = 'none';
        } else if (currentChart instanceof RadarChart) {
            lineChartContainer.style.display = 'none';
            radarChartContainer.style.display = 'block';
        }

        // Additional logic or updates based on the selected chart type
        loadDataAndInitialize(currentChart);
    }

    /**
     *
     * @constructor
     */
    function Main() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one Class");
        }
    }

    /**
     *
     * @returns {Main singleton class |*}
     */
    Main.getInstance = function () {
        var self = this
        if (self.instance == null) {
            self.instance = new Main();

            init();
        }
        return instance;
    }

    Main.getInstance();
})();

function initWelcomeModal() {
    var modal = d3.select("#welcomeModal");
    var span = d3.select(".close");

    // Display the modal
    modal.style("display", "block");

    // When the user clicks on <span> (x), close the modal
    span.on("click", function () {
        modal.style("display", "none");
    });

    // When the user clicks anywhere outside of the modal, close it
    d3.select(window).on("click", function (e) {
        if (e.target === modal.node()) {
            modal.style("display", "none");
        }
    });
}

function toggleDropdown() {
    var content = document.getElementById("dropdownContent");
    var chevronDown = document.getElementById("chevronDown");
    var chevronUp = document.getElementById("chevronUp");

    content.classList.toggle("show");

    // Toggle chevron icons
    if (content.classList.contains("show")) {
        chevronDown.style.display = "none";
        chevronUp.style.display = "inline";
    } else {
        chevronDown.style.display = "inline";
        chevronUp.style.display = "none";
    }
}

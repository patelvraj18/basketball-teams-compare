function filterSelectionRadar(radarChart, features) {
    var self = this;

    self.radarChart = radarChart;
    self.features = features;

    self.init();
};


filterSelectionRadar.prototype.init = function () {

    var self = this;
    self.margin = { top: 10, right: 20, bottom: 0, left: 50 };
    var divFilterChart = d3.select("#filterSectionRadar").classed("content", true);
    // var chartsContainer = d3.select('#chartsContainer');
    // var filterSelectionContainer = chartsContainer.append("div")
    //   .style("flex", "1");
    //   filterSelectionContainer.node().appendChild(divFilterChart.node());

    var pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var centerOfPage = pageWidth / 2;

    var leftMargin = centerOfPage - (self.svgWidth / 2);
    self.margin.left = leftMargin;

    self.svgBounds = divFilterChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 100;

    self.svg = divFilterChart.select("svg");
    if (self.svg.empty()) {
        self.svg = divFilterChart.append("svg");
    }

    self.svg
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight)
        .style("margin-left", self.margin.left + "px"); 

    var team1Selector = d3.select("#radarChartContainer #team1Selector");
    var team2Selector = d3.select("#radarChartContainer #team2Selector");

    var yearSelector = d3.select("yearSelector")

    // setting default value for Team 1 (Atlanta Hawks)
    team1Selector.property("value", "Atlanta Hawks");

    // setting default value for Team 2 (Boston Celtics)
    team2Selector.property("value", "Boston Celtics");

    var currYear = new Date().getFullYear() + 1
    //console.log("currentYear", currYear)
    yearSelector.property("value", currYear);

    //console.log("here");



};

filterSelectionRadar.prototype.update = function (teamData, teamName1, teamName2) {
    var self = this;
    var allTeamNames = [];
    var selected = false;
    var selectedYear;
    teamData.forEach(function(team) {
        allTeamNames.push(team.Team);
    })
    // Update Team 1 selector
    var team1Selector = d3.select("#radarChartContainer #team1Selector");
    var team1Options = team1Selector.selectAll("option")
        .data(teamData, function(d) { return d.Team; }); // Assuming "TeamName" is the property for team names

    team1Options.enter().append("option")
        .merge(team1Options)
        .attr("value", function (d) { return d.Team; })
        .text(function (d) { return d.Team; });

    team1Options.exit().remove();

    // Update Team 2 selector
    var team2Selector = d3.select("#radarChartContainer #team2Selector");
    var team2Options = team2Selector.selectAll("option")
        .data(teamData, function(d) { return d.Team; });

    team2Options.enter().append("option")
        .merge(team2Options)
        .attr("value", function (d) { return d.Team; })
        .text(function (d) { return d.Team; });

    team2Options.exit().remove();

    if (teamName1!=null && teamName2!=null) {
        // setting default value for Team 1
        team1Selector.property("value", teamName1);
        // setting default value for Team 2
        team2Selector.property("value", teamName2);
    }
    else {
        // setting default value for Team 1 (Atlanta Hawks)
        team1Selector.property("value", "Atlanta Hawks");
        // setting default value for Team 2 (Boston Celtics)
        team2Selector.property("value", "Boston Celtics");
    }
    var selectedTeam1 = team1Selector.property("value");
    var selectedTeam2 = team2Selector.property("value");
    self.teamName1 = selectedTeam1;
    self.teamName2 = selectedTeam2;

    // var firstSeasons;
    // getFirstSeason(selectedTeam1)
    //     .then(function (year1) {
    //         getFirstSeason(selectedTeam2)
    //             .then(function (year2) {
    //                 year1 += 0
    //                 year2 += 0
    //                 var firstSeasonsTmp = [getFirstSeason(selectedTeam1), getFirstSeason(selectedTeam2)];
    //                 firstSeasons = firstSeasonsTmp;
    //                 console.log("y1: ", year1);

    //             });
    // });

    var firstSeasons = [Math.max(1973, getFirstSeason(selectedTeam1,teamData)), Math.max(1973, getFirstSeason(selectedTeam2,teamData))];
    // console.log(firstSeasons);

    // Create a year selector
    var yearSelector = d3.select("#filterSectionRadar #yearSelector");
    var yearOptions = yearSelector.selectAll("option")
        .data(d3.range((d3.max(firstSeasons)), new Date().getFullYear() + 1));

    yearOptions.enter().append("option")
        .merge(yearOptions)
        .attr("value", function (d) { return d; })
        .text(function (d) { return d + " - " + (d + 1); });

    yearOptions.exit().remove();

    yearSelector.property("value", (d3.max(firstSeasons)));
    var selectedYear = parseInt(yearSelector.property("value"));

    // Listen for change events on the year selector
    yearSelector.on("change", function () {
        selectedTeam1 = team1Selector.property("value");
        selectedTeam2 = team2Selector.property("value");
        self.teamName1 = selectedTeam1;
        self.teamName2 = selectedTeam2;
        selectedYear = parseInt(yearSelector.property("value"));
        if(selectedYear<1982) {
            alert("Warning: FG_PCT was not tracked prior to the year 1982.")
        }
        // console.log("Updating from year change.  Using "+ selectedTeam1+" as Team 1 and "+selectedTeam2+" as Team 2, in year "+selectedYear+". self.features is "+self.features);

        // Update the radar chart with the selected year
        self.radarChart.update(selectedTeam1, selectedTeam2, self.features, selectedYear, allTeamNames);
    });


    // Listen for change events on Team 1 selector
    team1Selector.on("change", function () {
        updateDisabledOptions();
        selectedTeam1 = team1Selector.property("value");
        selectedTeam2 = team2Selector.property("value");
        self.teamName1 = selectedTeam1;
        self.teamName2 = selectedTeam2;
        selectedYear = parseInt(yearSelector.property("value"));
        // console.log("Updating from Team1 change.  Using "+ selectedTeam1+" as Team 1 and "+selectedTeam2+" as Team 2, in year "+selectedYear+". self.features is "+self.features);
        self.radarChart.update(selectedTeam1, selectedTeam2, self.features, selectedYear, allTeamNames);
    });

    // Listen for change events on Team 2 selectors
    team2Selector.on("change", function () {
        updateDisabledOptions();
        selectedTeam1 = team1Selector.property("value");
        selectedTeam2 = team2Selector.property("value");
        self.teamName1 = selectedTeam1;
        self.teamName2 = selectedTeam2;
        selectedYear = parseInt(yearSelector.property("value"));
        // console.log("Updating from Team2 change.  Using "+ selectedTeam1+" as Team 1 and "+selectedTeam2+" as Team 2, in year "+selectedYear+". self.features is "+self.features);
        self.radarChart.update(selectedTeam1, selectedTeam2, self.features, selectedYear, allTeamNames);
    });

    // Function to update disabled options based on the selected teams
    function updateDisabledOptions() {
        var selectedTeam1 = team1Selector.property("value");
        var selectedTeam2 = team2Selector.property("value");
        var firstSeasons = [Math.max(1973, getFirstSeason(selectedTeam1,teamData)), Math.max(1973, getFirstSeason(selectedTeam2,teamData))];
    // console.log(firstSeasons);

    // Create a year selector
    var yearSelector = d3.select("#filterSectionRadar #yearSelector");
    var yearOptions = yearSelector.selectAll("option")
        .data(d3.range((d3.max(firstSeasons)), new Date().getFullYear() + 1));

    yearOptions.enter().append("option")
        .merge(yearOptions)
        .attr("value", function (d) { return d; })
        .text(function (d) { return d + " - " + (d + 1); });

    yearOptions.exit().remove();
        //console.log("changed");
        const currentTeam1 = team1Selector.property("value");
        const currentTeam2 = team2Selector.property("value");

        // Disable the selected team in the other selector
        //team1Options.property("disabled", function(d) { return d === currentTeam2; });
        //team2Options.property("disabled", function(d) { return d === currentTeam1; });

        if (currentTeam1 && currentTeam2 && currentTeam1 === currentTeam2) {
            // Teams are the same, throw an error message
            alert("Error: Please select different teams for Team 1 and Team 2.");
            // Reset the selection to the previous value
            team1Selector.property("value", team1Selector.property("data-previous-value"));
            team2Selector.property("value", team2Selector.property("data-previous-value"));
            return;
        }

        // Store the previous value to be used for resetting the selection if needed
        team1Selector.property("data-previous-value", currentTeam1);
        team2Selector.property("data-previous-value", currentTeam2);
    }


};

function parseSeasonYear(seasonYear) {
    //Format is like 1971-1972
    var startYear = +seasonYear.split('-')[0];
    return new Date(startYear, 0, 1);
  }

function getFirstSeason(teamName, teamData) {
    // Find the team in the teamData array
    var team = teamData.find(function (d) {
        return d.Team === teamName;
    });

    // Return the FirstSeasonYear if the team is found
    return team ? team.FirstSeasonYear : null;
}
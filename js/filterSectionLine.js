function filterSelectionLine(lineChart, features) {
    var self = this;

    self.lineChart = lineChart;
    self.features = features;
    // Extract only the Abbreviation property
    self.features_abbrev = features.map(function (d) {
        return d.Abbreviation;
    });

    self.init();
};

filterSelectionLine.prototype.init = function () {

    var self = this;
    self.margin = { top: 10, right: 20, bottom: 0, left: 50 };
    var divFilterChart = d3.select("#filterSectionLine").classed("content", true);
    // var chartsContainer = d3.select('#chartsContainer');
    // var filterSelectionContainer = chartsContainer.append("div")
    //   .style("flex", "1");
    //   filterSelectionContainer.node().appendChild(divFilterChart.node());

    self.svgBounds = divFilterChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width / 2 - self.margin.left - self.margin.right;
    self.svgHeight = 100;

    self.svg = divFilterChart.select("svg");
    if (self.svg.empty()) {
        self.svg = divFilterChart.append("svg");
    }

    self.svg
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight);

    var team1Selector = d3.select("#team1Selector");
    var team2Selector = d3.select("#team2Selector");
    // setting default value for Team 1 (Atlanta Hawks)
    team1Selector.property("value", "Atlanta Hawks");

    // setting default value for Team 2 (Boston Celtics)
    team2Selector.property("value", "Boston Celtics");

};

filterSelectionLine.prototype.update = function (teamNames, teamName1, teamName2) {
    var self = this;

    var selected = false;
    var selectedFeature;

    // Update Team 1 selector
    var team1Selector = d3.select("#team1Selector");
    var team1Options = team1Selector.selectAll("option")
        .data(teamNames);

    team1Options.enter().append("option")
        .merge(team1Options)
        .attr("value", function (d) { return d; })
        .text(function (d) { return d; });

    team1Options.exit().remove();

    // Update Team 2 selector
    var team2Selector = d3.select("#team2Selector");
    var team2Options = team2Selector.selectAll("option")
        .data(teamNames);

    team2Options.enter().append("option")
        .merge(team2Options)
        .attr("value", function (d) { return d; })
        .text(function (d) { return d; });

    team2Options.exit().remove();
    // console.log(teamName1);
    // console.log(teamName2);
    if (teamName1 != null && teamName2 != null) {
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
    // Load features from CSV file
    d3.csv("data/features.csv").then(function (data) {
        self.featuresCSV = data;
    });
    // Feature selector menu
    d3.select("#featureSelector").selectAll("*").remove();
    var featureSelector = d3.select("#featureSelector");

    var tooltip = d3.select("body").selectAll(".tooltip")
        .data([null])
        .join("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const table = featureSelector.append("table");
    const rows = table.selectAll("tr")
        .attr("class", "row")
        .data(self.features)
        .enter()
        .append("tr");

    rows.append("td")
        .text(d => d.Explanation)
        .style("cursor", "pointer")
        .style("color", "#686868")
        .on("mouseover", function (event, d) {
            // Show the tooltip with the description on hover
            var explanation = getFeatureExplanation(d.Abbreviation); // Retrieve explanation using the abbreviation
            tooltip.html(explanation)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
                .transition()
                .duration(200)
                .style("opacity", 1); // Fully opaque
        })
        .on("mousemove", function (event) {
            // Ensure tooltip follows the mouse
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function () {
            // Hide the tooltip when not hovering
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });



    featureSelector.exit().remove();
    //.on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    function getFeatureExplanation(feature) {
        var featureDescriptions = {
            "WIN_PCT": "A statistic that shows the proportion of games a team has won over the total they've played.",
            "FGA": "The total number of shots a player or team has taken during a game.",
            "FG_PCT": "The ratio of field goals made to the total field goals attempted, indicating shooting accuracy.",
            "FG3A": "The number of shots taken from beyond the three-point line, which is a certain distance from the basket.",
            "FG3_PCT": "The percentage of three-point shots made out of those attempted, a measure of long-range shooting efficiency.",
            "FT_PCT": "The percentage of free throws (unopposed shots awarded after certain fouls) that a player or team successfully makes.",
            "REB": "The total number of times a player retrieves the basketball after a missed field goal or free throw.",
            "AST": "A statistic awarded to a player who passes the ball to a teammate in a way that leads to a score.",
            "PF": "Infractions charged against a player for physical contact or rule violations, like holding or pushing an opponent.",
            "STL": "When a defensive player legally takes the ball away from the offensive player who is dribbling, passing, or holding it.",
            "BLK": "When a defensive player legally deflects an offensive player's field goal attempt, preventing it from going into the basket.",
            "PTS": "The total number of points a player or team has scored from field goals and free throws.",
            "PTS_RANK": "The standing or ranking of a player or team in a particular category based on the number of points scored compared to others."
        };

        return featureDescriptions[feature] || "No explanation available.";
    }

    function showTooltip(text, mouseCoords) {


        // Position the tooltip next to the mouse cursor
        tooltip
            .text(text)
            .style("left", (mouseCoords[0] + 10) + "px")
            .style("top", (mouseCoords[1] + 10) + "px");
    }

    function hideTooltip() {
        d3.select(".tooltip").remove();
    }


    // Listen for change events on Team 1 selector
    team1Selector.on("change", function () {
        updateDisabledOptions();
        selectedTeam1 = team1Selector.property("value");
        selectedTeam2 = team2Selector.property("value");
        self.teamName1 = selectedTeam1;
        self.teamName2 = selectedTeam2;
        // console.log(selectedTeam1 + " " + selectedTeam2 + " " + selectedFeature);
        if (!selectedFeature) {
            selectedFeature = "WIN_PCT"
            const firstRow = table.select("tr:first-child");
            if (firstRow.size() > 0) {
                firstRow.classed("selected", true);
            }
        }
        self.lineChart.update(selectedTeam1, selectedTeam2, selectedFeature);
    });

    // Listen for change events on Team 2 selector
    team2Selector.on("change", function () {
        updateDisabledOptions();
        selectedTeam1 = team1Selector.property("value");
        selectedTeam2 = team2Selector.property("value");
        self.teamName1 = selectedTeam1;
        self.teamName2 = selectedTeam2;
        // console.log(selectedTeam1 + " " + selectedTeam2 + " " + selectedFeature);
        if (!selectedFeature) {
            selectedFeature = "WIN_PCT"
            const firstRow = table.select("tr:first-child");
            if (firstRow.size() > 0) {
                firstRow.classed("selected", true);
            }
        }

        self.lineChart.update(selectedTeam1, selectedTeam2, selectedFeature);

    });

    rows.on("click", function () {
        table.selectAll("tr").classed("selected", false);

        d3.select(this).classed("selected", true);
        // console.log("this==> ",this);

        selectedTeam1 = team1Selector.property("value");
        selectedTeam2 = team2Selector.property("value");
        self.teamName1 = selectedTeam1;
        self.teamName2 = selectedTeam2;
        selectedFeature = d3.select(this).data()[0].Abbreviation;

        if (selectedFeature === "PTS_RANK") {
            // Add an explanation below the filter selection
            featureSelector.selectAll(".rank-explanation").remove();
            var addedDes = featureSelector.append("div")
                .attr("class", "rank-explanation")
                .text("We implemented rank 1 to be at the top of y-axis since lower ranking indicates better performance.")
                .style("font-family", "'Poppins', sans-serif")
                .style("font-size", "13px")
                .style("text-anchor", "middle");
        }
        else {
            featureSelector.selectAll(".rank-explanation").remove();
        }

        selected = true;

        // Update disabled options when a feature is clicked
        updateDisabledOptions();

        self.lineChart.update(selectedTeam1, selectedTeam2, selectedFeature);
    });

    // Function to update disabled options based on the selected teams
    function updateDisabledOptions() {
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

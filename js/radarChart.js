function RadarChart() {
  // console.log("radarchart init");
  var self = this;
  var divLineChart = d3.select("#lineChartContainer")
  divLineChart.style("display:none");
  // divLineChart.select("#lineChart").style("display: none");

  var divRadarChart = d3.select("#radarChartContainer");
  divRadarChart.style("display:flex");
  self.init();
};

RadarChart.prototype.init = function () {
  var self = this;
  self.margin = { top: 20, right: 20, bottom: 30, left: 40 };

  var divRadarChart = d3.select("#radarChartContainer").classed("content", true);

  self.svgBounds = divRadarChart.node().getBoundingClientRect();
  self.svgWidth = 900;
  self.svgHeight = 600; // Initial height, you can adjust this as needed

  // Calculate the left margin for centering
  self.margin.left = Math.max((self.svgBounds.width - self.svgWidth) / 2, 0);

  // Adjust the height dynamically based on the contents
  self.svg = divRadarChart.append("svg")
    .attr("width", self.svgWidth + self.margin.left + self.margin.right + 30)
    .attr("height", self.svgHeight + self.margin.top + self.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

  // self.tooltip = d3.select("body")
  //   .append("div")
  //   .attr("class", "tooltip")
  //   .style("opacity", 0)
  //   .style("position", "absolute")
  //   .style("padding", "10px")
  //   .style("background-color", "white")
  //   .style("border-radius", "5px")
  //   .style("box-shadow", "0px 0px 6px rgba(0,0,0,0.3)")
  //   .style("pointer-events", "none");
};

function parseSeasonYear(seasonYear) {
  //Format is like 1971-1972
  // console.log("seasonYear", seasonYear);
  var startYear = +seasonYear.split('-')[0];
  // console.log("startYear", startYear);
  return startYear;
}

RadarChart.prototype.update = function (selectedTeam1, selectedTeam2, features, year, allTeamNames) {
  var self = this;
  //getting data(json) file for team 1
  var cityAndTeam1 = selectedTeam1.split(' ');
  cityAndTeam1.shift();
  var teamName1 = cityAndTeam1.join(' ');
  const data_file1 = "data/" + teamName1 + ".csv";

  //getting data(json) file for team 2
  var cityAndTeam2 = selectedTeam2.split(' ');
  cityAndTeam2.shift();
  var teamName2 = cityAndTeam2.join(' ');
  const data_file2 = "data/" + teamName2 + ".csv";
  var maxes = {};
  features.forEach(function (feature) {
    maxes[feature] = 0;
  })
  allTeamNames.forEach(function (teamName) {
    var cityAndTeam = teamName.split(' ');
    cityAndTeam.shift();
    var teamNameFinal = cityAndTeam.join(' ');
    var data_file = "data/" + teamNameFinal + ".csv";
    d3.csv(data_file).then(function (data) {
      var teamDataForYear = data.filter(function (d) {
        return parseSeasonYear(d.YEAR).getFullYear() === year;
      });
      // console.log(teamDataForYear);
      if (teamDataForYear.length != 0) {
        var teamSelectedFeatures = teamDataForYear.map(function (d) {
          var selectedTeamData = {};
          features.forEach(function (feature) {
            selectedTeamData[feature] = d[feature];
          });
          return selectedTeamData;
        });
        features.forEach(function (feature) {
          teamSelectedFeatures[0][feature] = +teamSelectedFeatures[0][feature];
          if (teamSelectedFeatures[0][feature] > maxes[feature]) {
            maxes[feature] = teamSelectedFeatures[0][feature];
            // console.log(maxes[feature]);
          }
        });
      }
    });
  });
  d3.csv(data_file1).then(function (data1) {

    // Load and parse data for team 2
    d3.csv(data_file2).then(function (data2) {
      // console.log(maxes);
      //console.log(`team 1: ${data1}, team 2: ${selectedTeam2}`);

      // Filter data for the specified year
      var team1DataForYear = data1.filter(function (d) {
        return parseSeasonYear(d.YEAR).getFullYear() === year;
      });
      var team2DataForYear = data2.filter(function (d) {
        return parseSeasonYear(d.YEAR).getFullYear() === year;
      });
      // Extract only selected features
      var team1SelectedFeatures = team1DataForYear.map(function (d) {
        var selectedTeam1Data = {};
        features.forEach(function (feature) {
          selectedTeam1Data[feature] = (d[feature] / (maxes[feature] + 0.0001)) * 100;
          // console.log("feature " + feature);
          // console.log("team1 " + selectedTeam1Data[feature]);
        });
        return selectedTeam1Data;
      });

      var team2SelectedFeatures = team2DataForYear.map(function (d) {
        var selectedTeam2Data = {};
        features.forEach(function (feature) {
          selectedTeam2Data[feature] = (d[feature] / (maxes[feature] + 0.0001)) * 100;
          // console.log("feature " + feature);
          // console.log("team2 " + selectedTeam2Data[feature]);
        });
        return selectedTeam2Data;
      });



      // Parse data and create radar chart
      self.drawChart(team1SelectedFeatures, team2SelectedFeatures, features, selectedTeam1, selectedTeam2, year);
    });
  });
}

RadarChart.prototype.drawChart = function (data1, data2, selectedFeature, selectedTeam1, selectedTeam2, year) {

  // WIN_PCT, FG_PCT, OREB, DREB, STL, BLK
  var self = this;

  //var types = {"WIN_PCT":"important", "FG_PCT":"offense", "OREB":"offense", "DREB":"defnese", "STL":"defense", "BLK":"defense"}//blue : important
  var types = { "WIN_PCT": "blue", "FG_PCT": "red", "OREB": "red", "DREB": "green", "STL": "green", "BLK": "green" }//blue : important, red : offensive, green : defensive

  // This is for removing previous elements from the SVG
  self.svg.selectAll("*").remove();

  let width = 600;
  let height = 600;

  data1.forEach((point) => {
    point["WIN_PCT"] = +point["WIN_PCT"];
    point["FG_PCT"] = +point["FG_PCT"];
    point["DREB"] = +point["DREB"];
    point["OREB"] = +point["OREB"];
    point["STL"] = +point["STL"];
    point["BLK"] = +point["BLK"];
  });

  data2.forEach((point) => {
    point["WIN_PCT"] = +point["WIN_PCT"];
    point["FG_PCT"] = +point["FG_PCT"];
    point["DREB"] = +point["DREB"];
    point["OREB"] = +point["OREB"];
    point["STL"] = +point["STL"];
    point["BLK"] = +point["BLK"];
  });

  // function handleMouseOver(event, d) {
  //   var xPosition = event.pageX;
  //   var yPosition = event.pageY;

  //   xPosition += 10;
  //   yPosition -= 30;

  //   self.tooltip.transition()
  //     .duration(200)
  //     .style("opacity", .9);
  //   self.tooltip.html(self.createTooltipContent(d, selectedFeature))
  //     .style("left", xPosition + "px")
  //     .style("top", yPosition + "px");
  // }

  // function handleMouseOut(event, d) {
  //   self.tooltip.transition()
  //     .duration(500)
  //     .style("opacity", 0);
  // }

  let radialScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, 250]);
  let ticks = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  let legendData = [
    { label: "Overall", color: "#4287f5" },
    { label: "Offensive", color: "#f54242" },
    { label: "Defensive", color: "#32b83f" }
  ];

  // Create legend
  let legend = self.svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - 150) + "," + 20 + ")");

  legend.selectAll("rect")
    .data(legendData)
    .enter().append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 20)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", d => d.color);

  legend.selectAll("text")
    .data(legendData)
    .enter().append("text")
    .attr("x", 20)
    .attr("y", (d, i) => i * 20 + 12)
    .text(d => d.label);


  d3.csv("data/teams.csv").then(function (teams) {

    function angleToCoordinate(angle, value) {
      let x = Math.cos(angle) * radialScale(value);
      let y = Math.sin(angle) * radialScale(value);
      return { "x": width / 2 + x, "y": height / 2 - y };
    }

    self.svg.selectAll("circle")
      .data(ticks)
      .join(
        enter => enter.append("circle")
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("r", d => radialScale(d))
      );

    self.svg.selectAll(".ticklabel")
      .data(ticks)
      .join(
        enter => enter.append("text")
          .attr("class", "ticklabel")
          .attr("x", width / 2 + 8)
          .attr("y", d => height / 2 - radialScale(d))
          .text(d => d.toString())
      );

    let featureData = selectedFeature.map((f, i) => {
      let angle = (Math.PI / 2) + (2 * Math.PI * i / selectedFeature.length);
      return {
        "name": f,
        "angle": angle,
        "line_coord": angleToCoordinate(angle, 100),
        "label_coord": angleToCoordinate(angle, 110)
      };
    });

    // draw axis line
    self.svg.selectAll("line")
      .data(featureData)
      .join(
        enter => enter.append("line")
          .attr("x1", width / 2)
          .attr("y1", height / 2)
          .attr("x2", d => d.line_coord.x)
          .attr("y2", d => d.line_coord.y)
          .attr("stroke", "black")
      );

    let types = {
      "WIN_PCT": "#4287f5", // blue for Overall
      "BLK": "#32b83f",
      "STL": "#32b83f",
      "DREB": "#32b83f",
      "OREB": "#f54242",
      "FG_PCT": "#f54242",
    }

    var selectedFeatureDescriptions = {
      "WIN_PCT": "Win Percentage - a statistic that shows the proportion of games a team has won over the total they've played.",
      "FG_PCT": "Field Goal Percentage - the ratio of field goals made to the total field goals attempted, indicating shooting accuracy.",
      "STL": "Steals - when a defensive player legally takes the ball away from the offensive player who is dribbling, passing, or holding it.",
      "BLK": "Blocks - when a defensive player legally deflects an offensive player's field goal attempt, preventing it from going into the basket.",
      "OREB": "Offensive Rebounds - The total number of offensive rebounds a player or team has secured from missed field goals.",
      "DREB": "Defensive Rebounds - The total number of defensive rebounds a player or team has secured from missed field goals."
    };

    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("padding", "10px")
      .style("background-color", "white")
      .style("border-radius", "5px")
      .style("box-shadow", "0px 0px 6px rgba(0,0,0,0.3)")
      .style("pointer-events", "none");


    // console.log("selectedFeature", featureData);
    // draw axis label
    self.svg.selectAll(".axislabel")
      .data(featureData)
      .join(
        enter => enter.append("text")
          .attr("x", d => d.label_coord.x)
          .attr("y", d => d.label_coord.y)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          // Adjust the rotation here
          .attr("transform", d => {
            let rotation = d.name === "DREB" ? 360 : - (d.angle * 180 / Math.PI) + 90;
            return `rotate(${rotation}, ${d.label_coord.x}, ${d.label_coord.y})`;
          })

          .text(d => d.name)
          .style("fill", d => types[d.name])
          // Append the tooltip description
          .append("title")
          .text(d => selectedFeatureDescriptions[d.name] || "No description available.")
          .on("mouseover", function (event, d) {
            // Make sure the 'd' structure is correct here
            // console.log("mouseover", d);
            tooltip.transition()
              .duration(200)
              .style("opacity", 0.9);
            tooltip.html(selectedFeatureDescriptions[d.name] || "No description available")
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function (event, d) {
            // console.log("mouseout", d);
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          }));

    if (year < 1982) {
      let angle = (Math.PI / 2) + (2 * Math.PI * selectedFeature.indexOf("FG_PCT") / selectedFeature.length);

      // Calculate the coordinates for the text position inside the circle
      let textX = width / 2 + Math.cos(angle) * radialScale(100);
      let textY = height / 2 - Math.sin(angle) * radialScale(100);

      // white rectangle as a background
      self.svg.append("rect")
        .attr("x", textX + 13)
        .attr("y", textY + 40)
        .attr("width", 190)
        .attr("height", 25)
        .style("fill", "white");

      // text
      self.svg.append("text")
        .attr("x", textX + 110)
        .attr("y", textY + 55)
        .text("FG_PCT was not tracked prior to 1982")
        .style("font-size", "10px")
        .style("fill", "black")
        .attr("stroke-width", 5)
        .attr("text-anchor", "middle")
        .style("font-family", "'Poppins', sans-serif")
        .style("background-color", "#c3bdb5");
    }

    let line = d3.line()
      .x(d => d.x)
      .y(d => d.y);

    //Maybe change this to team color?
    // let colors = ["darkorange", "gray"];

    let teamColors = ["#C8102E", "#007A33"];

    // Override with actual team colors if available
    var team1Info = teams.find(team => team.Team === selectedTeam1);
    // console.log("team1Info ", team1Info);
    if (team1Info) {
      // console.log("here1 ", team1Info.Color1);
      teamColors[0] = team1Info.Color1;
    } else {
      console.log("team1Info null ");
    }

    var team2Info = teams.find(team => team.Team === selectedTeam2);
    // console.log("team2Info ", team2Info);
    if (team2Info) {
      // Check if Color1 is the same for both teams
      if (team1Info.Color1.substring(0, 3).toLowerCase() == team2Info.Color1.substring(0, 3).toLowerCase()) {
        teamColors[1] = team2Info.Color2;
      } else {
        teamColors[1] = team2Info.Color1;
      }

    }

    // console.log("radar color 1", teamColors[0], "2", teamColors[1]);
    self.svg.append("text")
      .attr("x", 50)
      .attr("y", -8)
      .attr("fill", "#345d5a")
      .text("All values are % of NBA best in selected season (100% means the selected team led the NBA in that category.)")
      .style('font-size', '14px')
      .style('font-style', 'italic')
      .style('font-family', "'Poppins', sans-serif")
      .style("text-anchor", "left");

    self.tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("pointer-events", "none");

    function createTooltipHtml(teamData, teamName, features) {
      // Check if features is an array and has elements
      if (!Array.isArray(features) || features.length === 0) {
        console.error("Invalid or empty features array");
        return "No data available";
      }

      let htmlContent = `<strong>${teamName} Stats:</strong><br/>`;
      features.forEach(function (feature) {
        let value = teamData && teamData[feature] !== undefined ? teamData[feature] : null;
        htmlContent += `${feature}: ${value != null ? value.toFixed(3) + "% of NBA best" : "N/A"}<br/>`;
      });
      return htmlContent;
    }


    data = [
      {
        team: "Team1",
        teamData: data1[0],
        teamName: selectedTeam1.Team
      },
      {
        team: "Team2",
        teamData: data2[0],
        teamName: selectedTeam2.Team
      }
    ];
    function getPathCoordinates(data_point) {
      let coordinates = [];
      for (var i = 0; i < selectedFeature.length; i++) {
        let ft_name = selectedFeature[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / selectedFeature.length);
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
      }
      return coordinates;
    }

    function showTooltipForTeam(event, d, teamData, teamName, features) {
      // Use the team data captured in the closure for the tooltip
      self.tooltip
        .html(createTooltipHtml(teamData, teamName, features))
        .style("opacity", 1)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");

      // Dim other areas
      d3.selectAll(".radarArea").style("opacity", 0.1);
      d3.select(event.currentTarget).style("opacity", 0.7);
    }


    function hideTooltip() {
      // Reset all areas and hide the tooltip
      d3.selectAll(".radarArea").style("opacity", 0.5);
      self.tooltip.style("opacity", 0);
    }

    self.svg.selectAll("path.team1")
      .data([data1[0]]) // Bind the first team's data to the first path
      .enter()
      .append("path")
      .attr("class", "radarArea team1")
      .attr("d", d => line(getPathCoordinates(d)))
      .attr("stroke-width", 3)
      .attr("stroke", teamColors[0])
      .attr("fill", teamColors[0])
      .attr("stroke-opacity", 1)
      .attr("opacity", 0.5)
      .on("mouseover", function (event, d) {
        // Closure captures the team data for team1
        showTooltipForTeam(event, d, data1[0], team1Info.Team, selectedFeature);
      })
      .on("mouseout", hideTooltip);

    self.svg.selectAll("path.team2")
      .data([data2[0]]) // Bind the second team's data to the second path
      .enter()
      .append("path")
      .attr("class", "radarArea team2")
      .attr("d", d => line(getPathCoordinates(d)))
      .attr("stroke-width", 3)
      .attr("stroke", teamColors[1])
      .attr("fill", teamColors[1])
      .attr("stroke-opacity", 1)
      .attr("opacity", 0.5)
      .on("mouseover", function (event, d) {
        showTooltipForTeam(event, d, data2[0], team2Info.Team, selectedFeature);
      })
      .on("mouseout", hideTooltip);


    // Add the legend at the bottom of the chart
    var legend = self.svg.append('g')
      .attr('class', 'chart-legend')
      .attr('transform', 'translate(0,' + (self.svgHeight + self.margin.top) + ')');

    // Add red legend square for Team 1
    legend.append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', teamColors[0])
      .attr('x', self.svgWidth - self.margin.right - 115) // X position
      .attr('y', -353); // Y position

    // Add text for Team 1
    legend.append('text')
      .attr('x', self.svgWidth - self.margin.right - 90) // X position
      .attr('y', -338) // Y position to align with the box
      .text(selectedTeam1)
      .style('font-size', '10px')
      .style('font-family', "'Poppins', sans-serif");

    // Add blue legend square for Team 2
    legend.append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', teamColors[1])
      .attr('x', self.svgWidth - self.margin.right - 115) // X position
      .attr('y', -320); // Y position

    // Add text for Team 2
    legend.append('text')
      .attr('x', self.svgWidth - self.margin.right - 90) // X position
      .attr('y', -305) // Y position to align with the box
      .text(selectedTeam2)
      .style('font-size', '10px')
      .style('font-family', "'Poppins', sans-serif");

    // self.svg.selectAll(".radarArea")
    //   .data([data1[0], data2[0]])
    //   .enter()
    //   .append("path")
    //   .attr("class", "radarArea")
    //   .on("mouseover", handleMouseOver)
    //   .on("mouseout", handleMouseOut);
  });

}

// Helper function to combine and process data
function combineAndProcessData(data1, data2) {
  // Combine and process data from data1 and data2

  var combinedData = [
    ...data1.map(d => ({ ...d, team: "Team1", date: parseSeasonYear(d.YEAR) })),
    ...data2.map(d => ({ ...d, team: "Team2", date: parseSeasonYear(d.YEAR) })),

  ];

  return combinedData;

}

// RadarChart.prototype.createTooltipContent = function (d, features) {
//   var content = "<strong>Team Stats:</strong><br/>";
//   features.forEach(function (feature) {
//     content += feature + ": " + d[feature].toFixed(2) + "<br/>";
//   });
//   return content;
// };
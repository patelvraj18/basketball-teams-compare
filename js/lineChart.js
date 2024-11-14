function LineChart() {
  // console.log("linechart init");
  var self = this;
  var divRadarChart = d3.select("#radarChartContainer");
  divRadarChart.style("display:none");

  var divLineChart = d3.select("#lineChartContainer");
  divLineChart.style("display:inline-flex");

  var lineChart = d3.select("#lineChart");
  lineChart.style("display:flex");

  self.init();
};

LineChart.prototype.init = function () {
  var self = this;
  self.margin = { top: 90, right: 40, bottom: 80, left: 60 };

  var divContainer = d3.select("#lineChartContainer").classed("content", true);
  var divLineChart = d3.select(".lineChartContent")

  self.svgBounds = divContainer.node().getBoundingClientRect();
  self.svgWidth = self.svgBounds.width / 1.5 - self.margin.left - self.margin.right + 30;
  self.svgHeight = 750; // Initial height, you can adjust this as needed

  // Calculate the left margin for centering
  self.margin.left = 30;

  // Adjust the height dynamically based on the content
  self.svg = divLineChart.append("svg")
    .attr("width", self.svgWidth)
    .attr("height", self.svgHeight + self.margin.top + self.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

  self.tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("padding", "10px")
    .style("background-color", "white")
    .style("border-radius", "5px")
    .style("box-shadow", "0px 0px 6px rgba(0,0,0,0.3)")
    .style("pointer-events", "none");
};

LineChart.prototype.update = function (selectedTeam1, selectedTeam2, selectedFeature) {
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


  d3.csv(data_file1).then(function (data1) {
    // Load and parse data for team 2
    d3.csv(data_file2).then(function (data2) {

      // console.log(`Abbreviation: ${selectedFeature}, team 1: ${selectedTeam1}, team 2: ${selectedTeam2}`);


      // Parse data and create line chart
      self.drawChart(data1, data2, selectedFeature, selectedTeam1, selectedTeam2);
    });
  });

  //console.log(`Abbreviation: ${selectedFeature}, team 1: ${teamName1}, team 2: ${teamName2}`);
}
LineChart.prototype.drawChart = function (data1, data2, selectedFeature, selectedTeam1, selectedTeam2) {
  var self = this;

  // This is for removing previous elements from the SVG
  self.svg.selectAll("*").remove();
  // Combine and process data as needed
  var combinedData = combineAndProcessData(data1, data2, selectedFeature);

  // Create scales
  var xScale = d3.scaleTime()
    .domain(d3.extent(combinedData, d => d.date))
    .range([0, self.svgWidth - 150]);

  var yScale;
  //Make data numerical
  combinedData.forEach((point) => {
    point["AST"] = +point["AST"];
    point["GP"] = +point["GP"];
    point["WIN_PCT"] = +point["WIN_PCT"];
    point["FGA"] = +point["FGA"];
    point["FG_PCT"] = +point["FG_PCT"];
    point["FG3A"] = +point["FG3A"];
    point["FG3_PCT"] = +point["FG3_PCT"];
    point["FT_PCT"] = +point["FT_PCT"];
    point["REB"] = +point["REB"];
    point["AST"] = +point["AST"];
    point["PF"] = +point["PF"];
    point["STL"] = +point["STL"];
    point["BLK"] = +point["BLK"];
    point["PTS"] = +point["PTS"];
    point["PTS_RANK"] = +point["PTS_RANK"];
  });
  combinedData.forEach((point) => {
    point[selectedFeature] = +point[selectedFeature];
  });
  if (selectedFeature === "STL" || selectedFeature === "BLK" || selectedFeature === "REB") {
    self.svg.append("line")
      .attr("x1", xScale(new Date(1972, 0, 1)))
      .attr("x2", xScale(new Date(1972, 0, 1)))
      .attr("y1", 0)
      .attr("y2", 750)
      .attr("stroke-width", "2")
      .attr("stroke-dasharray", "3")
      .attr("stroke", "black");
    self.svg.append("text")
      .attr("x", xScale(new Date(1973, 0, 1)))
      .attr("y", 530)
      .text("Steals, Blocks, and Rebounds")
      .attr("class", "text-extra")
    self.svg.append("text")
      .attr("x", xScale(new Date(1973, 0, 1)))
      .attr("y", 550)
      .text("began being officially tracked in 1972")
      .attr("class", "text-extra")
  }
  if (selectedFeature === "FGA" || selectedFeature === "FG_PCT" || selectedFeature === "FG3A" || selectedFeature === "FG3_PCT") {
    self.svg.append("line")
      .attr("x1", xScale(new Date(1981, 0, 1)))
      .attr("x2", xScale(new Date(1981, 0, 1)))
      .attr("y1", 0)
      .attr("y2", 750)
      .attr("stroke-width", "2")
      .attr("stroke-dasharray", "3")
      .attr("stroke", "black");
    if (selectedFeature === "FG3A") {
      self.svg.append("text")
        .attr("x", xScale(new Date(1982, 0, 1)))
        .attr("y", 100)
        .text("Shooting statistics in the NBA")
        .attr("class", "text-extra");
      self.svg.append("text")
        .attr("x", xScale(new Date(1982, 0, 1)))
        .attr("y", 120)
        .text("began being officially tracked in 1981")
        .attr("class", "text-extra");
    }
    else {
      self.svg.append("text")
        .attr("x", xScale(new Date(1982, 0, 1)))
        .attr("y", 530)
        .text("Shooting statistics in the NBA")
        .attr("class", "text-extra");
      self.svg.append("text")
        .attr("x", xScale(new Date(1982, 0, 1)))
        .attr("y", 550)
        .text("began being officially tracked in 1981")
        .attr("class", "text-extra");
    }
  }

    d3.csv("data/min_team_data.csv").then(function (minData) {
      d3.csv("data/max_team_data.csv").then(function (maxData) {

        var minMaxData = [
          ...minData.map(d => ({ ...d, team: "Min", date: parseSeasonYear(d.YEAR) })),
          ...maxData.map(d => ({ ...d, team: "Max", date: parseSeasonYear(d.YEAR) })),
        ];
        // console.log(d3.max(maxData, d => +d[selectedFeature]));
        var yScale = d3.scaleLinear()
          .domain([0, d3.max(maxData, d => +d[selectedFeature])])
          .range([self.svgHeight, 0]);
        if (selectedFeature === "PTS_RANK") {
          yScale = d3.scaleLinear()
            .domain([1, 30])
            .range([0, self.svgHeight]);
        }
        // Create line segments for min and max values
        var minLine = d3.line()
          .x(d => xScale(d.date))
          .y(d => yScale(d[selectedFeature]));

        var maxLine = d3.line()
          .x(d => xScale(d.date))
          .y(d => yScale(d[selectedFeature]));



        // Draw min line
        self.svg.append("path")
          .data([minMaxData.filter(d => d.team === "Min")])
          .attr("class", "line-min")
          .attr("fill", "none")
          .attr("stroke", "gray")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "3")
          .attr("d", minLine);

        // Draw max line
        self.svg.append("path")
          .data([minMaxData.filter(d => d.team === "Max")])
          .attr("class", "line-max")
          .attr("fill", "none")
          .attr("stroke", "gray")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "1")
          .attr("d", maxLine);

        var lineLegendData = [
          { label: "Max Value Team", color: "gray", dasharray: "1" },
          { label: "Min Value Team", color: "gray", dasharray: "3" }
        ];

        // Create the legend group, positioned to the right of the chart title
        var lineLegend = self.svg.append("g")
          .attr("class", "line-legend")
          .attr("transform", "translate(" + (self.svgWidth - 160) + ", -65)"); // Adjust this as per your layout

        // Append colored rectangles for max and min lines
        lineLegend.selectAll(".line-legend-box")
          .data(lineLegendData)
          .enter()
          .append("rect")
          .attr("class", "line-legend-box")
          .attr("x", 0)
          .attr("y", (d, i) => i * 35)
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", "none") // Set fill to none for transparency
          .style("stroke", d => d.color)
          .style("stroke-width", 2)
          .style("stroke-dasharray", d => d.dasharray)
          .style("opacity", 0.45);


        // Append text labels for max and min lines
        lineLegend.selectAll(".line-legend-text")
          .data(lineLegendData)
          .enter()
          .append("text")
          .attr("class", "line-legend-text")
          .attr("x", 28) // Right to the legend box
          .attr("y", (d, i) => i * 35 + 15)
          .text(d => d.label)
          .style("font-size", "10px")
          .style("font-family", "'Poppins', sans-serif");

        var lineGenerator = d3.line()
          .x(d => xScale(d.date))
          .y(d => yScale(d[selectedFeature]));
        d3.csv("data/teams.csv").then(function (teams) {

          var teamColors = {
            "Team1": { "Color1": "#C8102E", "Color2": "#FDB927" }, // Default color : Hawks
            "Team2": { "Color1": "#007A33", "Color2": "#BA9653" }, // Default color : Celtics
          };

          var team1First = "2023";
          var team2First = "2023";

          // Override with actual team colors if available
          var team1Info = teams.find(team => team.Team === selectedTeam1);
          if (team1Info) {
            teamColors["Team1"] = { "Color1": team1Info.Color1, "Color2": team1Info.Color2 };
            team1First = team1Info.FirstSeasonYear;
          }

          var team2Info = teams.find(team => team.Team === selectedTeam2);
          if (team2Info) {
            teamColors["Team2"] = { "Color1": team2Info.Color1, "Color2": team2Info.Color2 };
            team2First = team2Info.FirstSeasonYear;

          }


          // Check if Color1 is the same for both teams
          if (teamColors["Team1"].Color1.substring(0, 3).toLowerCase() === teamColors["Team2"].Color1.substring(0, 3).toLowerCase()) {
            // Use Color2 for Team2
            teamColors["Team2"].Color1 = teamColors["Team2"].Color2;
          }

          // x and y axes
          self.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + (self.svgHeight) + ")")
            .call(d3.axisBottom(xScale));

          self.svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale));

          // Draw line for team 1
          self.svg.append("path")
            .datum(combinedData.filter(d => d.team === "Team1"))
            .attr("class", "line-team1")
            .attr("fill", "none")
            .attr("stroke", teamColors["Team1"].Color1)
            .attr("stroke-width", 1.5)
            .attr("d", lineGenerator);

          // Draw line for team 2
          self.svg.append("path")
            .datum(combinedData.filter(d => d.team === "Team2"))
            .attr("class", "line-team2")
            .attr("fill", "none")
            .attr("stroke", teamColors["Team2"].Color1)
            .attr("stroke-width", 1.5)
            .attr("d", lineGenerator);

          var circles = self.svg.selectAll("circle")
            .data(combinedData)
            .enter().append("circle")
            .filter(d => d[selectedFeature] !== 0 && !isNaN(d[selectedFeature])) // Exclude zero and N/A values
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d[selectedFeature]))
            .attr("r", 4)
            .attr("fill", d => d.team === "Team1" ? teamColors["Team1"].Color1 : teamColors["Team2"].Color1)
            .attr("stroke", d => d.team === "Team1" ? teamColors["Team1"].Color2 : teamColors["Team2"].Color2)
            .attr("stroke-width", 1)
            .on("mouseover", handleMouseOverCircle)
            .on("mouseout", handleMouseOut);


          //This is to find the team that started later
          var laterStartTeam = (parseInt(team1First) > parseInt(team2First)) ? selectedTeam1 : selectedTeam2;
          var laterStartYear = (laterStartTeam === selectedTeam1) ? team1First : team2First;
          var laterStartColor = (laterStartTeam === selectedTeam1) ? teamColors["Team1"].Color1 : teamColors["Team2"].Color1;


          // Draw vertical line for the team that started later
          self.svg.append("line")
            .attr("x1", xScale(new Date(laterStartYear, 0, 1)))
            .attr("x2", xScale(new Date(laterStartYear, 0, 1)))
            .attr("y1", 0) // Adjusted to start at the x-axis
            .attr("y2", self.svgHeight + 80) // Adjusted to end slightly above the x-axis
            .attr("stroke-width", "2")
            .attr("stroke-dasharray", "1")
            .attr("stroke", laterStartColor);

          // Add text label for the first season year of the team that started later
          self.svg.append("text")
            .attr("x", (xScale(new Date(laterStartYear, 0, 1)) + 2))
            .attr("y", self.svgHeight + self.margin.bottom - 9)
            .style("text-anchor", "start")
            .style("font-family", "'Poppins', sans-serif")
            .style("font-size", "14px")
            .style("fill", laterStartColor)
            .text(" " + laterStartTeam + " started in ")
            .append("tspan")
            .text(laterStartYear);


          // y-axis legend
          self.svg.append("text")
            .attr("class", "y-axis-legend")
            .attr("y", 15)
            .attr("x", -30)
            .attr("transform", "rotate(-90)") // Rotate the text by 90 degrees counter-clockwise
            .style("text-anchor", "middle")
            .style("font-family", "'Poppins', sans-serif")
            .style("font-size", "12px")
            .style("font-weight", "800")
            .style("color", "#333333")
            .text(selectedFeature);

          self.svg.append("text")
            .attr("class", "x-axis-legend")
            .attr("y", self.svgHeight + self.margin.bottom - 40)
            .attr("x", self.svgWidth / 2 - 55)
            .style("text-anchor", "middle")
            .style("font-family", "'Poppins', sans-serif")
            .style("font-size", "14px")
            .style("color", "#333333")
            .style("font-weight", "800")
            .text("Year");

          //dynamic title
          self.svg.append("text")
            .attr("class", "chart-title")
            .attr("y", -30)
            .attr("x", self.svgWidth / 2)
            .style("text-anchor", "middle")
            .style("font-family", "'Poppins', sans-serif")
            .style("font-size", "18px")
            .html("Line Chart for Comparing <tspan style='font-weight: bold; color: red;'>" + selectedFeature + "</tspan> feature Over Time");

          self.svg.append("text")
            .attr("class", "chart-subtitle")
            .attr("y", -9)
            .attr("x", self.svgWidth / 2)
            .style("text-anchor", "middle")
            .style("font-family", "'Poppins', sans-serif")
            .style("font-size", "12px")
            .html("First Season Year: ")
            .append("tspan")
            .style("color", team1Info.Color1)
            .text(selectedTeam1)
            .append("tspan")
            .text(" - " + team1First + ", ")
            .append("tspan")
            .style("color", team2Info.Color1)
            .text(selectedTeam2)
            .append("tspan")
            .text(" - " + team2First);

          var legend = self.svg.append('g')
            .attr('class', 'chart-legend')
            .attr('transform', 'translate(' + (100) + ',' + (100) + ')');

          // Add red legend square for Team 1
          legend.append('rect')
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', teamColors["Team1"].Color1)
            .attr('x', -85) // Adjust X position to position the legend next to the title
            .attr('y', -163); // Y position

          // Add text for Team 1
          legend.append('text')
            .attr('x', -58) // Adjust X position to position the legend next to the title
            .attr('y', -148) // Y position to align with the box
            .text(selectedTeam1)
            .style('font-size', '10px')
            .style('font-family', "'Poppins', sans-serif");

          // Add blue legend square for Team 2
          legend.append('rect')
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', teamColors["Team2"].Color1)
            .attr('x', -85) // Adjust X position to position the legend next to the title
            .attr('y', -130); // Y position

          // Add text for Team 2
          legend.append('text')
            .attr('x', -58) // Adjust X position to position the legend next to the title
            .attr('y', -115) // Y position to align with the box
            .text(selectedTeam2)
            .style('font-size', '10px')
            .style('font-family', "'Poppins', sans-serif");
        })
      });
    });
    function handleMouseOverCircle(event, d) {
      var xPosition = event.pageX;
      var yPosition = event.pageY;
  
      xPosition += 10;
      yPosition -= 30;
  
      var year = d.date.getFullYear();
      // console.log("d: ", d);
  
      self.tooltip.transition()
        .duration(200)
        .style("opacity", .9);
  
      self.tooltip.html("Year: " + year + "<br/>" + selectedFeature + " (" + d.TEAM_NAME + "): " + d[selectedFeature].toFixed(3))
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");
    }
  
  
    // Function to handle mouseout on the line
    function handleMouseOut(event, d) {
      self.tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    }
  
  
    // Helper function to combine and process data
    function combineAndProcessData(data1, data2) {
      // Combine and process data from data1 and data2
  
      var combinedData = [
        ...data1.map(d => ({ ...d, team: "Team1", date: parseSeasonYear(d.YEAR) })),
        ...data2.map(d => ({ ...d, team: "Team2", date: parseSeasonYear(d.YEAR) })),
        // ...max.map(d => ({ ...d, team: "Max", date: parseSeasonYear(d.YEAR) })),
      ];
  
      return combinedData;
    }
  
    function parseSeasonYear(seasonYear) {
      //Format is like 1971-1972
      var startYear = +seasonYear.split('-')[0];
      return new Date(startYear, 0, 1);
    }
  }
  //self.svgHeight = Math.max(400, d3.max(combinedData, d => yScale(d[selectedFeature]))) + 20;
  // Create line generator
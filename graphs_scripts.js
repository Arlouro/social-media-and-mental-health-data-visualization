// >-----------------< Graph Config >-------------------<
const graphConfig = {
  mainWidth: 750,
  mainHeight: 700,
  sideWidth: 300,
  sideHeight: 250,
  colors: {
    Male: '#285AAD',    
    Female: '#EA2F33',  
    Other: '#9DC518'
  },
  mentalHealthMetrics: [
    { key: 'feelDepressed', label: 'Depression Scale' },
    { key: 'compareScale', label: 'Social Comparison Scale' },
    { key: 'botherScale', label: 'Worry Scale' },
    { key: 'interestFluctuation', label: 'Interest Fluctuation Scale' },
    { key: 'sleep', label: 'Sleep Issues Scale' },
    { key: 'concentrationScale', label: 'Concentration Scale' },
    { key: 'socialValidation', label: 'Social Validation Scale' },
    { key: 'restlessness', label: 'Restlessness Scale' },
    { key: 'distractionScale', label: 'Distraction Scale' },
    { key: 'distractionWhileBusy', label: 'Distraction While Busy Scale' },
    { key: 'useWithoutPurpose', label: 'Use Without Purpose Scale' }
  ],
  socialMediaVisualizationOptions: [
    { key: 'platforms', label: 'Social Media Platforms' },
    { key: 'time', label: 'Time Spent on Social Media' }
  ]
};


// >-----------------< Data Initialization >-------------------<
function initializeGraphs() {
  d3.csv("dataset.csv").then(data => {
    const cleanedData = data.map(d => ({
      age: parseAge(d["1. What is your age?"]),
      gender: genderGroup(d["2. Gender"]),
      relationshipStatus: d["3. Relationship Status"],
      occupation: d["4. Occupation Status"],
      organization: d["5. What type of organization are you affiliated with?"],
      socialMediaUsed: socialMediaUsedStringParse(d["7. What social media platforms do you commonly use?"]),
      socialMediaTime: parseSocialMediaTime(d["8. What is the average time you spend on social media every day?"]),
      useWithoutPurpose: parseScale(d["9. How often do you find yourself using Social media without a specific purpose?"]),
      distractionWhileBusy: parseScale(d["10. How often do you get distracted by Social media when you are busy doing something?"]),
      restlessness: parseScale(d["11. Do you feel restless if you haven't used Social media in a while?"]),
      distractionScale: parseScale(d["12. On a scale of 1 to 5, how easily distracted are you?"]),
      botherScale: parseScale(d["13. On a scale of 1 to 5, how much are you bothered by worries?"]),
      concentrationScale: parseScale(d["14. Do you find it difficult to concentrate on things?"]),
      compareScale: parseScale(d["15. On a scale of 1-5, how often do you compare yourself to other successful people through the use of social media?"]),
      socialValidation: parseScale(d["17. How often do you look to seek validation from features of social media?"]),
      feelDepressed: parseScale(d["18. How often do you feel depressed or down?"]),
      interestFluctuation: parseScale(d["19. On a scale of 1 to 5, how frequently does your interest in daily activities fluctuate?"]),
      sleep: parseScale(d["20. On a scale of 1 to 5, how often do you face issues regarding sleep?"]),
    }));

    const platformUsageByGender = countPlatformsByGender(cleanedData);
    const timeUsageByGender = countSocialMediaTimeByGender(cleanedData);

    const state = {
      selectedMentalHealthMetric: 'feelDepressed',
      selectedSocialMediaVisualization: 'platforms',
      selectedPlatform: null,
      selectedOccupation: null,
      selectedGender: null
    };

    createScatterPlot("#main-graph", graphConfig.mainWidth, graphConfig.mainHeight, cleanedData, state);
    createLegendForMainGraph("#main-graph", state);
    createBarGraph("#side-graph-1", graphConfig.sideWidth, graphConfig.sideHeight, cleanedData, state);
    createDonutChart("#side-graph-2", graphConfig.sideWidth, graphConfig.sideHeight, platformUsageByGender, timeUsageByGender, state);
    
    setupScatterPlotInteractions(cleanedData, state);
    setupDonutChartInteractions(cleanedData, platformUsageByGender, timeUsageByGender, state);
    setupBarGraphInteractions(cleanedData, platformUsageByGender, timeUsageByGender, state);

  }).catch(error => {
    console.error("Error loading or processing data:", error);
  });
}


// >-----------------< Helper Functions >-------------------<
function parseAge(ageString) {
  const age = parseInt(ageString, 10);
  return isNaN(age) ? null : age;
}

function genderGroup(gender) {
  if (gender === "Male" || gender === "Female") return gender;
  return "Other";
}

function parseSocialMediaTime(timeString) {
  if (!timeString) return "Unknown";
  return timeString.trim();
}

function parseScale(scaleString) {
  const scale = parseFloat(scaleString);
  return isNaN(scale) ? null : scale;
}

function socialMediaUsedStringParse(socialMediaUsed) {
  return socialMediaUsed ? socialMediaUsed.split(",").map(d => d.trim()) : [];
}

function countPlatformsByGender(data) {
  const platformCounts = {};

  data.forEach(entry => {
      const { gender, socialMediaUsed } = entry;

      socialMediaUsed.forEach(platform => {
          if (!platformCounts[platform]) {
              platformCounts[platform] = { Male: 0, Female: 0, Other: 0 };
          }
          platformCounts[platform][gender] = (platformCounts[platform][gender] || 0) + 1;
      });
  });

  const sortedPlatforms = Object.keys(platformCounts).sort((a, b) => {
      const aTotal = Object.values(platformCounts[a]).reduce((acc, count) => acc + count, 0);
      const bTotal = Object.values(platformCounts[b]).reduce((acc, count) => acc + count, 0);
      return aTotal - bTotal;
  }
  );

  const sortedPlatformCounts = {};
  sortedPlatforms.forEach(platform => {
      sortedPlatformCounts[platform] = platformCounts[platform];
  });

  return sortedPlatformCounts;
}

function countSocialMediaTimeByGender(data) {
  const timeCategories = [
    "Less than 1 hour",
    "Between 1 and 2 hours",
    "Between 2 and 3 hours",
    "Between 3 and 4 hours",
    "Between 4 and 5 hours",
    "More than 5 hours"
  ];

  const timeUsageByGender = {};
  timeCategories.forEach(category => {
    timeUsageByGender[category] = { Male: 0, Female: 0, Other: 0 };
  });

  data.forEach(entry => {
    const { gender, socialMediaTime } = entry;
    if (timeUsageByGender[socialMediaTime]) {
      timeUsageByGender[socialMediaTime][gender]++;
    }
  });

  return timeUsageByGender;
}


// >-----------------< Visualization Update >-------------------<
function updateAllVisualizations(data, state) {
  const filteredData = data.filter(d => {
    const platformMatch = state.selectedPlatform ? 
      d.socialMediaUsed.includes(state.selectedPlatform) : true;
    
    const occupationMatch = state.selectedOccupation ? 
      d.occupation === state.selectedOccupation : true;
    
    const genderMatch = state.selectedGender ? 
      d.gender === state.selectedGender : true;
    
    return platformMatch && occupationMatch && genderMatch;
  });

  d3.select("#main-graph").selectAll("svg").remove();
  createScatterPlot("#main-graph", graphConfig.mainWidth, graphConfig.mainHeight, filteredData, state);
  createLegendForMainGraph("#main-graph", state);
  setupScatterPlotInteractions(data, state);
}

// >-----------------< Tooltip Creation >-------------------<
function createTooltip() {
  return d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("padding", "10px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)");
}

// >-----------------< Legend Creation >-------------------<
function createLegendForMainGraph(containerId, state) {
  const svg = d3.select(containerId).select("svg");
  const width = parseInt(svg.attr("width"));
  const margin = { top: 60, right: 140, bottom: 70, left: 60 };

  svg.selectAll(".legend").remove();

  const controlContainer = svg.append("g")
    .attr("class", "dashboard-controls")
    .attr("transform", `translate(${width - margin.right}, 20)`);

  const legend = controlContainer.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(-220, -20)");

  const legendData = [
    { color: graphConfig.colors.Male, label: 'Male' },
    { color: graphConfig.colors.Female, label: 'Female' },
    { color: graphConfig.colors.Other, label: 'Other' }
  ];

  const legendItems = legend.selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(${i * 80}, 0)`);

  legendItems.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => d.color)
    .attr("rx", 3)
    .attr("ry", 3);

  legendItems.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .text(d => d.label)
    .attr("font-size", "12px")
    .attr("fill", "#333");
}


// >-----------------< Scatter Plot Interactions >-------------------<
function setupScatterPlotInteractions(data, state) {
  const metricSelector = d3.select("#main-graph")
    .append("select")
    .attr("class", "metric-selector")
    .style("position", "absolute")
    .style("top", "50px")
    .style("left", "14px")
    .style("padding", "5px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("background-color", "white")
    .style("width", "150px");

  metricSelector.selectAll("option")
    .data(graphConfig.mentalHealthMetrics)
    .enter()
    .append("xhtml:option")
    .attr("value", d => d.key)
    .text(d => d.label);

  metricSelector.property("value", state.selectedMentalHealthMetric);

  metricSelector.on("change", function() {
    state.selectedMentalHealthMetric = this.value;
    updateAllVisualizations(data, state);
  });
}

// >-----------------< Donut Chart Interactions >-------------------<
function setupDonutChartInteractions(data, platformUsageByGender, timeUsageByGender, state) {
  const svg = d3.select("#side-graph-2 svg");
  
  svg.selectAll(".arc")
    .on("click", function(event, d) {
      const selectedPlatform = d.category;
      
      state.selectedPlatform = state.selectedPlatform === selectedPlatform ? null : selectedPlatform;
      
      updateAllVisualizations(data, state);
    });
}

// >-----------------< Bar Graph Interactions >-------------------<
function setupBarGraphInteractions(data, platformUsageByGender, timeUsageByGender, state) {
  const svg = d3.select("#side-graph-1 svg");

  svg.selectAll(".bar")
    .on("click", function(event, d) {
      const selectedOccupation = d.data.occupation;
      
      state.selectedOccupation = state.selectedOccupation === selectedOccupation ? null : selectedOccupation;
      
      updateAllVisualizations(data, state);
    });
}

// >-----------------< Graph Creation >-------------------<
// Scatter Plot >----<
function createScatterPlot(containerId, width, height, data, state) {
  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const margin = { top: 60, right: 150, bottom: 70, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const metricKey = state.selectedMentalHealthMetric;

  const x = d3.scaleLinear()
  .domain([10, 70])
  .range([0, chartWidth]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[metricKey])])
    .range([chartHeight, 0]);

  // Axis
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .style("text-anchor", "center")
    .attr("dy", "0.8em")
    .style("font-size", "12px")
    .style("fill", "#555");

  g.append("g")
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .selectAll("text")
    .style("font-size", "12px")
    .style("fill", "#555");

  // X-axis label
  svg.append("text")
    .attr("transform", `translate(${width / 2}, ${height - margin.bottom / 2})`)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .text("Age");

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left / 3)
    .attr("x", 0 - height / 2)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .text(graphConfig.mentalHealthMetrics.find(m => m.key === metricKey).label);

  // Scatter
  g.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", d => x(d.age))
    .attr("cy", d => y(d[metricKey]))
    .attr("r", 5)
    .attr("fill", d => graphConfig.colors[d.gender])
    .attr("opacity", 0.7);

  const tooltip = createTooltip();

  svg.selectAll(".dot")
    .on("mouseenter", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 8)
        .attr("fill", "#333");
    })
    .on("mousemove", function(event, d) {
      tooltip.style("visibility", "visible")
        .text(`${d.age} years old - ${d[metricKey]}`);
      tooltip.style("top", `${event.pageY + 5}px`)
        .style("left", `${event.pageX + 5}px`);
    })
    .on("mouseleave", function() {
      d3.select(this)
      .transition()
      .duration(200)
      .attr("r", 5)
      .attr("fill", d => graphConfig.colors[d.gender]);
      tooltip.style("visibility", "hidden");
    });
}

// Donut Chart >----<
function createDonutChart(containerId, width, height, platformUsageByGender, timeUsageByGender, state) {
  const svg = d3.select(containerId).select("svg");
  if (svg.size() > 0) svg.remove();

  const donutContainer = d3.select(containerId)
    .append("div")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("flex-direction", "column")
    .style("margin-bottom", "20px")
    .style("align-items", "left");

  const visualizationSelector = donutContainer
    .append("select")
    .attr("class", "metric-selector")
    .style("padding", "5px")
    .style("border", "1px solid #ccc")	
    .style("border-radius", "4px")
    .style("background-color", "white")
    .style("width", "200px")
    .style("margin-right", "170px")
    .style("margin-top", "-7px");

  visualizationSelector.selectAll("option")
    .data(graphConfig.socialMediaVisualizationOptions)
    .enter()
    .append("option")
    .attr("value", d => d.key)
    .text(d => d.label);

  visualizationSelector.property("value", state.selectedSocialMediaVisualization);

  function renderDonutChart(visualizationType) {
    donutContainer.select("svg").remove();

    const currentData = visualizationType === 'platforms' 
      ? platformUsageByGender 
      : timeUsageByGender;

    const newSvg = donutContainer
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const genders = ["Male", "Female", "Other"];
    const colors = [graphConfig.colors.Male, graphConfig.colors.Female, graphConfig.colors.Other];
    
    const innerRadius = 20;
    const outerRadius = Math.min(width, height) / 2 + 10;

    const tooltip = createTooltip();

    const data = Object.entries(currentData).flatMap(([category, counts]) => 
      genders.map((gender, genderIndex) => ({
        category,
        gender,
        value: counts[gender],
        color: colors[genderIndex],
        genderIndex
      }))
    );

    const radiusScale = d3.scaleBand()
      .domain(Object.keys(currentData))
      .range([innerRadius, outerRadius])
      .padding(0.1);

    const anglePerSection = Math.PI / 2;
    const angleScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([0, anglePerSection]);

    Object.keys(currentData).forEach((category) => {
      genders.forEach((_, genderIndex) => {
        const borderArc = d3.arc()
          .innerRadius(radiusScale(category))
          .outerRadius(radiusScale(category) + radiusScale.bandwidth())
          .startAngle(genderIndex * anglePerSection)
          .endAngle((genderIndex + 1) * anglePerSection);

        newSvg.append("path")
          .attr("class", "section-border")
          .attr("d", borderArc)
          .attr("fill", "none")
          .attr("stroke", "#aaa")
          .attr("stroke-width", 1);
      });
    });

    const arc = d3.arc()
      .innerRadius(d => radiusScale(d.category))
      .outerRadius(d => radiusScale(d.category) + radiusScale.bandwidth())
      .startAngle(d => d.genderIndex * anglePerSection)
      .endAngle(d => d.genderIndex * anglePerSection + angleScale(d.value));

    newSvg.selectAll("path.arc")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("d", arc)
      .attr("fill", d => d.color)
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .text(`${d.category} - ${d.gender}: ${d.value}`);
      })
      .on("mousemove", event => {
        tooltip.style("top", `${event.pageY + 5}px`)
          .style("left", `${event.pageX + 5}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      })
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate(0, d.value);
        return function (t) {
          d.value = interpolate(t);
          return arc(d);
        };
      });

    // Labels 
    Object.keys(currentData).forEach((category) => {
      const angle = -Math.PI / 2;

      const x = Math.cos(angle) * (radiusScale(category) + radiusScale.bandwidth() / 2) - 10;
      const y = Math.sin(angle) * (radiusScale(category) + radiusScale.bandwidth() / 2) + 4;

      newSvg.append("text")
      .attr("class", "label")
      .attr("x", x)
      .attr("y", y)
      .text(category)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "#333");
    });
  }

  renderDonutChart(state.selectedSocialMediaVisualization);

  visualizationSelector.on("change", function() {
    state.selectedSocialMediaVisualization = this.value;
    renderDonutChart(this.value);
  });
}

// Bar Graph >----<
function createBarGraph(containerId, width, height, data) {
  const svg = d3.select(containerId)
    .style("display", "flex")
    .style("justify-content", "center")
    .style("align-items", "center")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const margin = { top: 20, right: 20, bottom: 20, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const occupationData = d3.rollups(
    data,
    (v) => v.length,
    (d) => d.occupation,
    (d) => d.gender
  );

  const stackedData = occupationData.map(([occupation, genderCounts]) => {
    return {
      occupation,
      ...Object.fromEntries(genderCounts),
      total: genderCounts.reduce((sum, [, count]) => sum + count, 0),
    };
  });

  stackedData.sort((a, b) => b.total - a.total);

  const x = d3.scaleBand()
    .domain(stackedData.map((d) => d.occupation))
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(stackedData, (d) => d.total)])
    .nice()
    .range([chartHeight, 0]);

  const genders = ["Male", "Female", "Other"];

  const stack = d3.stack()
    .keys(genders)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  const series = stack(stackedData);

  // X-axis
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  // Y-axis
  g.append("g")
    .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0))
    .selectAll("text")
    .style("font-size", "12px")
    .style("fill", "#555");

  // Bars
  g.selectAll(".series")
    .data(series)
    .enter()
    .append("g")
    .attr("class", "series")
    .attr("fill", (d) => graphConfig.colors[d.key])
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d, i) => x(stackedData[i].occupation))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("class", "bar")
    .on("mouseover", function(event, d) {
      tooltip.style("visibility", "visible")
        .text(`${d.data.occupation} - ${d.key}: ${d[1] - d[0]}`);
    })
    .on("mousemove", function(event) {
      tooltip.style("top", `${event.pageY + 5}px`)
        .style("left", `${event.pageX + 5}px`);
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    })
    .on("mouseenter", function() {
      d3.select(this)
        .transition()
        .attr("opacity", 0.7);
    })
    .on("mouseleave", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 1);
    });

  const tooltip = createTooltip();

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left / 3)
    .attr("x", 0 - height / 2)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .text("Number of Participants");
}

document.addEventListener('DOMContentLoaded', initializeGraphs);
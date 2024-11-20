// Define sample data
const data = [
  { mental_health: 55, screen_time: 25, gender: 'Male' },
  { mental_health: 70, screen_time: 35, gender: 'Female' },
  { mental_health: 45, screen_time: 15, gender: 'Male' },
  { mental_health: 65, screen_time: 30, gender: 'Female' },
  { mental_health: 50, screen_time: 20, gender: 'Male' },
  { mental_health: 75, screen_time: 40, gender: 'Female' }
];

// Main graph ----------------------------->
// Create the main scatter plot
const mainGraph = d3.select('#main-graph')
  .append('svg')
  .attr('width', 600)
  .attr('height', 400);

const x = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.screen_time)])
  .range([50, 550]);
const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.mental_health)])
  .range([350, 50]);

mainGraph.append('g')
  .attr('transform', 'translate(0, 350)')
  .call(d3.axisBottom(x));
mainGraph.append('g')
  .attr('transform', 'translate(50, 0)')
  .call(d3.axisLeft(y));

mainGraph.selectAll('circle')
  .data(data)
  .enter()
  .append('circle')
  .attr('cx', d => x(d.screen_time))
  .attr('cy', d => y(d.mental_health))
  .attr('r', 5)
  .attr('fill', d => d.gender === 'Male' ? 'blue' : 'red');


// Secondary graphs ----------------------------->
// Create the secondary bar graph
const barGraph = d3.select('#bar-graph')
  .append('svg')
  .attr('width', 300)
  .attr('height', 200);

const barX = d3.scaleBand()
  .range([0, 300])
  .padding(0.1);
const barY = d3.scaleLinear()
  .range([200, 0]);

barX.domain(data.map(d => d.gender));
barY.domain([0, d3.max(data, d => d.screen_time)]);

barGraph.append('g')
  .attr('transform', 'translate(0, 200)')
  .call(d3.axisBottom(barX));
barGraph.append('g')
  .call(d3.axisLeft(barY));

const barData = d3.rollups(
  data,
  group => d3.mean(group, d => d.screen_time),
  d => d.gender
);

barGraph.selectAll('.bar')
  .data(barData)
  .enter()
  .append('rect')
  .attr('x', d => barX(d[0]))  // Gender
  .attr('y', d => barY(d[1]))  // Average Screen Time
  .attr('width', barX.bandwidth())
  .attr('height', d => 200 - barY(d[1]))
  .attr('fill', d => d[0] === 'Male' ? 'blue' : 'red');


// Create the secondary donut chart
const donutChart = d3.select('#donut-chart')
  .append('svg')
  .attr('width', 200)
  .attr('height', 200)
  .append('g')
  .attr('transform', 'translate(100,100)');

const pie = d3.pie()
  .value(d => d.mental_health);

const arc = d3.arc()
  .outerRadius(80)
  .innerRadius(40);

const donutSlices = donutChart.selectAll('path')
  .data(pie(data))
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', (d, i) => ['green', 'orange', 'purple'][i]);
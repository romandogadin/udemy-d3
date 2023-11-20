// MARGINS
const MARGIN = {
	LEFT: 100,
	RIGHT: 10,
	TOP: 10,
	BOTTOM: 100
}

// AREA OF THE CHART
const AREA_WIDTH = 800
const AREA_HEIGHT = 500

// CHART AREA WITHOUT THE MARGINS
const WIDTH = AREA_WIDTH - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = AREA_HEIGHT - MARGIN.TOP - MARGIN.BOTTOM

// SVG FOR THE VISUAL
const svg = d3.select("#chart-area").append("svg")
	.attr("width", AREA_WIDTH)
	.attr("height", AREA_HEIGHT)

// ADD A GROUP AND DEFINE A TRANSFORMER THAT PUSHES THE WHOLE GROUP(VISUAL) OVER AND DOWN BY SOME AMOUNT
const g = svg.append("g")
	.attr("transform",
		  `translate(${MARGIN.LEFT},${MARGIN.TOP})`)

let time = 0

// SET THE SCALES
// for the GDP (X) axis I will use the logarithmic scale because it will make data more spread out
const x = d3.scaleLog()
			.base(10) 				// log base
			.domain([100,150000]) 	// min/max of the data in the CSV file
			.range([0, WIDTH]) 		// scalled output that fits into the SVG area

const y = d3.scaleLinear()
			.domain([0,90])			// life expactancy min/max
			.range([HEIGHT, 0])     // scalled output that fits into the SVG area

// area of the circle - population
const area = d3.scaleSqrt()						// useful for sizing circles by area (not radius). Doubling radius will increase area by 4
			.domain([2000, 1400000000])			// country population
			.range([3,60])						// scalled output

// colors for continents 
const continentColor = d3.scaleOrdinal(d3.schemePastel1) // schemePastel1 has 9 colors. Assign an ordinal number to each color
			
// TEXT ANNOTATIONS (for axis titles)
// X axis title
const xLabel = g.append("text")
	.attr("y", HEIGHT + 50)
	.attr("x", WIDTH / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("GDP Per Capita ($)")

// Y axis title
const yLabel = g.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", -40)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Life Expectancy (Years)")

// Year counter
const timeLabel = g.append("text")
	.attr("y", HEIGHT - 10)
	.attr("x", WIDTH - 40)
	.attr("font-size", "40px")
	.attr("opacity", "0.4")
	.attr("text-anchor", "middle")
	.text("1800")


// ACTUAL AXIS
// define the X axis
const xAxisCall = d3.axisBottom(x)
	.tickValues([400, 4000, 40000])
	.tickFormat(d3.format("$"))

// attach the Y axis to the group
g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
	.call(xAxisCall)

// define the Y axis
const yAxisCall = d3.axisLeft(y)

// attach the Y axis to the group
g.append("g")
	.attr("class", "y axis")
	.call(yAxisCall)

// feed the data
d3.json("data/data.json").then
(
	function(data)
	{
		// clean data
		const formattedData = data.map
		(	
			year => 
			{
				// check for missing data in income and life_exp
				return year["countries"].filter
				(
					country => 
					{
						const dataExists = (country.income && country.life_exp)
						return dataExists
					}
				)
				// return the list with income and life_exp
				.map 
				(
					country => 
					{
					country.income = Number(country.income)
					country.life_exp = Number(country.life_exp)
					return country
					}
				)
			}
		)

		//console.log(formattedData)

		// run the code every 0.1 second
		d3.interval(function(){
			// at the end of our data, loop back
			time = (time < 214) ? time + 1 : 0
			update(formattedData[time])
		}, 100)

		// first run of the visualization
		update(formattedData[0])
	}
)

// define the UPDATE function that refreshes the data
function update(data) {
	// transitions enable smooth animations between updates
	const t = d3.transition()
				.duration(100)

	console.log(data)

	// JOIN new data with old elements
	// g.selectAll("circle") - tells the browser to find the g element and look inside it for any circles. 
    // If it finds circles, it returns them in a selection that is an array of elements. 
    // If it doesn’t find any, it returns an empty selection
    // data(data) - Binds new data to the selection
	const circles = g.selectAll("circle")
		.data(data, d => d.country)

	console.log(circles)
		
	// EXIT old elements not present in new data.
	circles
		.exit()		// identify old/non-existing elements from the previous run
		.remove() 	// remove the selected elements from the document and return a new selection with the removed elements
	
	// ENTER new elements present in new data.
	// enter() is selecting only the elements that were not in data model (DOM) yet
	circles.enter() 
		.append("circle")
		.attr("fill", d => continentColor(d.continent)) // assign a color code to a continent
		.merge(circles) 								// select the DOM elements that did not exist in the DOM before and the ones that did
		.transition(t)									// enable smooth animations between updates
			.attr("cy", d => y(d.life_exp))
			.attr("cx", d => x(d.income))
			//.attr("r",  d => Math.sqrt(area(d.population) / Math.PI))
			.attr("r",  d => area(d.population))

	// update the text attribute of the timeLabel annotation
	timeLabel.text(String(time + 1800))	

	// log continents -> color mapping
	//console.log(continentColor.domain()) 
	//console.log(continentColor.range())
	//console.log(continentColor)
}
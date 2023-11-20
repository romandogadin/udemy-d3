/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 3 - CoinStats
*/

const MARGIN = { LEFT: 20, RIGHT: 100, TOP: 50, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
	.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
	.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
	.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// time parser for x-scale
const parseTime = d3.timeFormat("%d/%m/	%Y")

// for tooltip
const bisectDate = d3.bisector(d => d.year).left

// scales
const x = d3.scaleTime().range([0, WIDTH])
const y = d3.scaleLinear().range([HEIGHT, 0])

// axis generators
const xAxisCall = d3.axisBottom()
const yAxisCall = d3.axisLeft()
	.ticks(6)
	.tickFormat(d => `${parseInt(d / 1000)}k`)

// axis groups
const xAxis = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
const yAxis = g.append("g")
	.attr("class", "y axis")

// y-axis label
yAxis.append("text")
	.attr("class", "axis-title")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.attr("fill", "#5D6971")
	.text("Population)")

// line path generator
const line = d3.line()
	.x(d => x(d.year))
	.y(d => y(d.value))

json_promise = d3.json("data/coins.json")

d3.json("data/coins.json").then(data => {
	// prepare and clean data
	filteredData = {}
	Object.keys(data)
		.forEach(coin => {
			filteredData[coin] = data[coin]
				.filter(d => {
					return !(d["price_usd"] == null)
				}).map(d => {
					d["price_usd"] = Number(d["price_usd"])
					d["24h_vol"] = Number(d["24h_vol"])
					d["market_cap"] = Number(d["market_cap"])
					d["date"] = parseTime(d["date"])
					return d
				})
		})

	// run the visualization for the first time
	update()
})

function update() {
	// transition delay between iterations (or smoothness)
	const t = d3.transition().duration(100)
	
	////////////////////// READ THE DROP DOWN VALUES //////////////////////////
	// $("") is a jQuery selector. 
	// It selects an HTML element with the given id "coin-select". 
	// val() is a jQuery method that gets the value of form elements
	const coin = $("#coin-select").val()  	// X axis
	const yValue = $("#var-select").val()	// Y axis

	// get dates from the slider
	const sliderValues = $("#date-slider").slider("values") 	

	// filter data using the dates from the slider
	const dataTimeFiltered = filteredData[coin].filter(d => {
		return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
	})

	//////////////////// SET SCALERS DOMAINS ////////////////////
	// d3.extent is a utility that finds min and max values in our array
	x.domain(d3.extent(dataTimeFiltered, d => d.date))
	y.domain(
		d3.min(dataTimeFiltered, d => d[yValue]) / 1.005,
		d3.max(dataTimeFiltered, d => d[yValue]) * 1.005
	)

	/////////////////// FORMATTING ///////////////////////////
	 //  format numbers with up to 2 significant digits and an appropriate SI prefix
	 // "4.2k", "4.2M", "4.2B" and so on
	const formatSi = d3.format(".2s")

	// Uses "K" instead of "k" to denote thousands.
	// Uses "B" instead of "G" to denote billions.
	function formatAbbreviation(x) {
		const s = formatSi(x)
		switch (s[s.length - 1]) {
			case "G": return s.slice(0, -1) + "B" // billions
			case "k": return s.slice(0, -1) + "K" // thousands
		}
		return s
	}

	// update axis
	xAxisCall.scale(x)
	xAxis.transition(t).call(xAxisCall)
	yAxisCall.scale(y)
	yAxis.transition(t).call(yAxisCall)

	// clear old tooltips from the class before rendering new ones
	d3.select(".focus").remove()
	d3.select(".overlay").remove()

	/////////////////// TOOLTIPS ////////////////////////
	const focus = g.append("g")
		.attr("class","focus")
		.style("display","none")  // hide the element

	
	focus.append("line")
		.attr("class", "x-hover-line hover-line")
		.attr("y1", 0)
		.attr("y2", HEIGHT)

	focus.append("line")
		.attr("class", "y-hover-line hover-line")
		.attr("x1", 0)
		.attr("x2", WIDTH)

	focus.append("circle")
		.attr("r", 7.5)

	focus.append("text")
		.attr("x", 15)
		.attr("dy", ".31em")

	g.append("rect")
		.attr("class", "overlay")
		.attr("width", WIDTH)
		.attr("height", HEIGHT)
		.on("mouseover", () => focus.style("display", null))
		.on("mouseout", () => focus.style("display", "none"))
		.on("mousemove", mousemove)

	function mousemove() {
		const x0 = x.invert(d3.mouse(this)[0])
		const i = bisectDate(dataTimeFiltered, x0, 1)
		const d0 = dataTimeFiltered[i - 1]
		const d1 = dataTimeFiltered[i]
		const d = x0 - d0.date > d1.date - x0 ? d1 : d0
		focus.attr("transform", `translate(${x(d.date)}, ${y(d[yValue])})`)
		focus.select("text").text(d[yValue])
		focus.select(".x-hover-line").attr("y2", HEIGHT - y(d[yValue]))
		focus.select(".y-hover-line").attr("x2", -x(d.date))
	}
}
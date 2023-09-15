/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/

// how much whitespace you want to have around your chart
const MARGIN = {
    LEFT: 100,
    RIGHT: 30,
    TOP: 20,
    BOTTOM: 100
}

// the actual size of the chart (svg area - margins)
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM

// define the svg area size
const svg = d3.select('#chart-area').append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

// add a group and define a transformer that pushes the whole g group (visual) over and down by some amount.
const g = svg.append("g")
    .attr("transform", // attribute that supports transformations 
          `translate(${MARGIN.LEFT},${MARGIN.TOP})` // type of transformation. Others are rotate, scale, skew
         )

// Main logic. 
// First ingest data from the csv
d3.csv("data/revenues.csv").then(data => 
{   
    // Convert numeric values to numeric data types
    data.forEach(d => {
        d.profit = Number(d.profit)    
        d.revenue = Number(d.revenue)
    })

    // log the data
    console.log(data)

    // define the horizontal scaler for X
    const x = d3.scaleBand()
        .domain(data.map(d => d.month)) // get the list of all months dynamically (doesn't exclude duplicates)
        .range([0, WIDTH])
        .paddingInner(0.3) // padding between the columns
        .paddingOuter(0.2) // padding outside the columns (very left and very right)

    // define the vertical scaler for Y
    // the scaler return the number of pixels from the top (since 0,0 is the top left corner of the canvas)
    // the number depends on the RANGE. If the range is reversed - [HEIGHT,0] - it will provide the height of the column
    // starting from the bottom of canvas X-axis. If the RANGE is regular [0, HEIGHT] - it will consider the X-axis to be at the top of the canvas.
    const y = d3.scaleLinear()
        .domain(                               // DOMAIN is the complete set of values. This is what's written on the Y-axis: 0 to max revenue value
            [0, d3.max(data, d => d.revenue)]  // use the callback function to dynamically generate the array of all revenues
                                               // first use the d3.max function to retrieve a max value from the array
                                               // passing two parameters: data - the entire dataset
                                               //                         d => d.revenue - the callback functin with each row passing to the d 
                                               //                                          and retrieving revenue from that row using d.revenue
        )
        .range([HEIGHT,0])                     // needs to be inverted in order for the Y axis to start from 0 at the bottom

    // add X axis title
    g.append("text")
    .attr("class", "x axis-label")
    .attr("x", WIDTH / 2)
    .attr("y", HEIGHT + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Month")
    
    // add X axis 
    const xAxisCall = d3.axisBottom(x)
    
    g.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${HEIGHT})`) // pushes the the X axis down, instead of keeping it at the top
        .call(xAxisCall)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")
    
    // add Y axis title
    g.append("text")
    .attr("class", "y axis-label")
    .attr("x", - (HEIGHT / 2))
    .attr("y", -60)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Revenue ($)")
    
    // add Y axis
    const yAxisCall = d3.axisLeft(y)
        .ticks(3)
        .tickFormat(d => d + "m")
    
    g.append("g")
        .attr("class", "y axis")
        .call(yAxisCall)

    // g.selectAll("rect") - tells the browser to find the g element and look inside it for any rectangles. 
    // If it finds rectangles, it returns them in a selection that is an array of elements. 
    // If it doesn’t find any, it returns an empty selection
    // data(data) - Binds data to the selection
    const rects = g.selectAll("rect")
        .data(data)
    
    // adds a rectangle for each item in the enter selection
    rects.enter() // The enter selection consists of 'placeholder' elements that represent the elements that need to be added.
        .append("rect")
        .attr("y", d => y(d.revenue))               // starting rendering point on the Y axis. The column will be filled from this point down to the X axis
        .attr("x", d => x(d.month))                 // start rendering each column at a particular month in the iteration
        .attr("width", x.bandwidth)                 // 'bandwidth' is used to find the width of each band
        .attr("height", d => HEIGHT - y(d.revenue)) // fill the rectangle
        .attr("fill", "green")
})
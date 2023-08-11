/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.8 - Activity: Your first visualization!
*/

const svg = d3.select("#chart-area").append("svg")
    //.attr("style", "outline: thin solid black;")
    .attr("width", 500)
    .attr("height", 500)

d3.json("data/buildings.json").then(
        data => {data.forEach(
            d => {d.height = Number(d.height)}
        )
        console.log(data)

        const rectangles = svg.selectAll("rect")
            .data(data)

        rectangles.enter().append("rect")
            .attr("x", (d,i) => i*100)
            .attr("y", (d,i) => 500-d.height)
            .attr("width", 70)
            .attr("height", (d) => d.height)
            .attr("fill", "green")
    })
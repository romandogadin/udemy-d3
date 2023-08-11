/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.5 - Activity: Adding SVGs to the screen
*/

const svg = d3.select('#chart-area').append("svg")
    .attr("style", "outline: thin solid black;")
    .attr("width",500)
    .attr("height",400)

// line
svg.append("line")
    .attr("x1",5)
    .attr("y1",20)
    .attr("x2",250)
    .attr("y2",20)
    .attr("stroke","green")
    .attr("stroke-width",5)
    .attr("fill","green")


// circle
svg.append("circle")
    .attr("cx",50)
    .attr("cy",70)
    .attr("r",30)

// rectangle
svg.append("rect")
    .attr("x",150)
    .attr("y",150)
    .attr("width",200)
    .attr("height",100)    
    .attr("fill","blue")

// ellipse
svg.append("ellipse")
    .attr("cx",350)
    .attr("cy",300)
    .attr("rx",100)
    .attr("ry",30)
    .attr("fill","purple")    
$(document).ready(() => {
    let dim = {
        height: window.screen.height,
        width: window.screen.width * 1.5,
    }
    let margin = {
        top: 30,
        bottom: 30,
        left: 100,
        right: 100
    }
    let hoverCircleNodeClass = {
        "fill": "#fff",
        "stroke": "steelblue",
        "stroke-width": "1px",
    }
    let fontPos = {
        x: .35,
        y: 13
    }
    let duration = 800
    $.ajax({
        url: 'data.json',
        datatype: 'json',
        success: (data) => {
            data.treeData[0].startPoint = dim.height / 2;
            createTree(data.treeData[0]);

        }
    });
    createTree = (data) => {
        // d3.select(self.frameElement).style("height", "500px");
        let tree = d3.layout.tree().nodeSize([20, 30]).size([
            dim.height - margin.top - margin.bottom, dim.width - margin.left - margin.right
        ]);

        let nodes = tree.nodes(data).reverse();
        let links = tree.links(nodes);
        console.log(nodes, links)
        let diagonal = d3.svg.diagonal().projection((d) => [d.y, d.x]);
        nodes.forEach((d) => d.y = d.depth * 110)
        let svg = d3.select("body").
            append("svg").
            attr("width", dim.width).
            attr("height", dim.height).
            append("g").
            attr("transform", `translate(${margin.left},${margin.right})`);
        let i = 0;
        let nodeData = svg.selectAll("g.node").data(nodes, (d) => d.id || (d.id = ++i));
        var nodeEnter = nodeData.enter().append("g")
            .attr("class", "node")
            .attr("transform", (d) => { return `translate(0,${data.startPoint})` })
            .on("click", (d) => {
                click(d)
            })
            .on("mouseover", (d) => {

                let selectedNode = d3.selectAll("circle").
                    filter(p => p.id === d.id)
                selectedNode.classed("hoverCircleNodeClass",false)
                    selectedNode.style("fill",(d)=>d.color).style("stroke-width",0)
            })
            .on("mouseout",(d)=>{
               let selectedNode =  d3.selectAll("circle").
                filter(p=>p.id === d.id)
                selectedNode.style("fill",null).style("stroke-width","3px")
                selectedNode.classed("hoverCircleNodeClass",true)
            })
            ;
        nodeEnter.
            append("circle").
            attr("r", (d) => { return d.depth == 0 ? 1e-1 : 1e-4 })
            // style("fill", (d) => d.color)

        nodeEnter.append("text").
            attr("x", fontPos.x).
            attr("y", fontPos.y).
            attr("text-anchor", "end")
            .text((d) => d.name)
            .style("fill-opacity", 1e-6)

        let nodeUpdate = nodeData.
            transition().
            duration(duration).
            attr("transform", (d) => `translate(${d.y},${d.x})`)

        nodeUpdate.select("circle")
            .attr("r", (d) => {
                return d.depth === 0 ? 50 : 8
            })


        nodeUpdate.select("text")
            .style("fill-opacity", 1);
        /**
         * 
         * write exit logic here 
         *
         */
        let link = svg.selectAll("path.link")
            .data(links, (d) => d.target.id);

        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                let o = { x: data.startPoint, y: 0 };
                return diagonal({ source: o, target: o });
            });
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

    }

    function click(d) {
        
    } 

    function updateTree(){

        
    }
})


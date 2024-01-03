

    let dim = {
        height:800,
        width: window.screen.width ,
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
    function Call(){
        $.ajax({
            url: 'data.json',
            datatype: 'json',
            success: (data) => {
                data.treeData[0].startPoint = dim.height / 2;
                createTree(data.treeData[0]);
    
            }
        });
    }
    function getMaxDepthIterative(root) {
        const stack = [{ node: root, depth: 0 }];
        let maxDepth = 0;

        while (stack.length > 0) {
            const { node, depth } = stack.pop();

            if (depth > maxDepth) {
                maxDepth = depth;
            }

            if (node.children) {
                for (const child of node.children) {
                    stack.push({ node: child, depth: depth + 1 });
                }
            }
        }

        return maxDepth;
    }
    let svg;
    createTree = (data) => {
       let depth=  getMaxDepthIterative(data)*50
       let tree = d3.layout.tree().nodeSize([20, 30]).size([
            dim.height - margin.top - margin.bottom, dim.width - margin.left - margin.right
        ]);

        let nodes = tree.nodes(data).reverse();
        let links = tree.links(nodes);
        let diagonal = d3.svg.diagonal().projection((d) => [d.y, d.x]);
        nodes.forEach((d) => d.y = d.depth * depth);
        let zoom = d3.behavior.zoom().scaleExtent([0.5,20]).on("zoom", zoomed)
        zoomRange.addEventListener("input", function() {
            const scale = +this.value;
            svg.attr("transform",
            "translate(" + 0 + ")"
            + " scale(" +scale + ")");
          });
          d3.select("body svg").remove();

         svg = d3.select("body").
            append("svg").
            attr("width", dim.width).
            attr("height", dim.height).
            call(zoom).
            append("g").
            attr("transform", `translate(${margin.left},${margin.right})`);
            d3.select("#zoom_in").on("click", function() {
                zoom.scaleBy(svg.transition().duration(750), 1.2);
              });
              d3.select("#zoom_out").on("click", function() {
                zoom.scaleBy(svg.transition().duration(750), 0.8);
              });

        let i = 0;

        let nodeData = svg.selectAll("g.node").data(nodes, (d) => d.id || (d.id = ++i));
        nodeData.exit().remove();
        var nodeEnter = nodeData.enter().append("g")
            .attr("class", "node")
            .attr("transform", (d) => `translate(0,${data.startPoint})`)
            .on("click", (d) => {
                click(d, data);
            })
            .on("mouseover", (d) => {
                let selectedNode = d3.selectAll("circle").filter(p => p.id === d.id);
                selectedNode.classed("hoverCircleNodeClass", false)
                selectedNode.style("fill", (d) => d.color).style("stroke-width", 0);
            })
            .on("mouseout", (d) => {
                let selectedNode = d3.selectAll("circle").filter(p => p.id === d.id);
                selectedNode.style("fill", null).style("stroke-width", "3px");
                selectedNode.classed("hoverCircleNodeClass", true);
            });

        nodeEnter.
            append("circle").
            attr("r", (d) => { return d.depth == 0 ? 1e-1 : 1e-4 });

        nodeEnter.append("text").
            attr("x", fontPos.x).
            attr("y", fontPos.y).
            attr("text-anchor", "end")
            .text((d) => d.name)
            .style("fill-opacity", 1e-6);

        let nodeUpdate = nodeData.
            transition().
            duration(duration).
            attr("transform", (d) => `translate(${d.y},${d.x})`);

        nodeUpdate.select("circle")
            .attr("r", (d) => {
                return d.depth === 0 ? 50 : 8;
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Remove any existing nodes
            nodeData.exit().remove();

        // // Update existing links
        let link = svg.selectAll("path.link")
            .data(links, (d) => d.target.id);

        // Remove any exiting links
        link.exit().remove();

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

    function click(d, data) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        updateTree(data);
    }

    function updateTree(data) {
        let tree = d3.layout.tree().nodeSize([20, 30]).size([
            dim.height - margin.top - margin.bottom, dim.width - margin.left - margin.right
        ]);

        let nodes = tree.nodes(data).reverse();
        let links = tree.links(nodes);
        let diagonal = d3.svg.diagonal().projection((d) => [d.y, d.x]);
        nodes.forEach((d) => d.y = d.depth * 110);

        let svg = d3.select("body svg g");

        // Update existing nodes
        let nodeData = svg.selectAll("g.node").data(nodes, (d) => d.id || (d.id = ++i));

        // Remove any exiting nodes
        nodeData.exit().remove();

        let nodeEnter = nodeData.enter().append("g")
            .attr("class", "node")
            .attr("transform", (d) => `translate(${d.y},${d.x})`)
            .on("click", (d) => click(d, data))
            .on("mouseover", (d) => {
                let selectedNode = d3.selectAll("circle").filter(p => p.id === d.id);
                selectedNode.classed("hoverCircleNodeClass", false)
                selectedNode.style("fill", (d) => d.color).style("stroke-width", 0);
            })
            .on("mouseout", (d) => {
                let selectedNode = d3.selectAll("circle").filter(p => p.id === d.id);
                selectedNode.style("fill", null).style("stroke-width", "3px");
                selectedNode.classed("hoverCircleNodeClass", true);
            });

        nodeEnter.append("circle")
            .attr("r", (d) => d.depth === 0 ? 50 : 8);

        nodeEnter.append("text")
            .attr("x", fontPos.x)
            .attr("y", fontPos.y)
            .attr("text-anchor", "end")
            .text((d) => {
                return(d.name)
            })
            .style("fill-opacity", 1e-6);
        let nodeUpdate = nodeData.
            transition().
            duration(duration).
            attr("transform", (d) => `translate(${d.y},${d.x})`);

        nodeUpdate.select("circle")
            .attr("r", (d) => {
                return d.depth === 0 ? 50 : 8;
            });

        nodeUpdate.select("circle")
            .attr("r", (d) => d.depth === 0 ? 50 : 8);

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // // Update existing links
        let link = svg.selectAll("path.link").data(links, (d) => d.target.id);

        // // Remove any exiting links
        link.exit().remove();

        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                console.log("---",d)
                let o = { x: d.x, y: d.y};
                return diagonal({ source: o, target: o });
            });

        link.transition()
            .duration(duration)
            .attr("d", diagonal);
    }

    function zoomed() {
        console.log("calling")
        svg.attr("transform", "translate(" + d3.event.translate + ")");
      }



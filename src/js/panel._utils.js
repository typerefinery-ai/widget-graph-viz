// panel._uitils.js
// panel common utils
window.Widgets.Panel = {};
window.Widgets.Panel.Utils = {};

;(function ($, ns, d3, document, window) {

    ns.options = {
        tree_data: {
            sighting: 'data/sightingIndex.json',
            task: 'data/taskIndex.json',
            impact: 'data/impactIndex.json',
            event: 'data/eventIndex.json',
            me: 'data/meIndex.json',
            company: 'data/companyIndex.json',
        },    
        tree_data_default: 'sighting',
        duration: 350,
        radius: 6, // radius of curve for links
        barHeight: 40,
        margin: {
            top: 30,
            left: 30,
            bottom: 50,
            right: 30,
        },
        width: "100%",
        height: "100%",
        svg_spacing: 500,
        svg_height: "100%",
        // Icons
        prefix:
        'https://raw.githubusercontent.com/os-threat/images/main/img/',
        shape: 'rect-',
        icon_size: 30,
        textPadding: 8,
        corner: 5,
        // the tree view
        minHeight: 20,
        width: "100%",
        height: "100%",
        lineSpacing: 50,
        indentSpacing: 50,
        tooltipContent: 'summary', //'summary' or 'json'
        itemFont: '18px',
        boxSize: 10,
        tree_edge_thickness: 0.75,
        graph_edge_thickness: 1,
        linkStrength: 200,
        nodeStrength: -100,
        centreStrength: 80,
        theme: 'light',
        light_theme: {
            fill: 'white',
            svgName: 'black',
            svgBorder: 'black',
            checkColour: 'gray',
            checkText: 'white',
            select: 'yellow',
            edges: 'black',
            tooltip: {
                fill: 'white', 
                stroke: '1px', 
                scolour: 'black', 
                corner: 5, 
                tcolour: 'black', 
                tsize: '11px', 
                padding: '5px',
                maxwidth: '900px',
                overflow: 'auto'
            },
        },
        dark_theme: {
            fill: 'gray',
            svgName: 'white',
            svgBorder: 'white',
            checkColour: 'white',
            checkText: 'gray',
            select: 'yellow',
            edges: 'white',
            tooltip: {
                fill: 'lightgray', 
                stroke: '1px', 
                scolour: 'white', 
                corner: 5, 
                tcolour: 'white', 
                tsize: '11px', 
                padding: '5px',
                maxwidth: '900px',
                overflow: 'auto'
            },
        },
    };

    ns.contentMenuActive = false;
    ns.contentMenuItem = false;


    // 1. Instantiate Visualisation Variables
    // 3. Setup RMB Menu Items
    ns.menuItems = [
        {
        title: 'Copy Object',
        action: (d) => {
            // TODO: add any action you want to perform
            console.log('Copy Object', d);
        },
        },
        {
        title: 'Create Relationship',
        action: (d) => {
            // TODO: add any action you want to perform
            console.log('Create Relationship ->', d);
        },
        },
    ];



    // JSON Syntax Highlighting - https://stackoverflow.com/questions/4810841/pretty-print-json-using-javascript
    ns.syntaxHighlight = function(json) {
        if (typeof json != 'string') {
                json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    
    // Function that assembles the HTML tooltip string
    ns.htmlTooltip = function (d) {
        // console.log('d->',d);tooltip paragraph style
        let pgraph_style = '<p style="font-size:' + toString(ns.theme.tooltip.tsize) + '">';
        pgraph_style += '<font color="' + ns.theme.tooltip.tcolour +'">';
        // initilaise description string with  paragraph style
        let desc_string = pgraph_style;
        // If Tooltip is JSON, then highlight, otherwise setup return string
        if (ns.options.tooltipContent == 'json') {
            return desc_string += ns.syntaxHighlight(d.data.original);        
        }
        // setup 
        // add heading
        desc_string += '<b>' + d.data.heading + '</b>' + '<br>';
        // add description
        desc_string += d.data.description;

        return desc_string;
    }  
    

    // Three function that change the tooltip when user hover / move / leave a cell
    ns.mouseover = function(event, d) {
        //console.log('mouseover contentMenuItem ', event, d);
        if (!ns.contentMenuActive) {
            ns.showTooltip(d)
            console.log('mouseover ', ns.contentMenuActive);
            ns.contentMenuItem = d;

            d3.select(this)
                .style("stroke", window.Widgets.Widget.theme.select)
                .style("opacity", 1)
        }
    
    }
    ns.contextmenu = function(event, d) {
        ns.contentMenuItem = d;
        ns.contentMenuActive = true;
        ns.hideTooltip();
    }
    ns.mousemove = function(event, d) {
        //console.log('mousemove contentMenuItem ', event, d);
        if (!ns.contentMenuActive) {
            console.log('mousemove ', ns.contentMenuActive);

            ns.contentMenuItem = d;

            window.Widgets.Widget.tooltip
                .html(ns.htmlTooltip(d))
                .style("left", (event.pageX+30) + "px")
                .style("top", (event.pageY) + "px")
        }
    }
    ns.mouseleave = function(event, d) {
        //console.log('mouseleave contentMenuItem ', event, d);
        if (ns.contentMenuItem == d) {
            console.log('mouseleave remove contentMenuItem');
            ns.contentMenuItem = null;
        }
        window.Widgets.Widget.tooltip
            .style("opacity", 0)
        
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    ns.showTooltip = function(d) {
        if (!ns.contentMenuActive) {
            console.log('showTooltip ', ns.contentMenuActive);
            
            window.Widgets.Widget.tooltip
                .transition()
                .duration(window.Widgets.Widget.options.duration)
                .style("opacity", 1)
        }
    }

    ns.hideTooltip = function() {
        window.Widgets.Widget.tooltip
            .style("opacity", 0)
    }

    ns.makeLink = function (start, end, radius) {
        const path = d3.path()
        const dh = (4 / 3) * Math.tan(Math.PI / 8) // tangent handle offset
    
        //flip curve
        let fx, fy
        if (end[0] - start[0] == 0) {
          fx = 0
        } else if (end[0] - start[0] > 0) {
          fx = 1
        } else {
          fx = -1
        }
        if (end[1] - start[1] == 0) {
          fy = 0
        } else if (end[1] - start[1] > 0) {
          fy = 1
        } else {
          fy = -1
        }
    
        //scale curve when dx or dy is less than the radius
        if (radius == 0) {
          fx = 0
          fy = 0
        } else {
          fx *= Math.min(Math.abs(start[0] - end[0]), radius) / radius
          fy *= Math.min(Math.abs(start[1] - end[1]), radius) / radius
        }
    
        path.moveTo(...start)
        path.lineTo(...[start[0], end[1] - fy * radius])
        path.bezierCurveTo(
          ...[start[0], end[1] + fy * radius * (dh - 1)],
          ...[start[0] + fx * radius * (1 - dh), end[1]],
          ...[start[0] + fx * radius, end[1]]
        )
        path.lineTo(...end)
        return path
      }

})(window.jQuery, window.Widgets.Panel.Utils, window.d3, document, window)
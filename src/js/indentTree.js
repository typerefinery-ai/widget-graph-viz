// indentTree.js
//define context menu functions
window.Widgets.IndentTree = {}

;(function ($, ns, d3, document, window) {

  ns.options = {};

  ns.indentTree = function (data, tree_svg, options) {

    ns.data = data;
    ns.tree_svg = tree_svg;

    //copy options to ns
    ns.options = Object.assign({}, options);

    console.group('indentTree')
    // WARNING: x and y are switched because the d3.tree is vertical rather than the default horizontal
    ns.theme = {}
    if (ns.options.theme === 'light') {
        ns.theme = ns.options.light_theme
    } else {
        ns.theme = ns.options.dark_theme
    }
    //menu items
    
    // 3. Setup RMB Menu Items
    ns.treeMenuItems = [
      {
      title: 'Copy Object',
      action: (d) => {
          // TODO: add any action you want to perform
          console.log('Tree Copy Object to Unattached', d);
      },
      },
      {
      title: 'Edit Subgraph',
      action: (d) => {
          // TODO: add any action you want to perform
          console.log('Tree Edit Subgraph ->', d);
      },
      },
  ];


    // settings

    ns.plus = {
      shapeFill: ns.theme.checkColour,
      shapeStroke: ns.theme.checkColour,
      textFill: ns.theme.checkText,
      text: '+',
    }
    ns.minus = {
      shapeFill: ns.theme.checkColour,
      shapeStroke: ns.theme.checkColour,
      textFill: ns.theme.checkText,
      text: '−',
    }
    //
    ns.tree = d3.tree().nodeSize([ns.options.lineSpacing, ns.options.indentSpacing])

    ns.root = d3.hierarchy(data)

    ns.root.x0 = 0
    ns.root.y0 = 0
    ns.root.descendants().forEach((d, i) => {
      d.id = i
      d._children = d.children
      if (d.depth && d.data.name.length !== 7) d.children = null
    })

    let index = -1
    ns.root.eachBefore(function (n) {
      ++index
    }) // counts original number of items

    //resonsive size before icons had height =  Math.max(minHeight, index * lineSpacing + marginTop + marginBottom )

    console.log('options.tree_panel_height->', ns.options.tree_panel_height)
    console.log('options.tree_panel_width->', ns.options.tree_panel_width)
    
    ns.svg = tree_svg
    //   .append('rect')
    //   .attr('class', 'index_rect')
    //   .attr('width', window.Widgets.IndentTree.options.width)
    //   .attr('height', window.Widgets.IndentTree.options.height)
    //   .attr('stroke', window.Widgets.IndentTree.theme.svgBorder)
    //   .attr('fill', window.Widgets.IndentTree.theme.treeFill)
    //   .attr('transform', 'translate(' + -window.Widgets.IndentTree.options.margin.left + ',' + -window.Widgets.IndentTree.options.margin.top + ')')

    ns.gLink = ns.svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', ns.theme.edges)
      .attr('stroke-width', ns.options.tree_edge_thickness)

    ns.gNode = ns.svg.append('g').attr('cursor', 'pointer').attr('pointer-events', 'all')

    console.log('root->', ns.root)
    console.log('options->', ns.options)
    console.log('ns.options->', ns.options)
    console.log('tree->', ns.tree)
    console.log('svg->', ns.svg)
    console.log('gNode->', ns.gNode)
    console.log('gLink->', ns.gLink)
    console.log('plus->', ns.plus)
    console.log('minus->', ns.minus)
    console.log('theme->', ns.theme)

    
    ns.update()

    console.groupEnd()
    return ns.svg.node()
  }

  ns.update = function() {
    console.group('update');
    console.log('root->', window.Widgets.IndentTree.root)
    console.log('options->', window.Widgets.IndentTree.options)

    let indexLast = -1
    const nodes = window.Widgets.IndentTree.root.descendants().reverse()
    const links = window.Widgets.IndentTree.root.links()

    // Compute the new tree layout.
    window.Widgets.IndentTree.tree(window.Widgets.IndentTree.root)

    // node position function
    let index = -1
    window.Widgets.IndentTree.root.eachBefore(function (n) {
      n.x = ++index * window.Widgets.IndentTree.options.lineSpacing
      n.y = n.depth * window.Widgets.IndentTree.options.indentSpacing
    })

    const height = Math.max(
      window.Widgets.IndentTree.options.minHeight,
      index * window.Widgets.IndentTree.options.lineSpacing + window.Widgets.IndentTree.options.margin.top + window.Widgets.IndentTree.options.margin.bottom
    )

    console.log('-options.margin.left->', -window.Widgets.IndentTree.options.margin.left)
    console.log('-options.margin.top->', -window.Widgets.IndentTree.options.margin.top)
    console.log('options.tree_panel_width->', window.Widgets.IndentTree.options.tree_panel_width)
    console.log('options.svg_height->', window.Widgets.IndentTree.options.tree_panel_height)

    const transition = ns.svg
      .transition()
      .duration(window.Widgets.IndentTree.options.duration)
      .attr('height', window.Widgets.IndentTree.options.svg_height)
      .attr('viewBox', [
        -window.Widgets.IndentTree.options.margin.left,
        -window.Widgets.IndentTree.options.margin.top,
        window.Widgets.IndentTree.options.tree_panel_width,
        window.Widgets.IndentTree.options.tree_panel_height,
      ])
      .tween('resize', window.ResizeObserver ? null : () => () => window.Widgets.IndentTree.svg.dispatch('toggle'))

    window.Widgets.IndentTree.svg
      .transition()
      .delay(indexLast < index ? 0 : window.Widgets.IndentTree.options.duration) // .delay(indexLast < index ? 0 : options.duration)
      .duration(0)
      .attr('viewBox', [
        -window.Widgets.IndentTree.options.margin.left,
        -window.Widgets.IndentTree.options.margin.top,
        window.Widgets.IndentTree.options.tree_panel_width,
        window.Widgets.IndentTree.options.tree_panel_height,
      ])

    // Update the nodes…
    const node = window.Widgets.IndentTree.gNode.selectAll('g').data(nodes, (d) => d.id)

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${d.y},${window.Widgets.IndentTree.root.x0})`)
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .on('click', (event, d) => {

        console.log('click d->', d)

        d.children = d.children ? null : d._children
        window.Widgets.IndentTree.update()

        charge
          .attr('fill', (d) =>
            d._children ? (d.children ? window.Widgets.IndentTree.minus.textFill : window.Widgets.IndentTree.plus.textFill) : 'none'
          )
          .text((d) => (d._children ? (d.children ? window.Widgets.IndentTree.minus.text : window.Widgets.IndentTree.plus.text) : ''))

        box.attr('fill', (d) =>
          d._children ? (d.children ? window.Widgets.IndentTree.minus.shapeFill : window.Widgets.IndentTree.plus.shapeFill) : 'none'
        )
      })

    // check box
    let box = nodeEnter
      .append('rect')
      .attr('width', window.Widgets.IndentTree.options.boxSize)
      .attr('height', window.Widgets.IndentTree.options.boxSize)
      .attr('x', -window.Widgets.IndentTree.options.boxSize / 2)
      .attr('y', -window.Widgets.IndentTree.options.boxSize / 2)
      .attr('fill', (d) =>
        d._children ? (d.children ? window.Widgets.IndentTree.minus.shapeFill : window.Widgets.IndentTree.plus.shapeFill) : 'none'
      )
      .attr('stroke', (d) => (d._children ? window.Widgets.IndentTree.theme.checkColour : 'none'))
      .attr('stroke-width', 0.5)

    // check box symbol
    let charge = nodeEnter
      .append('text')
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr('fill', (d) => (d._children ? (d.children ? window.Widgets.IndentTree.minus.textFill : window.Widgets.IndentTree.plus.textFill) : 'none'))
      .text((d) => (d._children ? (d.children ? '−' : '+') : ''))

    // attach icon
    let image = nodeEnter
      .append('image')
      .attr('x', 10 + window.Widgets.IndentTree.options.boxSize / 2)
      .attr('y', -window.Widgets.IndentTree.options.icon_size / 2 - window.Widgets.IndentTree.options.boxSize / 2)
      .attr('xlink:href', function (d) {
        console.log('d->', d)
        console.log('prefix->', window.Widgets.IndentTree.options.prefix, ', shape->', window.Widgets.IndentTree.options.shape)
        console.log(window.Widgets.IndentTree.options.prefix + window.Widgets.IndentTree.options.shape + d.data.icon + '.svg')
        return window.Widgets.IndentTree.options.prefix + window.Widgets.IndentTree.options.shape + d.data.icon + '.svg'
      })
      .attr('width', function (d) {
        return window.Widgets.IndentTree.options.icon_size + 5
      })
      .attr('height', function (d) {
        return window.Widgets.IndentTree.options.icon_size + 5
      })
      .on('mouseover.tooltip', window.Widgets.Widget.mouseover)
      .on("mousemove",  window.Widgets.Widget.mousemove)
      .on("mouseout.tooltip",  window.Widgets.Widget.mouseleave)
      .on('contextmenu', (d) => {
        d.preventDefault();
        window.Widgets.ContextMenu.createContextMenu(d, window.Widgets.IndentTree.treeMenuItems, '#tree_svg');
      });

    // label text
    let label = nodeEnter
      .append('text')
      .attr('x', window.Widgets.IndentTree.options.icon_size + 30 + window.Widgets.IndentTree.options.boxSize / 2)
      .attr('text-anchor', 'start')
      .style('font-size', window.Widgets.IndentTree.options.itemFont)
      .attr('dy', '0.32em')
      .text((d) => d.data.name)

    // Transition nodes to their new position.
    const nodeUpdate = node
      .merge(nodeEnter)
      .transition(transition)
      .attr('transform', (d) => `translate(${d.y},${d.x})`)
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1)

    // Transition exiting nodes to the parent's new position.
    const nodeExit = node
      .exit()
      .transition(transition)
      .remove()
      .attr('transform', (d) => `translate(${d.y},${window.Widgets.IndentTree.root.x})`)
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)

    // Update the links…
    const link = window.Widgets.IndentTree.gLink.selectAll('path').data(links, (d) => d.target.id)

    // Enter any new links at the parent's previous position.
    const linkEnter = link
      .enter()
      .append('path')
      .attr('stroke-opacity', 0)
      .attr('d', (d) =>
        ns.makeLink(
          [d.source.y, window.Widgets.IndentTree.root.x],
          [d.target.y + (d.target._children ? 0 : window.Widgets.IndentTree.options.boxSize / 2), window.Widgets.IndentTree.root.x],
          window.Widgets.IndentTree.options.radius
        )
      )

    // Transition links to their new position.
    link
      .merge(linkEnter)
      .transition(transition)
      .attr('stroke-opacity', 1)
      .attr('d', (d) =>
        ns.makeLink(
          [d.source.y, d.source.x],
          [d.target.y + (d.target._children ? 0 : window.Widgets.IndentTree.options.boxSize / 2), d.target.x],
          window.Widgets.IndentTree.options.radius
        )
      )

    // Transition exiting nodes to the parent's new position.
    link
      .exit()
      .transition(transition)
      .remove()
      .attr('stroke-opacity', 0)
      .attr('d', (d) =>
        ns.makeLink(
          [d.source.y, window.Widgets.IndentTree.root.x],
          [d.target.y + (d.target._children ? 0 : window.Widgets.IndentTree.options.boxSize / 2), window.Widgets.IndentTree.root.x],
          window.Widgets.IndentTree.options.radius
        )
      )

    // Stash the old positions for transition.
    window.Widgets.IndentTree.root.eachBefore((d) => {
      d.x0 = d.x
      d.y0 = d.y
    })

    indexLast = index // to know if viewbox is expanding or contracting

    console.groupEnd()
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
})(window.jQuery, window.Widgets.IndentTree, window.d3, document, window)

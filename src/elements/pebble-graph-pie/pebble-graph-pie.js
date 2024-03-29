/**
`<pebble-graph-pie>` Represents an element that displays a pie chart.

### Example

    <template is="dom-bind">
	  </template>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------

@group pebble Elements
@element pebble-graph-pie
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-button/paper-button.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
//import '../bedrock-externalref-d3js/bedrock-externalref-d3js.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-button/pebble-button.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleGraphPie extends mixinBehaviors([RUFBehaviors.UIBehavior], PolymerElement) {
  static get template() {
    return html`
    <style include="bedrock-style-common">
      :host {
        display: block;
      }

      text {
        fill: var(--palette-white, #ffffff);
      }

      svg {
        float: right;
        margin: -5% -3% 0 0;
      }

      .legend {
        font-size: var(--font-size-sm, 12px);
      }

      rect {
        stroke-width: 2;
      }
    </style>
    <pebble-button hidden\$="{{showReset}}" id="pie-button" on-tap="_handleTap" button-text="Reset Pie" raised=""></pebble-button>
    <svg id="svg"></svg>
`;
  }

  static get is() {
    return "pebble-graph-pie";
  }

  static get properties() {
    return {
      data: {
        type: Array,
        value: [],
        observer: "_onDataChanged"
      },

      showReset: {
        type: Boolean,
        value: true
      },

      showLegend: {
        type: Boolean,
        value: true
      },

      g: {
        type: Array,
        value: function () {
          return [];
        }
      },

      selectedItems: {
        type: Array,
        value: function () {
          return [];
        }
      }
    };
  }

  _drawChart() {
    let legendRectSize = 18;
    let legendSpacing = 4;
    let me = this;
    let width = 200,
      height = 135,
      radius = Math.min(width, height) / 2.5;
    this.selectedItems = [];

    //clears any previous svg data for chart redraw
    this.$.svg.innerHTML = '';

    //sets color pallet for pie slices
    let color = d3.scale.ordinal().range(["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c",
      "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"
    ]);

    //defines circle radius for the pie
    let arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    //defines the pie
    let pie = d3.layout.pie()
      .sort(function (d) {
        return null;
      })
      .value(function (d) {
        return d.value;
      });

    //creates the svg and appends segments
    let svg = d3.select(this.$.svg)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("class", "g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    //selects the data values for pie
    this.data.forEach(function (d) {
      d.value = +d.value;
    });

    //pushes data values to pie slices
    let g = svg.selectAll("g.arc")
      .data(pie(this.data))
      .enter()
      .append("g")
      .attr("class", "arc");

    //creates path and assigns color values
    g.append("path")
      .attr("d", arc)
      .style("fill", function (d) {
        return (d.data.color ? d.data.color : color(d.data.key));
      })

    this.g = g;

    //creates legend
    let legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function (d, i) {
        let height = legendRectSize + legendSpacing;
        let offset = height * color.domain().length / 2;
        let horz = 15 * legendRectSize;
        let vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
      });

    //styles legend
    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', color)
      .style('stroke', color)

    //appends key values to legend
    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function (d) {
        return d;
      });

    //creates click function for legend explode animation interacton with pie chart
    legend.on("click", function (d, index) {
      let g = g[0][index];
      d = d3.select(g[0][index]).datum();
      d3.select(g)
        .transition()
        .duration(400)
        .attr("transform", function (d) {
          if (!d.data._expanded) {
            d.data._expanded = true;
            //click handler - appends data to this.selectedItems var
            me._fireSelectionEvent(d);
            let a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
            let x = Math.cos(a) * 20;
            let y = Math.sin(a) * 20;
            return 'translate(' + x + ',' + y + ')';
          } else {
            d.data._expanded = false;
            //click handler - removes data from this.selectedItems var
            me._fireSelectionEvent2(d);
            return 'translate(0,0)';
          }
        });
    });

    //styles and positions values within pie slices
    g.filter(function (d) {
      return d.endAngle - d.startAngle > .2;
    }).append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("transform", function (d) {
        d.outerRadius = radius;
        d.innerRadius = radius / 2;
        return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) / 1000 + ")";
      })
      .style("fill", "White")
      .style("font", "bold 12px Arial")
      .style("stroke", "none")
      .text(function (d) {
        return d.data.value + ((d.data.unit) ? d.data.unit : "");
      });

    function angle(d) {
      let a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
      return a > 90 ? a - 180 : a;
    }
    //**Single-select for pie slices**      
    //creates click function for pie chart explode animation
    g.on("click", function (d) {
      if (d3.select(this).datum().data.clickable) {
        let slices = me.g[0];
        for (let i = 0; i < slices.length; i++) {
          let slice = slices[i];
          let di = d3.select(slice).datum();
          d3.select(slice)
            .transition()
            .duration(400)
            .attr("transform", function (di) {
              if (!di.data._expanded) {
                di.data._expanded = false;
                //click handler - removes data from this.selectedItems var
                me._fireSelectionEvent2(d);
                return 'translate(0,0)';
              } else {
                di.data._expanded = false;
                return 'translate(0,0)';
              }
            })
            //click handler - adds stroke every click
            .style("stroke", function (di) {
              if (!di.data._stroked) {
                di.data._stroked = true;
                return "none";
              }
            })
        }

        //click handler - controls individual pie slice attributes      
        d3.select(this)
          .transition()
          .duration(400)
          //click handler - adds stroke every click
          .style("stroke", function (d) {
            if (d.data._stroked) {
              d.data._stroked = true
              return "black";
            } else {
              d.data._stroked = false;
              return "none";
            }
          })
          .attr("transform", function (d) {
            if (!d.data._expanded) {
              d3.select(this)
              d.data._expanded = true;
              //click handler - appends data to this.selectedItems var
              me._fireSelectionEvent(d);
              let a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
              let x = Math.cos(a) * 5;
              let y = Math.sin(a) * 5;
              return 'translate(' + x + ',' + y + ')';
            } else {
              d.data._expanded = false;
              //click handler - removes data from this.selectedItems var
              me._fireSelectionEvent2(d);
              return 'translate(0,0)';
            }
          })
      }
    });

    //selects the data values for pie
    this.data.forEach(function (d, index) {
      if (d.selected) {
        me._showDefault(me, d, index);
      }
    });

    /*    
      //**Multi-select for pie slices**      
      //creates click function for pie chart explode animation
      g.on("click", function (d) {
            d3.select(this)
            .transition()
            .duration(400)
            .style("stroke",function(d){
                if (!d.data._stroked){
                    d.data._stroked = true
                    return "black";
                } else {
                    d.data._stroked = false;
                    return "none";
                }      
                })
            .attr("transform",function(d){
                if (!d.data._expanded){
                    d.data._expanded = true;
                    //click handler - appends data to this.selectedItems var
                    me._fireSelectionEvent(d);
                    var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
                    var x = Math.cos(a) * 5;
                    var y = Math.sin(a) * 5;
                    return 'translate(' + x + ',' + y + ')';                
                } else {
                    d.data._expanded = false;
                    //click handler - removes data from this.selectedItems var
                    me._fireSelectionEvent2(d);
                    return 'translate(0,0)';                
                }      
                })
            d3.selectAll("text")
            .style("stroke",function(){
                if (!d.data._strokedText){
                    d.data._strokedText = true
                    return "none";
                } else {
                    d.data._strokedText = false;
                    return "none";
                }      
                })
      });
    */
  }

  _showDefault(me, d, index) {
    let g = me.g[0][index];

    d3.select(g).style("stroke", function (d) {
      if (!d.data._stroked) {
        d.data._stroked = true;
        return "none";
      }
    })

    d3.select(g)
      .transition()
      .duration(400)
      .style("stroke", function (d) {
        if (d.data._stroked) {
          d.data._stroked = true
          return "black";
        } else {
          d.data._stroked = false;
          return "none";
        }
      })
      .attr("transform", function (d) {
        if (!d.data._expanded) {
          d.data._expanded = true;
          //click handler - appends data to this.selectedItems var
          let a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
          let x = Math.cos(a) * 5;
          let y = Math.sin(a) * 5;
          return 'translate(' + x + ',' + y + ')';
        } else {
          d.data._expanded = false;
          //click handler - removes data from this.selectedItems var
          return 'translate(0,0)';
        }
      });
  }

  _handleTap(d) {
    d3.selectAll('.arc')
      .transition()
      .duration(400)
      .attr("transform", 'translate(0,0)');
    //this.svg.reload();
  }

  _fireSelectionEvent(d) {
    //console.log('firing tap event with data ', JSON.stringify(d));
    this.fireBedrockEvent('selection-changed', d, {
      bubbles: true
    });
    this.selectedItems.push(d.data);
    //console.log('dynamic array includes ', JSON.stringify(this.selectedItems));
  }

  _fireSelectionEvent2(d) {
    //console.log('firing tap event with data ', JSON.stringify(d));
    this.selectedItems.splice(d.data, 1);
    //console.log('dynamic array includes ', JSON.stringify(this.selectedItems));
  }

  _onDataChanged() {
    if (this.data && this.data.length > 0) {
      this._handleTap();
      this._drawChart();
    }
  }
}
customElements.define(PebbleGraphPie.is, PebbleGraphPie);

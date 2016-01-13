'use strict';

(function() {

  var Media = function() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioElement = document.getElementById('audioElement');
    this.audioSrc = this.audioCtx.createMediaElementSource(this.audioElement);
    this.analyser = this.audioCtx.createAnalyser();

    // bind our analyser to the media element source.
    this.audioSrc.connect(this.analyser);
    this.audioSrc.connect(this.audioCtx.destination);

    // var frequencyData = new Uint8Array(analyser.frequencyBinCount);
    this.frequencyData = new Uint8Array(200);
  }

  /* Circles d3 class */
  var Circles = function(element, props, state) {
    this.element = element;
    this.props = props;
    this.state = state;
    this.media = new Media();
  }

  /* Chart init */
  Circles.prototype.init = function() {
    this.svg = d3.select(this.element).append('svg')
      .attr('class', 'd3')
      .attr('width', this.props.width)
      .attr('height', this.props.height);

    this.svg.append('g')
      .attr('class', 'd3-points');

    this.update();
  }

  /* Scale the data */
  Circles.prototype._scales = function() {
    if (!this.state.domain) {
      return null;
    }

    var width = this.element.offsetWidth;
    var height = this.element.offsetHeight;

    var x = d3.scale.linear()
      .range([0, width])
      .domain(this.state.domain.x);

    var y = d3.scale.linear()
      .range([height, 0])
      .domain(this.state.domain.y);

    var z = d3.scale.linear()
      .range([5, 20])
      .domain([1, 10]);

    return {x: x, y: y, z: z};
  }

  /* Update the data */
  Circles.prototype.update = function() {
    var scales = this._scales();
    this._drawPoints(scales);
    this._drawBarChart();
  }

  /* Draw the data */
  Circles.prototype._drawPoints = function(scales) {
    var g = d3.select(this.element).selectAll('.d3-points');

    var color = d3.scale.category20();

    var point = g.selectAll('.d3-point')
      .data(this.state.data, function(d) { return d.id; });

    point.enter().append('circle')
      .attr('class', 'd3-point')
      .style('fill', function(d,i) { return color(i); });

    point.attr('cx', function(d) { return scales.x(d.x); })
      .attr('cy', function(d) { return scales.y(d.y); })
      .attr('r', function(d) { return scales.z(d.z); });

    point.exit().remove();
  };

  Circles.prototype._drawBarChart = function() {
    var barPadding = '1';

    var _this = this;

    // Create our initial D3 chart.
    this.svg.selectAll('rect')
       .data(this.media.frequencyData)
       .enter()
       .append('rect')
       .attr('x', function (d, i) {
          return i * ('1600' / _this.media.frequencyData.length);
       })
       .attr('width', '1600' / _this.media.frequencyData.length - barPadding);
    
    this._renderMusic();
  }

  Circles.prototype._renderMusic = function() {
    requestAnimationFrame(this._renderMusic.bind(this));

    this.media.analyser.getByteFrequencyData(
      this.media.frequencyData
    );

    var color = d3.scale.category20();

    var _this = this;
    // Update d3 chart with new data.
    this.svg.selectAll('rect')
      .data(this.media.frequencyData)
      .attr('y', function(d) {
         return '700' - d;
      })
      .attr('height', function(d) {
         return d;
      })
      .attr('fill', function(d,i) { return color(i); });
  }

  /* Main Container */
  var App = React.createClass({

    getInitialState: function() {
      return {
        data: [
          { id: '1', x: 3, y: 30, z: 4 },
          { id: '2', x: 6, y: 32, z: 6 },
          { id: '3', x: 9, y: 35, z: 4 },
          { id: '4', x: 11, y: 38, z: 9 },
          { id: '5', x: 14, y: 41, z: 2 },
          { id: '6', x: 16, y: 35, z: 11 },
          { id: '7', x: 19, y: 38, z: 7 },
          { id: '8', x: 21, y: 47, z: 9 },
          { id: '9', x: 23, y: 41, z: 7 },
          { id: '10', x: 25, y: 30, z: 4 },
        ],
        domain: {
          x: [0, 30], 
          y: [0, 60]
        }
      };
    },

    render: function() {
      return React.createElement('div', null, [
        React.createElement('h1', { key: 'header' }, 'd3-react'),
        React.createElement(CirclesComponent, { 
          key: 'chart-component',
          data: this.state.data,
          domain: this.state.domain
        })
      ]);
    }
  });

  /* Circles Component */
  var CirclesComponent = React.createClass({

    circles: {},

    componentDidMount: function() {
      var element = ReactDOM.findDOMNode(this);
      this.circles = new Circles(
        element, 
        {
          width: '1600px',
          height: '900px'
        },
        {
          data: this.props.data,
          domain: this.props.domain
        }
      );

      this.circles.init();
    },

    componentWillUnmount: function() {
      this.circles = null;
    },

    render: function() {
      return (
        React.createElement('div', { className: 'chart-component' })
      );
    }
  });

  /* Bootstrap */
  ReactDOM.render(
    React.createElement(App),
    document.getElementById('root')
  );
})();
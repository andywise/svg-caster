var
  Promise = require('bluebird'),
  log4js = require('log4js'),
  SvgFont = require('./SvgFont'),
  Svg = require('./Svg'),
  SvgSet = require('./SvgSet')
  ;


module.exports = Application;

function Application(options) {
  this._options = options || {};
  this._collection = [];

  this._logger = log4js.getLogger();
}

Application.prototype = {

  run: function() {
    var
      self = this,
      logger = this._logger,
      serial = Promise.resolve(),
      options = this._options;

    if (options.svgFont) {
      serial = serial.then(function() {
        return self.loadFont(options);
      });
    }
    if (options.svg) {
      serial = serial.then(function() {
        return self.loadSvg(options);
      });
    }
    if (options.svgSet) {
      serial = serial.then(function() {
        return self.loadSvgSet(options);
      });
    }
    if (options.outSvg) {
      serial = serial.then(function() {
        return self.saveSvg(options);
      });
    }
    if (options.outSvgSet) {
      serial = serial.then(function() {
        return self.saveSvgSet(options);
      });
    }

    serial.then(
      function() {
        logger.info('done');
      },
      function(error) {
        logger.error(error);
      }
    );

    return serial;
  },

  _appendCollection: function(collection) {
    if (!Array.isArray(collection)) {
      return;
    }
    Array.prototype.push.apply(this._collection, collection);
  },

  loadFont: function(options) {
    var
      self = this,
      font = new SvgFont(this._options);

    return font.load(options)
      .then(function() {
        self._appendCollection(font.getCollection());
      });
  },

  loadSvg: function(options) {
    var
      self = this,
      svg = new Svg(this._options);

    return svg.load(options)
      .then(function() {
        self._appendCollection(svg.getCollection());
      });
  },

  loadSvgSet: function(options) {
    var
      self = this,
      svgSet = new SvgSet(this._options);

    return svgSet.load(options)
      .then(function() {
        self._appendCollection(svgSet.getCollection());
      });
  },

  saveSvg: function(options) {
    var
      svg = new Svg(this._options);

    svg.setCollection(this._collection);
    return svg.save(options);
  },

  saveSvgSet: function(options) {
    var
      svgSet = new SvgSet(this._options);

    svgSet.setCollection(this._collection);
    return svgSet.save(options);
  }

};
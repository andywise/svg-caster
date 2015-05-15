var
  fs = require('fs'),
  Promise = require('bluebird'),
  globby = require('globby'),
  pathLib = require('path'),
  cheerio = require('cheerio')
  ;

module.exports = SvgSet;

function SvgSet(options) {
  this._options = options || {};
  this._collection = [];
}


SvgSet.prototype = {

  load: function(options) {
    var
      self = this,
      promise,
      pattern;

    options = options || {};
    pattern = options.svgSet || '';

    promise = Promise.fromNode(function(callback) {
      globby(pattern, { nodir: true }, callback);
    })
      .each(function(fileName) {
        return Promise.fromNode(function(callback) {
          fs.readFile(fileName, { encoding: 'utf8' }, callback);
        })
          .then(function(content) {
            return self._parseSvgSet(content, options);
          });
      })
    ;

    return promise;
  },

  save: function(options) {
    var
      promise,
      path;

    options = options || {};
    path = options.outSvgSet || '';

    promise = Promise.resolve(this._buildSvgSet(options))
      .then(function(svg) {
        var
          fileName = pathLib.join(
            pathLib.dirname(path),
            pathLib.basename(path, pathLib.extname(path))
          ) + '.svg'
          ;
        return Promise.fromNode(function(callback) {
          fs.writeFile(fileName, svg, { encoding: 'utf8' }, callback);
        })
      });

    return promise;
  },

  getCollection: function() {
    return this._collection;
  },

  setCollection: function(collection) {
    if (!Array.isArray(collection)) {
      return;
    }
    this._collection.length = 0;
    Array.prototype.push.apply(this._collection, collection);
  },

  _parseSvgSet: function(content, options) {
    var
      collection = this._collection,
      svgSetDoc,
      viewBox,
      svg
    ;

    svgSetDoc = cheerio.load(content, {
      xmlMode: true,
      decodeEntities: true,
      normalizeWhitespace: true
    });

    svg = svgSetDoc('svg').first();
    viewBox = svg.attr('viewBox');

    function normalizeSvgElement(element) {
      var
        node,
        svgElement,
        attributes,
        defaultAttributes,
        width,
        height;

      [
        'id',
        'x',
        'y'
      ].forEach(function(attr) {
          element.removeAttr(attr);
        });

      node = element.get(0);
      if (node.tagName != 'svg') {
        if (node.tagName == 'symbol') {
          svgElement = svgSetDoc('<svg xmlns="http://www.w3.org/2000/svg">');
          attributes = node.attribs;
          Object.keys(attributes).forEach(function(name) {
            svgElement.attr(name, attributes[name]);
          });
          element = svgElement.append(element.children());
        }
        else {
          element = svgSetDoc('<svg xmlns="http://www.w3.org/2000/svg">').append(element);
        }
      }

      defaultAttributes = {
        xmlns: 'http://www.w3.org/2000/svg'
      };

      Object.keys(defaultAttributes)
        .forEach(function(name) {
          if (!element.attr(name)) {
            element.attr(name, defaultAttributes[name]);
          }
        });

      if (!element.attr('viewBox')) {
        if (viewBox) {
          element.attr('viewBox', viewBox);
        }
        else {
          width = node.attr('width');
          height = node.attr('height');
          if (typeof width != 'undefined' && typeof height != 'undefined') {
            element.attr('viewBox', '0 0 ' + parseFloat(width) + ' ' + parseFloat(height));
          }
        }
      }

      return element;
    }

    svg.find('[id]').each(function(index, element) {
      var
        name;
      element = svgSetDoc(element);
      name = element.attr('id');
      element = normalizeSvgElement(element);

      collection.push({
        name: name,
        svg: svgSetDoc.html(element)
      });
    });

  },


  _buildSvgSet: function(options) {
    const
      PRETTY_SIZE = 24;
    var
      svgSetDoc,
      root,
      shorty,
      pretty,
      prettyY,
      attributes;

    options = options || {};
    shorty = options.shorty;
    pretty = options.pretty;

    svgSetDoc = cheerio.load('<svg xmlns="http://www.w3.org/2000/svg">');
    root = svgSetDoc('svg')
      .first();

    if (pretty) {
      root.attr('width', PRETTY_SIZE);
    }
    prettyY = 0;

    this._collection.forEach(function(entity) {
      var
        parts,
        height,
        svgDoc,
        svgElement;

      svgDoc = cheerio.load(entity.svg, {
        xmlMode: true,
        decodeEntities: true,
        normalizeWhitespace: true
      });
      svgElement = svgDoc('svg')
        .first()
        .attr('id', entity.name);

      if (shorty) {
        attributes = svgElement.get(0).attribs;
        Object.keys(attributes)
          .filter(function(name) {
            return ['viewBox', 'id'].indexOf(name) == -1
          })
          .forEach(function(name) {
            svgElement.removeAttr(name);
          });
      }
      if (pretty) {
        parts = (svgElement.attr('viewBox') || '').split(/\s+/);
        svgElement.attr('width', PRETTY_SIZE);
        height = Math.ceil(PRETTY_SIZE * parseFloat(parts[3]) / parseFloat(parts[2]));
        svgElement.attr('height', height);
        svgElement.attr('y', prettyY);
        prettyY = Math.ceil(prettyY + height);
      }

      root.append(svgElement);
    });

    if (pretty) {
      root.attr('height', prettyY);
      root.attr('viewBox', '0 0 ' + PRETTY_SIZE + ' ' + prettyY)
    }

    return svgSetDoc.html();
  }

};
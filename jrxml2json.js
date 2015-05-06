(function (root, factory) {
  //'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      factory(exports, DOMParser);
    });
  } else if (typeof exports !== 'undefined') {
    var DOMParser = require('xmldom').DOMParser;
    factory(exports, DOMParser);
  } else {
    factory((root.jrxml2json = {}), DOMParser);
  }
}(this, function (exports, DOMParser) {
  //'use strict';

  var elementNameMap = {
    style: 'styles',
    parameter: 'parameters',
    field: 'fields',
    variable: 'variables',
    group: 'groups'
  };

  var attributeNameMap = {
    class: 'type'
  };

  var typeMap = {
    'java.lang.Boolean': 'Boolean',
    'java.lang.String': 'String',
    'java.lang.Double': 'Number',
    'java.lang.Integer': 'Number',
    'java.lang.Short': 'Number',
    'java.lang.Float': 'Number',
    'java.lang.Long': 'Number',
    'java.math.BigDecimal': 'Number',
    'java.sql.Date': 'Date',
    'java.sql.Time': 'Date',
    'java.util.Date': 'Date',
    'java.sql.Timestamp': 'Date',
    'java.net.URI': 'String',
    'java.awt.Image': 'String'
  };

  var textElements = [
    'queryString', 
    'variableExpression', 
    'groupExpression', 
    'text', 
    'textFieldExpression', 
    'imageExpression', 
    'printWhenExpression'
  ];

  var bandElements = [
    'groupHeader',
    'groupFooter',
    'title',
    'pageHeader',
    'columnHeader',
    'detail',
    'columnFooter',
    'pageFooter',
    'summary'
  ];

  function renameElements(str) {
    if (Object.keys(elementNameMap).indexOf(str) >  -1) {
      str = elementNameMap[str];
    }
    return str;
  }

  function renameAttributes(str) {
    if (Object.keys(attributeNameMap).indexOf(str) >  -1) {
      str = attributeNameMap[str];
    }
    return str;
  }

  function renameBooleanAttributes(str) {
    if (str.substring(0,2) === 'is') {
      str = str.substring(3,2).toLowerCase() + str.substring(3);
    }
    return str;
  }

  function formatNumbers(str) {
    if (!isNaN(str)) {
      str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
    }
    return str;
  }

  function formatBooleans(str) {
    if (str.toLowerCase() == 'true') {
      str = true;
    } else if (str.toLowerCase() == 'false') {
      str = false;
    }
    return str;
  }

  function renameTypes(str) {
    if (Object.keys(typeMap).indexOf(str) >  -1) {
      str = typeMap[str];
    }
    return str;
  }

  var formatters = {
    elementName: [
      renameElements
    ],
    attributeName: [
      renameAttributes,
      renameBooleanAttributes
    ],
    value: [
      renameTypes,
      formatBooleans,
      formatNumbers
    ]
  };

  function format(value, type) {
    for (var i = 0; i < formatters[type].length; i++) {
      if (typeof value === 'string') {
        value = formatters[type][i](value);
      }
    }
    return value;
  }

  function formatAttributes(node, obj) {
    if (node.hasAttributes()) {
      for (var j = 0; j < node.attributes.length; j++) {
        var attribute = node.attributes.item(j);
        obj[format(attribute.nodeName, 'attributeName')] = 
          format(attribute.nodeValue, 'value');
      }
    }
    return obj;
  }

  function formatBandElement(item) {
    var obj = {}, band = item.getElementsByTagName('band')[0];
    obj['height'] = band.getAttribute('height');
    if (band.hasChildNodes()) {
      obj.elements = [];
      for (var i = 0; i < band.childNodes.length; i++) {
        var item = band.childNodes.item(i);
        if (item.nodeType == 1) {
          var element = {};
          element['type'] = item.nodeName;
          for (var j = 0; j < item.childNodes.length; j++) {
            var elem = item.childNodes.item(j);
            //console.log('bandElem: ' + elem);
            //if (item.nodeType == 1) {
            //  formatAttributes(elem, element);
            //} 
          }
          obj.elements.push(element);
        }
      }
    }
    return obj;
  }

  function xml2obj(xml) {
    var obj = {};
    if (xml.nodeType == 1) {
      formatAttributes(xml, obj);
      if (textElements.indexOf(xml.nodeName) > -1) {
        obj = xml.firstChild.nodeValue;
      }
    } else if (xml.nodeType == 3) {
      //obj = xml.nodeValue;
      return;
    }

    if (xml.hasChildNodes()) {
      for (var i = 0; i < xml.childNodes.length; i++) {
        var item = xml.childNodes.item(i);
        var nodeName = format(item.nodeName, 'elementName');
        if (typeof(obj[nodeName]) == "undefined") {
          if (xml.nodeType == 1) {
            if (bandElements.indexOf(nodeName) > -1) {
              console.log(nodeName);
              obj[nodeName] = formatBandElement(item);
            } else {
              obj[nodeName] = xml2obj(item);
            }
          } else {
            obj = xml2obj(item);
          }
        } else {
          if (typeof(obj[nodeName].push) == "undefined") {
            var old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xml2obj(item));
        }
      }
    }
    return obj;
  }

  function convert(data, options) {
    var xml = new DOMParser().parseFromString(data, 'text/xml');
    return xml2obj(xml);
  }

  exports.version = '0.0.0';

  exports.convert = convert;

}));

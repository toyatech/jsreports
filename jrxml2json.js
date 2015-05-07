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

  var nodeTypeMap = [
    'element',
    'attribute',
    'text',
    'cdata_section',
    'entity_reference',
    'entity',
    'processing_instruction',
    'comment',
    'document',
    'document_type',
    'document_fragment',
    'notation'
  ];

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

  var collapseNodes = [
    'jasperReport', '#cdata-section'
  ];
 
  var mergeNodes = [
    'reportElement', 'graphicElement', 'textElement'
  ];

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

  function hasTextOrCDATASection(node) {
    if (node.hasChildNodes()) {
      var nodeType = node.firstChild.nodeType;
      return nodeType == 3 || nodeType == 4;
    }
  }

  function hasOwnProperties(obj) {
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        return true;
      }
    }
    return false;
  }

  function mergeProperties(obj1, obj2) {
    var obj3 = {};
    for (var k in obj1) { obj3[k] = obj1[k]; }
    for (var k in obj2) { obj3[k] = obj2[k]; }
    return obj3;
  }

  function processChildNodes(node, obj) {
    if (node.hasChildNodes()) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var item = node.childNodes.item(i);
        var nodeName = format(item.nodeName, 'elementName');
        if (collapseNodes.indexOf(nodeName) > -1) {
          obj = process(item, {});
        } else if (mergeNodes.indexOf(nodeName) > -1) {
            obj = mergeProperties(obj, process(item, {}));
        } else if (bandElements.indexOf(nodeName) > -1) {
          var tmp = {}, band = item.getElementsByTagName('band')[0];
          tmp['height'] = band.getAttribute('height');
          if (band.hasChildNodes()) {
            tmp.elements = [];
            for (var j = 0; j < band.childNodes.length; j++) {
              var element = band.childNodes.item(j);
              if (element.nodeType == 1) {
                if (element.hasChildNodes()) {
                for (var k = 0; j < element.childNodes.length; k++)
                  var elementDetail = element.childNodes.item(k);
                  if (elementDetail.nodeType == 1) {
                    //tmp.elements.push(mergeProperties({type: element.nodeName}, process(elementDetail)));
                  }
                }
              }
            }
          }
          obj[nodeName] = tmp; 
        } else {
          if (typeof(obj[nodeName]) == "undefined") {
            obj[nodeName] = process(item, {});
          } else {
            if (typeof(obj[nodeName].push) == "undefined") {
              var old = obj[nodeName];
              obj[nodeName] = [];
              obj[nodeName].push(old);
            }
            obj[nodeName].push(process(item, {}));
          }
        } 
      }
    }
    return obj;
  }

  function processElement(node, obj) {
    if (node.hasAttributes()) {
      for (var i = 0; i < node.attributes.length; i++) {
        process(node.attributes.item(i), obj);
      }
    }
    if (hasTextOrCDATASection(node)) {
      process(node.firstChild, obj);
    }
    return obj;
  }

  function processText(node, obj) {
    if (node.nodeValue.trim()) {
      return node.nodeValue.trim();
    } else {
      return;
    }
  }

  function processCDATASection(node, obj) {
    if (node.nodeValue.trim()) {
      return node.nodeValue.trim();
    } else {
      return;
    }
  }

  function processAttribute(node, obj) {
    obj[format(node.nodeName, 'attributeName')] =
      format(node.nodeValue, 'value');
    return obj;
  }
  
  function skip() { return; }

  var processors = {
    element: [
      processElement,
      processChildNodes
    ],
    attribute: [
      processAttribute
    ],
    text:[
      processText
    ], 
    cdata_section: [
      processCDATASection
    ], 
    entity_reference: [skip], 
    entity: [skip], 
    processing_instruction: [skip],
    comment: [skip],
    document: [
      processChildNodes
    ],
    document_type: [skip],
    document_fragment: [skip],
    notation: [skip]
  };

  function process(node, obj) {
    var nodeType = nodeTypeMap[node.nodeType - 1]; 
    for (var i = 0; i < processors[nodeType].length; i++) {
      obj = processors[nodeType][i](node, obj);
    }
    return obj;
  }

  function convert(data, options) {
    var node = new DOMParser().parseFromString(data, 'text/xml');
    return process(node, {});
  }

  exports.version = '0.0.0';

  exports.convert = convert;

}));

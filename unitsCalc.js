/**
    UnitsCalc v0.1.0 By Zoli Issam (jawbfl@gmail.com)


    Conventions :

    - em  1em is equal to the current font size.
    - 1ex is the x-height of a font (x-height is usually about half the font-size)
    - 1in is now always 96px
    - 3pt is now always 4px
    - 25.4mm is now always 96px
    - 1 pc is the same as 12pt
    - 1vw is 1% of the viewport width
    - 1vh is 1% of the viewport height
    - 1vmin is the smallest of 1vw and 1vh
    - 1vmax is the larger of 1vw and 1vh
*/

(function (window, document, undefined) {

    var T_NUMBER   = 1;
    var T_OPERATOR = 2;
    var T_POPEN    = 3;
    var T_PCLOSE   = 4;

    var unitsCalc = {

        tree: [],

        init: function() {
            var styleElements = document.getElementsByTagName("style");
            for(var i = 0; i < styleElements.length; ++i) {
                this.tree.push({});
                this.match(styleElements[i]);
            }
            this.apply();
        },

        match: function(style) {
            var cssText = style.innerText;
            var re = /calc\((.*)\);/g;

            while ((result = re.exec(cssText)) !== null) {
                this.build(result);
            }

        },

        build: function(result) {
            var position  = this.position(result);
            var parseTree = this.parse(result[1]);
            var parent    = this.tree[this.tree.length-1];

            if(!parent[position.selector]) parent[position.selector] = [];

            parent[position.selector].push({
                property: position.property,
                parseTree: parseTree
            });

        },

        position: function(result) {
            var text = result.input;
            var index = result.index;
            
            while(text[index-1] != ';' && text[index-1] != '{') {
                index--;
            }
            var property = text.substr(index).trim().split(':')[0];
            
            while(text[index-1] != '}' && index-1 > 0) {
                index--;
            }
            var selector = text.substr(index).trim().split('{')[0].trim();
            
            return {
                selector: selector,
                property: property
            };

        },

        parse: function(expr) {
            var re = /(?:\(|\)|(?:([0-9]+(?:\.[0-9]+)?)(%|in|cm|mm|em|ex|pt|pc|px|rem|vw|vh|vmin))|(?:\+|-|\*|\/))/ig;
            var parseTree = [];
            while ((res = re.exec(expr)) !== null) {
                res.unshift(this.tokenType(res[0]));
                parseTree.push(res);
            }
            return parseTree;
        },

        tokenType: function(token) {
            var number = /([0-9]+(\.[0-9]+)?)(%|in|cm|mm|em|ex|pt|pc|px|rem|vw|vh|vmin)/ig;
            var operator = /\+|-|\*|\//ig;
            if(token == '(') return T_POPEN;
            if(token == ')') return T_PCLOSE;
            if(operator.test(token)) return T_OPERATOR;
            if(number.test(token)) return T_NUMBER;
        },

        apply: function() {

            for (style in this.tree) {
                for (selector in this.tree[style]) {
                    for (property in this.tree[style][selector]) {

                        var object = this.tree[style][selector][property];
                        var elements = document.querySelectorAll(selector);

                        for (var i=0; i < elements.length; ++i) {
                            var jsName = this.propertyName(object.property);
                            var valueInPx = this.evaluate(elements[i], object.property, object.parseTree);
                            elements[i].style[jsName] = valueInPx;
                        }
                    }
                }
            }
        },

        propertyName: function(cssName) {
            return cssName.replace( /-(\w)/g, function _replace($1, $2) {
                return $2.toUpperCase();
            });
        },


        evaluate: function(element, property, parseTree) {
            var parent = element.parentNode;
            var body = document.querySelector('body');

            var units = {

                percent: parseInt(window.getComputedStyle(parent, null)[property].replace('px',''))/100.0,

                inch: 96,

                mm: 96/25.4,
                cm: 100*this.mm,

                em: parseInt(window.getComputedStyle(element, null)['font-size'].replace('px','')),
                ex: this.em/2.0,
                rem: parseInt(window.getComputedStyle(body, null)['font-size'].replace('px','')),

                pt: 4.0/3.0,
                pc: 12*this.pt,

                vw: document.documentElement.clientWidth/100.0,
                vh: document.documentElement.clientHeight/100.0,
                vmin: Math.min(this.vw, this.vh),
                vmax: Math.max(this.vw, this.vh)
            };

            var value = '';
            
            for(var i=0; i < parseTree.length; ++i) {
                if (parseTree[i][0] == T_NUMBER) {
                    value += this.anyToPx(parseInt(parseTree[i][2]), parseTree[i][3], units);
                }
                else {
                    value += parseTree[i][1];
                }
            }

            return eval(value);
            
        },

        anyToPx: function(value, unit, units) {
            if(unit == 'px')
                return value;

            else if(unit == '%')
                return value*units.percent;

            else if(unit == 'em')
                return value*units.em;
            else if(unit == 'ex')
                return value*units.ex;
            else if(unit == 'rem')
                return value*units.rem;

            else if(unit == 'in')
                return value*units.inch;

            else if(unit == 'pt')
                return value*units.pt;
            else if(unit == 'pc')
                return value*units.pc;

            else if(unit == 'mm')
                return value*units.mm;
            else if(unit == 'cm')
                return value*units.cm;

            else if(unit == 'vw')
                return value*units.vw;
            else if(unit == 'vh')
                return value*units.vh;
            else if(unit == 'vmin')
                return value*units.vmin;
            else if(unit == 'vmax')
                return value*units.vmax;
        }
    };

    window.unitsCalc = unitsCalc;

})(this, window.document);
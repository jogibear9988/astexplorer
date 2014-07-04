/**@jsx React.DOM */
/*jshint browser:true, newcap:false, expr:true*/
/*global CodeMirror */
"use strict";
var fs = require('fs');
var isEqual = require('lodash.isEqual');
var debounce = require('lodash.debounce');


var initialCode = fs.readFileSync(__dirname + '/codeExample.txt', 'utf8');

var Editor = React.createClass({
  getDefaultProps: function() {
    return {
      value: initialCode
    };
  },

  componentWillReceiveProps: function(nextProps) {
    /*
    var value = this.codeMirror.getValue();
    if (nextProps.value !== value) {
      this.codeMirror.setValue(nextProps.value);
    }
    */
  },

  shouldComponentUpdate: function() {
    return false;
  },

  componentDidMount: function() {
    global.cm = this.codeMirror = CodeMirror(
      this.refs.container.getDOMNode(),
      {
        value: this.props.value,
        lineNumbers: true
      }
    );

    if (this.props.onContentChange) {
      this.codeMirror.on('change', this.onContentChange);
      this.onContentChange();
    }
    this.codeMirror.on('keyup', function(cm, event) {
      event.stopPropagation();
    });

    this.codeMirror.on('focus', function(cm, event) {
      this.mark && this.mark.clear();
    }.bind(this));

    this.codeMirror.on('cursorActivity', debounce(function(cm) {
       this.props.onActivity && this.props.onActivity(cm.getCursor());
    }.bind(this), 250));

    // This is some really ugly hack to change the highlight in the editor from
    // anywhere - don't do this in a real React app!
    this._markerRange = null;
    global.cmHighlight = function(from, to) {
      if (isEqual([from, to], this._markerRange)) return;
      this._markerRange = [from, to];
      if (this.mark) this.mark.clear();
      this.mark = this.codeMirror.markText(from, to, {className: 'marked'});
    }.bind(this);

    global.cmClearHighlight = function(from, to) {
      this._markerRange = null;
      if (this.mark) {
        this.mark.clear();
        this.mark = null;
      }
    }.bind(this);
  },

  onContentChange: function() {
    clearTimeout(this.timer);
    this.timer = setTimeout(function() {
      this.props.onContentChange(this.codeMirror.getValue());
    }.bind(this), 200);
  },

  onReset: function() {
    this.props.onReset && this.props.onReset();
  },

  render: function() {
    /* jshint ignore:start */
    return (
      <div id="Editor" ref="container" />
    );
    /* jshint ignore:end */
  }
});

module.exports = Editor;
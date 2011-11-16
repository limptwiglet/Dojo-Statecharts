define([
  'dojo/_base/declare'
  ,'dojo/_base/lang'
], function (declare, lang) {
  var State = declare('', null, {
    isState: true,

    // Refernce to this states parent state
    parent: null,


    // The statechart that this state belongs to
    statechart: null,


    // The string representation of the path from the statechart to this state
    path: '',

    // Flag to tell if the state has been initalized
    isInitalized: false,

    // Keys of substates within this state
    subStates: [],

    constructor: function (props) {
      lang.mixin(this, props);
    },

    initState: function () {
      if (this.isInitalized) {
        return;
      }

      // Setup our substates
      var subStates = this.subStates,
      l = subStates.length,
      i = 0,
      name = null,
      subState = null;

      for (; i < l; i++) {
        name = subStates[i];
        subState = this[name];
        subState.root = this.root;
        subState.parent = this;
        subState.path = this.path + '.' + name;
        subState.statechart = this.statechart;
        subState.initState();

        this.subStates[i] = subState;
      }
    },

    gotoState: function () {

    },


    getSubstate: function (state) {
      if (lang.isObject(state)) {
        return this.subStates.indexOf(state) > -1 ? state : null;
      }

      if (lang.isString(state)) {
        return lang.getObject(state, false, this);
      }
    },

    getSubstates: function () {
      var subStates = this.subStates,
      l = subStates.length,
      i = 0,
      ret = [],
      subState;

      for (; i < l; i++) {
        subState = subStates[i];
        ret.push(this.getSubstate(subState));
     }

     return ret;
    },

    // Stub functions for overwritting
    enterState: function () {},
    exitState: function () {}
  });

  return State;
});

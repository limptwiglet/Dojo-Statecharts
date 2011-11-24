define([
  'dojo/_base/declare'
  ,'dojo/_base/lang'
  ,'dojo/_base/array'
], function (declare, lang, arr) {
  var State = declare('', null, {
    isState: true,

    // Refernce to this states parent state
    parent: null,

    // The statechart that this state belongs to
    statechart: null,

    root: null,

    subStatesAreConcurrent: false,

    // The string representation of the path from the statechart to this state
    path: '',

    // Flag to tell if the state has been initalized
    isInitalized: false,

    registeredSubstates: [],

    initialSubstate: false,

    // Keys of substates within this state
    subStates: [],

    currentSubStates: [],

    isCurrentState: false,

    constructor: function (props) {
      lang.mixin(this, props);
    },

    initState: function () {
      if (this.isInitalized) {
        return;
      }

      this.currentSubStates = [];

      this.registerWithParent();

      // Setup our substates
      var subStates = this.subStates,
      l = subStates.length,
      i = 0,
      name = null,
      subState = null,
      self = this;


      var initSubstate = function (state, i) {
        state.rootState = self.rootState;
        state.parent = self;
        state.path = self.path + '.' + name;
        state.statechart = self.statechart;
        state.initState();

        self.subStates[i] = state;
      };

      for (; i < l; i++) {
        name = subStates[i];
        subState = this[name];

        if (!subState) continue;

        if (lang.isString(subState)) {
          require([subState], (function (i, subState) {
            return function (state) {
              self[name] = state;
              initSubstate(state, i);
            };
          })(i, subState));
        } else {
          initSubstate(subState, i);
        }
      }
      this.isInitalized = true;

      if (this.initialSubstate) {
        this.initialSubstate = this.getSubstate(this.initialSubstate);
      }
    },


    // Registering sub states is not right!
    registerWithParent: function () {
      var parent = this.parent;

      while (parent) {
        parent.registerSubstate(this);
        parent = parent.parent;
      }
    },

    registerSubstate: function (state) {
      if (arr.indexOf(this.registeredSubstates, state) > -1) return;
      this.registeredSubstates.push(state);
    },

    gotoState: function (state, fromState, context) {
      if (this.isCurrentState) {
        fromState = this;
      } else if (this.currentSubStates.length) {
        fromState = this.currentSubStates[0];
      }

      this.statechart.gotoState(state, fromState, context);
    },


    getSubstate: function (state) {
      if (state.isRootState) {
        return state;
      }

      if (lang.isObject(state)) {
        return arr.indexOf(this.registeredSubstates, state) > -1 ? state : null;
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
    exitState: function () {},

    handleEvent: function (event, context) {
      var fn = lang.getObject(event, false, this);
      if (fn && lang.isFunction(fn))  {
        return this[event](context);

      }
      return false;
    }
  });

  return State;
});

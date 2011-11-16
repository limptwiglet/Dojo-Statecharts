define([
  'dojo/_base/declare'
  ,'dojo/_base/lang'
], function (declare, lang) {

  var ACTIONS = {
    ENTER: 1,
    EXIT: 0
  };

  var Statechart = declare('', null, {
    isStatechart: true,

    // This is the root state of the statechart
    // this will always be entered when the statechart is initalized
    rootState: null,

    // Keys of substates
    subStates: [],

    subStatesAreConcurrent: false,

    // Contains any currently active substates
    currentSubStates: [],

    // Indicates if a state change is currently happening
    lockStateChange: false,

    // Contains a que of state changes, these will get processed in order
    // by the clearChangeStack method
    stateChangeStack: [],

    constructor: function (props) {
      lang.mixin(this, props);
    },

    initStatechart: function () {
      this.transitionLocked = false;

      // Setup our substates
      var subStates = this.subStates,
      l = subStates.length,
      i = 0,
      name = null,
      subState = null;

      for (; i < l; i++) {
        name = subStates[i];
        subState = this[name];
        subState.parent = this;
        subState.path = name;
        subState.statechart = this;
        subState.initState();

        this.subStates[i] = subState;
      }

      this.gotoState(this.rootState);
    },


    gotoState: function (state, fromState, context) {
      // If a state change is currently happening then we need to add
      // this change to the stack and exit
      if (this.lockStateChange) {
        this.stateChangeStack.push({
          state: state,
          fromState: fromState,
          context: context
        });
        return;
      }

      // Lock the state change
      this.lockStateChange = true;


      var exitStates = false,
      enterStates = false,
      stateActions = [];

      if (fromState) {
        // Make sure the from state is a substate of the root
        fromState = this.rootState.getSubstate(fromState);
      } else if (this.currentSubStates.length > 0) {
        // No from state is defined so use the first current substate
        fromState = this.currentSubStates[0];
      }

      if (fromState) {
        exitStates = this.createStateChain(fromState);
      }

      enterStates = this.createStateChain(state);


      this.traverseEnterStates(enterStates.pop(), enterStates, stateActions);

      this.executeActions(state, stateActions, context);
    },

    executeActions: function (gotoState, actions, context) {
      var i = 0, l = actions.length, action;

      for (; i < l; i++) {
        action = actions[i];
        console.log(action);

        switch (action.action) {
          case ACTIONS.ENTER:
            this._enterState(action.state, context);
          break;
          case ACTIONS.EXIT:
            this._exitState(action.state, context);
          break;
        }
      }
    },

    _enterState: function (state, context) {
      state.enterState(context);
    },

    createStateChain: function (state) {
      var chain = [];

      while (state) {
        chain.push(state);
        state = state.parent;
      }

      return chain;
    },

    traverseEnterStates: function (state, statePath, stateActions) {

      if (!statePath || statePath.length === 0) {
        // We have come to the end of the state path so need to enter
        // this state
        stateActions.push({ state: state, action: ACTIONS.ENTER });

        if (state.subStatesAreConcurrent) {
          this.traverseConcurrentEnterStates(state.getSubstates(), null, stateActions);
        }
      } else if (statePath.length > 0) {
        console.log('here');
      }

    },

    traverseConcurrentEnterStates: function (states, exclude, stateActions) {
      var i = 0,
      l = states.length,
      state;

      for (; i < l; i++) {
        var state = states[i];
        this.traverseEnterStates(state, null, stateActions);
      }
    }

  });


  return Statechart;
});

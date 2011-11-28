define([
  'dojo/_base/declare'
  ,'dojo/_base/lang'
  , 'dojo/_base/array'
], function (declare, lang, arr) {

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

      this.rootState.isRootState = true;
      this.rootState.statechart = this;

      this.rootState.initState();

      this.gotoState(this.rootState);
    },


    gotoState: function (state, fromState, context) {
      // Fetch our state as it could be a string or a state object
      state = this.getState(state);

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


      var exitStates = [],
      enterStates = [],
      stateActions = [];

      if (fromState) {
        // Make sure the from state is a substate of the root
        fromState = this.rootState.getSubstate(fromState);
      } else if (this.rootState.currentSubStates.length > 0) {
        // No from state is defined so use the first current substate
        fromState = this.rootState.currentSubStates[0];
      }

      if (fromState) {
        exitStates = this.createStateChain(fromState);
      }

      enterStates = this.createStateChain(state);

      var pivot = this.findPivotState(exitStates, enterStates);

      this.traverseExitStates(exitStates.shift(), exitStates, pivot, stateActions);

      this.traverseEnterStates(enterStates.pop(), enterStates, pivot, stateActions);

      this.executeActions(state, stateActions, context);
    },

    executeActions: function (gotoState, actions, context) {
      var i = 0, l = actions.length, action;

      for (; i < l; i++) {
        action = actions[i];

        switch (action.action) {
          case ACTIONS.ENTER:
            this._enterState(action.state, action.current, context);
          break;
          case ACTIONS.EXIT:
            this._exitState(action.state, context);
          break;
        }
      }

      this.lockStateChange = false;

      this.clearChangeStack();
    },


    clearChangeStack: function () {
      if (this.stateChangeStack.length) {
        var state = this.stateChangeStack.shift();

        this.gotoState(state.state, state.fromState, state.context);
      }
    },

    findPivotState: function(chain1, chain2) {
      // summary:
      //    Locates the point in a statechain where states should be exited to
      //    and also entered to
      // chain1: Array
      //    An array containing states
      // chain2: Array
      //    An array containing states
      // returns:
      //    Returns the state which marks the pivot point
      if (chain1.length === 0 || chain2.length === 0) return null;

      var pivot = null;

      for (var i = 0; i < chain1.length; i++) {
        var state = chain1[i];
        if (pivot === null && arr.indexOf(chain2, state) >= 0) pivot = chain1[i];
      }

      return pivot;
    },

    _enterState: function (state, current, context) {
      // summary:
      //    Adds the state to its parent states currentSubstate array and sets
      //    the states isCurrentState property to true and finally calls the
      //    states own enterState method
      // state: Object
      //    The state to enter
      // current: Boolean
      //    If the state is to be marked current
      // context: Object
      //    A context object containing values to pass to the states enterState
      var parentState = state.parent;

      if (current) {
        parentState = state;

        while(parentState) {
          parentState.currentSubStates.push(state);
          parentState = parentState.parent;
        }
      }

      state.isCurrentState = true;

      state.enterState(context);
    },


    _exitState: function (state, context) {
      // summary:
      //    Removes the state from its parents currentSubstates array and
      //    sets the states isCurrentState property to false and finally calls
      //    the states own exitState method
      // state: Object
      //    The state to exit
      // context: Object
      //    A context object containing values to pass to the states exitState
      if (arr.indexOf(state.currentSubStates, state) >= 0) {
        var parentState = state.parent,
            subStates = parentState.currentSubStates;

        while (parentState) {
          subStates.splice(arr.indexOf(subStates, state), 1);
          parentState = parentState.parent;
        }
      }
      state.isCurrentState = false;
      state.exitState(context);
    },


    getState: function (state) {
      // summary:
      //    Gets a state from the rootstate of the state chart can use .
      //    seperation to get substates ie getState('a.b')
      // returns:
      //    Returns the substate
      return this.rootState.getSubstate(state);
    },


    createStateChain: function (state) {
      // summary:
      //    Walks up through the passed in state getting its parent states
      //
      // state: Object
      //    The state that should be walked
      //
      // returns:
      //    An array of this states chain

      var chain = new Array(), chain2 = {};

      while (state) {
        chain.push(state);
        state = state.parent;
      }

      return chain;
    },


    traverseEnterStates: function (state, statePath, pivot, stateActions) {
      // summary:
      //    Walks a statechain entering states and ensuring any concurrent sub states
      //    are entered as well
      //
      // state: Object
      //    State objec to go to
      //
      // statePath: Array
      //    The state chain that should be followed
      //
      // pivot: Object
      //    The pivot point at which states should be entered from
      //
      // stateActions: Array
      //    An array of state actions to be carried out

      if (pivot) {
        if (state !== pivot) {
          this.traverseEnterStates(statePath.pop(), statePath, pivot, stateActions);
        } else {
          this.traverseEnterStates(statePath.pop(), statePath, null, stateActions);
        }
      } else if (!statePath || statePath.length === 0) {
        // We have come to the end of the state path so need to enter
        // this state
        var gotoStateAction = { state: state, current: false, action: ACTIONS.ENTER };
        stateActions.push(gotoStateAction);

        var initialSubstate = state.initialSubstate;

        if (state.subStatesAreConcurrent) {
          this.traverseConcurrentEnterStates(state.getSubstates(), null, stateActions);
        } else if (initialSubstate) {
          this.traverseEnterStates(initialSubstate, null, null, stateActions);
        } else {
          gotoStateAction.current = true;
        }
      } else if (statePath.length > 0) {
        stateActions.push({ state: state, action: ACTIONS.ENTER });
        var nextState = statePath.pop();
        this.traverseEnterStates(nextState, statePath, null, stateActions);

        if (state.subStatesAreConcurrent) {
          this.traverseConcurrentEnterStates(state.getSubstates(), null, stateActions);
        }
      }

    },

    traverseConcurrentEnterStates: function (states, exclude, stateActions) {
      // summary:
      //    Walks through a states sub states entering them
      // states: Array
      //    An array of states to enter
      // exlude:
      //    Not current used
      // stateActions:
      //    State actions to run
      var i = 0,
      l = states.length,
      state;

      for (; i < l; i++) {
        var state = states[i];
        this.traverseEnterStates(state, null, null, stateActions);
      }
    },

    traverseExitStates: function(state, statePath, stopState, stateActions) {
      if (!state || state === stopState) return;

      if (state.subStatesAreConcurrent) {
        var i = 0, currentSubStates = state.currentSubStates,
        l = currentSubStates.length, currentState = null;

        for (; i < l; i++) {
          currentState = currentSubStates[i];
          if (currentState._exit_skipState === true) continue;
          var chain = this.createStateChain(currentState);
          this.traverseExitStates(chain.shift(), chain, state, stateActions);
        }
      }

      stateActions.push({ action: ACTIONS.EXIT, state: state });
      if (state.isCurrentState) state._exit_skipState = true;
      this.traverseExitStates(statePath.shift(), statePath, stopState, stateActions);
    },


    sendEvent: function (event, context) {
      var curStates = this.rootState.currentSubStates.slice(),
          handled = false,
          state = null,
          l = curStates.length,
          i = 0;

      for (; i < l; i++) {
        state = curStates[i];

        while (!handled && state) {
          handled = state.handleEvent(event, context);

          if (!handled) state = state.parent;
        }
      }
    }

  });


  return Statechart;
});

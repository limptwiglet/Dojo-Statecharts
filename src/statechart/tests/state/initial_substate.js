define('state/inital_substate', ['dojo', 'doh', 'statechart/main', 'statechart/state'], function(dojo, doh, Statechart, State){


  var statechart = new Statechart({
    rootState: new State({
      subStates: ['a', 'b'],

      initialSubstate: 'a',

      a: new State({
        subStates: ['c', 'd'],

        initialSubstate: 'c',

        c: new State({}),
        d: new State({})
      }),

      b: new State({
        subStates: ['e', 'f'],

        e: new State({}),
        f: new State({})
      })
    })
  }),


  rootState = statechart.rootState,
  stateA = statechart.rootState.a,
  stateB = statechart.rootState.b,
  stateC = statechart.rootState.a.c,
  stateD = statechart.rootState.a.d,
  stateE = statechart.rootState.b.e,
  stateF = statechart.rootState.b.f;

  statechart.initStatechart();


  doh.register('State: Test initial substate', [
    {
      name: 'root state initial substate should be A',
      runTest: function (t) {
        t.assertEqual(rootState.initialSubstate, stateA);
      }
    },

    {
      name: 'state a initial substate should be C',
      runTest: function (t) {
        t.assertEqual(stateA.initialSubstate, stateC);
      }
    },

    {
      name: 'state c should have no initial substate',
      runTest: function (t) {
        t.assertEqual(stateC.initialSubstate, false);
      }
    },

    {
      name: 'state d should have no initial substate',
      runTest: function (t) {
        t.assertEqual(stateD.initialSubstate, false);
      }
    },

    {
      name: 'state e should have no initial substate',
      runTest: function (t) {
        t.assertEqual(stateE.initialSubstate, false);
      }
    },

    {
      name: 'state f should have no initial substate',
      runTest: function (t) {
        t.assertEqual(stateF.initialSubstate, false);
      },
      tearDown: function () {
        statechart = rootState = stateA = stateB = stateC = stateD = stateE = stateF = null;
      }
    }
  ]);
});

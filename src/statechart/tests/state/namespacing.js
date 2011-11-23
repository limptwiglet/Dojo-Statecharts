define('state/namespacing', ['dojo', 'doh', 'statechart/main', 'statechart/state'], function(dojo, doh, Statechart, State){

  var statechart = new Statechart({
    rootState: new State({
      subStates: ['a', 'b'],

      a: new State({
        subStates: ['c', 'd'],

        c: new State({ value: 'c' }),
        d: new State({ value: 'd' })
      }),

      b: new State({})
    })
  }),

  rootState = statechart.rootState,
  stateA = rootState.a,
  stateB = rootState.b,
  stateC = stateA.c,
  stateD = stateA.d;


  statechart.initStatechart();


  doh.register('State: Test moving to states with a namespace', [
    {
      name: 'Should now be in A state',
      setUp: function () {
        statechart.gotoState('a');
      },
      runTest: function (t) {
        t.assertTrue(stateA.isCurrentState);
        t.assertFalse(stateC.isCurrentState);
      }
    },

    {
      name: 'Should now be in C state',
      setUp: function () {
        statechart.gotoState('a.c');
      },
      runTest: function (t) {
        t.assertTrue(stateA.isCurrentState);
        t.assertTrue(stateC.isCurrentState);
      }
    }
  ]);
});


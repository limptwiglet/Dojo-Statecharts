define('state/is_current', ['dojo', 'doh', 'statechart/main', 'statechart/state'], function(dojo, doh, Statechart, State){

  var statechart = new Statechart({
    rootState: new State({
      subStates: ['a', 'b'],

      initialSubstate: 'a',

      a: new State({}),

      b: new State({})
    })
  }),


  rootState = statechart.rootState,
  stateA = statechart.rootState.a,
  stateB = statechart.rootState.b;

  statechart.initStatechart();


  doh.register('State: Test isCurrent property', [
    {
      name: 'State A should have current property',
      runTest: function (t) {
        t.assertTrue(stateA.isCurrentState);
      }
    },
    {
      name: 'State B should not have current property',
      runTest: function (t) {
        t.assertFalse(stateB.isCurrentState);
      }
    },

    {
      name: 'State B should now have isCurrentState property',
      setUp: function () {
        statechart.gotoState('b');
      },
      runTest: function (t) {
        t.assertTrue(stateB.isCurrentState);
      }
    },

    {
      name: 'State A should not have isCurrentState property',
      runTest: function (t) {
        t.assertFalse(stateA.isCurrentState);
      }
    }
  ]);
});

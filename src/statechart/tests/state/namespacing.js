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
  });


  var statechart2 = new Statechart({
    rootState: new State({
      subStates: ['a', 'b'],

      a: new State({
        subStates: ['d', 'e'],
        subStatesAreConcurrent: true,

        d: new State({}),
        e: new State({})
      })
    })
  })



  statechart.initStatechart();


  doh.register('State: Test moving to states with a namespace', [
    {
      name: 'Should now be in A state',
      setUp: function () {
        statechart.gotoState('a');
      },
      runTest: function (t) {
        t.assertTrue(statechart.rootState.a.isCurrentState);
      }
    },

    {
      name: 'Should now be in C state',
      setUp: function () {
        statechart.gotoState('a.c');
      },
      runTest: function (t) {
        t.assertTrue(statechart.rootState.a.isCurrentState);
        t.assertTrue(statechart.rootState.a.c.isCurrentState);
      }
    },

    {
      name: 'Test statechart2 concurrent substates',
      setUp: function () {
        statechart2.gotoState('a.e');
      },
      runTest: function (t) {
      }
    }
  ]);
});


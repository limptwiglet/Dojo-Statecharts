require(['statechart/main', 'statechart/state'], function (Statechart, State) {
  stateChart = new Statechart({
    rootState: new State({
      subStates: ['stateA', 'stateB'],
      subStatesAreConcurrent: true,

      enterState: function () {
        console.log('entered root state');
      },

      exitState: function () {
        console.log('exit root state');
      },

      stateA: new State({
        name: 'sateA',
        enterState: function () {
          console.log('enter stateA');
        }
      }),

      stateB: new State({
        subStatesAreConcurrent: true,
        subStates: ['stateB1'],
        name: 'stateB',

        enterState: function () {
          console.log('enter stateB');
        },

        stateB1: new State({
          name: 'stateB1',
          enterState: function () {
            console.log('enter stateB1');
          }
        })

      })
    })
  });


  stateChart.initStatechart();
});

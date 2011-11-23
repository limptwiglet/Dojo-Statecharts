require(['statechart/main', 'statechart/state'], function (Statechart, State) {
  stateChart = new Statechart({
    rootState: new State({
      name: 'rootState',
      subStates: ['stateA', 'stateB', 'stateC', 'stateD'],

      enterState: function () {
        console.log('entered root state');
      },

      exitState: function () {
        console.log('exit root state');
      },

      stateA: 'js/statea.js',

      stateB: new State({
        subStatesAreConcurrent: true,
        subStates: ['stateB1', 'stateB2'],
        name: 'stateB',

        enterState: function (context) {
          console.log('enter stateB', context);
        },

        exitState: function() {
          console.log('exit stateB');
        },

        stateB1: new State({
          name: 'stateB1',
          enterState: function (context) {
            console.log('enter stateB1', context);
          },
          exitState: function() {
            console.log('exit stateB1');
          }
        }),

        stateB2: new State({
          name: 'stateB2',
          enterState: function () {
            console.log('enter stateB2');

            var self = this;
            setTimeout(function() {
              self.gotoState('stateC.stateC1');
            }, 1000)
          },
          exitState: function() {
            console.log('exit stateB2');
          }
        })

      }),

      stateC: new State({
        subStates: ['stateC1'],

        enterState: function () {
          console.log('enter stateC');
        },

        exitState: function () {
          console.log('exit stateC');
        },

        stateC1: new State({
          enterState: function () {
            console.log('enter stateC1');
            this.gotoState('stateD');
          }
        })
      }),

      stateD: 'js/stated.js'
    })
  });


  stateChart.initStatechart();
});

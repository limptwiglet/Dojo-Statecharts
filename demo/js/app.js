require(['dojo', 'statechart/main', 'statechart/state'], function (dojo, Statechart, State) {
  stateChart = new Statechart({
    rootState: new State({
      subStates: ['a', 'b'],

      enterState: function() {
        console.log('enter root state');
        this.gotoState('a');
      },

      exitState: function() {
        console.log('exit root state');
      },

      a: new State({
        subStates: ['c', 'd'],
        enterState: function () {
          console.log('enter state a');
          this.gotoState('a.c');
        },

        exitState: function() {
          console.log('exit state a');
        },

        c: new State({
          enterState: function () {
            console.log('enter state c');
          },

          exitState: function () {
            console.log('exit state c');
          }
        }),

        d: new State({
          enterState: function () {
            console.log('enter state d');
          },

          exitState: function () {
            console.log('exit state d');
          }
        })
      }),

      b: new State({
        enterState: function () {
          console.log('enter state b');
        },

        exitState: function() {
          console.log('exit state b');
        }
      })
    })
  });


  stateChart.initStatechart();

  setTimeout(function () {
    stateChart.gotoStateFromSibling('a.d', 'a');
  }, 250);

});

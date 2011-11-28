require(['dojo', 'statechart/main', 'statechart/state'], function (dojo, Statechart, State) {
  stateChart = new Statechart({
    rootState: new State({
      subStates: ['a', 'b'],

      enterState: function() {
        console.log('enter root state');
      },

      exitState: function() {
        console.log('exit root state');
      },

      a: new State({
        enterState: function () {
          console.log('enter state a');
          this.gotoState('b');
        },

        exitState: function() {
          console.log('exit state a');
        }
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

  console.log(dojo);
  dojo.ready(function () {
    var stateA = dojo.create('a', {
      href: '#',
      innerHTML: 'Goto state A'
    }, document.body),

    stateB = dojo.create('a', {
      href: '#',
      innerHTML: 'Goto state B'
    }, document.body);

    dojo.connect(stateA, 'onclick', function (evt) {
      dojo.stopEvent(evt);
      stateChart.gotoState('a', stateChart.rootState);
    });

    dojo.connect(stateB, 'onclick', function (evt) {
      dojo.stopEvent(evt);
      console.log(stateChart.rootState.currentSubStates);
      stateChart.gotoState('b', stateChart.rootState.a);
    });
  });
});

define(['statechart/state'], function (State) {
  var state = new State({
    name: 'sateA',
    enterState: function () {
      console.log('enter stateA');
      var self = this;
      setTimeout(function () {
        self.gotoState('stateB', null, {name: 'mark'});
      }, 1000);
    },

    exitState: function () {
      console.log('exit stateA');
    }
  });
  return state;
});

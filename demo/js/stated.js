define(['statechart/state'], function (State) {
    var state = new State({
      enterState: function () {
        console.log('entered stated');
      },

      exitState: function () {
        console.log('exit stated');
      },
  });


  return state;
});

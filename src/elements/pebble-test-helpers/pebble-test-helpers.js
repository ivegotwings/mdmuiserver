var PebbleTestHelpers = {};

(function(scope, global) {
  'use strict';

  // In case the var above was not global, or if it was renamed.
  global.PebbleTestHelpers = scope;

  global.scrollTestHelper = function(scroller, test) {

      function scrollEventHandler() {
          test.callback();
      }

      function triggerScrollEvent() {
        var scrollTop = scroller.scrollTop;
        if (test.y === scrollTop) {
          scrollEventHandler();
        } 
        else
        {
          scroller.scrollTop = test.y;
        }
      }
      
      var scrollTarget = scroller;
      scrollTarget.addEventListener('scroll', scrollEventHandler);
      triggerScrollEvent();
    }

  scope.scrollTestHelper = global.scrollTestHelper;
})(PebbleTestHelpers, this);

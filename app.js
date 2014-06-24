document.addEventListener('DOMContentLoaded', function () {
  // DOM ready, run it!

  // create arduino instance
  var myuno = new arduino.uno('arduino_reset', 'arduino_on');

  // callback handling the matrix led
  function write_ledmatrix(io, pin) {
    // we have to determine the when we are allowed to 'light' and when to
    // turn the leds off
    /* col1, ..., col6
        -------------
        | | | | | | |
        -------------
        | | | | | | |
        -------------
        | | | | | | |
        -------------
    */

    if (isNaN(pin) || pin < 0 || pin > 13) {
      return;
    }

    var nodes;
    var pin_classname = pin.name ? pin.name : ("pin" + pin);

    nodes = document.getElementsByClassName(pin_classname);

    // iterate over all nodes and check if we can turn on or off
    var sibling_index;
    var fill;
    var sibling_value;
    var i;

    function classname_map(x) {
      return x.indexOf(pin_classname, x.length - pin_classname.length) === -1;
    }

    for (i = 0; i < nodes.length; i++) {
      // 1. get other pin index for specified
      fill = '#fafafa';
      var siblings = Array.prototype.filter.call(nodes[i].classList, classname_map);
      if (siblings.length > 0) {
        sibling_value = myuno._getPinValue(siblings[0]);
        // HIGH value on col and HIGH on row
        if (io.value === arduino.HIGH && sibling_value === arduino.HIGH) {
          fill = 'lime';
        }
        nodes[i].setAttribute("fill", fill);
      }
    }
  }

  /* callback function that handles pin value changes */
  function write_callback(io, pin) {
    var nodes;

    if (pin.name) {
      nodes = document.getElementsByClassName(pin.name);
    } else {
      nodes = document.getElementsByClassName("pin" + pin); // nodes have "pin[0-9]"as classnames
    }

    if (!nodes || nodes.length <= 0) {
      console.log("Specified pin is not connected: " + pin.name);
      return;
    }

    var visibility = "hidden";

    if (io.value) {
      visibility = "visible";
    }

    var i;
    for (i = 0; i < nodes.length; i++) {
      if(nodes[i].classList.length === 1) // leds have exactly 2 classes
        nodes[i].setAttribute("visibility", visibility);
    }
  }
  myuno.addonChange(write_callback); // add callback for pin value changes
  myuno.addonChange(write_ledmatrix);

  var reset = false;
  var timeoutID = [];

  function loop() {
    myuno.digitalWrite(9, arduino.HIGH);
    myuno.digitalWrite(13, arduino.HIGH);

    if (!reset && myuno.status == arduino.ON) {
      timeoutID.push(window.setTimeout(loop, 500));
    }
  }

  // reset all pins to LOW output
  function resetAll() {
    reset = true;
    var i;
    for (i = 0; i < timeoutID.length; i++) {
      window.clearTimeout(timeoutID[i]);
    }
    timeoutID = [];

    for (i = 0; i <= 13; i++) {
      myuno.digitalWrite(i, arduino.LOW);
    }

    myuno.setStatus(arduino.OFF);
    reset = false;
  }

  // bind arduino reset
  myuno.actions.reset.addEventListener('click', function () {
    resetAll();
  }, false);

  myuno.actions.on.addEventListener('click', function () {
    if (myuno.status === arduino.OFF) {
      myuno.setStatus(arduino.ON);
      loop();
    }
  }, false);

  /* start of the program */
}, false);

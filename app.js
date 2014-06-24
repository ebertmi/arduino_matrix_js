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

    var nodes;
    var pin_classname = pin.name ? pin.name : ("pin" + pin);

    nodes = document.getElementsByClassName(pin_classname);

    // iterate over all nodes and check if we can turn on or off
    var sibling_index;
    var visibility = 'hidden';
    var sibling_value;
    var i;
    var classname_map = function(x){
      if(this.indexOf(pin_classname, this.length - suffix.length) === -1) {
        return x; // returns classes that are unequal to given node
      }
    };

    for (i = 0; i < nodes.length; i++) {
      // 1. get other pin index for specified
      sibling_index = node.children[i].classList.map(classname_map)[0]; // must be always 1!
      sibling_value = myuno._getPinValue(sibling_index);
      // HIGH value on col and HIGH on row
      if(io.value === 1 && sibling_value === 1) {
        visibility = 'visible';
      }
      nodes[i].setAttribute("visibility", visibility);
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
      nodes[i].setAttribute("visibility", visibility);
    }
  }
  myuno.addonChange(write_callback); // add callback for pin value changes

  var reset = false;
  var timeoutID = [];

  function loop() {
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

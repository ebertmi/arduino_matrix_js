document.addEventListener('DOMContentLoaded', function () {
  // DOM ready, run it!

  // create arduino instance
  var myuno = new arduino.uno('arduino_reset', 'arduino_on');

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

  var toggle = arduino.LOW;
  var reset = false;
  var timeoutID = [];

  function loop() {
    myuno.digitalWrite(13, toggle);

    toggle = toggle ? arduino.LOW : arduino.HIGH;

    if (!reset && myuno.status == arduino.ON) {
      timeoutID.push(window.setTimeout(loop, 500));
    }
  }

  // reset all pins to LOW output
  function resetAll() {
    reset = true;
    toggle = 0;
    var i;
    for (i = 0; i < timeoutID.length; i++) {
      window.clearTimeout(timeoutID[i]);
    }

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

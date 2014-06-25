document.addEventListener('DOMContentLoaded', function () {
  // DOM ready, run it!

  // create arduino instance
  var myuno = new arduino.uno('arduino_reset', 'arduino_on');
  var pins = [-1, 5, 4, 3, 2, 14, 15, 16, 17, 13, 12, 11, 10, 9, 8, 7, 6];
  // col[xx] of leds = pin yy on led matrix
  var cols = [pins[13], pins[3], pins[4], pins[10], pins[06], pins[11], pins[
    15], pins[16]];
  // row[xx] of leds = pin yy on led matrix
  var rows = [pins[9], pins[14], pins[8], pins[12], pins[1], pins[7], pins[2],
    pins[5]
  ];

  function write_led(row, col, value) {
    var nodes;
    nodes = document.getElementsByClassName("pin" + row + " pin" + col);

    for (i = 0; i < nodes.length; i++) {
      fill = '#fafafa';
      // HIGH value on col and HIGH on row
      if (value === arduino.HIGH) {
        fill = 'lime';
      }
      nodes[i].setAttribute("fill", fill);
    }
  }

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

    if (isNaN(pin) || pin < 0 || pin > 19 || cols.indexOf(pin) === -1) {
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
      var siblings = Array.prototype.filter.call(nodes[i].classList,
        classname_map);
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
      if (nodes[i].classList.length === 1) // leds have exactly 2 classes
        nodes[i].setAttribute("visibility", visibility);
    }
  }
  myuno.addonChange(write_callback); // add callback for pin value changes
  //myuno.addonChange(write_ledmatrix);

  var reset = false;
  var timeoutID = [];
  var col = 0;
  var leds = [];
  leds[0] = [0, 0, 0, 0, 0, 0, 0, 0];
  leds[1] = [0, 0, 1, 0, 0, 0, 0, 0];
  leds[2] = [0, 0, 0, 0, 0, 0, 0, 0];
  leds[3] = [0, 0, 0, 1, 0, 1, 0, 0];
  leds[4] = [0, 0, 0, 0, 0, 0, 0, 0];
  leds[5] = [0, 0, 0, 0, 0, 0, 0, 0];
  leds[6] = [1, 1, 1, 1, 1, 1, 1, 0];
  leds[7] = [0, 0, 0, 1, 0, 0, 0, 0];

  var h = [];
  h[0] = [0, 0, 1, 0, 0, 0, 1, 0];
  h[1] = [0, 0, 1, 0, 0, 0, 1, 0];
  h[2] = [0, 0, 1, 0, 0, 0, 1, 0];
  h[3] = [0, 0, 1, 1, 1, 1, 1, 0];
  h[4] = [0, 0, 1, 0, 0, 0, 1, 0];
  h[5] = [0, 0, 1, 0, 0, 0, 1, 0];
  h[6] = [0, 0, 1, 0, 0, 0, 1, 0];
  h[7] = [0, 0, 1, 0, 0, 0, 1, 0];

  function display() {
    myuno.digitalWrite(cols[col], arduino.LOW); // Turn whole previous column off
    col++;
    if (col === 8) {
      col = 0;
    }
    var row;
    for (row = 0; row < 8; row++) {
      if (leds[col][7 - row] == 1) {
        myuno.digitalWrite(rows[row], arduino.HIGH); // Turn on this led
      } else {
        myuno.digitalWrite(rows[row], arduino.LOW); // Turn off this led
      }
    }
    myuno.digitalWrite(cols[col], arduino.HIGH);
  }

  function display_steady() {
    var j;
    var i;
    for (i = 0; i < rows.length; i++) {
      for (j = 0; j < cols.length; j++) {
        myuno.digitalWrite(rows[i], leds[i][j]);
        myuno.digitalWrite(cols[j], leds[i][j]);
        write_led(rows[i], cols[j], leds[i][j]);
      }
    }
  }

  function slidePattern() {
    var i;
    var j;
    for (i = 0; i < 7; i++) {
      for (j = 0; j < 8; j++) {
        leds[j][i] = leds[j][i+1];
      }
    }
  }

  function setPattern(pattern) {
    var i;
    var j;
    for (i = 0; i < 8; i++) {
      for (j = 0; j < 8; j++) {
        leds[i][j] = pattern[i][j];
      }
    }
  }

  var counter = 0;
  function loop() {
    slidePattern();
    counter ++;
    if(counter > 6) {
      setPattern(h);
      counter = 0;
    }

    if (!reset && myuno.status == arduino.ON) {
      timeoutID.push(window.setTimeout(loop, 250));
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
      timeoutID.push(window.setInterval(display_steady, 100)); // 100 hz
      loop();
    }
  }, false);

  /* start of the program */
}, false);

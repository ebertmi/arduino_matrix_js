var crboard = {};
crboard.matrix = [];
var name_s = "io_com1";

// get the leds
crboard.LEDs = document.getElementsByClassName(name_s);
if (crboard.LEDs.length <= 0) {
  throw new Exception("No LEDs found for specified identifier: " + name_s);
}
crboard.parent = crboard.LEDs[0].parentNode;
crboard.rows = crboard.parent.getAttribute("rows");
crboard.columns = crboard.parent.getAttribute("cols");
var i, j;

// create undefined matrix
for (i = 0; i < crboard.rows; i++) {
  crboard.matrix[i] = [];
  for (j = 0; j < crboard.columns; j++) {
    crboard.matrix[i][j] = undefined;
  }
}

// read the rows and columns for individual LEDs and stores the svg:group in it
for (i = 0; i < crboard.LEDs.length; i++) {
  crboard.matrix[crboard.LEDs[i].getAttribute("x") - 1][crboard.LEDs[i].getAttribute(
    "y") - 1] = crboard.LEDs[i];
}


// test writing :D
function digitalwrite(row, col, high_low) {
  var g = crboard.matrix[row][col];
  var color = "grey";
  var visibility = "hidden";

  if (high_low) {
    color = "lime";
    visibility = "visible";
  }

  var i;
  for (i = 0; i < g.children.length; i++) {
    if (g.children[i].nodeName === "circle") {
      g.children[i].setAttribute("fill", color);
      if (!g.children[i].classList.contains("crledbase")) {
        g.children[i].setAttribute("visibility", visibility);
        g.children[i].setAttribute("fill", "whitesmoke");
        g.children[i].setAttribute("fill-opacity", "0.6");
      }
    }
  }
}

var multiplex = [0, 0, 0, 0, 0, 0, 0, 0];

function writecol(col, high_low) {
  // write specified rows
  // more like simulating the row writing
  multiplex[col] = high_low;
  //writerow(col, high_low);
}

function writerow(row, high_low) {
  // write specified rows
  // more like simulating the row writing
  var g = crboard.matrix[row];
  var color = "grey";
  var visibility = "hidden";

  if (high_low) {
    color = "lime";
    visibility = "visible";
  }

  var j;
  var i;
  for (j = 0; j < g.length; j++) {
    if(j == col)
      for (i = 0; i < g[j].children.length; i++) {
        if (g[j].children[i].nodeName === "circle") {
          g[j].children[i].setAttribute("fill", color);
          if (!g[j].children[i].classList.contains("crledbase")) {
            g[j].children[i].setAttribute("visibility", visibility);
            g[j].children[i].setAttribute("fill", "whitesmoke");
            g[j].children[i].setAttribute("fill-opacity", "0.6");
          }
        }
      }
  }
}

var col = 0;
var leds = [];
leds[0] = [0, 0, 0, 0, 0, 0, 0, 0];
leds[1] = [0, 0, 1, 0, 0, 0, 0, 0];
leds[2] = [0, 0, 0, 0, 0, 0, 0, 0];
leds[3] = [0, 0, 0, 1, 0, 1, 0, 0];
leds[4] = [0, 0, 0, 0, 0, 0, 0, 0];
leds[5] = [0, 0, 0, 0, 0, 0, 0, 0];
leds[6] = [0, 0, 0, 0, 0, 0, 1, 0];
leds[7] = [0, 0, 0, 1, 0, 0, 0, 0];

var timeout;

function display() {
	writecol(col, 0);
	col = ++col % crboard.matrix[0].length;
  console.log(col);
	var row;
	for(row = 0; row < crboard.matrix.length; row++) {
		if(leds[row][col] == 1) {
			writerow(row, 1);
		} else {
			writerow(row, 0);
		}
	}

	writecol(col, 1);
	timeout = window.setTimeout(display, 500);
}

function writedigital(pin, high_or_low) {
  var nodes = document.getElementsByClassName("pin" + pin); // nodes have "pin[0-9]"as classnames
  if(!nodes || nodes.length <= 0) {
    console.log("Specified pin is not connected: " + pin);
    return;
  }

  var visibility = "hidden";

  if(high_or_low) {
    visibility = "visible";
  }

  var i;
  for(i = 0; i < nodes.length; i++) {
    nodes[i].setAttribute("visibility", visibility);
  }
}

var HIGH = 1;
var LOW = 0;
var toggle = 0;
var reset = false;
var timeoutID;
var arduino = {};

arduino.timeoutID = undefined;
arduino.interrupt = undefined;
arduino.status = {};
arduino.status.current = "OFF";
arduino.status.OFF = "OFF";
arduino.status.ON = "ON";
arduino.pinmode = "OUT";
arduino.actions = {};
arduino.actions.reset = document.getElementById('arduino_reset');
arduino.actions.on = document.getElementById('arduino_on');


function loop() {
  writedigital(13, toggle);

  toggle = toggle ? LOW : HIGH;

  if(!reset){
    timeoutID  = window.setTimeout(loop, 500);
  }
}

// reset all pins to LOW output
function resetAll() {
  reset = true;
  toggle = 0;
  window.clearTimeout(timeoutID);

  var i;
  for(i = 0; i <= 13; i++) {
    writedigital(i, LOW);
  }

  arduino.status.current = arduino.status.OFF;
  reset = false;
}

// bind arduino reset
arduino.actions.reset.addEventListener('click', function() {
  resetAll();
}, false);

arduino.actions.on.addEventListener('click', function() {
  if(arduino.status.current === arduino.status.OFF) {
    loop();
    arduino.status.current = arduino.status.ON;
  }
}, false);

/*
for (i = 0; i < crboard.rows; i++) {
  for (j = 0; j < crboard.columns; j++) {
    digitalwrite(i, j, Math.round(Math.random()));
  }
}*/

display();

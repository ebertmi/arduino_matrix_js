arduino = arduino || {}; // do not override

arduino.HIGH = 1;
arduino.LOW = 0;
arduino.CHANGE = 2;
arduino.RISING = 3;
arduino.FALLING = 4;
arduino.OUTPUT = 'OUTPUT';
arduino.INPUT = 'INPUT';
arduino.INPUT_PULLUP = 'INPUT_PULLUP';
arduino.OFF = 0;
arduino.ON = 1;

arduino.Timer1 = {
  self: undefined, // reference to actual arduino board
};

arduino.Timer1.initialize = function (period) {
  arduino.Timer1.period = period;
};

arduino.Timer1.attachInterrupt = function (func) {
  arduino.Timer1.func = func;

  arduino.Timer1.id = window.setInterval(func, arduino.Timer1.period);
};

arduino.Timer1.detachInterrupt = function () {
  window.clearTimeout(arduino.Timer1.id );
};

// constructor
arduino.uno = function (resetID, onID, lID, txID) {
  this.timeoutID = undefined;
  this.interrupt = undefined;
  this.status = arduino.OFF;
  this.actions = {};
  this.actions.reset = document.getElementById(resetID);
  this.actions.on = document.getElementById(onID);
  this.actions.onChange = []; // list of external event handlers for value changes
  this.int0 = undefined; // digital pin 2
  this.int1 = undefined; // digital pin 3
  this.interrupts = true;

  // setup io map
  this.io = {};
  this.io.ledON = {
    'pin': undefined,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'LEDON'
  };
  this.io.ledTX = {
    'pin': undefined,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'LEDTX'
  };
  this.io.ledRX = {
    'pin': undefined,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'LEDRX'
  };
  this.io.pin0 = {
    'pin': 0,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'RX'
  };
  this.io.pin1 = {
    'pin': 1,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'TX'
  };
  this.io.pin2 = {
    'pin': 2,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'INT0'
  };
  this.io.pin3 = {
    'pin': 3,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'INT1'
  };
  this.io.pin4 = {
    'pin': 4,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin5 = {
    'pin': 5,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin6 = {
    'pin': 6,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin7 = {
    'pin': 7,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin8 = {
    'pin': 8,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin9 = {
    'pin': 9,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'PWM'
  };
  this.io.pin10 = {
    'pin': 10,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'PWM'
  };
  this.io.pin11 = {
    'pin': 11,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'PWM'
  };
  this.io.pin12 = {
    'pin': 12,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin13 = {
    'pin': 13,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'LED'
  };
  this.io.gnd = {
    'pin': 'gnd',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'GND'
  };
  this.io.vcc = {
    'pin': 'vcc',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'VCC'
  };
  this.io.analog0 = {
    'pin': '14',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog0'
  };
  this.io.analog1 = {
    'pin': '15',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog1'
  };
  this.io.analog2 = {
    'pin': '16',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog2'
  };
  this.io.analog3 = {
    'pin': '17',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog3'
  };
  this.io.analog4 = {
    'pin': '18',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog4'
  };
  this.io.analog5 = {
    'pin': '19',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog5'
  };

  // mapping of all digital pins
  this.io.digital = [this.io.pin0, this.io.pin1, this.io.pin2, this.io.pin3,
    this.io.pin4, this.io.pin5, this.io.pin6, this.io.pin7, this.io.pin8, this.io
    .pin9, this.io.pin10, this.io.pin11, this.io.pin12, this.io.pin13, this.io.analog0,
    this.io.analog1, this.io.analog2, this.io.analog3,
    this.io.analog4, this.io.analog5
  ];

  // mapping of all analog pins
  this.io.analog = [this.io.analog0, this.io.analog1, this.io.analog2, this.io.analog3,
    this.io.analog4, this.io.analog5
  ];
};

/**
  Actives the interrupts for the arduino
**/
arduino.uno.prototype.interrupts = function () {
  this.interrupts = true;
};

/**
  Deactives the interrupts for the arduino
**/
arduino.uno.prototype.noInterrupts = function () {
  this.interrupts = false;
};

arduino.uno.prototype.setStatus = function (status) {
  // only set valid status
  if (status !== undefined && (status === arduino.OFF || status === arduino.ON)) {
    this.status = status;
    this.digitalWrite(this.io.ledON, status); // LED control
  }
};

/**
    Returns value for given pin, should be used in callbacks and not as public
    arduino API
**/
arduino.uno.prototype._getPinValue = function (pin) {
  // is there a leading pin?
  if(pin.indexOf('pin') === 0) {
    pin = pin.replace(/pin/g, '');
  }

  var io_index = this._pin(pin);

  if(!io_index) {
    return null;
  }

  return this.io.digital[io_index].value; // current value for specified pin
};

/**
  Adds an eventlistener that will be triggered on pin writing changes
**/
arduino.uno.prototype.addonChange = function(callback) {
  if(callback)
    return this.actions.onChange.push(callback) -1; // return index
};

arduino.uno.prototype.onReset = function (callback) {
  this.actions.reset.addEventListener('click', callback, false);
};

arduino.uno.prototype.onOn = function (callback) {
  this.actions.on.addEventListener('click', callback, false);
};

/**
    interrupt:  die Nummer des Interrupts (int)
    function :  die Funktion, die aufgerufen wird, wenn ein Interrupt
                eintrifft; diese Funktion darf keine Parameter und auch keine
                Rückgaben enthalten.
    mode     :  definiert wann genau der Interrupt eingeleitet werden soll. Vier
                Konstanten sind bereits als zulässige Werte vordefiniert worden.

**/
arduino.uno.prototype.attachInterrupt = function (interrupt, func, mode) {
  var interrupt_object = {
    'func': func,
    'mode': mode
  };
  // handle case for int0 and int1
  if ('INT0' === interrupt.toUpperCase()) {
    this.int0 = interrupt_object;
  } else if ('INT1' === interrupt.toUpperCase()) {
    this.int1 = interrupt_object;
  }
};

arduino.uno.prototype.detachInterrupt = function (interrupt) {
  // handle case for int0 and int1
  if ('INT0' === interrupt.toUpperCase() || interrupt === 0) {
    this.int0 = undefined;
  } else if ('INT1' === interrupt.toUpperCase()  || interrupt === 1) {
    this.int1 = undefined;
  }
};

arduino.uno.prototype.pinMode = function (pin, mode) {
  if (!mode || !(mode === arduino.INPUT || mode === arduino.OUPUT ||
    arduino.INPUT_PULLUP)) {
    throw new Error('Unallowed mode: ' + mode); // return if no value specified
  }

  if (pin < 0 || pin > this.io.digital.length) {
    throw new Error('Cannot write to specified pin -> not existing.');
  }

  this.io.digital[pin].mode = mode;
};

arduino.uno.prototype._pin = function (pin) {
  // analog pins are mapped to 14-19 inside the io.digital array
  var _int = parseInt(pin);
  if(!isNaN(_int)) {
    pin = _int;
  }

  switch (pin) {
  case 0:
  case 1:
  case 2:
  case 3:
  case 4:
  case 5:
  case 6:
  case 7:
  case 8:
  case 9:
  case 10:
  case 11:
  case 12:
  case 13:
    return pin;
  case 14:
  case 'a0':
    return 14;
  case 15:
  case 'a1':
    return 15;
  case 'a2':
  case 16:
    return 16;
  case 'a3':
  case 17:
    return 17;
  case 'a4':
  case 18:
    return 18;
  case 'a5':
  case 19:
    return 19;
  default: return null;
  }
};

arduino.uno.prototype.digitalWrite = function (pin, value) {
  if (!(value === arduino.HIGH || value === arduino.LOW)) {
    throw new Error('Value is neither HIGH nor LOW.'); // return if no value specified
  }

  // get pin object
  var io;
  if(typeof pin === 'string' || typeof pin === 'number') {
    if (!isNaN(pin) && (pin < 0 || pin > this.io.digital.length)) {
      throw new Error('Cannot write to specified pin -> not existing.');
    }
    pin = this._pin(pin);
    io = this.io.digital[pin];
  } else if (pin.value !== undefined && pin.pinmode !== undefined){
    io = pin; // got pin object, value, mode, name
  } else {
    throw new Error('Cannot write to specified pin -> not existing.');
  }

  var old_value = io.value;

  // are we allowed to write?
  if(io.pinmode === arduino.OUTPUT) {
    io.value = value;

    // trigger callbacks
    if(old_value !== io.value) {
      var i;
      for(i = 0; i < this.actions.onChange.length; i++) {
        this.actions.onChange[i].call(undefined, io, pin);
      }
    }
  }
};

/**
    Not part of the original arduino function set, however needed to simulate
    external write operations on the pins and trigger interrupt routines
**/
arduino.uno.prototype.externalDigitalWrite = function (pin, value) {
  if (!(value === arduino.HIGH || value === arduino.LOW)) {
    throw new Error('Value is neither HIGH nor LOW.'); // return if no value specified
  }

  if (pin < 0 || pin > this.io.digital.length) {
    throw new Error('Cannot write to specified pin -> not existing.');
  }

  var io = this.io.digital[0];

  if (io.pinmode === arduino.OUTPUT) {
    throw new Error('Pinmode for pin: ' + pin + ' is set to OUTPUT.');
  }

  var that = this;
  var old_value = io.value;
  io.value = value; // set value

  // check mode
  var isChange = old_value != value;
  var isLow = value === arduino.LOW;
  var isHigh = value === arduino.HIGH;
  var isFalling = old_value === arduino.HIGH && value === arduino.LOW;
  var isRising = old_value === arduino.LOW && value === arduino.HIGH;

  // check if we need to trigger interrupt
  function triggerInterrupt(interrupt, change, low, high, falling, rising) {
    if (!interrupt) return;
    // check mode
    if ((interrupt.mode = arduino.CHANGE && change) || (interrupt.mode =
      arduino.LOW && low) || (interrupt.mode = arduino.HIGH && high) || (
      interrupt.mode = arduino.FALLING && falling) || (interrupt.mode =
      arduino.RISING && rising)) {

      // trigger it
      interrupt.func.call(that);
    }
  }

  if (this.interrupts) {
    triggerInterrupt(this.int0, change, low, high, falling, rising);
    triggerInterrupt(this.int1, change, low, high, falling, rising);
  }
};

/* end of arduino api */

var expect = require('chai').expect;
var sinon = require("sinon");

var index = require('../../../../../../lib/engine/flow/index');
var events = require('../../../../../../lib/engine/flow/events');
var node = require('../../../../../../lib/engine/flow/node');
var protocol = require('../../../../../../lib/protocol');

var DEFAULT_CONF = {
  driver: 'mock', 
  loglevel: 'WARN',
  serverIP: '192.168.100.1',
  socketServerPort: 8082,
  userKey: 'a2a9705fc33071cc212af979ad9e52d75bc096936fb28fe18d0a6b56067a6bf8',
  uuid: '76FA49A9-78D8-4AE5-82A3-EC960138E908',
  device: '',
  runtime: 'node',
};

var inId,inPort,inValue, outId,outPort,outValue;

function nodeOutputChanged(id, portName, value){
  outId = id;
  outPort = portName;
  outValue = value; 
}

function nodeInputChanged(id, portName, value){
  inId = id;
  inPort = portName;
  inValue = value; 
}

var motor1Cases = [
 {
    motor1: 1000,
    wantInPort: 'motor1',
    wantInValue: 1000
 },
 {
    motor1: 50,
    wantInPort: 'motor1',
    wantInValue: 50
 },
 {
    motor1: -150,
    wantInPort: 'motor1',
    wantInValue: -150
 }
];

var motor2Cases = [
 {
    motor2: 1000,
    wantInPort: 'motor2',
    wantInValue: 1000
 },
 {
    motor2: 50,
    wantInPort: 'motor2',
    wantInValue: 50
 },
 {
    motor2: -150,
    wantInPort: 'motor2',
    wantInValue: -150
 }
];

describe('DOUBLE_DC_MOTOR node', function(){
  var enine;
  var driver;
  var id;
  var _activeNodeCache;
  var client;

  before(function() {
    engine = index.create(DEFAULT_CONF);
    driver = engine.setDriver('mock'); 
    engine.on(events.NODEOUTPUT, nodeOutputChanged);
    engine.on(events.NODEINPUT, nodeInputChanged);
    driver._generate(protocol.serialize({
      no: 1, // block no
      type: 0x10,
      data: [{
        'BYTE': 0x62
      }, {
        'BYTE': 0x02
      }]
    }));
    _activeNodeCache = engine.getActiveNodeCache();
    for (var ID in _activeNodeCache){
      if (_activeNodeCache[ID].type === "DOUBLE_DC_MOTOR"){
        id = ID;
      }
    }
  });

  after(function() {
/*
    nodes = engine.getActiveNodes();
    for(var i = 0; i < nodes.length; i++){
      engine.removeNode(nodes[i].id);
    }
*/
    engine.removeListener(events.NODEOUTPUT, nodeOutputChanged);
    engine.removeListener(events.NODEINPUT, nodeInputChanged);
    engine.stop();
    engine = null;
  });

  it('When display changed, should report to app and send to block', function() {
    for (var i = 0; i < motor1Cases.length; i++){
      _activeNodeCache[id].updateInput('motor1',motor1Cases[i].motor1,true);
      expect(inId).to.be.eql(id);
      expect(inPort).to.be.eql(motor1Cases[i].wantInPort); 
      expect(inValue).to.be.eql(motor1Cases[i].wantInValue); 
   
      _activeNodeCache[id].updateInput('motor2',motor2Cases[i].motor2,true);
      expect(inId).to.be.eql(id);
      expect(inPort).to.be.eql(motor2Cases[i].wantInPort); 
      expect(inValue).to.be.eql(motor2Cases[i].wantInValue);       
    }
  });
});

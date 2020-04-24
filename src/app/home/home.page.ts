import { Component } from '@angular/core';

declare var ble: any;
const theDevice = {
    // tslint:disable: object-literal-key-quotes
    'id': '832ae7fe-d3c5-11e4-b9d6-1681e6b88ec1',
    'scan_id': '832ae7fe-d3c5-11e4-b9d6-1681e6b88ec1',
    'characteristics': {
      'message': '737bea54-d3c5-11e4-b9d6-1681e6b88ec1',
      'dataReady': '93c7a770-ddff-11e4-b9d6-1681e6b88ec1',
      'updateAppName': '93c7ab44-ddff-11e4-b9d6-1681e6b88ec1',
      'setName': '93c7ab44-ddff-11e4-b9d6-1681e6b88ec1',
      'heartbeat': 'c73f5580-91eb-11e5-8994-feff819cdc9f',
      'oemFilter':   'def98092-236d-11e6-b67b-9e71128cae77',
      'softwareRev': '66595ed6-be1a-11e5-9912-ba0be0483c18'
    }
};

// tslint:disable-next-line: no-var-keyword
var theInterval;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  peripherals: any[] = [];
  connectedDevice: any;
  connected: boolean;

  constructor() {
    this.connected = false;
  }

  startScan() {
    console.log('scan');
    const thisRef = this;
    this.peripherals = [];

    ble.scan([], 20, function(device) {
      console.log(JSON.stringify(device));
      thisRef.peripherals.push(device.id);
    },
    function(err) {
      console.error('error scanning');
    });
  }

  stopScan() {
    console.log('Stop Scan');
    ble.stopScan(
      function() { console.log("Scan complete"); },
      function() { console.log("stopScan failed"); }
  );
  }

  connect(device) {
    const thisRef = this;
    this.connectedDevice = device;
    this.connected = true;
    ble.connect(device,
      function(device) {
        console.log('Successfully connected');
        ble.startNotification(thisRef.connectedDevice, theDevice.id, theDevice.characteristics.heartbeat, function(data) {
          const a = new Uint8Array(data);
          console.log('Hb Callback$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ' + a[0]);
        }, function(err) {
          console.error('error heartbeat starting notification');
        });

        ble.startNotification(thisRef.connectedDevice, theDevice.id, theDevice.characteristics.dataReady, function(data) {
          const a = new Uint8Array(data);
          console.log('dataReady Callback ' + a[0]);
        }, function(err) {
          console.error('error heartbeat starting notification');
        });

        theInterval = setInterval(function() {
            console.log('write data');
            const data = new Uint8Array(17);
            data[0] = 39;
            data[1] = 1;
            data[2] = 1;
            data[3] = 0;
            data[4] = 0;
            data[5] = 11;
            data[6] = 0;
            data[7] = 0;
            data[8] = 0;
            data[9] = 0;
            data[10] = 0;
            data[11] = 0;
            data[12] = 0;
            data[13] = 0;
            data[14] = 0;
            data[15] = 0;
            data[16] = 0;
            ble.write(thisRef.connectedDevice, theDevice.id, theDevice.characteristics.message, data.buffer, function(data) {
              console.log('write Callback ' + data);
            }, function(err) {
              console.error('error heartbeat starting notification');
            });
         }, 1000);
      },
      function(err) {
        console.error('error connecting to device');
      });
  }

  disconnect() {
    console.log('disconnect');
    clearInterval(theInterval);
    this.connected = false;
    ble.disconnect(this.connectedDevice,
      function(device) {
        console.log('Successfully disconnected');
      },
      function(err) {
        console.error('error connecting to device');
      });
  }

  onError(reason) {
    console.log(reason);
  }
}

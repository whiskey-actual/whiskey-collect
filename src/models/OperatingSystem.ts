import { model, Schema } from "mongoose";

export interface OperatingSystem {
  osSourceLabel: string;
  osClass?: string;
  osVendor?: string;
  osPlatform?: string;
  osVersion?: string;
  osVariant?: string;
}

export const OperatingSystemSchema = new Schema({
  osSourceLabel: {type:String, required:true, index:true, id: true, unique: true},
  osClass: {type:String, index:true },
  osVendor: {type:String, index:true },
  osPlatform: {type:String, index:true },
  osVersion: {type:String, index:true },
  osVariant: {type:String, index:true },

}, {
  collection: 'OperatingSystem',
  timestamps: true,
  autoCreate: true,
})


// Virtuals
// DeviceSchema.virtual("type").get(function(this: Device) {
//   //return this.deviceType
// })

// Methods
// DeviceSchema.methods.getOperatingSystem = function(this: Device) {
//   //return this.operatingSystem
// }

// Document middlewares
OperatingSystemSchema.pre<OperatingSystem>("save", async function() {

  let tempString = this.osSourceLabel;

  if(this.osSourceLabel.match('/microsoft/i') || this.osSourceLabel.match('/windows/i')) {
    this.osVendor = "microsoft"
    this.osPlatform = "windows"
  }

  //now remove the matches
  tempString = tempString.replace('microsoft', '');
  tempString = tempString.replace('windows', '')
  tempString = tempString.trim();

  if(this.osSourceLabel.match('/server/i')) {
    this.osClass = "server"
  } else {
    this.osClass = "end-user device"
  }

  tempString = tempString.replace('server','')

  // prune objects
  // if(!this.observedByActiveDirectory) {delete this.observedByActiveDirectory}
  // if(!this.observedByAzure) {delete this.observedByAzure}
  // if(!this.observedByAzureMDM) {delete this.observedByAzureMDM}
  // if(!this.observedByCrowdstrike) {delete this.observedByCrowdstrike}

});

export default model('OperatingSystem', OperatingSystemSchema)

import { model, Schema } from "mongoose";

export interface operatingSystem {
  osString: string;
  osClass: string|undefined;
  osVendor: string|undefined;
  osPlatform: string|undefined;
  osVersion: string|undefined;
  osVariant: string|undefined;
}

export const operatingSystemSchema = new Schema({
  osString: {type:String, required:true, index:true, id: true, unique: true},
  osClass: {type:Date, default:new Date()},
  osVendor: {type:Date, default:new Date(), required:true },
  osPlatform: {type:Boolean, default:false, required:true, index:true, },
  osVersion: {type:String, required:true, index:true, default: 'UNKNOWN'},
  osVariant: {type:String, required:true, index:true, default: 'UNKNOWN'},

}, {
  collection: 'operatingSystems',
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
operatingSystemSchema.pre<operatingSystem>("save", async function() {

  let tempString = this.osString;

  if(this.osString.match('/microsoft/i') || this.osString.match('/windows/i')) {
    this.osVendor = "microsoft"
    this.osPlatform = "windows"
  }

  //now remove the matches
  tempString = tempString.replace('microsoft', '');
  tempString = tempString.replace('windows', '')
  tempString = tempString.trim();

  if(this.osString.match('/server/i')) {
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

export default model('operatingSystem', operatingSystemSchema)

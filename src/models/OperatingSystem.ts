import { LogEngine } from 'whiskey-log';
import { getUnifiedObject } from "../components/getUnifiedObject";


import mongoose, { model, Schema } from "mongoose";

export class OperatingSystem {

  constructor(le:LogEngine, operatingSystemLabel:string) {

    this._le = le
    this._osSourceLabel = operatingSystemLabel

    let tempLabel:string = operatingSystemLabel

      if(tempLabel.match('/microsoft/gi') || tempLabel.match('/windows/gi')) {
          this._osVendor = "Microsoft"
          this._osPlatform = "Windows"
        }

        //now remove the matches
        tempLabel = tempLabel.replace('microsoft', '');
        tempLabel = tempLabel.replace('windows', '')
        tempLabel = tempLabel.trim();

        if(tempLabel.match('/server/gi')) {
          this._osClass = "Server"
        } else {
          this._osClass = "End-user device"
        }

        tempLabel = tempLabel.replace('server','')

        this._osLabelRemainder = tempLabel
        
  }

  private _le:LogEngine = new LogEngine([])
  private _osSourceLabel:string = ''
  private _osVendor:string = ''
  private _osPlatform:string = ''
  private _osClass:string = ''
  private _osLabelRemainder:string = ''
  private _osVersion:string = ''
  private _osVariant:string = ''

  public async saveOperatingSystem():Promise<void> {

    this._le.logStack.push('saveOperatingSystem')

    try {

      let o:OperatingSystem.OperatingSystemInterface = {
        osSourceLabel: this._osSourceLabel,
        osVendor: this._osVendor,
        osPlatform: this._osPlatform,
        osVersion: this._osVersion,
        osVariant: this._osVariant,
        osClass: this._osClass,
        osLabelReminder: this._osLabelRemainder
      }

      const unifiedObject:any = await getUnifiedObject(this._le, 'OperatingSystem', 'osSourceLabel', this._osSourceLabel, o, []);

      const os = await mongoose.model('OperatingSystem').findByIdAndUpdate(
        { osSourceLabel: o.osSourceLabel },
        { $set: unifiedObject},
        {
          new: true,
          upsert: true
        }
      );

      console.debug(os);

    } catch(err:any) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, err)
      throw(err)
    } finally {
      this._le.logStack.pop();
    }

    return new Promise<void>((resolve) => {resolve()})

  }
}


export namespace OperatingSystem {

  export interface OperatingSystemInterface {
    osSourceLabel: string;
    osClass: string;
    osVendor: string;
    osPlatform: string;
    osVersion: string;
    osVariant: string;
    osLabelReminder: string;
  }

  export const OperatingSystemSchema = new Schema({
    osSourceLabel: {type:String, required:true, index:true, id: true, unique: true},
    osClass: {type:String, index:true },
    osVendor: {type:String, index:true },
    osPlatform: {type:String, index:true },
    osVersion: {type:String, index:true },
    osVariant: {type:String, index:true },

  }, {
    collection: 'operatingSystems',
    timestamps: true,
    autoCreate: true,
  })

  export const OperatingSystemModel = model('OperatingSystem', OperatingSystemSchema)


  // Virtuals
  // DeviceSchema.virtual("type").get(function(this: Device) {
  //   //return this.deviceType
  // })

  // Methods
  // DeviceSchema.methods.getOperatingSystem = function(this: Device) {
  //   //return this.operatingSystem
  // }

  // Document middlewares
  // OperatingSystemSchema.pre<OperatingSystem>("updateOne", async function() {

  //   let tempString = this.osSourceLabel;

  //   if(!tempString===undefined) {

  //     if(tempString.match('/microsoft/i') || tempString.match('/windows/i')) {
  //       this.osVendor = "microsoft"
  //       this.osPlatform = "windows"
  //     }
    
  //     //now remove the matches
  //     tempString = tempString.replace('microsoft', '');
  //     tempString = tempString.replace('windows', '')
  //     tempString = tempString.trim();
    
  //     if(this.osSourceLabel.match('/server/i')) {
  //       this.osClass = "server"
  //     } else {
  //       this.osClass = "end-user device"
  //     }
    
  //     tempString = tempString.replace('server','')
    

  //   }


  //   // prune objects
  //   // if(!this.observedByActiveDirectory) {delete this.observedByActiveDirectory}
  //   // if(!this.observedByAzure) {delete this.observedByAzure}
  //   // if(!this.observedByAzureMDM) {delete this.observedByAzureMDM}
  //   // if(!this.observedByCrowdstrike) {delete this.observedByCrowdstrike}

  // });

  

}

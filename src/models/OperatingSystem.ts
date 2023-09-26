import { Utilities } from 'whiskey-util'
import { model, Schema } from "mongoose";


  export interface OperatingSystem {
    osLabel: string;
  }

  export const OperatingSystemSchema = new Schema({
    osLabel: {type:String, required:true, index:true, id: true, unique: true},
    osClass: {type:String, index:true },
    osVendor: {type:String, index:true },
    osPlatform: {type:String, index:true },
    osVersion: {type:String, index:true },
    osVariant: {type:String, index:true },
    osLabelRemainder: {type:String, index:true}
  }, {
    collection: 'operatingSystems',
    timestamps: true,
    autoCreate: true,
    virtuals: {
      osLabel: {
        async set(v) {
          // `v` is the value being set, so use the value to set
          // `firstName` and `lastName`.{
          let tempLabel:string = this.osLabel

          if(Utilities.doesRegexMatch(tempLabel, ['/microsoft/gi','/windows/gi'])) {
            this.set({ osVendor: 'Microsoft', osPlatform: 'Windows'});
          }

          //now remove the matches
          tempLabel = tempLabel.replace('microsoft', '');
          tempLabel = tempLabel.replace('windows', '')
          tempLabel = tempLabel.trim();

          if(Utilities.doesRegexMatch(tempLabel, ['/server/gi'])) {
            this.set({osClass: "Server"})
          } else {
            this.set({osClass: "End-user device"})
          }

          tempLabel = tempLabel.replace('server','')

          this.set({osLabelRemainder: tempLabel})

        }
      }
    },
    methods: {
      async saveOS() {
        await model('OperatingSystem').updateOne(
          { osLabel: this.osLabel },
          {
            $set: this
          },
          {
            new: true,
            upsert: true
          }
        );
      }
    }
  });



  export const OperatingSystem = model('OperatingSystem', OperatingSystemSchema)
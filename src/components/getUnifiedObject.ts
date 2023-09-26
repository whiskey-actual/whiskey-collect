import { LogEngine } from 'whiskey-log';
import mongoose from "mongoose";

export async function getUnifiedObject(le:LogEngine, modelName:string, identityKey:string, identityValue:string, incomingObject:any, immutableKeys:string[]=[]):Promise<any> {

    le.logStack.push("getUnifiedObject");

    le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Note, `model=${modelName}, identityKey=${identityKey}, identityValue=${identityValue}`)

    // first, get the existing object, if it exists.
    const existingRecord = await mongoose.model(modelName).findOne({[identityKey]: identityValue})

    let unifiedObject:any
    if(existingRecord) {
      unifiedObject=existingRecord._doc;
      const unifiedObjectKeys = Object.keys(unifiedObject)

      // now, iterate throught the incoming keys & compare to the already-existing object.
      let incomingObjectKeys = Object.keys(incomingObject);
      
      // iterate through the keys ..
      for(let i=0;i<incomingObjectKeys.length;i++) {

        const objectKey = incomingObjectKeys[i]

        // does this key already exist for the existing object?
        if(unifiedObjectKeys.includes(objectKey)) {

          // if the key is different, log it and update the value (but dont change immutable values)
          if(unifiedObject[objectKey]!==incomingObject[objectKey] && !immutableKeys.includes(objectKey)) {
            le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Change, `${unifiedObject[identityKey]}.${objectKey}: ${unifiedObject[objectKey]} -> ${incomingObject[objectKey]}`)
            unifiedObject[objectKey] = incomingObject[objectKey]
          } else {
            le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Success, `${unifiedObject[identityKey]}.${objectKey}: ${incomingObject[objectKey]}`)
          }
        } else {
          // is the key value undefined?
          if(unifiedObject[objectKey]!=undefined) {
            unifiedObject[objectKey] = incomingObject[objectKey];
            le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Add, `${unifiedObject[identityKey]}.${objectKey}: ${unifiedObject[objectKey]}`)
          }
        }
      }
    } else {
      unifiedObject=incomingObject;
      le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Add, `${unifiedObject.deviceName}`)
    }

    le.logStack.pop();
    return new Promise<any>((resolve) => {resolve(unifiedObject)})

  }
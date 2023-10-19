import { Device } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export class DeviceProcessor {

    public static async persistDevice(deviceName:string, dataObject:any) {

        console.debug("persistDevice()")

        const p = new PrismaClient()

        const oldDevice = await p.device.findUnique({where: {name:deviceName}})

        // if we have an already existing device, find which fields need updating ..
        if(oldDevice) {
        
            let updateObject:any = {}

            // iterate through keys

            const oldKeys = Object.keys(oldDevice)
            const oldValues = Object.values(oldDevice)

            const newKeys = Object.keys(dataObject)
            const newValues = Object.values(dataObject)

            for(let j=0; j<oldKeys.length; j++) {
                for(let k=0; k<newKeys.length; k++) {
                    if(oldKeys[j]===newKeys[k]) {
                        // these are the same keys, compare the values
                        if(oldValues[j]!==newValues[k]) {
                        updateObject[newKeys[k]]=newValues[k]
                        }
                    }
                }
            }

            console.debug(updateObject)

            await p.device.update({
                data: updateObject,
                where: {
                name: deviceName
                }
            })

        } else {
        await p.device.create({
            data: dataObject
        })
        }

    }

}


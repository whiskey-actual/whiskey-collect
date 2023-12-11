import { LogEngine } from "whiskey-log"
import { PageIteratorCallback, PageCollection, PageIterator } from "@microsoft/microsoft-graph-client"
import { Client } from "@microsoft/microsoft-graph-client"

export async function callAPI(le:LogEngine, graphClient:Client, apiEndpoint:string, selectFields:string[]=[]):Promise<any> {
    le.logStack.push('callAPI')
    var output:any = []
   
    try {

      le.AddLogEntry(LogEngine.EntryType.Info, `.. calling API endpoint ${apiEndpoint} ..`)

      const gc = graphClient.api(apiEndpoint)
      if(selectFields.length>0) {
        gc.select(selectFields.join(","))
      }

      const callback:PageIteratorCallback = (item:any) => {
        //console.debug(item)
        output.push(item)
        return true;
      }

      const response:PageCollection = await gc.get()

      const pageIterator = new PageIterator(graphClient, response, callback)

      await pageIterator.iterate();
      
    } catch (err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err)
    } finally {
      le.logStack.pop()
    }
   
    return new Promise<any>((resolve) => {resolve(output)})

  }
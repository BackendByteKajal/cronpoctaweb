const NodeCache = require("node-cache");
const myCache = new NodeCache();

export class NodeCaching{
    public static set(token:string,data:any){
        myCache.set(token,data);
    }

    public static get(token:string){
        const cacheToken = myCache.get(token);
        return cacheToken;
    }
    
    public static hasToken(token:string){
       return myCache.has(token);
    }
}
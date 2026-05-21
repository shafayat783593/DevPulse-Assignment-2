import type { Ruser } from "./types";


declare global {
    namespace Express{
        interface Request{
            user: Ruser & {id:number}
        }
    }
}
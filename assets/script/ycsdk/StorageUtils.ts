import { sys } from "cc";

export class StorageUtils{


        static setStringData(key: string, value: string): void {
            if (key == "" || value == "") return;
            if (typeof value != "string") value = JSON.stringify(value);
            sys.localStorage.setItem(key, value);
        }
       
        static getStringData(key: string): string {
            let value = sys.localStorage.getItem(key);
            if (value == "" || value == undefined || value == null) value = "";
            return value;
        }

        static setBooleanData(key: string, value: boolean): void {
            sys.localStorage.setItem(key, value.toString());
        }
       
        static getBooleanData(key: string): boolean {
            let value = sys.localStorage.getItem(key);
            if (value == "" || value == undefined || value == null) return false;
            if (value == "true") return true;
            if (value == "false") return false;
            return false;
        }
}
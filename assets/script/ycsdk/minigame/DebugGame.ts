import { GameInterface } from "../GameInterface";
import { BannerType } from "./BannerType";
import { InterstitialType } from "./InterstitialType";
import { PrivacyListener } from "./PrivacyListener";

export class DebugGame implements GameInterface {

    init(callBack?): void {
        console.log("debug init")
        callBack && callBack()
    }

    showPolicy(node: string, callBack: PrivacyListener): void {
        console.log("bubug call show policy")
    }

    login(callBack?: Function): void {
        console.log("debug call login")
    }

    pay(params: string, callBack: Function): void {
        console.log("bubug call pay")
    }

    showBanner(position: BannerType): void {
        console.log("bubug call show banner")
    }

    hideBanner(): void {
        console.log("bubug call hide banner")
    }

    showInters(type: InterstitialType): void {
        console.log("debug call show interstitial ad type:", type)
    }

    hideInters(type: InterstitialType): void {
        console.log("bubug call hide interstitial")
    }

    showVideo(callBack: Function): boolean {
        console.log("call debug show video ad")
        callBack && callBack(true)
        return true
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        console.log("bubug call custom function name:", methodName)
    }

}
import { GameInterface } from "../../GameInterface";
import { BannerType } from "../../minigame/BannerType";
import { InterstitialType } from "../../minigame/InterstitialType";

export class AndroidGame implements GameInterface {

    className = 'com/ycsdk/cocos/GameBridge'

    init(callBack?: any): void {
        this.login()
    }

    login(callBack?: Function): void {
        jsb.reflection.callStaticMethod(this.className, 'login', '()V')
    }

    pay(params: string, callBack: Function): void {

    }

    showBanner(position: BannerType): void {
        jsb.reflection.callStaticMethod(this.className, 'showBanner', '()V')
    }

    hideBanner(): void {
        jsb.reflection.callStaticMethod(this.className, 'hideBanner', '()V')
    }

    showInters(type: InterstitialType): void {
        jsb.reflection.callStaticMethod(this.className, 'showInters', '()V')
    }

    hideInters(type: InterstitialType): void {
        jsb.reflection.callStaticMethod(this.className, 'hideInters', '()V')
    }

    showVideo(callBack: Function): boolean {
        let videoCallBack = function (res) {
            console.log('on video call back:', res)
            if (res) {
                callBack && callBack(true)
            } else {
                callBack && callBack(false)
            }
        }
        window['videoCallBack'] = videoCallBack
        jsb.reflection.callStaticMethod(this.className, 'showVideo', '()V')
        return false
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        jsb.reflection.callStaticMethod(this.className, 'customFunc', '(Ljava/lang/String;Ljava/lang/String;)V', methodName, params)
    }

}
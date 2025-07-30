import { instantiate, Node, Prefab, resources } from "cc";
import { GameInterface } from "../GameInterface";
import { BannerType } from "./BannerType";
import { InterstitialType } from "./InterstitialType";
import { PrivacyListener } from "./PrivacyListener";
import { StorageUtils } from "../StorageUtils";
import { PrivacyEvent } from "./PrivacyEvent";
import { YCSDK } from "../YCSDK";

export class DebugGame implements GameInterface {
    private privacyKey: string = "PRIVACY"

    init(callBack?): void {
        console.log("debug init")
        callBack && callBack()
    }

    showPolicy(node: Node, callBack: PrivacyListener): void {
        let agree = StorageUtils.getStringData(this.privacyKey)
        console.log(agree)
        if (agree == 'agree') {
            console.log("user agree privacy, not show")
            callBack.userAgree && callBack.userAgree()
            return
        }
        if (!node) {
            console.log("node is null")
            callBack.nodeError && callBack.nodeError()
            return
        }
        resources.load('Privacy/policyUI', Prefab, (err, prefab) => {
            if (err) {
                console.error('加载隐私政策Prefab失败:', err)
                return
            }
            const yinsiUI = instantiate(prefab)
            const content = yinsiUI.getChildByName('panel').getChildByName('content')
            if (!content.getComponent(PrivacyEvent)) {
                content.addComponent(PrivacyEvent)
            }
            const agree = yinsiUI.getChildByName('panel').getChildByName('agree')
            agree.on(Node.EventType.TOUCH_END, () => {
                callBack.onAgree && callBack.onAgree()
                StorageUtils.setStringData(this.privacyKey, "agree")
                yinsiUI.active = false
            }, this)
            const disagree = yinsiUI.getChildByName('panel').getChildByName('disagree')
            disagree.on(Node.EventType.TOUCH_END, () => {
                callBack.onDisAgree && callBack.onDisAgree()
                yinsiUI.active = false
            }, this)
            YCSDK.ins.getGameNode().addChild(yinsiUI)
        })
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
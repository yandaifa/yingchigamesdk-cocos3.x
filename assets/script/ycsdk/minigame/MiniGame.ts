import { instantiate, Node, Prefab, resources, sys } from "cc";
import { AdTactics } from "../AdTactics";
import { GameInterface } from "../GameInterface";
import { sdkconfig } from "../SDKConfig";
import { YCSDK } from "../YCSDK";
import { BannerType } from "./BannerType";
import { DouYinGame } from "./douyin/DouYinGame";
import HttpRequest from "./HttpRequest";
import { HuaWeiGame } from "./huawei/HuaWeiGame";
import { InterstitialType } from "./InterstitialType";
import { KuaiShouGame } from "./kuaishou/KuaiShouGame";
import { OppoGame } from "./oppo/OppoGame";
import { VivoGame } from "./vivo/VivoGame";
import { XiaoMiGame } from "./xiaomi/XiaoMiGame";
import { WeChatGame } from "./wechat/WeChatGame";
import { Md5 } from "./md5";
import { PrivacyListener } from "./PrivacyListener";
import { StorageUtils } from "../StorageUtils";
import { PrivacyEvent } from "./PrivacyEvent";

export class MiniGame implements GameInterface {

    private channel: GameInterface
    private privacyKey: string = "PRIVACY"

    constructor(platform) {
        this.channelFactory(platform)
    }

    private channelFactory(platform) {
        console.log("switch platform:", platform)
        switch (platform) {
            case sys.Platform.HUAWEI_QUICK_GAME:
                this.channel = new HuaWeiGame()
                break
            case sys.Platform.XIAOMI_QUICK_GAME:
                this.channel = new XiaoMiGame()
                break
            case sys.Platform.OPPO_MINI_GAME:
                this.channel = new OppoGame()
                break
            case sys.Platform.VIVO_MINI_GAME:
                this.channel = new VivoGame()
                break
            case sys.Platform.BYTEDANCE_MINI_GAME:
                this.channel = new DouYinGame()
                break
            case sys.Platform.WECHAT_GAME:
                this.channel = new WeChatGame()
                break
            default:
                break
        }
    }

    jsonToKeyValue(json: Record<string, any>): string {
        return Object.entries(json)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    }

    init(callBack?): void {
        if (!YCSDK.ins.isRun(sys.Platform.OPPO_MINI_GAME)) {
            this.setAdStateListener()
            this.channel.init(callBack)
            return
        }
        const url = "https://iaa.rhino-times.com/api/game/query-match-config"
        const data = { pkgName: sdkconfig.pkgName, version: sdkconfig.version }
        const sign = Md5.hashStr(this.jsonToKeyValue(data))
        data["sign"] = sign
        HttpRequest.get().requestPostjson(url, data, (success, result) => {
            if (!success || !result) {
                this.setAdStateListener()
                this.channel.init(callBack)
                return
            }
            const res = result.oexts
            sdkconfig.open = result.open
            sdkconfig.ratio = res.ratio
            sdkconfig.subornUserTest = res.subornUserTest
            this.setAdStateListener()
            this.channel.init(callBack)
        })
    }

    setAdStateListener() {
        const st = new AdTactics()
        st.refreshAll()
        YCSDK.ins.setAdStateListener(st)
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
        this.channel.login(callBack)
    }

    pay(params: string, callBack): void {
        this.channel.pay(params, callBack)
    }

    showBanner(position: BannerType): void {
        if (!sdkconfig.open) {
            console.log("广告未开启")
            return
        }
        this.channel.showBanner(position)
    }

    hideBanner(): void {
        this.channel.hideBanner()
    }

    showInters(type: InterstitialType): void {
        if (!sdkconfig.open) {
            console.log("广告未开启")
            return
        }
        this.channel.showInters(type)
    }

    hideInters(type: InterstitialType = InterstitialType.Native): void {
        this.channel.hideInters(type)
    }

    showVideo(callBack: Function): boolean {
        if (!sdkconfig.open) {
            console.log("广告未开启")
            callBack && callBack(true)//不影响正常游玩，下发奖励
            return false
        }
        return this.channel.showVideo(callBack)
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        if (!sdkconfig.open) {
            console.log("广告未开启")
            return
        }
        this.channel.customFunc(methodName, params, callBack)
    }
}

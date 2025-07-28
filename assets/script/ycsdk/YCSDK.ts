import { sys, Node, resources, Prefab, instantiate, view } from "cc"
import { AdState } from "./AdState"
import { AdType } from "./AdType"
import { GameInterface } from "./GameInterface"
import { BannerType } from "./minigame/BannerType.js"
import { DebugGame } from "./minigame/DebugGame"
import { InterstitialType } from "./minigame/InterstitialType"
import { MiniGame } from "./minigame/MiniGame"
import { PayParams } from "./minigame/PayParams"
import { PrivacyListener } from "./minigame/PrivacyListener"
import { Config, sdkconfig } from "./SDKConfig"
import { StorageUtils } from "./StorageUtils"
import { PrivacyEvent } from "./minigame/PrivacyEvent"
import { AndroidGame } from "./nativegame/anroid/AndroidGame"

export class YCSDK {

    private static instance: YCSDK
    private platform: GameInterface
    private states: Array<AdState> = []
    private suportPlatfrom = [sys.Platform.HUAWEI_QUICK_GAME, sys.Platform.XIAOMI_QUICK_GAME, sys.Platform.OPPO_MINI_GAME, sys.Platform.VIVO_MINI_GAME, sys.Platform.BYTEDANCE_MINI_GAME, sys.Platform.WECHAT_GAME]
    private privacyKey: string = "PRIVACY"
    private gameNode: Node

    private constructor() {
        this.createPlatform()
    }

    public static get ins(): YCSDK {
        if (!YCSDK.instance) {
            YCSDK.instance = new YCSDK()
        }
        return YCSDK.instance
    }

    private createPlatform(): void {
        let platform = sys.platform
        console.log("current platform:", platform)
        if (platform == sys.Platform.ANDROID) {
            this.platform = new AndroidGame()
            return
        }
        if (this.isSupportMiniGame(platform)) {
            this.platform = new MiniGame(platform)
            return
        }
        console.log("ycsdk暂不支持该小游戏平台,以调试模式运行")
        this.platform = new DebugGame()
    }

    isSupportMiniGame(platform) {
        return this.suportPlatfrom.includes(platform)
    }

    isRun(platform): boolean {
        return sys.platform == platform;
    }

    init(config: Config, callBack?: Function) {
        console.log("ycsdk init")
        if (!config) {
            console.log("ycsdk init fail, config is null")
            callBack && callBack()
            return
        }
        sdkconfig.pkgName = config.pkgName
        sdkconfig.bannerId = config.bannerId
        sdkconfig.intersId = config.intersId
        sdkconfig.nativeId = config.nativeId
        sdkconfig.videoId = config.videoId
        sdkconfig.nativeBannerId = config.nativeBannerId
        this.platform.init(callBack)
    }

    agreePrivacy(): boolean {
        return StorageUtils.getStringData(this.privacyKey) == 'agree'
    }

    showPolicy(node: Node, callBack: PrivacyListener): void {
        console.log("ycsdk showPolicy")
        if (this.isRun(sys.Platform.ANDROID)) {
            return
        }
        this.gameNode = node
        let agree = StorageUtils.getStringData(this.privacyKey)
        console.log(agree)
        if (agree == 'agree') {
            console.log("user agree privacy, not show")
            callBack && callBack.userAgree()
            return
        }
        if (!node) {
            console.log("node is null")
            callBack && callBack.nodeError()
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
        console.log("ycsdk login")
        this.platform.login(callBack)
    }

    pay(params: PayParams, callBack: Function): void {
        this.platform.pay(params.toJSonString(), callBack)
    }

    showBanner(position: BannerType = BannerType.Bottom): void {
        console.log("ycsdk show banner, type:", position)
        this.platform.showBanner(position)
    }

    hideBanner(): void {
        this.platform.hideBanner()
    }

    random(max: number): number {
        max = Math.floor(max)
        return Math.floor(Math.random() * max) + 1
    }

    showInters(type: InterstitialType = InterstitialType.Initial): void {
        console.log("ycsdk show interstitial, type:", type)
        if (type) {
            this.platform.showInters(type)
            return
        }
        this.platform.showInters(type)
    }

    hideInters(type: InterstitialType = InterstitialType.Native): void {
        this.platform.hideInters(type)
    }

    showVideo(callback: Function): boolean {
        console.log("ycsdk show video")
        return this.platform.showVideo(callback)
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        this.platform.customFunc(methodName, params, callBack)
    }

    setAdStateListener(state: AdState) {
        if (this.states.includes(state)) {
            console.log("setAdStateListener interface is called")
            return
        }
        this.states.push(state)
    }
    vertical(): boolean {
        let winSize = view.getDesignResolutionSize()
        console.log('vertical:', winSize.height > winSize.width)
        return winSize.height > winSize.width
    }

    setGameNode(node: Node) {
        this.gameNode = node
    }

    getGameNode(): Node {
        return this.gameNode
    }

    onLoad(type: AdType) {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onLoad(type)
        })
    }

    onError(type: AdType, callback?: Function) {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onError(type, callback)
        })
    }

    onShow(type: AdType) {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onShow(type)
        })
    }

    onClick(type: AdType) {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onClick(type)
        })
    }

    onClose(type: AdType) {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onClose(type)
        })
    }

    onReward() {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onReward()
        })
    }
}
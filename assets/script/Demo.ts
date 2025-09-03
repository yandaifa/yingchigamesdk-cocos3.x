import { _decorator, Component, Node } from 'cc';
import { YCSDK } from './ycsdk/YCSDK';
import { Config } from './ycsdk/SDKConfig';
import { SubornVideoConfig } from './ycsdk/minigame/SubornVideoConfig';
import { BannerType } from './ycsdk/minigame/BannerType';
import { InterstitialType } from './ycsdk/minigame/InterstitialType';
const { ccclass, property } = _decorator;

@ccclass('Demo')
export class Demo extends Component {

    init() {
        let params: Config = {
            pkgName: "com.tlx.wddzz.nearme.gamecenter",
            appId: "",
            bannerId: ["2913720", "2913716", "2913711", "2913706", "2913702"],
            videoId: ["2913725", "2913730", "2913745", "2913750", "2913755"],
            nativeId: ["2913818", "2913813", "2913809", "2913804", "2913799"],
            nativeBannerId: ["2913762", "2913763", "2913765", "2913770", "2913775"]
        }
        let adconfig: SubornVideoConfig = {
            count: 4
        }
        YCSDK.ins.init(params, () => {
            console.log('ycsdk init finish')
        }, adconfig)
    }

    login() {
        YCSDK.ins.login(() => {
            console.log('ycsdk login result')
        })
    }

    showPrivacy() {
        YCSDK.ins.showPolicy(this.node, {
            userAgree: () => {
                //已经同意过隐私政策
                console.log("userAgree")
            },
            nodeError() {
                //传入的节点错误，隐私政策弹窗依赖游戏节点
                console.log("nodeError")
            },
            onAgree: () => {
                //同意隐私政策，继续游戏
                console.log("onAgree")
            },
            onDisAgree() {
                //不同意隐私政策，退出游戏
                console.log("onDisAgree")
            }
        })
    }

    showBanner() {
        YCSDK.ins.showBanner(BannerType.Native)
    }

    hideBanner() {
        YCSDK.ins.hideBanner()
    }

    showInters() {
        YCSDK.ins.showInters(InterstitialType.Native)
    }

    hideInters() {
        YCSDK.ins.showInters()
    }

    showVideo() {
        YCSDK.ins.showVideo((res) => {
            if (res) {
                console.log('show video suc, send reward')
            }
        })
    }
}


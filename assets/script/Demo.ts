import { _decorator, Component, Node } from 'cc';
import { YCSDK } from './ycsdk/YCSDK';
import { Config } from './ycsdk/SDKConfig';
const { ccclass, property } = _decorator;

@ccclass('Demo')
export class Demo extends Component {

    init() {
        let param: Config = {
            pkgName: "",
            appId: "",
            bannerId: [],
            intersId: [],
            videoId: ["111", "222", "333"],
            nativeId: [],
        }
        YCSDK.ins.init(param, () => {
            console.log('ycsdk init finish')
        })
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
        YCSDK.ins.showBanner()
    }

    hideBanner() {
        YCSDK.ins.hideBanner()
    }

    showInters() {
        YCSDK.ins.showInters()
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


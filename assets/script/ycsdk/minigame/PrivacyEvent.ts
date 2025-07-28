import { Component, instantiate, Prefab, resources, Node, sys } from "cc"
import { YCSDK } from "../YCSDK"

export class PrivacyEvent extends Component {

    private yinsiUI: Node

    onLoad(): void {
        resources.load('Privacy/yinsiUI', Prefab, (err, prefab: Prefab) => {
            if (err) {
                console.error('加载Prefab失败:', err)
                return
            }
            this.yinsiUI = instantiate(prefab)
            const close = this.yinsiUI.getChildByName('window').getChildByName('closeBtn')
            close.on(Node.EventType.TOUCH_END, () => {
                this.yinsiUI.active = false
            }, this)
            YCSDK.ins.getGameNode().addChild(this.yinsiUI)
            console.log('on PrivacyEvent add')
        })
    }

    openPrivacyPolicy(event) {
        console.log("点击隐私政策")
        if (YCSDK.ins.isRun(sys.Platform.HUAWEI_QUICK_GAME)) {
            this.hwOpen()
            return
        }
        this.open()
    }

    hwOpen() {
        const qg = window['qg']
        if (!qg) {
            console.log('qg is null')
            return
        }
        qg.openDeeplink({
            uri: 'https://ds.rhino-times.com/tl/docs/m_privateprotocol.html'
        })
    }

    open() {
        this.yinsiUI.active = true
    }
}
import { AdType } from "../../AdType"
import { GameInterface } from "../../GameInterface"
import { sdkconfig } from "../../SDKConfig"
import { YCSDK } from "../../YCSDK"
import { SubornVideoConfig } from "../SubornVideoConfig"
import { BannerType } from "../BannerType"
import { InterstitialType } from "../InterstitialType"
import { SubornNativeConfig } from "../SubornNativeConfig"

export class OppoGame implements GameInterface {

    private qg = window['qg']
    private bannerAd
    private nativeAd
    private count: number = 0

    constructor() {
        console.log("current channel is oppo")
    }

    init(callback?: Function, adconfig?: SubornVideoConfig, config?: SubornNativeConfig): void {
        if (sdkconfig.subornUserTest) {
            sdkconfig.subornUser = true
            this.configVideo(adconfig)
            this.configNative(config)
            callback && callback()
            return
        }
        let info = this.qg.getEnterOptionsSync()
        console.log("oppo init: ", info)
        if (info) {
            let type = info.type
            let query = info.query
            let referrerInfo = info.referrerInfo
            if (query && query.key1 && query.key2) {
                sdkconfig.subornUser = true
                this.configVideo(adconfig)
                this.configNative(config)
            }
        }
        callback && callback()
    }

    configNative(config?: SubornNativeConfig) {
        if (!config.switch) {
            return
        }
        if (config.loop > 0) {
            setInterval(() => {
                this.showInters(config.type == 0 ? InterstitialType.Initial : InterstitialType.Native)
            }, config.loop * 1000)
        }
    }

    configVideo(adconfig: SubornVideoConfig): void {
        if (!adconfig.switch) {
            return
        }
        if (adconfig.delay > 0) {
            setTimeout(() => {
                this.loadVideoAdNoCallBack(adconfig.count)
            }, adconfig.delay * 1000)
            return
        }
        this.loadVideoAdNoCallBack(adconfig.count)
    }

    login(callBack?: Function): void {

    }

    pay(params: string, callBack: Function): void {

    }

    showBanner(position: BannerType = BannerType.Bottom): void {
        if (!sdkconfig.ycBannerId) {
            console.log('banner广告参数没有配置')
            return
        }
        this.hideBanner()
        // if (sdkconfig.subornUser) {
        //     this.showBigPicAd()
        //     return
        // }
        this.createBannerAd(position)
    }

    createBannerAd(position: BannerType) {
        // let params = { adUnitId: sdkconfig.ycBannerId, style: position == BannerType.Top ? { top: 0, left: 0 } : {} }
        if (this.bannerAd) {
            this.bannerAd.destroy()
            this.bannerAd = null
        }
        this.bannerAd = this.qg.createBannerAd({ adUnitId: sdkconfig.ycBannerId })
        this.bannerAd.onResize((obj) => {
            console.log("banner 宽度：" + obj.width + ", banner 高度：" + obj.height)
        })
        this.bannerAd.onLoad(() => {
            console.log('[Banner广告] 广告加载成功')
            YCSDK.ins.onLoad(AdType.Banner)
            YCSDK.ins.onShow(AdType.Banner)
        })
        this.bannerAd.onHide(() => {
            console.log("banner广告隐藏")
            YCSDK.ins.onClose(AdType.Banner)
            if (this.bannerAd) {
                this.bannerAd.destroy()
                this.bannerAd = null
            }
        })
        this.bannerAd.onError(err => {
            console.log("banner错误监听: ", JSON.stringify(err))
            if (this.bannerAd) {
                this.bannerAd.destroy()
                this.bannerAd = null
            }
            YCSDK.ins.onError(AdType.Banner)
        })
        this.bannerAd.onClick(obj => {
            console.log(`开启Banner广告点击回调: code: ${obj.code},msg: '${obj.msg}'`)
        })
        this.bannerAd.show()
    }

    hideBanner(): void {
        console.log("oppo hide banner")
        if (this.bannerAd) {
            this.bannerAd.hide()
        }
    }

    showInters(type: InterstitialType = InterstitialType.Initial): void {
        if (!type) {
            this.showInitialType()
            return
        }
        switch (type) {
            case InterstitialType.Initial:
                this.showInitialType()
                break
            case InterstitialType.Native:
                this.showNativeType()
                break
            case InterstitialType.Video:
                this.showVideo(() => {
                    console.log("oppo video ad show success")
                })
                break
        }
    }

    showInitialType() {
        if (!sdkconfig.ycIntersId) {
            console.log("插屏广告id未配置")
            return
        }
        if (this.qg.getSystemInfoSync().platformVersionCode < 1061) {
            console.log("快应用平台版本号低于1061,暂不支持插屏广告相关 API")
            return
        }
        var interstitialAd = this.qg.createInterstitialAd({
            adUnitId: sdkconfig.ycIntersId,
        })
        interstitialAd.onLoad(function () {
            console.log('插屏广告加载成功')
            YCSDK.ins.onLoad(AdType.Inters)
            interstitialAd.show()
        })
        interstitialAd.onClose(function () {
            console.log('插屏广告关闭')
            YCSDK.ins.onClose(AdType.Inters)
        })
        interstitialAd.onError(function (err) {
            console.log("插屏广告出错: ", err)
            interstitialAd.destroy()
            interstitialAd = null
            YCSDK.ins.onError(AdType.Inters)
        })
        interstitialAd.load()
    }

    showNativeType() {
        if (!sdkconfig.ycNativeId) {
            console.log('原生模板广告参数没有配置')
            return
        }
        let { windowHeight, windowWidth, platformVersionCode, screenWidth, screenHeight } = this.qg.getSystemInfoSync()
        if (platformVersionCode < 1094) {
            console.log("快应用平台版本号低于1094,暂不支持原生模板广告相关API")
            return
        }
        if (this.nativeAd) {
            this.nativeAd.destroy()
            this.nativeAd = null
        }
        this.nativeAd = this.qg.createCustomAd({
            adUnitId: sdkconfig.ycNativeId,
            style: {
                top: windowHeight * 0.4,
                left: (windowWidth - windowWidth * 0.6) / 2,
                width: windowWidth * 0.6,
            }
        })
        this.nativeAd.onLoad(() => {
            console.log('[原生模板广告] 广告加载成功')
            YCSDK.ins.onLoad(AdType.Native)
        })
        this.nativeAd.onClick((obj) => {
            console.log(`原生模板广告点击回调: code: ${obj.code},msg: '${obj.msg}'`);
            YCSDK.ins.onClick(AdType.Native)
        })
        this.nativeAd.onHide(() => {
            console.log("原生模板广告隐藏")
            if (this.nativeAd) {
                this.nativeAd.destroy()
                this.nativeAd = null
            }
            YCSDK.ins.onClose(AdType.Native)
        })
        this.nativeAd.onError(err => {
            console.log("原生模板广告错误监听：", JSON.stringify(err))
            if (this.nativeAd) {
                this.nativeAd.destroy()
                this.nativeAd = null
            }
            YCSDK.ins.onError(AdType.Native)
        })
        this.nativeAd.show().then(() => {
            console.log('原生模板广告promise 回调：展示成功')
            YCSDK.ins.onShow(AdType.Native)
        }).catch(err => {
            console.log(`原生模板广告promise 回调：展示失败 ${JSON.stringify(err)}`)
        })
    }

    hideInters(type: InterstitialType): void {
        if (type = InterstitialType.Native) {
            if (!!this.nativeAd) {
                this.nativeAd.hide()
            }
        }
    }

    showVideo(callBack: Function): boolean {
        console.log("oppo video ad start show")
        this.loadVideoAd(callBack)
        return false
    }

    loadVideoAd(videoCallBack) {
        if (!sdkconfig.ycVideoId) {
            console.log('视频广告参数没有配置')
            videoCallBack && videoCallBack(false)
            return
        }
        let videoAd = this.qg.createRewardedVideoAd({
            adUnitId: sdkconfig.ycVideoId
        })
        videoAd.onLoad(() => {
            console.log("oppo video load success")
            YCSDK.ins.onLoad(AdType.Video)
            videoAd.show()
            YCSDK.ins.onShow(AdType.Video)
        })
        videoAd.onError(err => {
            console.log('onError:' + JSON.stringify(err))
            videoAd.destroy()
            YCSDK.ins.onError(AdType.Video, videoCallBack)
        })
        videoAd.onClick(function (obj) {
            console.log(`on click: code: ${obj.code}, msg: '${obj.msg}'`)
            YCSDK.ins.onClick(AdType.Video)
        })
        videoAd.onClose((res) => {
            YCSDK.ins.onClose(AdType.Video)
            console.log('==> oppoRewardVideoAd onClose', res)
            if (res == undefined) {
                //看完广告,给奖励
                videoCallBack && videoCallBack(true)
                YCSDK.ins.onReward()
            } else {
                if (res.isEnded) {
                    //看完广告,给奖励
                    videoCallBack && videoCallBack(true)
                    YCSDK.ins.onReward()
                } else {
                    // 没看完,不给奖励
                    console.log('广告没看完')
                    YCSDK.ins.onClose(AdType.Video)
                    videoCallBack && videoCallBack(false)
                }
            }
        })
        videoAd.load()
    }

    loadVideoAdNoCallBack(adcount: number = 3) {
        if (!sdkconfig.ycVideoId) {
            console.log('视频广告参数没有配置')
            return
        }
        let videoAd = this.qg.createRewardedVideoAd({
            adUnitId: sdkconfig.ycVideoId
        })
        videoAd.onLoad(() => {
            console.log("oppo video load success")
            videoAd.show()
        })
        videoAd.onError(err => {
            console.log('onError:' + JSON.stringify(err))
            YCSDK.ins.onError(AdType.Video)
        })
        videoAd.onClose((res) => {
            this.count++
            if (this.count >= adcount) {
                return
            }
            this.loadVideoAdNoCallBack(adcount)
        })
        videoAd.load()
        YCSDK.ins.onLoad(AdType.Video)
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        console.log("oppo custom function name:", methodName)
    }


}
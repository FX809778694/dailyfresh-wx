var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
let app = getApp()

Page({
  data: {
    integralUser: 0.00, // 账户积分
    integralUsable: 0.00, // 本次最多可用积分
    integralPrice: 0.00, // 兑换金额
    integralSelect: 0.00, // 选择的积分
    integrationExchange: 0.01 // 兑换比例
  },

  onShow() {
    let userIntegration = app.globalData.userIntegration;
    this.setData({
      integralUser: userIntegration,
      integralUsable: Math.floor(userIntegration * this.data.integrationExchange) / this.data.integrationExchange,
    })
  },

  sliderChange(e) {
    this.setData({
      /**
       * @integralSelect 当前值
       * @integralPrice 兑换的金额
       */
      integralSelect: e.detail.value,
      integralPrice: Math.floor(e.detail.value * this.data.integrationExchange)
    })
  },

  affirm() {
    if (this.data.integralSelect < 100) {
      wx.showToast({
        title: '积分最少100起兑',
        icon: 'none',
        duration: 2000
      })
      return
    }

    util.request(api.OrderExchange, {
      integralAmount: Math.floor(this.data.integralSelect / 100) * 100,
    }, 'POST').then(res => {
      if (res.errno === 0) {
        /**
         * @integralUser 用户积分
         * @integralPrice 兑换的金额
         * @integralSelect 选择的积分
         * @integralUsable 可用积分
         */
        this.setData({
          integralUser: res.data.userIntegration,
          integralPrice: 0,
          integralSelect: 0,
          integralUsable: Math.floor(res.data.userIntegration * this.data.integrationExchange) / this.data.integrationExchange,
        })

        // 更新积分的缓存
        app.globalData.userIntegration = res.data.userIntegration

        wx.showToast({
          title: '兑换成功',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})
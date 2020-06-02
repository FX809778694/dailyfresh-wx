import {showLoading} from "../../utils/toolMethods";

var util = require('../../utils/util.js');
var api = require('../../config/api.js');

var app = getApp();
Page({
  data: {
    status: false,
    orderId: 0,
    time:0,
    deliveryTime:'',
    isShow: false,
  },

  onShow: function() {
    showLoading();
    let options = wx.getStorageSync('payOption');
    this.setData({
      orderId: options.orderId,
      status: options.status === '1',
      isShow: true,
      deliveryTime: options.deliveryTime,
      time: wx.getStorageSync('orderUnpaid')
    })
    wx.hideLoading();
  },

  enterOrder(e) {
    let tab = e.currentTarget.dataset.index
    wx.setStorageSync('tab', tab);
  },

  payOrder() {
    let that = this;
    // 模拟支付成功，同理，后台也仅仅是返回一个成功的消息而已
    // wx.showModal({
    //   title: '目前不能微信支付',
    //   content: '点击确定模拟支付成功，点击取消模拟未支付成功',
    //   success: function (res) {
    //     if (res.confirm) {
    //       util.request(api.OrderPrepay, { orderId: that.data.orderId }, 'POST').then(res => {
    //         if (res.errno === 0) {
    //           that.setData({
    //             status: true
    //           });
    //         }
    //         else {
    //           util.showErrorToast('支付失败');
    //         }
    //       });
    //     }
    //     else if (res.cancel) {
    //       util.showErrorToast('支付失败');
    //     }

    //   }
    // });

    util.request(api.OrderPrepay, {
      orderId: that.data.orderId
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        const payParam = res.data;
        console.log("支付过程开始")
        wx.requestPayment({
          'timeStamp': payParam.timeStamp,
          'nonceStr': payParam.nonceStr,
          'package': payParam.packageValue,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function(res) {
            console.log("支付过程成功")
            that.setData({
              status: true
            });
          },
          'fail': function(res) {
            console.log("支付过程失败")
            util.showErrorToast('支付失败');
          },
          'complete': function(res) {
            console.log("支付过程结束")
          }
        });
      }
    });
  }
})

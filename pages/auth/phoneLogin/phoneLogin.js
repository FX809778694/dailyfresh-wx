var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
import {
  navigateBack,
  errToast
} from "../../../utils/toolMethods"

var app = getApp();
Page({
  data: {
    phoneNumber: '',
    verifyCode: '',

    verifyClockText: '发送验证码',
    clockSecond: 60
  },

  onLoad(options) {

  },

  phoneInputHandle(e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },

  login(e) {
    let that = this;
    let _value = e.detail.value;
    if (!_value.phoneNumber) {
      errToast('请输入手机号');
      return;
    } else if (!_value.verifyCode) {
      errToast('请输入验证码');
      return;
    }

    let params = {
      mobile: _value.phoneNumber,
      code: _value.verifyCode,
      openId: wx.getStorageSync('openId'),
      co: wx.getStorageSync('inviteId')
    };
    util.request(api.AuthPhoneLogin, params, 'POST')
      .then(res => {

        if (res.errno == 0) {
          that.setData({
            loginErrorCount: 0
          });
          app.globalData.hasLogin = true;
          wx.setStorageSync('userInfo', res.data.userInfo);
          app.globalData.tabBarCartNum = res.data.cartGoodsCount;
          app.globalData.balanceMoney = res.data.userInfo.balanceMoney;
          app.globalData.userIntegration = res.data.userInfo.userIntegration;

          wx.setStorage({
            key: "token",
            data: res.data.token,
            success: function() {
              wx.switchTab({
                url: '/pages/ucenter/index/index'
              });
            }
          });
        } else {
          that.setData({
            loginErrorCount: that.data.loginErrorCount + 1
          });
          app.globalData.hasLogin = false;
          util.showErrorToast('账户登录失败');
        }

      });

  },

  sendVerifyCode() {
    let that = this;

    if(that.data.phoneNumber === '') {
      errToast('请输入手机号');
      return;
    }

    if (that.data.clockSecond > 0 && that.data.clockSecond !== 60) {
      return
    }

    let params = {
      mobile: that.data.phoneNumber
    };
    util.request(api.AuthLoginVerify, params, 'POST')
      .then(res => {
      });

    if(that.clockTimer) {
      clearInterval(that.clockTimer)
    }


    that.clockTimer = setInterval(() => {

      let newClockSecond = that.data.clockSecond -= 1;
      that.setData({
        verifyClockText: `${that.data.clockSecond}s后重发`,
        clockSecond: newClockSecond
      });

      if(that.data.clockSecond === 0) {
        clearInterval(that.clockTimer);
        that.setData({
          verifyClockText: "发送验证码",
          clockSecond: 60
        })
      }
    }, 1000)

  },

  enterLogin() {
    navigateBack(1)
  }
});

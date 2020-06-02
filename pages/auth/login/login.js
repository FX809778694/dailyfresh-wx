import {
  successToast,
  navigateTo
} from "../../../utils/toolMethods";

var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
var user = require('../../../utils/user.js');

var app = getApp();
Page({
  data: {

  },
  onLoad: function(options) {

  },
  onReady: function() {

  },
  onShow: function() {
    // 页面显示
    let that = this;
    wx.login({
      success(res) {
        util.request(api.getSessionKeyByCode, {
          code: res.code,
        }, 'POST').then(res => {
          if (res.errno === 0) {
            wx.setStorageSync('openId', res.data);
            that.setData({
              sessionKey: res.data
            })
          }
        })
      }
    })

  },

  wxLogin: function(e) {
    if (e.detail.userInfo == undefined) {
      app.globalData.hasLogin = false;
      util.showErrorToast('微信登录失败');
      return;
    }

    user.checkLogin().catch(() => {

      user.loginByWeixin(e.detail.userInfo).then(res => {
        app.globalData.hasLogin = true;

        wx.navigateBack({
          delta: 1
        })
      }).catch((err) => {
        app.globalData.hasLogin = false;
        util.showErrorToast('微信登录失败');
      });

    });
  },

  getPhoneNumber(e) {
    let that = this;

    let decryptData = {
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv,
    };

    util.request(api.loginByWeChatPhone, {
      sessionKey: that.data.sessionKey,
      userInfo: {},
      encryptedData: decryptData.encryptedData,
      iv: decryptData.iv,
      co: wx.getStorageSync('inviteId')
    }, 'POST').then(res => {
      if (res.errno === 0) {
        //存储用户信息
        wx.setStorageSync('userInfo', res.data.userInfo);
        wx.setStorageSync('token', res.data.token);
        app.globalData.hasLogin = true;
        app.globalData.tabBarCartNum = res.data.cartGoodsCount;

        successToast("登录成功");
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/ucenter/index/index'
          });
        }, 600)
      }
    })

  },

  accountLogin: function() {
    navigateTo("/pages/auth/phoneLogin/phoneLogin");
  },

  enterServiceAgreement() {
    navigateTo("/pages/auth/serviceAgreement/serviceAgreement");
  },

  enterPrivacyPolicy() {
    navigateTo("/pages/auth/privacyPolicy/privacyPolicy");
  }

});

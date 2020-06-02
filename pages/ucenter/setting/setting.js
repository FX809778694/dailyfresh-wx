var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();
import {
  navigateTo,
  successToast
} from '../../../utils/toolMethods'

Page({
  data: {
    hasLogin: false
  },

  onShow: function () {
    //获取用户的登录信息
    if (app.globalData.hasLogin) {
      this.setData({
        hasLogin: true
      });
    }
  },

  // 意见反馈
  goFeedback(e) {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/ucenter/feedback/feedback"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    };
  },

  // 绑定手机
  bindPhoneNumber: function (e) {
    if (e.detail.errMsg !== "getPhoneNumber:ok") {
      // 拒绝授权
      return;
    }

    if (!this.data.hasLogin) {
      wx.showToast({
        title: '绑定失败：请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    util.request(api.AuthBindPhone, {
      iv: e.detail.iv,
      encryptedData: e.detail.encryptedData
    }, 'POST').then(function (res) {
      if (res.errno === 0) {
        wx.showToast({
          title: '绑定手机号码成功',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  // 设置密码
  goPassword(){
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/ucenter/payPassword/payPassword"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    };
  },

  // 退出登录
  logout() {
    app.globalData.hasLogin = false;
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
    wx.removeStorageSync('enterIndexTimeNum');
    wx.removeStorageSync('enterIndexTime');
    app.globalData.tabBarCartNum = 0;
    successToast('退出成功');
    setTimeout(() =>{
      wx.switchTab({
        url: '/pages/ucenter/index/index'
      });
    }, 1000)

  },

  enterLogin() {
    wx.navigateTo({
      url: "/pages/auth/login/login"
    });
  },

  enterPrivacyPolicy() {
    navigateTo("/pages/auth/privacyPolicy/privacyPolicy");
  }

})

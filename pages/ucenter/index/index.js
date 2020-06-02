var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var user = require('../../../utils/user.js');
var app = getApp();

Page({
  data: {
    userInfo: {
      nickName: '点击登录',
      avatarUrl: 'https://niuniu-wx.oss-cn-beijing.aliyuncs.com/login.png'
    },
    order: {
      unpaid: 0,
      unship: 0,
      unrecv: 0,
      uncomment: 0
    },
    balanceMoney: 0, //余额
    coupon: 0, //优惠券
    userIntegration: 0, //积分
    hasLogin: false
  },
  onShow: function() {
    //获取用户的登录信息
    if (app.globalData.hasLogin) {
      let userInfo = wx.getStorageSync('userInfo');
      this.setData({
        userInfo: userInfo,
        hasLogin: true
      });

      let that = this;
      util.request(api.UserIndex).then(function(res) {
        if (res.errno === 0) {
          that.setData({
            order: res.data.order,
            balanceMoney: res.data.balanceMoney,
            coupon: res.data.coupon,
            userIntegration: res.data.userIntegration,
          });
        }
      });
    } else {
      this.setData({
        userInfo: {
          nickName: '点击登录',
          avatarUrl: 'https://niuniu-wx.oss-cn-beijing.aliyuncs.com/login.png'
        },
        order: {
          unpaid: 0,
          unship: 0,
          unrecv: 0,
          uncomment: 0
        },
        balanceMoney: 0, //余额
        coupon: 0, //优惠券
        userIntegration: 0, //积分
        hasLogin: false
      })
    }

    // 设置tabBar购物车数量
    if (app.globalData.tabBarCartNum !== 0) {
      util.tabBarCartNum(0)
    } else {
      wx.removeTabBarBadge({
        index: 3,
      })
    }
  },

  // 登录
  goLogin() {
    if (!this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
  },

  // 我的订单 - 查看全部
  goOrder() {
    if (this.data.hasLogin) {
      try {
        wx.setStorageSync('tab', 0);
      } catch (e) {

      }
      wx.navigateTo({
        url: "/pages/ucenter/order/order"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
  },

  // 我的订单 - 查看对应分类订单
  goOrderIndex(e) {
    if (this.data.hasLogin) {
      let tab = e.currentTarget.dataset.index
      let route = e.currentTarget.dataset.route
      try {
        wx.setStorageSync('tab', tab);
      } catch (e) {

      }
      wx.navigateTo({
        url: route,
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    };
  },

  // 优惠券
  goCoupon() {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/ucenter/couponList/couponList"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    };
  },

  // 积分兑换
  goIntegral() {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/ucenter/integral/integral"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    };
  },

  // 我的收藏
  goCollect() {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/ucenter/collect/collect"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    };
  },

  // 历史浏览
  goFootprint() {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/ucenter/footprint/footprint"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    };
  },

  // 收货地址
  goAddress() {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/ucenter/address/address"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    };
  },

  // 售后/退款
  goAfterSale: function() {
    wx.navigateTo({
      url: '/pages/buyService/orderList/orderList'
    });
  },

  // 帮助中心
  goHelp: function() {
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },

  // 设置
  setting: function() {
    wx.navigateTo({
      url: '/pages/ucenter/setting/setting'
    });
  },
})

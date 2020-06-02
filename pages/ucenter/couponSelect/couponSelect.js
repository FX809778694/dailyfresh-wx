var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

var app = getApp();

Page({
  data: {
    couponList: [],
    cartId: 0,
    couponId: 0,
    userCouponId: 0,
    scrollTop: 0,
    count: 10, // 优惠券数据的数量
  },

  onShow: function () {
    this.setData({
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
    });
    // 页面显示
    wx.showLoading({
      title: '加载中...',
    });

    try {
      var cartId = wx.getStorageSync('cartId');
      if (!cartId) {
        cartId = 0;
      }

      var couponId = wx.getStorageSync('couponId');
      if (!couponId) {
        couponId = 0;
      }

      var userCouponId = wx.getStorageSync('userCouponId');
      if (!userCouponId) {
        userCouponId = 0;
      }

      var grouponRulesId = wx.getStorageSync('grouponRulesId');
      if (!grouponRulesId) {
        grouponRulesId = 0;
      }

      this.setData({
        cartId: cartId,
        couponId: couponId,
        userCouponId: userCouponId,
        grouponRulesId: grouponRulesId
      });

    } catch (e) {
      // Do something when catch error
      console.log(e);
    }

    this.getCouponList();
  },

  getCouponList: function () {

    let that = this;
    that.setData({
      couponList: []
    });
    // 页面渲染完成
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 2000
    });

    util.request(api.CouponSelectList, {
      cartId: that.data.cartId,
      grouponRulesId: that.data.grouponRulesId,
    }).then(function (res) {
      if (res.errno === 0) {
        res.data.list.map(item => {
          // 2020-04-16 00:00:00 ----> 04-16 00:00
          item.startTime = item.startTime.slice(5, -3)
          item.endTime = item.endTime.slice(5, -3)
        })
        that.setData({
          couponList: res.data.list,
          count: res.data.total,
        });
      }
      wx.hideToast();
    });

  },
  selectCoupon: function (e) {
    try {
      wx.setStorageSync('couponId', e.currentTarget.dataset.cid);
      wx.setStorageSync('userCouponId', e.currentTarget.dataset.id);
    } catch (error) {

    }

    wx.navigateBack();
  },
  unselectCoupon: function() {
    // 如果优惠券ID设置-1，则表示订单不使用优惠券
    try {
      wx.setStorageSync('couponId', -1);
      wx.setStorageSync('userCouponId', -1);
    } catch (error) {

    }

    wx.navigateBack();
  }

})

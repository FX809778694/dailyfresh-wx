var util = require('../../utils/util.js');
var api = require('../../config/api.js');
import {
  timeStrOperate,
  debounce,
  priceSupplement,
} from "../../utils/toolMethods"
import arithmetic from '../../utils/arithmetic'
var app = getApp();

Page({
  data: {
    checkedGoodsList: [],
    cartId: 0,
    addressId: 0,
    couponId: 0,
    userCouponId: 0,
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
    });
  },

  //获取checkou信息
  getCheckoutInfo: function() {
    let that = this;
    util.request(api.CartCheckout, {
      cartId: that.data.cartId,
      addressId: that.data.addressId,
      couponId: that.data.couponId,
      userCouponId: that.data.userCouponId,
      grouponRulesId: that.data.grouponRulesId
    }).then(function(res) {
      if (res.errno === 0) {
        if (res.data.checkedGoodsList.length > 0) {
          res.data.checkedGoodsList.forEach(item => {
            item.total = priceSupplement(arithmetic.round(arithmetic.multiply(item.price, item.number), 2));
            item.price = priceSupplement(item.price)
          })
        }

        that.setData({
          checkedGoodsList: res.data.checkedGoodsList,
        });
      }



      wx.hideLoading();
    });
  },

  onReady: function() {
    // 页面渲染完成
  },

  onShow: function() {
    // 页面显示
    wx.showLoading({
      title: '加载中...',
    });
    try {
      var cartId = wx.getStorageSync('cartId');
      if (cartId === "") {
        cartId = 0;
      }
      var addressId = wx.getStorageSync('addressId');
      if (addressId === "") {
        addressId = 0;
      }
      var couponId = wx.getStorageSync('couponId');
      if (couponId === "") {
        couponId = 0;
      }
      var userCouponId = wx.getStorageSync('userCouponId');
      if (userCouponId === "") {
        userCouponId = 0;
      }
      var grouponRulesId = wx.getStorageSync('grouponRulesId');
      if (grouponRulesId === "") {
        grouponRulesId = 0;
      }

      this.setData({
        cartId: cartId,
        addressId: addressId,
        couponId: couponId,
        userCouponId: userCouponId,
        grouponRulesId: grouponRulesId,
      });

    } catch (e) {
      // Do something when catch error
    }

    this.getCheckoutInfo();
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },

});

var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

import {
  showLoading,
  navigateTo,
  switchTab
} from "../../../utils/toolMethods"
var app = getApp();

Page({
  data: {
    couponList: [],
    code: '',
    status: 0,
    limit: 5,
    count: 10,
    scrollTop: 0,
    showPage: false,
    totalPages: 1, // 接口返回的总页数
    page: 1,
    noData: false
  },

  onLoad: function(options) {
    this.setData({
      mainWrapHeight: app.globalData.hh - 163
    });
    this.getCouponList();
  },

  getCouponList: function() {

    let that = this;
    if(this.data.page > this.data.totalPages) {
      this.setData({
        noData: true
      });
      return
    }
    showLoading();
    util.request(api.CouponMyList, {
      status: that.data.status,
      page: that.data.page,
      limit: that.data.limit
    }).then(function(res) {
      if (res.errno === 0) {
        res.data.list.map(item => {
          // 2020-04-16 00:00:00 ----> 04-16 00:00
          item.startTime = item.startTime.slice(5, -3)
          item.endTime = item.endTime.slice(5, -3)
        })
        let listData = [...that.data.couponList, ...res.data.list];
        that.setData({
          scrollTop: 0,
          couponList: listData,
          showPage: true,
          count: res.data.total,
          page: that.data.page += 1,
          totalPages: res.data.pages
        });
        wx.hideLoading();
      }
    });

  },

  scrollBottom() {
    this.getCouponList();
  },

  bindExchange: function (e) {
    this.setData({
      code: e.detail.value
    });
  },
  clearExchange: function () {
    this.setData({
      code: ''
    });
  },
  goExchange: function() {
    if (this.data.code.length === 0) {
      util.showErrorToast("请输入兑换码");
      return;
    }

    let that = this;

    util.request(api.CouponExchange, {
      code: that.data.code
    }, 'POST').then(function (res) {
      if (res.errno === 0) {
        that.setData({
          totalPages: 1,
          page: 1,
          couponList: []
        })
        that.getCouponList();
        that.clearExchange();
        wx.showToast({
          title: "领取成功",
          duration: 2000
        })
      }
      else{
        util.showErrorToast(res.errmsg);
      }
    });
  },

  switchTab: function(e) {
    this.setData({
      couponList: [],
      status: e.currentTarget.dataset.index,
      page: 1,
      totalPages: 1,
      limit: 5,
      count: 10,
      scrollTop: 0,
      noData: false
    });
    this.setData({
      mainWrapHeight: e.currentTarget.dataset.index == '0' ? app.globalData.hh - 144 : app.globalData.hh - 60
    });

    this.getCouponList();
  },

  enterCouponExplain() {
    navigateTo('/pages/ucenter/couponExplain/couponExplain')
  },

  enterCategory() {
    switchTab('/pages/catalog/catalog')
  }

})

import {priceSupplement} from "../../utils/toolMethods";

var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();

Page({
  data: {
    goodsList: [],
    minFreight: 0, // 包邮
    gapPrice: 0, // 差多少钱包邮
  },

  onLoad: function(options) {
    this.setData({
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
    });
    if (options.minFreight && options.gapPrice) {
      this.setData({
        minFreight: options.minFreight,
        gapPrice: options.gapPrice
      })
    }
  },

  onShow: function() {
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.CartAddGoods).then(res => {
      if (res.errno === 0) {
        res.data.list.map(item => {
          // 处理价格补0
          item.retailPrice = priceSupplement(item.retailPrice)
          item.marketPrice = priceSupplement(item.marketPrice)
        })
        this.setData({
          goodsList: res.data.list
        })
      }

      wx.hideLoading();
    });
  },

  //添加到购物车
  addToCart(e) {
    let itemIndex = e.currentTarget.dataset.itemIndex;
    let goodsInfo = this.data.goodsList[itemIndex];
    let goodsId = goodsInfo.id;

    //添加到购物车
    util.addToCart(goodsId, 'needUpdateTabBar', false).then(res => {
      this.setData({
        gapPrice: (this.data.gapPrice - goodsInfo.retailPrice).toFixed(2)
      })
    })
  },

  // 去购物按钮
  goCart() {
    wx.switchTab({
      url: "/pages/cart/cart"
    });
  },
})

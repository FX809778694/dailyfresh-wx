var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
//获取应用实例
const app = getApp();
import {
  priceSupplement,
  showLoading
} from '../../../utils/toolMethods'

Page({
  data: {
    orderList: [],
    showType: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 1, // 数据的数量
  },

  onLoad: function(options) {

  },

  // 订单列表
  getOrderList() {
    showLoading();
    util.request(api.OrderList, {
      showType: this.data.showType,
      page: this.data.page,
      limit: this.data.limit
    }).then(res => {
      wx.hideLoading();
      if (res.errno === 0) {
        //计算数量
        res.data.list.forEach(item => {
          let num = 0;
          item.actualPrice = priceSupplement(item.actualPrice)
          item.goodsList.forEach(item_1 => {
            num += item_1.number;
            item.goodsNum = num;
          })
        })

        this.setData({
          orderList: this.data.orderList.concat(res.data.list),
          totalPages: res.data.pages,
          total: res.data.total
        });
      }
    });
  },

  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.setData({
        page: this.data.page + 1
      });
      this.getOrderList();
    } else {
      wx.showToast({
        title: '没有更多订单了',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
  },

  // tab 切换
  switchTab: function(event) {
    let showType = event.currentTarget.dataset.index;
    this.setData({
      orderList: [],
      showType: showType,
      page: 1,
      limit: 10,
      totalPages: 1
    });
    this.getOrderList();
  },

  // “去付款”按钮点击效果
  payOrder: function(e) {
    let that = this;
    let orderid = e.currentTarget.dataset.orderid;

    util.request(api.OrderPrepay, {
      orderId: orderid
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        const payParam = res.data;
        // console.log("支付过程开始");
        wx.requestPayment({
          'timeStamp': payParam.timeStamp,
          'nonceStr': payParam.nonceStr,
          'package': payParam.packageValue,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function(res) {
            // console.log("支付过程成功");
            util.redirect('/pages/ucenter/order/order');
          },
          'fail': function(res) {
            // console.log("支付过程失败");
            util.showErrorToast('支付失败');
          },
          'complete': function(res) {
            // console.log("支付过程结束")
          }
        });
      }else{
        // console.log(res.errmsg)
      }
    });
  },

  // “取消订单”点击效果
  cancelOrder: function(e) {
    let that = this;
    let orderid = e.currentTarget.dataset.orderid;

    wx.showModal({
      title: '',
      content: '确定要取消此订单？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderCancel, {
            orderId: orderid
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({
                title: '取消订单成功'
              });
              util.redirect('/pages/ucenter/order/order');
            } else {
              util.showErrorToast(res.errmsg);
            }
          });
        }
      }
    });
  },

  // “取消订单并退款”点击效果
  refundOrder: function(e) {
    let that = this;
    let orderid = e.currentTarget.dataset.orderid;

    wx.showModal({
      title: '',
      content: '确定要取消此订单？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderRefund, {
            orderId: orderid
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({
                title: '取消订单成功'
              });
              util.redirect('/pages/ucenter/order/order');
            } else {
              util.showErrorToast(res.errmsg);
            }
          });
        }
      }
    });
  },

  // “删除”点击效果
  deleteOrder: function(e) {
    let that = this;
    let orderid = e.currentTarget.dataset.orderid;

    wx.showModal({
      title: '',
      content: '确定要删除此订单？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderDelete, {
            orderId: orderid
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({
                title: '删除订单成功'
              });
              util.redirect('/pages/ucenter/order/order');
            } else {
              util.showErrorToast(res.errmsg);
            }
          });
        }
      }
    });
  },

  // “确认收货”点击效果
  confirmOrder: function(e) {
    let that = this;
    let orderid = e.currentTarget.dataset.orderid;

    wx.showModal({
      title: '',
      content: '确认收货？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderConfirm, {
            orderId: orderid
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({
                title: '确认收货成功！'
              });
              that.setData({
                orderList: [],
                page: 1,
                limit: 10,
                totalPages: 1
              });
              // 页面显示
              that.getOrderList();
            } else {
              util.showErrorToast(res.errmsg);
            }
          });
        }
      }
    });
  },

  // “再来一单”按钮点击效果
  onceOrder: function (e) {
    let orderid = e.currentTarget.dataset.orderid;
    let userid = wx.getStorageSync('token');

    util.request(api.OrderOnce, {
      orderId: orderid,
      userId: userid
    }).then(res=> {
      if (res.errno === 0) {
        wx.switchTab({
          url: "/pages/cart/cart"
        });

        util.tabBarCartNum(e.currentTarget.dataset.goodsnum)
      }
    });
  },

  // 评价
  evaluate(e) {
    let orderid = e.currentTarget.dataset.orderid;
    wx.redirectTo({
      url: `/pages/commentPost/commentPost?orderid=${orderid}`
    });
  },

  onShow: function() {
    this.setData({
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
    });
    this.setData({
      orderList: [],
      showType: wx.getStorageSync('tab'),
      page: 1,
      limit: 10,
      totalPages: 1
    });
    // 页面显示
    this.getOrderList();
  },

  onHide() {
    this.setData({
      orderList: [],
      showType: 0,
      page: 1,
      limit: 10,
      totalPages: 1
    });
  }

})

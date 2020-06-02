import {navigateTo, priceSupplement} from "../../../utils/toolMethods";

var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
//获取应用实例
const app = getApp();

Page({
  data: {
    orderId: 0,
    orderInfo: {}, // 订单信息
    orderGoods: [], // 订单商品
    goodsNum: 0, // 订单商品数量
    handleOption: {}, // 订单所处状态
    countDown: '', // 倒计时
    setInterval: null,

    markers: [{
      latitude: '',
      longitude: '',
      iconPath: 'https://images.niuniufresh.com/kkd8jq174ya574i4ixu9.png',
      width: 30,
      height: 36
    }],
    longitudeDeliver: '',
    latitudeDeliver: '',
    scale: 17, // 位置的精确度

    allStatusData: [],
    statusData: [],
    showMoreBtn: true,
  },

  onLoad: function(options) {
    this.setData({
      orderId: options.id,
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
    });
    this.getOrderDetail();
  },

  // 获取订单详情
  getOrderDetail: function() {
    wx.showLoading({
      title: '加载中',
    });

    setTimeout(function() {
      wx.hideLoading()
    }, 2000);

    util.request(api.OrderDetail, {
      orderId: this.data.orderId
    }).then(res => {
      if (res.errno === 0) {
        res.data.orderGoods.map(item => {
          // 处理价格补0
          item.price = priceSupplement(item.price)
          item.marketPrice = priceSupplement(item.marketPrice)
        })
        res.data.orderInfo.goodsPrice = priceSupplement(res.data.orderInfo.goodsPrice)
        res.data.orderInfo.couponPrice = priceSupplement(res.data.orderInfo.couponPrice)
        res.data.orderInfo.freightPrice = priceSupplement(res.data.orderInfo.freightPrice)
        res.data.orderInfo.balancePrice = priceSupplement(res.data.orderInfo.balancePrice)
        res.data.orderInfo.actualPrice = priceSupplement(res.data.orderInfo.actualPrice)
        this.setData({
          orderInfo: res.data.orderInfo,
          orderGoods: res.data.orderGoods,
          handleOption: res.data.orderInfo.handleOption,
        });

        // 处理订单状态数据
        res.data.orderLogs.map(item => {
          // res.data.orderLogs.push(item);
          // res.data.orderLogs.push(item);
          // res.data.orderLogs.push(item);
          // res.data.orderLogs.push(item);

          item.createTime = util.formatTime(new Date(item.createTime))
        });
        // res.data.orderLogs = res.data.orderLogs.reverse();
        let _statueData = [];
        res.data.orderLogs.map((item, index) => {
          if(index < 3) {
            _statueData.push(item)
          }
        });
        this.setData({
          allStatusData: res.data.orderLogs,
          statusData: _statueData,
        });

        this.getCoordinateData(res.data.orderInfo.deliveryId)
      }

      // 倒计时
      if (res.data.orderInfo.handleOption.pay) {
        this.data.setInterval = setInterval(() => {
          this.countDown(res.data.orderInfo.addTime);
        }, 1000);
      }

      //计算商品总数
      let num = 0;
      res.data.orderGoods.forEach(item => {
        num += item.number;
      });
      this.setData({
        goodsNum : num
      });

      wx.hideLoading();
    });
  },

  // 时间格式化
  formatDuring: function(mss) {
    var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = parseInt((mss % (1000 * 60)) / 1000);
    minutes = minutes < 10 ? ('0' + minutes) : minutes;
    seconds = seconds < 10 && seconds >= 1 ? ('0' + seconds) : seconds;
    return minutes + " : " + seconds;
  },

  // 倒计时
  countDown: function(time) {
    let time_original = new Date(time).getTime();
    let ios_time_original = new Date(time.replace(/-/g,'/')).getTime();
    let time_new = new Date().getTime();
    let timestamp;

    if(time_original) {
      timestamp = time_new - time_original
    } else {
      timestamp = time_new - ios_time_original
    }

    let orderSaveTime = this.data.orderInfo.orderSaveTime * 60000;

    // 如果时间到了就重新请求一次，获取详情更新状态，同时停止倒计时
    if (timestamp >= orderSaveTime) {
      // this.getOrderDetail()
      clearInterval(this.data.setInterval)
    } else {
      timestamp = orderSaveTime - timestamp;
      this.setData({
        countDown: this.formatDuring(timestamp)
      });
    }
  },

  // 复制粘贴按钮
  textPaste() {
    wx.showToast({
      title: '复制成功',
    });
    wx.setClipboardData({
      data: this.data.orderInfo.orderSn,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            console.log(res.data)
          }
        })
      }
    })
  },

  // “去付款”按钮点击效果
  payOrder: function() {

    let that = this;
    util.request(api.OrderPrepay, {
      orderId: that.data.orderId
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        const payParam = res.data;
        console.log("支付过程开始");
        wx.requestPayment({
          'timeStamp': payParam.timeStamp,
          'nonceStr': payParam.nonceStr,
          'package': payParam.packageValue,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function(res) {
            console.log("支付过程成功");
            util.redirect('/pages/ucenter/order/order');
          },
          'fail': function(res) {
            console.log("支付过程失败");
            util.showErrorToast('支付失败');
          },
          'complete': function(res) {
            console.log("支付过程结束")
          }
        });
      }
    });
  },

  // “取消订单”点击效果
  cancelOrder: function() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    wx.showModal({
      title: '',
      content: '确定要取消此订单？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderCancel, {
            orderId: orderInfo.id
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
  refundOrder: function() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    wx.showModal({
      title: '',
      content: '确定要取消此订单？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderRefund, {
            orderId: orderInfo.id
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
  deleteOrder: function() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    wx.showModal({
      title: '',
      content: '确定要删除此订单？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderDelete, {
            orderId: orderInfo.id
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
  confirmOrder: function() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    wx.showModal({
      title: '',
      content: '确认收货？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderConfirm, {
            orderId: orderInfo.id
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({
                title: '确认收货成功！'
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

  // “再来一单”按钮点击效果
  onceOrder: function(e) {
    let orderid = e.currentTarget.dataset.orderid;
    let userid = wx.getStorageSync('token');

    util.request(api.OrderOnce, {
      orderId: orderid,
      userId: userid
    }).then(res => {
      if (res.errno === 0) {
        wx.switchTab({
          url: "/pages/cart/cart"
        });

        util.tabBarCartNum(this.data.goodsNum)
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

  getCoordinateData(deliveryId) {
    let userid = wx.getStorageSync('token');
    util.request(api.OrderCoordinate, {
      deliveryId : deliveryId,
      userId: userid
    }).then(res => {
      if (res.errno === 0) {
        this.setData({
          'markers[0].latitude': res.data.lat,
          'markers[0].longitude': res.data.lng,
          latitudeDeliver: res.data.lat,
          longitudeDeliver: res.data.lng
        })
      }
    });
  },

  enterDistribution(e) {
    console.log(e.currentTarget.dataset.lng, e.currentTarget.dataset.lat, e.currentTarget.dataset.deliveryId);
    let lng = e.currentTarget.dataset.lng;
    let lat = e.currentTarget.dataset.lat;
    let deliveryId = e.currentTarget.dataset.deliveryId;
    let addressLng = e.currentTarget.dataset.addressLng;
    let addressLat = e.currentTarget.dataset.addressLat;
    navigateTo(`/pages/ucenter/distributionMap/distributionMap?lng=${lng}&lat=${lat}&deliveryId=${deliveryId}&addressLng=${addressLng}&addressLat=${addressLat}`)
  },


  // 点击显示更多 把全部数据赋值到显示数据
  showMoreData() {
    let _statusData = this.data.allStatusData;
    this.setData({
      statusData: _statusData,
      showMoreBtn: false
    })
  },

  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
});

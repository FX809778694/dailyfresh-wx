import {round} from "../../utils/arithmetic";

var util = require('../../utils/util.js');
var api = require('../../config/api.js');
import {
  timeStrOperate,
  debounce,
  priceSupplement,
  showLoading
} from "../../utils/toolMethods"
import arithmetic from '../../utils/arithmetic'

var app = getApp();

Page({
  data: {
    cartId: 0,
    addressId: 0,
    couponId: 0,
    userCouponId: 0,
    checkedGoodsList: [], // 购买的商品列表
    goodsNum: 0, // 购买的商品数量
    checkedAddress: {}, // 地址信息
    availableCouponLength: 0, // 可用的优惠券数量
    goodsTotalPrice: 0.00, // 商品总价
    freightPrice: 0.00, // 快递费
    balanceMoney: 0.00, // 欠款
    couponPrice: 0.00, // 优惠券的价格
    orderTotalPrice: 0.00, // 订单总价
    actualPrice: 0.00, // 实际需要支付的总价
    discountPrice: 0.00, // 商品本身优惠的价格
    message: '', // 留言
    password: '', // 密码
    deliveryTime: [], // 配送时间段
    pickerIndex: 0, // 选中的配送时间
    balancePrice: 0.00, // 账户余额
    accountPracticalPrice: 0.00, // 用户本次下单余额实际支付金额
    needPrice: 0.00, // 待支付
    integralUser: 0, // 用户积分
    integralUsable: 0, // 可用积分
    integrationExchange: 0, // 积分兑换比例
    integralSelect: 0, // 选择的积分
    integralPrice: 0, // 兑换的金额
    integralPriceMax: 0, // 积分能兑换最高金额
    integralLoad: false, // 积分弹窗
    isAccountPay: false, // 是否用余额支付
    isWeixinPay: true, // 是否用微信支付
    passwordLoad: false, // 密码框
    deliveryTimeDetail: ''
  },

  onShow: function() {
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

      this.setData({
        cartId: cartId,
        addressId: addressId,
        couponId: couponId,
        userCouponId: userCouponId,
      });
    } catch (e) {
      console.log(e);
    }

    // 加载积分弹窗信息
    this.getExchangeInfo();

    // 加载订单信息
    this.getCheckoutInfo();
  },

  //获取checkou信息
  getCheckoutInfo() {
    util.request(api.CartCheckout, {
      cartId: this.data.cartId,
      addressId: this.data.addressId,
      couponId: this.data.couponId,
      userCouponId: this.data.userCouponId,
    }).then(res => {
      if (res.errno === 0) {
        wx.setStorageSync('orderUnpaid', res.data.orderUnpaid);
        wx.setStorageSync('addressId', res.data.addressId);
        // debugger
        this.setData({
          checkedGoodsList: res.data.checkedGoodsList,
          checkedAddress: res.data.checkedAddress,
          availableCouponLength: res.data.availableCouponLength,
          actualPrice: priceSupplement(res.data.actualPrice),
          couponPrice: priceSupplement(res.data.couponPrice),
          freightPrice: priceSupplement(res.data.freightPrice),
          balanceMoney: priceSupplement(res.data.balanceMoney),
          goodsTotalPrice: priceSupplement(res.data.goodsTotalPrice),
          orderTotalPrice: priceSupplement(res.data.orderTotalPrice),
          discountPrice: priceSupplement(res.data.discountPrice),
          addressId: res.data.addressId,
          couponId: res.data.couponId,
          integrationExchange: res.data.integrationExchange,
          userCouponId: res.data.userCouponId,
          balancePrice: priceSupplement(res.data.balancePrice),
          integralPriceMax: priceSupplement(arithmetic.round(arithmetic.multiply(this.data.integralUser, res.data.integrationExchange), 2)),
          integralUsable: priceSupplement(arithmetic.round(arithmetic.divide(arithmetic.multiply(this.data.integralUser, res.data.integrationExchange), res.data.integrationExchange), 2)),
          needPrice: priceSupplement(res.data.actualPrice),
          deliveryTimeDetail: timeStrOperate(res.data.deliveryTime),
        });
        console.log(timeStrOperate(res.data.deliveryTime));
      }

      // 计算总共有多少件商品 & 优惠金额
      let num = 0;
      let price = 0;
      if (this.data.checkedGoodsList.length > 0) {
        this.data.checkedGoodsList.forEach(item => {
          num += item.number
        })
      }
      this.setData({
        goodsNum: num,
      });

      this.deliveryTime();
      wx.hideLoading();
    });
  },

  // 更改配送时间
  bindPickerChange: function(e) {
    this.setData({
      pickerIndex: e.detail.value
    })
  },

  // 可以配送的时间段
  deliveryTime: function() {
    let arr = [];
    for (let i = 9; i < 18; i++) {
      if (i === 9) {
        arr.push(`0${i}:00 ~ ${i + 1}:00`)
      } else {
        arr.push(`${i}:00 ~ ${i + 1}:00`)
      }
    }
    this.setData({
      deliveryTime: arr
    })
  },

  // 更改地址
  selectAddress: function() {
    wx.navigateTo({
      url: '/pages/ucenter/address/address?page=chekout',
    })
  },

  // 优惠券
  selectCoupon: function() {
    wx.navigateTo({
      url: '/pages/ucenter/couponSelect/couponSelect',
    })
  },

  // 查看商品列表
  goodsList: function() {
    wx.navigateTo({
      url: '/pages/checkoutGoods/checkoutGoods',
    })
  },

  // 留言
  bindMessageInput: function(event) {
    this.setData({
      message: event.detail.value
    });
  },

  // 去付款
  submitOrder: debounce(function() {
    let that = this;
    // 判断有没有收货地址
    if (this.data.addressId <= 0) {
      util.showErrorToast('请选择收货地址');
      return false;
    }
    //
    // // 判断有没有打开余额支付
    // if (!this.data.isAccountPay) {
    //   util.showErrorToast('请选择余额支付');
    //   return false;
    // }
    //
    // // 判断余额够不够支付
    // if (this.data.accountPracticalPrice >= this.data.balancePrice) {
    //   util.showErrorToast('余额不足');
    //   return false;
    // }

    // 清除购物车的 globalData
    app.globalData.cartList = [];
    showLoading('发起付款中');
    util.request(api.OrderSubmit, {
      cartId: this.data.cartId,
      addressId: this.data.addressId,
      couponId: this.data.couponId,
      userCouponId: this.data.userCouponId,
      message: this.data.message,
      balancePrice: this.data.balanceMoney,
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.hideLoading();
        // 下单成功，重置couponId
        try {
          wx.setStorageSync('couponId', 0);
        } catch (error) {}

        const orderId = res.data.orderId;

        // 余额支付
        // util.request(api.OrderBalancePay, {
        //   orderId: orderId,
        // }, 'POST').then(res => {
        //   if (res.errno === 0) {
        //     // 清除购物车的 globalData
        //     app.globalData.cartList = [];
        //     wx.redirectTo({
        //       url: '/pages/payResult/payResult?status=1&orderId=' + orderId + '&deliveryTime=' + this.data.deliveryTime[this.data.pickerIndex]
        //     });
        //   }
        // });

        util.tabBarCartNum(-this.data.goodsNum)

        util.request(api.OrderPrepay, {
          orderId: orderId
        }, 'POST').then(res => {
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
                let option ={
                  orderId: orderId,
                  status: '1',
                  deliveryTime: that.data.deliveryTimeDetail
                }
                wx.setStorageSync('payOption', option);
                wx.redirectTo({
                  url: '/pages/payResult/payResult'
                });
              },
              'fail': function(res) {
                console.log("支付过程失败");
                let option ={
                  orderId: orderId,
                  status: '0',
                  deliveryTime: that.data.deliveryTimeDetail
                }
                wx.setStorageSync('payOption', option);
                wx.redirectTo({
                  url: '/pages/payResult/payResult'
                });
              },
              'complete': function(res) {
                console.log("支付过程结束")
              }
            });
          } else {
            let option ={
              orderId: orderId,
              status: '0'
            }
            wx.setStorageSync('payOption', option);
            wx.redirectTo({
              url: '/pages/payResult/payResult',
              deliveryTime: that.data.deliveryTimeDetail
            });
          }
          util.tabBarCartNum(-this.data.goodsNum)
        });
      } else {
        util.showErrorToast(res.errmsg);
      }
      //  else {
      //   wx.redirectTo({
      //     url: '/pages/payResult/payResult?status=0&orderId=' + orderId
      //   });
      // }
    });
  },400),

  // 账户支付 change
  switchChange(e) {
    if (e.detail.value) {
      this.setData({
        passwordLoad: true,
      })
    } else {
      this.setData({
        passwordLoad: false,
      })
    }
  },

  // 输入密码模态框 - 确认
  affirmPassword() {
    util.request(api.OrderPaddword, {
      payPassword: this.data.password,
    }, 'POST').then(res => {
      if (res.errno === 0) {
        this.setData({
          isAccountPay: true,
          passwordLoad: false,
          password: '',
          accountPracticalPrice: this.data.balancePrice - this.data.actualPrice >= 0 ? this.data.actualPrice : this.data.balancePrice,
          needPrice: this.data.balancePrice - this.data.actualPrice >= 0 ? 0 : (this.data.actualPrice - this.data.balancePrice).toFixed(2)
        });
        if (this.data.balancePrice - this.data.actualPrice >= 0) {
          this.setData({
            isWeixinPay: false
          })
        }
      } else {
        wx.showToast({
          title: res.errmsg,
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 输入密码模态框 - 取消
  closePassword() {
    this.setData({
      accountPracticalPrice: 0,
      needPrice: this.data.actualPrice,
      isWeixinPay: true,
      passwordLoad: false,
      isAccountPay: false
    })
  },

  // 密码
  bindPasswordInput: function(event) {
    this.setData({
      password: event.detail.value
    });
  },

  // 获取积分
  getExchangeInfo() {
    this.setData({
      integralUser: app.globalData.userIntegration
    })
  },

  // 积分兑换弹窗 - 滑块
  sliderChange(e) {
    this.setData({
      /**
       * @integralSelect 当前值
       * @integralPrice 兑换的金额
       */
      integralSelect: e.detail.value,
      integralPrice: Math.floor(e.detail.value * this.data.integrationExchange)
    })
  },

  // 积分兑换弹窗 - 打开
  open() {
    this.setData({
      integralLoad: true,
    })
  },

  // 积分兑换弹窗 - 关闭
  close() {
    this.setData({
      integralLoad: false,
    })
  },

  // 积分兑换弹窗 - 确认
  affirm() {
    if (this.data.integralSelect < 100) {
      wx.showToast({
        title: '积分最少100起兑',
        icon: 'none',
        duration: 2000
      });
      return
    }

    util.request(api.OrderExchange, {
      integralAmount: Math.floor(this.data.integralSelect / 100) * 100,
    }, 'POST').then(res => {
      if (res.errno === 0) {
        /**
         * @integralLoad 积分兑换弹窗
         * @balancePrice 账户金额
         * @integralUser 用户积分
         * @integralPrice 兑换的金额
         * @integralSelect 选择的积分
         * @integralUsable 可用积分
         * @integralPriceMax 积分能兑换最高金额
         */
        this.setData({
          integralLoad: false,
          balancePrice: res.data.balanceMoney,
          integralUser: res.data.userIntegration,
          integralPrice: 0,
          integralSelect: 0,
          integralUsable: Math.floor(res.data.userIntegration * this.data.integrationExchange) / this.data.integrationExchange,
          integralPriceMax: Math.floor(res.data.userIntegration * this.data.integrationExchange),
        });

        // 更新积分的缓存
        app.globalData.balanceMoney = res.data.balanceMoney;
        app.globalData.userIntegration = res.data.userIntegration;

        // 支付方式 & 待支付
        /**
         * 【账户金额 - 实付金额】
         * @balancePrice 账户金额
         * @actualPrice 实付金额
         * @isAccountPay 账户支付
         * @isWeixinPay 微信支付
         * @accountPracticalPrice 账户应付金额
         * @needPrice 待支付
         */
        if (this.data.isAccountPay) {
          let gapPrice = this.data.balancePrice - this.data.actualPrice;
          if (gapPrice >= 0) {
            this.setData({
              isWeixinPay: false,
              accountPracticalPrice: this.data.actualPrice,
              needPrice: 0.00
            })
          } else {
            this.setData({
              isWeixinPay: true,
              accountPracticalPrice: this.data.balancePrice,
              needPrice: (this.data.actualPrice - this.data.balancePrice).toFixed(2)
            })
          }
        } else {
          this.setData({
            isWeixinPay: true,
            accountPracticalPrice: 0.00,
            needPrice: this.data.actualPrice
          })
        }
      }
    })
  }
});

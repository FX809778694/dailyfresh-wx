var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var user = require('../../utils/user.js');

var app = getApp();
import {
  timeStrOperate,
  debounce,
  priceSupplement,
} from "../../utils/toolMethods"
import arithmetic from '../../utils/arithmetic'

Page({
  data: {
    cartGoods: [], // 商品集合
    cartTotal: { // 结算信息
      "goodsCount": 0,
      "goodsAmount": 0.00,
      "checkedGoodsCount": 0,
      "checkedGoodsAmount": 0.00
    },
    checkedAllStatus: false, // 是否全选
    recommend: [], // 猜你喜欢
    hasLogin: false, // 是否登录
    minFreight: 0, // 包邮
    gapPrice: 0, // 差多少钱包邮
    minOrderTotal: 0, // 起步价
    gapOrderTotal: 0, // 差多少钱起送
    discounts: 0, // 优惠多少钱
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    this.getCartList();
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  onShow: function() {
    // 页面显示
    if (app.globalData.hasLogin) {
      this.getCartList();
      this.recommendList();
    }

    this.setData({
      hasLogin: app.globalData.hasLogin,
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
    });

    // debugger
    // 设置tabBar购物车数量
    if (app.globalData.tabBarCartNum !== 0) {
      util.tabBarCartNum(0)
    } else {
      wx.removeTabBarBadge({
        index: 3,
      })
    }
  },

  // 跳转登录界面
  goLogin() {
    wx.navigateTo({
      url: "/pages/auth/login/login"
    });
  },

  // 去购物按钮
  goShopping() {
    wx.switchTab({
      url: `/pages/index/index`
    });
  },

  // 去凑单
  pieceOrder() {
    wx.navigateTo({
      url: `/pages/addOrder/addOrder?minFreight=${this.data.minFreight}&gapPrice=${this.data.gapPrice}`
    });
  },

  // 获取购物车列表
  getCartList: function() {
    util.request(api.CartList).then(res => {
      // console.log(res.data.cartList);
      res.data.cartList.map(item => {
        // 处理价格补0
        item.price = priceSupplement(item.price)
        item.marketPrice = priceSupplement(item.marketPrice)
        if(item.flashPrice) {
          item.flashPrice = priceSupplement(item.flashPrice)
        }
      })
      if (res.errno === 0) {
        res.data.cartTotal.checkedGoodsAmount = priceSupplement(res.data.cartTotal.checkedGoodsAmount)
        this.setData({
          cartGoods: res.data.cartList,
          cartTotal: res.data.cartTotal,
          minFreight: priceSupplement(res.data.minFreight),
          minOrderTotal: res.data.minOrderTotal,
        });

        // 是否全选
        this.setData({
          checkedAllStatus: this.isCheckedAll()
        });

        // debugger
        // 更新tabbar数量
        app.globalData.tabBarCartNum = res.data.cartTotal.goodsCount;
        util.tabBarCartNum(0)

        // discounts 优惠，遍历累加 【（市场价 - 实际价格）*数量】
        let discounts = 0;
        if (res.data.cartList.length > 0) {
          res.data.cartList.forEach(item => {
            if (item.checked) {
              if (item.marketPrice) {
                if(item.isFlashGoods) { // 有抢购的商品计算优惠价格

                  if(item.number <= item.flashNum) {
                    discounts = arithmetic.add(arithmetic.multiply(arithmetic.subtract(item.marketPrice, item.flashPrice), item.number), discounts);
                  } else {
                    let flashTotalPrice = arithmetic.subtract(item.marketPrice, item.flashPrice) * item.flashNum;
                    let plainTotalPrice = arithmetic.subtract(item.marketPrice, item.price) * arithmetic.subtract(item.number, item.flashNum);
                    discounts = arithmetic.add(arithmetic.add(flashTotalPrice, plainTotalPrice), discounts);
                  }

                } else { // 不是抢购计算优惠价格
                  discounts = arithmetic.add(arithmetic.subtract(item.marketPrice, item.price) * item.number, discounts);
                }


              } else {
                discounts += 0
              }
            }
          })
        }

        this.setData({
          gapPrice: priceSupplement(arithmetic.subtract(res.data.minFreight, res.data.cartTotal.checkedGoodsAmount)),
          gapOrderTotal: priceSupplement(arithmetic.subtract(res.data.minOrderTotal, res.data.cartTotal.checkedGoodsAmount)),
          discounts: priceSupplement(arithmetic.round(discounts, 2)),
        })
      }
    });
  },

  // 获取猜你喜欢列表
  recommendList: function() {
    util.request(api.CartRecommendList).then(res => {
      if (res.errno === 0) {
        if (res.data.list) {
          res.data.list.forEach(item => {
            // 处理价格补0
            item.retailPrice = priceSupplement(item.retailPrice)
            item.marketPrice = priceSupplement(item.marketPrice)

            if (app.globalData.cartList) {
              app.globalData.cartList.forEach(val => {
                if (item.id === val.id) {
                  item.number = val.number
                }
              })
            }
          })
        }

        this.setData({
          recommend: res.data.list,
        });
      }
    });
  },

  // 判断购物车商品已全选
  isCheckedAll() {
    if (this.data.cartGoods.length <= 0) {
      return false;
    }

    return this.data.cartGoods.every(function(element, index, array) {
      if (element.checked == true && element.checked) {
        return true;
      } else {
        return false;
      }
    });
  },

  // checked 按钮
  checkedItem: function(event) {
    let itemIndex = event.target.dataset.itemIndex;
    util.request(api.CartChecked, {
      isChecked: this.data.cartGoods[itemIndex].checked ? 0 : 1,
      goodsIds: [this.data.cartGoods[itemIndex].goodsId]
    }, 'POST').then(res => {
      if (res.errno === 0) {
        this.setData({
          cartGoods: res.data.cartList,
          cartTotal: res.data.cartTotal
        });
        this.updateNumber();
      }

      this.setData({
        checkedAllStatus: this.isCheckedAll()
      });
    });
  },

  // 全选
  checkedAll: function() {
    var goodsIds = this.data.cartGoods.map(function(v) {
      return v.goodsId;
    });
    util.request(api.CartChecked, {
      goodsIds: goodsIds,
      isChecked: this.isCheckedAll() ? 0 : 1
    }, 'POST').then(res => {
      if (res.errno === 0) {
        this.setData({
          cartGoods: res.data.cartList,
          cartTotal: res.data.cartTotal
        });

        this.updateNumber();
      }

      this.setData({
        checkedAllStatus: this.isCheckedAll()
      });
    });
  },

  // 更新购物车商品信息
  updateCart: function(goodsId, number, id, isFlashGoods) {
    util.request(api.CartUpdate, {
      goodsId: goodsId,
      number: number,
      isFlashGoods: isFlashGoods // 1是秒杀商品 0 不是
    }, 'POST').then(res => {
      this.setData({
        checkedAllStatus: this.isCheckedAll()
      });
    });
  },

  // 改变数量，更新对应信息
  updateNumber: function() {
    /*
     * @checkedGoodsCount 选中的数量，遍历累加
     * @checkedGoodsAmount 选中的总价，遍历累加 【数量*价格】
     * @discounts 优惠，遍历累加 【（市场价 - 实际价格）*数量】
     */

    let checkedGoodsCount = 0;
    let checkedGoodsAmount = 0;
    let discounts = 0;
    this.data.cartGoods.forEach(item => {
      if (item.checked) {
        checkedGoodsCount += item.number;
        if(item.isFlashGoods) { // 有抢购的商品计算价格

          if(item.number <= item.flashNum) {
            checkedGoodsAmount = arithmetic.add(arithmetic.multiply(item.number, item.flashPrice), checkedGoodsAmount);
          } else {
            let flashTotalPrice = arithmetic.multiply(item.flashNum, item.flashPrice);
            let plainTotalPrice = arithmetic.multiply(arithmetic.subtract(item.number, item.flashNum), item.price);
            checkedGoodsAmount = arithmetic.add(arithmetic.add(flashTotalPrice, plainTotalPrice), checkedGoodsAmount);
          }

        } else { // 不是抢购计算价格
          checkedGoodsAmount = arithmetic.add(arithmetic.multiply(item.number, item.price), checkedGoodsAmount);
        }

        if (item.marketPrice) {
          if(item.isFlashGoods) { // 有抢购的商品计算优惠价格

            if(item.number <= item.flashNum) {
              discounts = arithmetic.add(arithmetic.subtract(item.marketPrice , item.flashPrice) * item.number, discounts);
            } else {
              let flashTotalPrice = arithmetic.subtract(item.marketPrice, item.flashPrice) * item.flashNum;
              let plainTotalPrice = arithmetic.subtract(item.marketPrice, item.price) * arithmetic.subtract(item.number, item.flashNum);
              discounts = arithmetic.add(arithmetic.add(flashTotalPrice, plainTotalPrice), discounts);
            }

          } else { // 不是抢购计算优惠价格
            discounts = arithmetic.add(arithmetic.subtract(item.marketPrice, item.price) * item.number, discounts);
          }


        } else {
          discounts += 0
        }
      }
    });

    /*
     * @cartTotal.checkedGoodsCount 选中的总数量
     * @cartTotal.checkedGoodsAmount 选中的总价
     * @gapPrice 差多少钱包邮 【包邮价 - 选中的总价】
     * @gapOrderTotal 差多少钱起送 【起送价 - 选中的总价】
     * @discounts 优惠多少钱
     */
    this.setData({
      'cartTotal.checkedGoodsCount': checkedGoodsCount,
      'cartTotal.checkedGoodsAmount': priceSupplement(checkedGoodsAmount),
      gapPrice: priceSupplement(arithmetic.subtract(this.data.minFreight, checkedGoodsAmount)),
      gapOrderTotal: priceSupplement(arithmetic.subtract(this.data.minOrderTotal, checkedGoodsAmount)),
      discounts: priceSupplement(discounts)
    });
  },

  // 减少数量
  cutNumber: function(event) {
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    // debugger
    let goodsIds = [];
    goodsIds.push(this.data.cartGoods[itemIndex].goodsId);

    let number = cartItem.number - 1;
    if (number === 0) {
      wx.showModal({
        content: '确定删除该商品吗？',
        success: res => {
          if (res.confirm) {
            util.request(api.CartDelete, {
              cart: JSON.stringify([{
                goodsId: cartItem.goodsId,
                isFlashGoods: cartItem.isFlashGoods
              }])
            }, 'POST').then(res => {
              if (res.errno === 0) {
                this.setData({
                  cartGoods: res.data.cartList,
                  cartTotal: res.data.cartTotal
                });
              }

              this.setData({
                checkedAllStatus: this.isCheckedAll()
              });
              this.updateNumber();

              // 改变全局购物车数量
              app.globalData.cartList = [];
              this.data.cartGoods.forEach(item => {
                app.globalData.cartList.push({
                  id: item.goodsId,
                  number: item.number
                })
              });
              util.tabBarCartNum(-1);

              // 更新猜你喜欢商品数量
              this.recommendList()
            });
          } else if (res.cancel) {}
        }
      })
    } else {
      cartItem.number = number;
      this.setData({
        cartGoods: this.data.cartGoods
      });
      this.updateCart(cartItem.goodsId, number, cartItem.id, cartItem.isFlashGoods);
      this.updateNumber();

      // 改变全局购物车数量
      app.globalData.cartList = [];
      this.data.cartGoods.forEach(item => {
        app.globalData.cartList.push({
          id: item.goodsId,
          number: item.number
        })
      });
      util.tabBarCartNum(-1);

      // 更新猜你喜欢商品数量
      this.recommendList()
    }
  },

  // 添加数量
  addNumber: function(event) {
    // debugger
    let that = this;
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = that.data.cartGoods[itemIndex];
    let number = cartItem.number + 1;
    let goodsId = cartItem.goodsId;
    cartItem.number = number;
    this.setData({
      cartGoods: that.data.cartGoods
    });
    util.request(api.CartUpdate, {
      goodsId: goodsId,
      number: number,
      isFlashGoods: cartItem.isFlashGoods // 1是秒杀商品 0 不是
    }, 'POST').then(res => {
      // console.log(res);
      if(res.errno == 711) {
        wx.showToast({
          title: '库存不足',
          icon: 'none',
          duration: 1000
        });
        let itemIndex = event.target.dataset.itemIndex;
        let cartItem = that.data.cartGoods[itemIndex];
        cartItem.number -= 1;
        that.setData({
          cartGoods: that.data.cartGoods
        });
        util.tabBarCartNum(0);
      } else {
        util.tabBarCartNum(1);
      }
      that.setData({
        checkedAllStatus: that.isCheckedAll()
      });
      that.updateNumber();

      // 改变全局购物车数量
      app.globalData.cartList = [];
      that.data.cartGoods.forEach(item => {
        // console.log(item.number);
        app.globalData.cartList.push({
          id: item.goodsId,
          number: item.number
        })
      });
      // console.log(app.globalData.cartList);

      // 更新猜你喜欢商品数量
      that.recommendList()
    });

  },

  // 删除按钮
  deleteCart: function() {
    let goodsIds = this.data.cartGoods.filter(function(element, index, array) {
      if (element.checked == true) {
        return true;
      } else {
        return false;
      }
    });

    if (goodsIds.length <= 0) {
      return false;
    }
    let goodsAry = [];
    goodsAry = goodsIds.map(function(element, index, array) {
      if (element.checked == true) {
        return {
          goodsId: element.goodsId,
          isFlashGoods: element.isFlashGoods
        }
      }
    });
    // debugger
    wx.showModal({
      title: '',
      content: '是否删除所选商品',
      success: res => {
        if (res.confirm) {
          util.request(api.CartDelete, {
            cart: JSON.stringify(goodsAry)
          }, 'POST').then(res => {
            if (res.errno === 0) {
              let cartList = res.data.cartList.map(v => {
                v.checked = false;
                return v;
              });

              this.setData({
                cartGoods: cartList,
                cartTotal: res.data.cartTotal
              });

              this.updateNumber();

              // 改变tabBar 购物车数量
              let checkedGoodsCount = 0;
              cartList.forEach(item => {
                checkedGoodsCount += item.number;
              });

              // 改变全局购物车数量
              app.globalData.cartList = [];
              if (this.data.cartGoods) {
                this.data.cartGoods.forEach(item => {
                  app.globalData.cartList.push({
                    id: item.goodsId,
                    number: item.number
                  })
                })
              }

              // 更新猜你喜欢商品数量
              this.recommendList();
              // debugger;
              app.globalData.tabBarCartNum = checkedGoodsCount;
              util.tabBarCartNum(0)
            }

            this.setData({
              checkedAllStatus: this.isCheckedAll()
            });
          });
        } else if (res.cancel) {
          util.showErrorToast(res.errmsg);
        }
      }
    })
  },

  // 去结算
  checkoutOrder: debounce(function() {
    // 如果总金额小于起步价，就拒绝配送
    if (this.data.cartTotal.checkedGoodsAmount < this.data.minOrderTotal) {
      wx.showToast({
        title: '不足起送价',
        icon: 'none',
        duration: 2000
      });
      return false
    }

    var checkedGoods = this.data.cartGoods.filter(function(element, index, array) {
      if (element.checked == true) {
        return true;
      } else {
        return false;
      }
    });

    if (checkedGoods.length <= 0) {
      return false;
    }

    // storage中设置了cartId，则是购物车购买
    try {
      wx.setStorageSync('cartId', 0);
      wx.navigateTo({
        url: '/pages/checkout/checkout'
      })
    } catch (e) {}
  }, 400),

  //添加到购物车
  addToCart: function(e) {
    let goodsInfo = this.data.recommend[e.currentTarget.dataset.itemIndex];
    let goodsId = goodsInfo.id;

    util.addToCart(goodsId, 'needUpdateTabBar', false).then(res => {
      let number = 'recommend[' + e.currentTarget.dataset.itemIndex + '].number';
      if (goodsInfo.number) {
        this.setData({
          [number]: goodsInfo.number + 1
        })
      } else {
        this.setData({
          [number]: 1
        })
      }

      this.getCartList();
    })
  },
});

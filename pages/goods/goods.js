var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var user = require('../../utils/user.js');
var app = getApp();

import {
  dateClockFormat,
  debounce,
  navigateTo,
  priceSupplement,
  showLoading, throttle
} from "../../utils/toolMethods";

Page({
  data: {
    isIphoneX: false,
    id: 0,
    goods: {},
    attribute: [],
    issueList: [],
    comment: [],
    specificationList: [],
    productList: [],
    relatedGoods: [],
    cartGoodsCount: 0,
    userHasCollect: 0,
    number: 1,
    checkedSpecText: '规格数量选择',
    tmpSpecText: '请选择规格数量',
    checkedSpecPrice: 0,
    soldout: false, // 商品在售状态

    totalSecond: 0,
    clockHr: '',
    clockMin: '',
    clockSec: '',
    microSec: '',

    swiperActive: 1,

    foodsAryData: [],
    showTopBtn: false,
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({
        id: parseInt(options.id)
      });
    }
  },

  onShow: function() {
    // 获取购物车的数量
    util.request(api.CartGoodsCount).then(res => {
      if (res.errno === 0) {
        this.setData({
          cartGoodsCount: res.data
        });
      }
    });
    this.setData({
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
      isIphoneX: app.globalData.isIphoneX
    });
    this.getGoodsInfo();
    this.getFoodsData();
  },

  // 获取商品信息
  getGoodsInfo: function() {
    showLoading();
    let that = this;
    util.request(api.GoodsDetail, {
      id: that.data.id
    }).then(function(res) {
      if (res.errno === 0) {
        wx.hideLoading();

        let imgStrr = `<img class="rich-photo" $1`;
        if(res.data.info.detail) {
          res.data.info.detail = res.data.info.detail
            .replace(/<p([\s\w"=\/\.:;]+)((?:(style="[^"]+")))/ig, '<p')
            .replace(/<p([\s\w"=\/\.:;]+)((?:(class="[^"]+")))/ig, '<p')
            .replace(/<p>/ig, '<p class="rich-p">')

            .replace(/<img([\s\w"-=.:;]+)((?:(height="[^"]+")))/ig, '<img$1')
            .replace(/<img([\s\w"-=.:;]+)((?:(width="[^"]+")))/ig, '<img$1')
            .replace(/<img([\s\w"-=.:;]+)((?:(style="[^"]+")))/ig, '<img$1')
            .replace(/<img([\s\w"-=.:;]+)((?:(alt="[^"]+")))/ig, '<img$1')
            .replace(/<img([\s\w"-=.:;]+)/ig, imgStrr);
          // console.log(res.data.info.detail);
        }
          // 处理价格补0
        res.data.info.retailPrice = priceSupplement(res.data.info.retailPrice)
        res.data.info.marketPrice = priceSupplement(res.data.info.marketPrice)
        if(res.data.info.flashPrice) {
          res.data.info.flashPrice = priceSupplement(res.data.info.flashPrice)
        }
        that.setData({
          goods: res.data.info,
          attribute: res.data.attribute,
          issueList: res.data.issue,
          comment: res.data.comment,
          specificationList: res.data.specificationList,
          productList: res.data.productList,
          userHasCollect: res.data.userHasCollect,
          checkedSpecPrice: res.data.info.retailPrice,
          totalSecond: res.data.info.remainTime
        });
        that.countdown(that);

        if (res.data.userHasCollect == 1) {
          that.setData({
            collectImage: that.data.hasCollectImage
          });
        } else {
          that.setData({
            collectImage: that.data.noCollectImage
          });
        }

        //获取推荐商品
        that.getGoodsRelated();
      }
    });
  },

  // 获取相关做法
  getFoodsData() {
    let that = this;
    util.request(api.GoodsFoods, {
      id: this.data.id
    }).then(function(res) {
      that.setData({
        foodsAryData: res.data
      })
    })
  },

  // 获取推荐商品
  getGoodsRelated() {
    util.request(api.GoodsRelated, {
      id: this.data.id
    }).then(res => {
      if (res.errno === 0) {
        console.log(app.globalData.cartList)
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

        // let _list = [];
        // res.data.list.map(item => {
        //   _list.push(item);
        //   _list.push(item)
        // });
        this.setData({
          relatedGoods: res.data.list,
        });
      }
    });
  },

  // 规格选择
  clickSkuValue: function(event) {
    let that = this;
    let specName = event.currentTarget.dataset.name;
    let specValueId = event.currentTarget.dataset.valueId;

    //判断是否可以点击

    //TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      if (_specificationList[i].name === specName) {
        for (let j = 0; j < _specificationList[i].valueList.length; j++) {
          if (_specificationList[i].valueList[j].id == specValueId) {
            //如果已经选中，则反选
            if (_specificationList[i].valueList[j].checked) {
              _specificationList[i].valueList[j].checked = false;
            } else {
              _specificationList[i].valueList[j].checked = true;
            }
          } else {
            _specificationList[i].valueList[j].checked = false;
          }
        }
      }
    }
    this.setData({
      specificationList: _specificationList,
    });
    //重新计算spec改变后的信息
    this.changeSpecInfo();

    //重新计算哪些值不可以点击
  },


  //获取选中的规格信息
  getCheckedSpecValue: function() {
    let checkedValues = [];
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      let _checkedObj = {
        name: _specificationList[i].name,
        valueId: 0,
        valueText: ''
      };
      for (let j = 0; j < _specificationList[i].valueList.length; j++) {
        if (_specificationList[i].valueList[j].checked) {
          _checkedObj.valueId = _specificationList[i].valueList[j].id;
          _checkedObj.valueText = _specificationList[i].valueList[j].value;
        }
      }
      checkedValues.push(_checkedObj);
    }

    return checkedValues;
  },

  //判断规格是否选择完整
  isCheckedAllSpec: function() {
    return !this.getCheckedSpecValue().some(function(v) {
      if (v.valueId == 0) {
        return true;
      }
    });
  },

  getCheckedSpecKey: function() {
    let checkedValue = this.getCheckedSpecValue().map(function(v) {
      return v.valueText;
    });
    return checkedValue;
  },

  // 规格改变时，重新计算价格及显示信息
  changeSpecInfo: function() {
    let checkedNameValue = this.getCheckedSpecValue();

    //设置选择的信息
    let checkedValue = checkedNameValue.filter(function(v) {
      if (v.valueId != 0) {
        return true;
      } else {
        return false;
      }
    }).map(function(v) {
      return v.valueText;
    });
    if (checkedValue.length > 0) {
      this.setData({
        tmpSpecText: checkedValue.join('　')
      });
    } else {
      this.setData({
        tmpSpecText: '请选择规格数量'
      });
    }

    if (this.isCheckedAllSpec()) {
      this.setData({
        checkedSpecText: this.data.tmpSpecText
      });

      // 规格所对应的货品选择以后
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (!checkedProductArray || checkedProductArray.length <= 0) {
        this.setData({
          soldout: true
        });
        return;
      }

      let checkedProduct = checkedProductArray[0];
      if (checkedProduct.number > 0) {
        this.setData({
          checkedSpecPrice: checkedProduct.price,
          soldout: false
        });
      } else {
        this.setData({
          checkedSpecPrice: this.data.goods.retailPrice,
          soldout: true
        });
      }

    } else {
      this.setData({
        checkedSpecText: '规格数量选择',
        checkedSpecPrice: this.data.goods.retailPrice,
        soldout: false
      });
    }

  },

  // 获取选中的产品（根据规格）
  getCheckedProductItem: function(key) {
    return this.data.productList.filter(function(v) {
      if (v.specifications.toString() == key.toString()) {
        return true;
      } else {
        return false;
      }
    });
  },

  //添加或是取消收藏
  addCollectOrNot: function() {
    let that = this;
    util.request(api.CollectAddOrDelete, {
        type: 0,
        valueId: this.data.id
      }, "POST")
      .then(function(res) {
        if (that.data.userHasCollect == 1) {
          that.setData({
            collectImage: that.data.noCollectImage,
            userHasCollect: 0
          });
        } else {
          that.setData({
            collectImage: that.data.hasCollectImage,
            userHasCollect: 1
          });
        }

      });

  },

  //立即购买（先自动加入购物车）
  addFast: function() {
    var that = this;
    if (this.data.openAttr == false) {
      //打开规格选择窗口
      this.setData({
        openAttr: !this.data.openAttr
      });
    } else {

      //提示选择完整规格
      if (!this.isCheckedAllSpec()) {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: '请选择完整规格'
        });
        return false;
      }

      //根据选中的规格，判断是否有对应的sku信息
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (!checkedProductArray || checkedProductArray.length <= 0) {
        //找不到对应的product信息，提示没有库存
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: '没有库存'
        });
        return false;
      }

      let checkedProduct = checkedProductArray[0];
      //验证库存
      if (checkedProduct.number <= 0) {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: '没有库存'
        });
        return false;
      }

      //立即购买
      util.request(api.CartFastAdd, {
          goodsId: this.data.goods.id,
          number: this.data.number,
        }, "POST")
        .then(function(res) {
          if (res.errno == 0) {

            // 如果storage中设置了cartId，则是立即购买，否则是购物车购买
            try {
              wx.setStorageSync('cartId', res.data);
              wx.navigateTo({
                url: '/pages/checkout/checkout'
              })
            } catch (e) {}

          } else {
            wx.showToast({
              image: '/static/images/icon_error.png',
              title: res.errmsg,
              mask: true
            });
          }
        });
    }
  },

  // 大家都在看添加到购物车
  addCart: debounce(function(e) {
    let goodsId = e.currentTarget.dataset.goodsid;
    let that = this;
    util.addToCart(goodsId, 'unNeedUpdateTabBar', false).then(() => {
      this.setData({
        cartGoodsCount: this.data.cartGoodsCount + 1
      });

      getApp().globalData.cartList = [];
      util.request(api.CartList).then(res => {
        if (res.errno === 0) {

          if (res.data.cartList.length > 0) {
            res.data.cartList.forEach(item => {
              getApp().globalData.cartList.push({
                id: item.goodsId,
                number: item.number
              })
            })
          }

          // 更新大家都在看数据
          that.getGoodsRelated();
        }
      })

    })
  }, 400),

  onPageScroll: throttle(function(event) {
    let that = this;
    that.setData({
      showTopBtn: event.scrollTop > 1100
    })
  }, 50),

  //添加到购物车
  addToCart: function() {
    var that = this;
    //添加到购物车
    util.request(api.CartAdd, {
      goodsId: this.data.goods.id,
      number: this.data.number,
      isFlashGoods: this.data.goods.goodsFlashPrice ? 1 : 0 // 1是秒杀商品 0 不是
    }, "POST")
    .then(function(res) {
      let _res = res;
      if (_res.errno == 0) {
        wx.showToast({
          title: '添加成功'
        });
        that.setData({
          cartGoodsCount: _res.data
        });
        if (that.data.userHasCollect == 1) {
          that.setData({
            collectImage: that.data.hasCollectImage
          });
        } else {
          that.setData({
            collectImage: that.data.noCollectImage
          });
        }
        // util.tabBarCartNum(that.data.number)

      } else {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: _res.errmsg,
          mask: true
        });
      }

    });

  },

  // 减少数量
  cutNumber: function() {
    this.setData({
      number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1
    });
  },

  // 添加数量
  addNumber: function() {
    this.setData({
      number: this.data.number + 1
    });
  },

  // 打开规格弹窗
  switchAttrPop: function() {
    if (this.data.openAttr == false) {
      this.setData({
        openAttr: !this.data.openAttr
      });
    }
  },

  // 关闭规格弹窗
  closeAttr: function() {
    this.setData({
      openAttr: false,
    });
  },

  // 跳转到购物车页面
  openCartPage: function() {
    let that = this;
    clearInterval(that.interval);
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },

  countdown: function(that) {

    let timeObj = dateClockFormat(that.data.totalSecond, 'partObj');
    // 渲染倒计时时钟
    that.setData({
      clock: dateClockFormat(that.data.totalSecond, 'combination'),
      clockHr: timeObj.hr,
      clockMin: timeObj.min,
      clockSec: timeObj.sec,
      microSec: timeObj.micro_sec
    });

    if(that.data.totalSecond <= 0) {
      that.setData({
        clock: '秒杀结束',
      });
      return
    }
    // 实现倒计时
    that.interval = setTimeout(function () {
      let newTotalSecond = that.data.totalSecond -= 100;
      that.setData({
        totalSecond: newTotalSecond
      });
      that.countdown(that);
    }, 100)

  },

  swiperChangeHandle(e) {
    this.setData({
      swiperActive: e.detail.current + 1
    })
  },

  enterDelicacyDetail(e) {
    let id = e.currentTarget.dataset.id;
    navigateTo(`/pages/delicacyDetail/delicacyDetail?id=${id}`)
  },

  toTopHandle() {
    this.setData({
      showTopBtn: false
    });
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },

  onHide() {
    let that = this;
    clearInterval(that.interval);
  },

  onUnload() {
    let that = this;
    clearInterval(that.interval);
  }

})

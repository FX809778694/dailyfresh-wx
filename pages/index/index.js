const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');
import {
  dateClockFormat,
  navigateTo,
  showLoading,
  throttle,
  switchTab,
  priceSupplement
} from "../../utils/toolMethods"

//获取应用实例
const app = getApp();

Page({
  data: {
    banner: [], //banner
    goodsClassify: [], //商品分类
    goodsList: [], //商品列表
    hotGoods: [], //热销商品
    coupon: [],
    goodsCount: 0,
    animationX: 0, // 购物车动画
    animationY: 0, // 购物车动画

    totalSecond: 0,
    clockHr: '',
    clockMin: '',
    clockSec: '',
    microSec: '',

    fixedCategory: true, // 固定分类商品切换

    cateGoryActive: 0, // 分类的选中
    totalPages: 1, // 接口返回的总页数
    page: 1,
    shopListData: [], // 新品上市及分类的商品数据
    shopListPicData: {}, // 商品列表分类带的大图数据
    noData: false, // 商品数据是否加载结束
    topNum: 0, // 主滚动距离
    intoId: '',
    clickSelectClassify: false, // 是否是点击分类

    skillShopList: [], // 秒杀的商品

    delicacyListData: [], // 首页菜谱数据

    couponTimeSign: true,  // true 说明 满足 （不是同一天且第一次进入） false 说明 不满足 （不是同一天且第一次进入）
    couponModel: true, // 登录当天第一次进首页优惠券弹框
    couponData: [], // 首页弹框我的优惠券

    showTopBtn: false,

    newPeopleCouponData: [], // 新人优惠券数据
    newPeopleCouponModel: true, // 新人优惠券弹框,

    scrollTop: 0 // 记录页面的滚动高度,
  },

  onLoad: function(options) {

    if (options.scene) {
      //这个scene的值存在则证明首页的开启来源于朋友圈分享的图,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      var scene = decodeURIComponent(options.scene);

      let info_arr = [];
      info_arr = scene.split(',');
      let _type = info_arr[0];
      let id = info_arr[1];

      if (_type == 'goods') {
        wx.navigateTo({
          url: '../goods/goods?id=' + id
        });
      } else if (_type == 'groupon') {
        wx.navigateTo({
          url: '../goods/goods?grouponId=' + id
        });
      } else {
        wx.navigateTo({
          url: '../index/index'
        });
      }
    }

    if (options.grouponId) {
      //这个pageId的值存在则证明首页的开启来源于用户点击来首页,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../goods/goods?grouponId=' + options.grouponId
      });
    }

    if (options.goodId) {
      //这个goodId的值存在则证明首页的开启来源于分享,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../goods/goods?id=' + options.goodId
      });
    }

    if (options.orderId) {
      //这个orderId的值存在则证明首页的开启来源于订单模版通知,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../ucenter/orderDetail/orderDetail?id=' + options.orderId
      });
    }
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

  onShow() {

    // 改变新人优惠券弹框 状态
    if (!this.data.hasLogin){
      this.setData({
        newPeopleCouponModel: true
      })
    }

    // 存储用户进入该页面的时间年月日 对比判断是否显示优惠券弹框
    // debugger
    if(wx.getStorageSync('userInfo')) {
      let time = new Date();
      let oldTime = wx.getStorageSync('enterIndexTime'); // 之前进入的时间 获取为空的时候是第一次登录 符合规则
      let newTime = util.formatTime(time, 'yy-mm-dd'); //当前进入的时间
      wx.setStorageSync('enterIndexTime', util.formatTime(time, 'yy-mm-dd'));

      // newTime = '2020-04-12'
      if(oldTime !== newTime) { // 进入首页时间不相等 重新计算第几次进入首页
        wx.removeStorageSync('enterIndexTimeNum');
      }

      if(wx.getStorageSync('enterIndexTimeNum')) { // 第几次进入 有数值 继续加次数标记第几次
        let oldNum = wx.getStorageSync('enterIndexTimeNum');
        let newNum = oldNum += 1;
        wx.setStorageSync('enterIndexTimeNum', newNum);
      } else { // 第几次进入 没数值 说明这次是第一次进入 更新存储为 第一次
        wx.setStorageSync('enterIndexTimeNum', 1);
      }
      // couponTimeSign true 说明 满足 （不是同一天且是第一次进入） false 说明 不满足 （不是同一天 第一次进入）
      this.setData({
        couponTimeSign: oldTime !== newTime && wx.getStorageSync('enterIndexTimeNum') == 1
      });
      // console.log(oldTime, newTime, this.data.couponTimeSign);
    }
    // 每次进入更新点击控制模态框ß
    this.setData({
      couponModel: true
    });

    this.setData({
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
      hasLogin: wx.getStorageSync('userInfo'),
      mainWrapHeight: app.globalData.hh
    });

    this.getIndexData();
    this.getIndexSkillData();
    this.fetchDelicacyData();

    if (this.data.hasLogin) {
      this.getIndexCouponData();
    } else {
      this.getIndexNewPeopleCoupon()
    }


    // 设置tabBar购物车数量
    if (app.globalData.tabBarCartNum !== 0) {
      util.tabBarCartNum(0)
    } else {
      wx.removeTabBarBadge({
        index: 3,
      })
    }

    this.fetchNewShopList();

  },

  onShareAppMessage: function() {
    return {
      title: '牛牛优选',
      desc: '牛牛优选商城',
      path: '/pages/index/index'
    }
  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    this.getIndexData();
    this.getIndexSkillData();
    this.fetchDelicacyData();
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  // 列表
  getIndexData: function() {
    util.request(api.IndexUrl).then(res => {
      // debugger
      if (res.errno === 0) {
        // 组装商品列表
        let goodsList = [];
        if (res.data.channel.length > 0) {
          res.data.channel.forEach(item => {
            //如果分类下面有商品就追加，没有加不追加
            if (res.data[`hotGoodsList${item.id}`] !== undefined) {
              if (res.data[`hotGoodsList${item.id}`].length > 0) {
                res.data[`hotGoodsList${item.id}`].forEach(item => {
                  item.displayFlag = true;
                  item.animationX = 0;
                  item.animationY = 0;
                  item.number = 0;

                  // 处理价格补0
                  item.retailPrice = priceSupplement(item.retailPrice)
                  item.marketPrice = priceSupplement(item.marketPrice)

                  if (app.globalData.cartList) {
                    app.globalData.cartList.forEach(val => {
                      if (item.id === val.id) {
                        item.number = val.number
                      }
                    })
                  } else {
                    item.number = 0
                  }
                });
                goodsList.push({
                  Classify: item,
                  list: res.data[`hotGoodsList${item.id}`]
                })
                this.calcFixedTop();
              }
            }
          })
        }

        this.setData({
          banner: res.data.banner,
          goodsClassify: res.data.channel,
          goodsList: goodsList,
          hotGoods: goodsList[0]
        });

        this.calcFixedTop();

      }
    });

    util.request(api.GoodsCount).then(res => {

      this.setData({
        goodsCount: res.data
      });
      this.calcFixedTop();
    });
  },

  calcFixedTop() {
    const _this = this;
    wx.nextTick(() => {
      let that = this;
      const $ = wx.createSelectorQuery();
      const target = $.selectAll('.list-wrap-header');

      target.boundingClientRect(function (rects) {
        // console.log(rects[0].top, app.globalData.fixedTop);
        // if(app.globalData.fixedTop === 0){
          app.globalData.fixedTop = rects[0].top + _this.data.scrollTop;
        // }

      }).exec();
    })
  },

  // 秒杀部分
  getIndexSkillData() {
    let that = this;
    util.request(api.skillIndexData).then(function(res) {
      // console.log(res);
      if (res.errno === 0) {
        res.data.goods.map(item => {
          // 处理价格补0
          item.retailPrice = priceSupplement(item.retailPrice)
          item.goodsFlashPrice = priceSupplement(item.goodsFlashPrice)
        })
        that.setData({
          skillShopList: res.data.goods.slice(0, 3),
          totalSecond: res.data.item ? res.data.item.remainTime : ''
        });
        that.countdown(that);
        that.calcFixedTop();
        wx.hideLoading();
      }
    });
  },

  // 获取我的优惠券信息数据
  getMyCouponData() {
    let that = this;
    util.request(api.CouponMyList, {
      status: '0',
      page: 1,
      limit: 100
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          couponData: res.data.list
        });
      }
    });
  },


  /*
  *   登录后当天第一次进入首页 弹框 优惠券数据
  * */
  getIndexCouponData() {
    let that = this;
    // console.log('调取登录当天第一次进入首页优惠券数据');
    util.request(api.indexCouponList).then(function(res) {
      if (res.errno === 0) {
        // 处理时间 截取
        res.data.list.map(item => {
          // 2020-04-16 00:00:00 ----> 04-16 00:00
          if(item.timeType !== 0) {
            item.startTime = item.startTime.slice(5, -3)
            item.endTime = item.endTime.slice(5, -3)
          }
        })
        that.setData({
          couponData: res.data.list
        })
      }
    });
  },

  /*
  *   获取未登录第一次进入首页 新人优惠券数据
  * */
  getIndexNewPeopleCoupon() {
    let that = this;
    util.request(api.indexCouponList).then(function(res) {
      if (res.errno == 0) {
        // 处理时间 截取
        res.data.list.map(item => {
          // 2020-04-16 00:00:00 ----> 04-16 00:00
          if(item.timeType !== 0) {
            item.startTime = item.startTime.slice(5, -3)
            item.endTime = item.endTime.slice(5, -3)
          }
        })
        that.setData({
          newPeopleCouponData: res.data.list
        })
      }
    });
  },

  closeNewPeopleCouponModel() {
    this.setData({
      newPeopleCouponModel: false
    })
  },

  goLogin() {
    navigateTo('/pages/auth/login/login')
  },

  // 热销产品添加到购物车
  hotAddCart(e) {
    let goodsInfo = this.data.hotGoods.list[e.currentTarget.dataset.itemIndex];
    let goodsId = goodsInfo.id;
    util.addToCart(goodsId, 'needUpdateTabBar', false).then(res => {
      // 数量
      let number = 'hotGoods.list[' + e.currentTarget.dataset.itemIndex + '].number';
      if (goodsInfo.number) {
        this.setData({
          [number]: goodsInfo.number + 1
        })
      } else {
        this.setData({
          [number]: 1
        })
      }

      // 同步更新商品列表的数量
      this.data.goodsList.forEach(item => {
        item.list.forEach(item_1 => {
          if (item_1.id === goodsId) {
            if (goodsInfo.number) {
              item.number = goodsInfo.number + 1
            } else {
              item.number = 1
            }
          }
        })
      });

      this.setData({
        goodsList: this.data.goodsList
      })
    })
  },

  //添加到购物车
  addToCart(e) {
    let goodsInfo = e.currentTarget.dataset.item;
    let goodsId = goodsInfo.id;
    let goodsIndex = e.currentTarget.dataset.index;
    let displayFlag = `shopListData[${goodsIndex}].displayFlag`;
    let animationX = `shopListData[${goodsIndex}].animationX`;
    let animationY = `shopListData[${goodsIndex}].animationY`;
    let clientX = app.globalData.ww - e.touches[0].clientX;
    let clientY = app.globalData.hh - e.touches[0].clientY + 150;

    util.addToCart(goodsId, 'needUpdateTabBar', false).then(res => {
      // 动画[当前点击时间大于上次点击时间2s才执行]
      if (new Date().getTime() - app.globalData.animationTime > 500) {
        this.setData({
          [displayFlag]: false,
          [animationX]: clientX,
          [animationY]: clientY
        })
      }

      app.globalData.animationTime = new Date().getTime();
      setTimeout(() => {
        this.setData({
          [displayFlag]: true,
          [animationX]: 0,
          [animationY]: 0
        })
      }, 1000);

      // 数量
      let number = this.data.shopListData[goodsIndex].number;
      if (goodsInfo.number) {
        this.setData({
          [number]: goodsInfo.number + 1
        })
      } else {
        this.setData({
          [number]: 1
        })
      }

      // 同步更新热销商品的数量
      this.data.hotGoods.list.forEach(item => {
        if (item.id === goodsId) {
          if (goodsInfo.number) {
            item.number = goodsInfo.number + 1
          } else {
            item.number = 1
          }
        }
      });

      this.setData({
        hotGoods: this.data.hotGoods
      })
    })
  },

  //跳转到对应分类
  goClassify(e) {
    wx.switchTab({
      url: '/pages/catalog/catalog'
    });

    app.globalData.classifyId = e.currentTarget.dataset.id;
  },

  // 获取首页菜谱数据
  fetchDelicacyData() {

    util.request(api.delicacyIndexList).then(res => {
      // console.log(res.data);
      this.setData({
        delicacyListData: res.data
      })
      this.calcFixedTop()
    })
  },

  // 主页面滚动事件
  onPageScroll: throttle(function(event) {
    let that = this;
    // console.log('滚动的距离' + event.scrollTop, '该元素的位置距离' + app.globalData.fixedTop);
    // const $ = wx.createSelectorQuery();
    // const target = $.selectAll('.list-wrap-header');

    that.setData({
      fixedCategory: !(event.scrollTop >= app.globalData.fixedTop),
      showTopBtn: event.scrollTop > 1100,
      scrollTop: event.scrollTop
    })
  }, 50),

  fetchClassifyShop() {
    let that = this;
    let params = {
      page: this.data.page,
      limit: 6,
      id: this.data.cateGoryActive
    };

    if(this.data.page > this.data.totalPages) {
      this.setData({
        noData: true
      });
      return
    }
    showLoading();
    util.request(api.IndexClassifyShopList, params).then(res => {
      let _list = [];
      res.data.list.map(item => {
        item.displayFlag = true;
        item.animationX = 0;
        item.animationY = 0;
        item.number = 0;
        // 处理价格补0
        item.retailPrice = priceSupplement(item.retailPrice)
        item.marketPrice = priceSupplement(item.marketPrice)
        _list.push(item)
      });
      let listData = [...this.data.shopListData, ..._list];
      this.setData({
        shopListData: listData,
        page: this.data.page += 1,
        totalPages: res.data.pages
      });
      wx.hideLoading();

      if(that.data.clickSelectClassify) {
        wx.nextTick(() => {
          let newTop = app.globalData.fixedTop;
          that.setData({
            topNum: newTop,
            clickSelectClassify: false
          });
          wx.pageScrollTo({
            scrollTop: newTop,
            duration: 0
          })
        })
      }

    });
  },

  fetchNewShopList() {
    let that = this;
    let params = {
      page: this.data.page,
      limit: 6
    };

    if(this.data.page > this.data.totalPages) {
      this.setData({
        noData: true
      });
      return
    }
    showLoading();
    util.request(api.IndexNewShopList, params).then(res => {
      let _list = [];
      res.data.list.map(item => {
        item.displayFlag = true;
        item.animationX = 0;
        item.animationY = 0;
        item.number = 0;
        // 处理价格补0
        item.retailPrice = priceSupplement(item.retailPrice)
        item.marketPrice = priceSupplement(item.marketPrice)
        _list.push(item)
      });
      // debugger
      let listData = [...this.data.shopListData, ..._list];
      this.setData({
        shopListData: listData,
        page: this.data.page += 1,
        totalPages: res.data.pages
      });

      wx.hideLoading();
      if(that.data.clickSelectClassify) {
        wx.nextTick(() => {
          let newTop = app.globalData.fixedTop;
          that.setData({
            topNum: newTop,
            clickSelectClassify: false
          });
          wx.pageScrollTo({
            scrollTop: newTop,
            duration: 0
          })
        })
      }

    });
  },

  selectClassifyHandle(e) {
    let that = this;
    // console.log(e.currentTarget.dataset.id);
    if(e.currentTarget.dataset.id === that.data.cateGoryActive) {
      return;
    }
    that.setData({
      cateGoryActive: e.currentTarget.dataset.id,
      page: 1,
      totalPages: 1,
      shopListData: [],
      noData: false,
      clickSelectClassify: true,
      fixedCategory: false
    });


    if(e.currentTarget.dataset.id === 0) {
      this.fetchNewShopList()
    } else {
      this.fetchClassifyShop();
      let shopListPicDataAry = this.data.goodsClassify.filter( item => item.id === e.currentTarget.dataset.id);
      // console.log(shopListPicDataAry);
      this.setData({
        shopListPicData: shopListPicDataAry[0]
      })
    }
  },

  onReachBottom() {
    if(this.data.cateGoryActive === 0) {
      this.fetchNewShopList()
    } else {
      this.fetchClassifyShop()
    }
  },

  enterSkillPage () {
    navigateTo('/pages/seckill/seckill')
  },

  enterGoodDetail(e) {
    let id = e.currentTarget.dataset.goodsid;
    navigateTo(`/pages/goods/goods?id=${id}`)
  },

  enterClassify(e) {
    switchTab('/pages/catalog/catalog')
  },

  onHide() {
    clearInterval(this.interval);
    this.setData({
      newPeopleCouponData: []
    })
  },

  closeCouponModel() {
    this.setData({
      couponModel: false
    })
  },

  enterDelicacyDetail(e) {
    let id = e.currentTarget.dataset.id;
    navigateTo(`/pages/delicacyDetail/delicacyDetail?id=${id}`)
  },

  useCouponHandle(e) {
    let that = this;
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;

    if (item.toUse == 1) { // 去领取调取接口
      util.request(api.CouponReceive, {
        couponId: item.id
      }, 'POST').then(res => {
        if (res.errno === 0) {
          wx.showToast({
            title: "领取成功"
          })
          let _couponData = that.data.couponData;
          _couponData[index].toUse = 0;
          that.setData({
            couponData: _couponData
          })
        } else {
          util.showErrorToast(res.errmsg);
        }
      })
    } else { // 去使用进入分类页
      switchTab('/pages/catalog/catalog')
      that.setData({
        couponModel: false
      })
    }

  },

  toTopHandle() {
    this.setData({
      showTopBtn: false
    });
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },
  goAdLink(e){
    let link = e.currentTarget.dataset.link;
    if (link == '/pages/signupActivity/registerActivity' && !app.globalData.hasLogin){
      navigateTo('/pages/auth/login/login')
    }else {
      navigateTo(link)
    }
  }

});

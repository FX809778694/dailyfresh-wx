import {priceSupplement} from "../../utils/toolMethods";

var util = require('../../utils/util.js');
var api = require('../../config/api.js');

//获取应用实例
const app = getApp();

Page({
  data: {
    categoryList: [], // 一级目录
    currentCategory: {}, // 当前一级目录
    currentSubCategoryList: [], // 当前一级目录对应二级目录
    goodsList: [], // 商品列表
    goodsCount: 0, // 商品总数
    id: '', // 要查询分类的id
    masterId: '', // 一级目录的id
    childSearch: false, // 当前是否查询子分类
    isAllClassify: false, // 是否展开全部分类
    toChildClassify: '', // 点击子分类滑到对应位置
    page: 1,
    limit: 10,
    totalPages: 0,
    shopTotal: 0, // 商品的数量
  },

  onShow() {
    if (app.globalData.classifyId !== null) {
      this.setData({
        id: app.globalData.classifyId,
        isClassifyClick: true
      })
    }
    this.getCatalog();

    this.setData({
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
    });

    // 设置tabBar购物车数量
    if (app.globalData.tabBarCartNum !== 0) {
      util.tabBarCartNum(0)
    } else {
      wx.removeTabBarBadge({
        index: 3,
      })
    }
  },

  // 上拉加载
  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.setData({
        page: this.data.page + 1
      });

      if (this.data.childSearch) {
        this.getGoodsList();
      } else {
        this.getCurrentCategory();
      }

    } else {
      wx.showToast({
        title: '该没有更多商品了',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        noGoodsFlag: true
      });
      return false;
    }
  },

  // 获取一级目录
  getCatalog: function() {
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.CatalogList, {
      id: this.data.id,
      page: this.data.page,
      limit: this.data.limit
    }, 'POST').then(res => {
      if (res.errno === 0) {
        // 判断是否点击分类进入，如果是加载对应分类，不是就加载第一个
        if (app.globalData.classifyId !== null) {
          let indexNum = null;
          res.data.categoryList.forEach((item, index) => {
            if (item.id === app.globalData.classifyId) {
              indexNum = index;
            }
          });
          this.setData({
            id: res.data.categoryList[indexNum].id,
            masterId: res.data.categoryList[indexNum].id,
            categoryList: res.data.categoryList,
            goodsList:[]
          });
        } else {
          this.setData({
            id: res.data.categoryList[0].id,
            masterId: res.data.categoryList[0].id,
            categoryList: res.data.categoryList,
          });
        }

        this.getCurrentCategory();
      }
      wx.hideLoading();
    });

    util.request(api.GoodsCount).then(res => {
      this.setData({
        goodsCount: res.data
      });
    });
  },

  // 切换一级目录
  switchCate(event) {
    /**
     * @id 要查询分类的id
     * @masterId 一级分类id
     * @goodsList 商品列表
     * @childSearch 是否是二级分类搜索
     * @page 从第一页开始
     * @isAllClassify 是否展开全部二级分类
     */
    this.setData({
      id: event.currentTarget.dataset.id,
      masterId: event.currentTarget.dataset.id,
      goodsList: [],
      page: 1,
      childSearch: false,
      isAllClassify: false,
      noGoodsFlag: false
    });

    app.globalData.classifyId = event.currentTarget.dataset.id;
    this.getCurrentCategory();
  },

  // 查询一级目录全部商品
  allClassify() {
    this.setData({
      id: this.data.masterId,
      goodsList: [],
      page: 1,
      childSearch: false,
      isAllClassify: false
    });
    this.getCurrentCategory();
  },

  // 获取二级目录
  getCurrentCategory() {
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.CatalogCurrent, {
      id: this.data.id,
      page: this.data.page,
      limit: this.data.limit
    }, 'POST').then(res => {
      if (res.errno === 0) {
        // 如果上拉加载，就合并新数据【二级分类】
        this.data.goodsList = [...this.data.goodsList, ...res.data.goodsList];
        this.data.goodsList.forEach(item => {
          item.number = 0;
          // 处理价格补0
          item.retailPrice = priceSupplement(item.retailPrice)
          item.marketPrice = priceSupplement(item.marketPrice)

          // 如果购物车有商品，就回显对应的数量
          if (app.globalData.cartList) {
            app.globalData.cartList.forEach(val => {
              if (item.id === val.id) {
                item.number = val.number
              }
            })
          }
        });

        this.setData({
          currentCategory: res.data.currentCategory,
          currentSubCategoryList: res.data.currentSubCategory,
          goodsList: this.data.goodsList,
          totalPages: res.data.pages,
          shopTotal: res.data.total
        });
      }
      wx.hideLoading();
    });
  },

  // 切换二级目录
  switchChildClassify(event) {
    /**
     * @id 二级分类id
     * @goodsList 商品列表
     * @childSearch 是否是二级分类搜索
     * @page 从第一页开始
     * @isAllClassify 是否展开全部二级分类
     */
    this.setData({
      id: event.currentTarget.dataset.id,
      goodsList: [],
      childSearch: true,
      page: 1,
      isAllClassify: false,
      toChildClassify: `id-${event.currentTarget.dataset.id}`
    });
    this.getGoodsList()
  },

  // 商品列表
  getGoodsList() {
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.GoodsList, {
      categoryId: this.data.id,
      page: this.data.page,
      limit: this.data.limit
    }).then(res => {
      if (res.errno === 0) {
        // 如果上拉加载，就合并新数据【一级分类】
        this.data.goodsList = [...this.data.goodsList, ...res.data.list];
        this.data.goodsList.forEach(item => {
          item.number = 0;
          // 处理价格补0
          item.retailPrice = priceSupplement(item.retailPrice)
          item.marketPrice = priceSupplement(item.marketPrice)

          // 如果购物车有商品，就回显对应的数量
          if (app.globalData.cartList) {
            app.globalData.cartList.forEach(val => {
              if (item.id === val.id) {
                item.number = val.number
              }
            })
          }
        });
        this.setData({
          goodsList: this.data.goodsList,
          totalPages: res.data.pages,
          shopTotal: res.data.total
        });
      }
      wx.hideLoading();
    });
  },

  // 展开 & 收缩 分类
  toggleClassify() {
    this.setData({
      isAllClassify: !this.data.isAllClassify
    })
  },

  // 减少数量
  cutNumber(event) {
    let itemIndex = event.target.dataset.itemIndex;
    let goodsInfo = this.data.goodsList[itemIndex];
    let setNum = 'goodsList[' + itemIndex + '].number';
    let goodsIds = [];
    goodsIds.push(goodsInfo.id);
    let number = goodsInfo.number - 1;

    if (number === 0) {
      wx.showModal({
        content: '确定删除该商品吗？',
        success: res => {
          if (res.confirm) {
            util.request(api.CartDelete, {
              cart: JSON.stringify([{
                goodsId: goodsInfo.id,
                isFlashGoods: 0
              }])
            }, 'POST').then(res => {
              if (res.errno === 0) {
                // 改变全局购物车数量
                if (app.globalData.cartList) {
                  app.globalData.cartList.forEach((item,index) => {
                    if (item.id === goodsInfo.id) {
                      app.globalData.cartList.splice(index,1)
                    }
                  })
                }
                this.setData({
                  [setNum]: number
                });
                util.tabBarCartNum(-1)
              }
            });
          } else if (res.cancel) {}
        }
      })
    } else {
      goodsInfo.number = number;
      util.request(api.CartUpdate, {
        goodsId: goodsInfo.id,
        number: goodsInfo.number,
      }, 'POST').then(res => {
        if (res.errno === 0) {
          // 改变全局购物车数量
          if (app.globalData.cartList) {
            app.globalData.cartList.forEach(item => {
              if (item.id === goodsInfo.id) {
                item.number = goodsInfo.number
              }
            })
          }

          this.setData({
            [setNum]: goodsInfo.number
          });
          util.tabBarCartNum(-1)
        }
      })
    }
  },

  // 添加数量
  addNumber(event) {
    // debugger
    let itemIndex = event.target.dataset.itemIndex;
    let goodsInfo = this.data.goodsList[itemIndex];
    let goodsId = goodsInfo.id;

    util.addToCart(goodsId, 'needUpdateTabBar', false).then(res => {
      let goodsNum = goodsInfo.number;
      let setNum = 'goodsList[' + itemIndex + '].number';
      this.setData({
        [setNum]: goodsNum + 1
      });

      // 改变全局购物车数量
      if (app.globalData.cartList) {
        app.globalData.cartList.forEach(item => {
          if (item.id === goodsInfo.id) {
            item.number = goodsInfo.number
          }
        })
      }
    })
  },
});

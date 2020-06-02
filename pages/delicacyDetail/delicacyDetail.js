const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');
import {
  throttle,
  switchTab, priceSupplement
} from "../../utils/toolMethods";

const app = getApp();

Page({
  data: {
    detailData: {}, // 详情的数据
    swiperActive: 1,

    viewMore: true,
    cookMajorsData: [],
    allCookMajorsData: [], // 做折叠 所有的最全的
    shortCookMajorsData: [], // 做折叠短的 裁好的

    cartNum: 0,
  },


  onShow() {
    this.setData({
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
      cartNum: app.globalData.tabBarCartNum
    });
  },

  onLoad(e) {
    this.getDetailData(e.id)
  },

  getDetailData(id) {
    let params = {
      id: id
    };
    util.request(api.delicacyDetail, params).then(res => {
      res.data.cookMajors.map( item => {

        item.goodsList.map( val => {
          val.number = 0;
          // 处理价格补0
          val.retailPrice = priceSupplement(val.retailPrice)
          val.marketPrice = priceSupplement(val.marketPrice)
          // 如果购物车有商品，就回显对应的数量
          // debugger
          if (app.globalData.cartList) {
            app.globalData.cartList.forEach(key => {
              if (val.id === key.id) {
                val.number = key.number
              }
            })
          }
        })

      });

      if(res.data.cookMajors.length > 4) {
        let _cookMajorsData = [];
        res.data.cookMajors.map((item, index) => {
          if(index <= 3) {
            _cookMajorsData.push(item)
          }
        });
        this.setData({
          cookMajorsData: _cookMajorsData,
          allCookMajorsData: res.data.cookMajors,
          shortCookMajorsData: _cookMajorsData
        })
      } else {
        this.setData({
          cookMajorsData: res.data.cookMajors,
          allCookMajorsData: res.data.cookMajors,
          shortCookMajorsData: res.data.cookMajors
        })
      }

      res.data.headImgUrls = JSON.parse(res.data.headImgUrls);
      let _dataImg = []
      res.data.headImgUrls.map(item => {
        _dataImg.push(item)
        _dataImg.push(item)
        _dataImg.push(item)
      })
      res.data.headImgUrls = _dataImg
      this.setData({
        detailData: res.data,
      })
    })
  },

  // 减少数量
  cutNumber(event) {
    let that = this;
    let oneIndex = event.target.dataset.itemIndex;
    let twoIndex = event.target.dataset.itemTwoIndex;
    let goodsInfo = this.data.cookMajorsData[oneIndex].goodsList[twoIndex];
    let setNum = 'cookMajorsData[' + oneIndex + ']goodsList[' + twoIndex + '].number';
    let setNumAll = 'allCookMajorsData[' + oneIndex + ']goodsList[' + twoIndex + '].number';
    let setNumShort = 'shortCookMajorsData[' + oneIndex + ']goodsList[' + twoIndex + '].number';

    let goodsIds = [];
    goodsIds.push(goodsInfo.id);
    let number = goodsInfo.number - 1;
    // debugger
    if (number === 0) {
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
            [setNum]: number,
            [setNumAll]: number,
            [setNumShort]: number
          });
          that.setData({
            cartNum: app.globalData.tabBarCartNum -= 1
          });
        }
      });
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
            [setNum]: goodsInfo.number,
            [setNumAll]: number,
            [setNumShort]: number
          });
          that.setData({
            cartNum: app.globalData.tabBarCartNum -= 1
          });
        }
      })
    }
  },

  // 添加数量
  addNumber(event) {
    // debugger
    let that = this;
    let oneIndex = event.target.dataset.itemIndex;
    let twoIndex = event.target.dataset.itemTwoIndex;
    let goodsInfo = this.data.cookMajorsData[oneIndex].goodsList[twoIndex];

    let goodsId = goodsInfo.id;
    util.addToCart(goodsId, 'unNeedUpdateTabBar', false).then(res => {
      let goodsNum = goodsInfo.number;
      let setNum = 'cookMajorsData[' + oneIndex + ']goodsList[' + twoIndex + '].number';
      let setNumAll = 'allCookMajorsData[' + oneIndex + ']goodsList[' + twoIndex + '].number';
      let setNumShort = 'shortCookMajorsData[' + oneIndex + ']goodsList[' + twoIndex + '].number';
      this.setData({
        [setNum]: goodsNum + 1,
        [setNumAll]: goodsNum + 1,
        [setNumShort]: goodsNum + 1
      });

      // 改变全局购物车数量
      if (app.globalData.cartList) {
        app.globalData.cartList.forEach(item => {
          if (item.id === goodsInfo.id) {
            item.number = goodsInfo.number
          }
        })
      }

      that.setData({
        cartNum: app.globalData.tabBarCartNum += 1
      });

    })
  },

  swiperChangeHandle(e) {
    this.setData({
      swiperActive: e.detail.current + 1
    })
  },

  praisedHandle(e) {
    let id = e.currentTarget.dataset.id;
    let params = {
      id: id
    };
    util.request(api.delicacyPraise, params, 'POST').then(res => {
      this.getDetailData(id);
    })
  },

  viewMoreHandle() {
    let _newCookMajorsData = this.data.allCookMajorsData;
    this.setData({
      viewMore: false,
      cookMajorsData: _newCookMajorsData
    })
  },

  viewHairDataHandle() {
    let _newCookMajorsData = this.data.shortCookMajorsData;
    this.setData({
      viewMore: true,
      cookMajorsData: _newCookMajorsData
    })
  },


  enterCart() {
    switchTab("/pages/cart/cart");
  }

})

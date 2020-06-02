const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');
import {
  throttle
} from "../../utils/toolMethods";

const app = getApp();

Page({
  data: {
    fixedTabs: true, // 固定tabs
    tabsActive: 0
  },

  onReady() {
    let that = this;
    const $ = wx.createSelectorQuery();
    const target = $.selectAll('.list-wrap-tabs');
    target.boundingClientRect(function (rects) {

      if (app.globalData.fixedFoodsTop === 0) {
        app.globalData.fixedFoodsTop = rects[0].top;
      }
    }).exec()


  },

  // 主页面滚动事件
  onPageScroll: throttle(function(event) {
    let that = this;
    // console.log('滚动的距离' + event.scrollTop, '该元素的位置距离' + app.globalData.fixedFoodsTop);

    that.setData({
      fixedTabs: !(event.scrollTop >= app.globalData.fixedFoodsTop)
    })
  }, 100),

  selectClassifyHandle(e) {
    let that = this;
    // console.log(e.currentTarget.dataset.id);
    if(e.currentTarget.dataset.id === that.data.cateGoryActive) {
      return;
    }
    that.setData({
      cateGoryActive: e.currentTarget.dataset.id,
      page: 1,
      shopListData: [],
      noData: false,
      clickSelectClassify: true,
      fixedCategory: false
    });

  },


  onReachBottom() {

  },

})

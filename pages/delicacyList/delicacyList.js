const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');
import {
  throttle,
  navigateTo,
  showLoading
} from "../../utils/toolMethods";

const app = getApp();

Page({
  data: {
    recommendData: [], //经典推荐数据
    fixedTabs: false, // 固定tabs
    tabsData: [],
    contentListData: [],
    tabsActive: 0,
    page: 1,
    size: 10,
    totalPages: 1,
    showTopBtn: false,
  },

  onReady() {
    let that = this;
    const $ = wx.createSelectorQuery();
    const target = $.selectAll('.list-wrap-tabs');
    target.boundingClientRect(function (rects) {
      // console.log(rects[0].top, app.globalData.fixedFoodsTop);

      if (app.globalData.fixedFoodsTop === 0) {
        app.globalData.fixedFoodsTop = rects[0].top;
      }
    }).exec()


  },

  onLoad() {

    this.getTabsData();
    this.getRecommendData();

  },

  getTabsData() {
    util.request(api.delicacyTabs).then(res => {
      console.log(res);
      this.setData({
        tabsData: res.data,
        tabsActive: res.data[0].id
      })
      this.getContentListData(res.data[0].id);
    })
  },

  // 主页面滚动事件
  onPageScroll: throttle(function(event) {
    let that = this;
    // console.log('滚动的距离' + event.scrollTop, '该元素的位置距离' + app.globalData.fixedFoodsTop);

    that.setData({
      fixedTabs: event.scrollTop >= app.globalData.fixedFoodsTop,
      showTopBtn: event.scrollTop > 1100
    })
  }, 100),

  selectClassifyHandle(e) {
    let that = this;
    console.log(e.currentTarget.dataset.id);
    if(e.currentTarget.dataset.id === that.data.tabsActive) {
      console.log("选中过了");
      return;
    }
    that.setData({
      tabsActive: e.currentTarget.dataset.id,
      page: 1,
      totalPages: 1,
      contentListData: [],
      noData: false,
      clickSelectClassify: true,
      fixedTabs: false
    });
    that.getContentListData(e.currentTarget.dataset.id);
  },

  getContentListData(id) {

    let that = this;
    let params = {
      page: this.data.page,
      limit: this.data.size,
      classifyId: id ? id : this.data.tabsActive
    };
    if(this.data.page > this.data.totalPages) {
      console.log('没有下一页啦');
      this.setData({
        noData: true
      });
      return
    }

    showLoading();

    util.request(api.delicacyList, params).then(res => {
      wx.hideLoading();

      console.log(res);
      let listData = [...this.data.contentListData, ...res.data.list];
      this.setData({
        contentListData: listData,
        page: this.data.page += 1,
        totalPages: res.data.pages
      });

      if(that.data.clickSelectClassify) {
        wx.nextTick(() => {
          let newTop = app.globalData.fixedFoodsTop;
          console.log(newTop);
          that.setData({
            clickSelectClassify: false
          });
          wx.pageScrollTo({
            scrollTop: newTop,
            duration: 0
          })
        })
      }

    })
  },

  getRecommendData() {

    util.request(api.delicacyBannerList).then(res => {
      this.setData({
        recommendData: res.data
      })
    })

  },

  onReachBottom() {
    console.log('我到底啦');
    this.getContentListData();
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

  }

})

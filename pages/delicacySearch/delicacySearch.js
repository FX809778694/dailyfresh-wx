import {navigateTo, showLoading} from "../../utils/toolMethods";

var util = require('../../utils/util.js');
var api = require('../../config/api.js');

var app = getApp();
Page({
  data: {
    keywrod: '',
    searchStatus: false,
    delicacyArticleList: [],
    historyKeyword: [],
    categoryFilter: false,
    currentSort: 'like_count',
    currentSortOrder: 'asc',

    currentSortType: 'default',
    defaultKeyword: {},

    hotKeyword: [{
      id: 111,
      keyword: '红烧排骨'
    }],

    page: 1,
    limit: 10,
    totalPages: 1
  },

  //事件处理函数
  closeSearch: function() {
    wx.navigateBack()
  },

  clearKeyword: function() {
    this.setData({
      keyword: '',
      searchStatus: false
    });
  },
  onLoad: function() {
    this.setData({
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
    });
  },

  inputChange: function(e) {
    this.setData({
      keyword: e.detail.value,
      searchStatus: false
    });
  },

  inputFocus: function() {
    this.setData({
      searchStatus: false,
      goodsList: []
    });
  },

  getDelicacyList: function() {
    let that = this;

    if(this.data.page > this.data.totalPages) {
      console.log('没有下一页啦');
      this.setData({
        noData: true
      });
      return
    }
    showLoading();

    util.request(api.delicacySearch, {
      name: that.data.keyword,
      page: that.data.page,
      limit: that.data.limit,
      sort: that.data.currentSort,
      order: that.data.currentSortOrder
    }).then(function(res) {

      wx.hideLoading();
      console.log(res);

      if (res.errno === 0) {

        that.setData({
          searchStatus: true,
          delicacyArticleList: [...that.data.delicacyArticleList, ...res.data.list],
          page: that.data.page += 1,
          totalPages: res.data.pages
        });

      }

    });
  },

  openSortFilter: function(event) {
    let currentId = event.currentTarget.id;
    console.log(this.data.currentSortOrder);
    wx.pageScrollTo({
      scrollTop: 0,
    });
    this.setData({
      page: 1,
      delicacyArticleList: []
    });
    switch (currentId) {
      case 'likeCount':
        let tmpSortOrder = 'asc';
        if (this.data.currentSortOrder == 'asc') {
          tmpSortOrder = 'desc';
        }
        this.setData({
          currentSortType: 'likeCount',
          currentSort: 'like_count',
          currentSortOrder: tmpSortOrder
        });

        this.getDelicacyList();
        break;
      default:
        //综合排序
        this.setData({
          currentSortType: 'default',
          currentSort: 'name',
          currentSortOrder: 'desc'
        });
        this.getDelicacyList();
    }
  },

  onKeywordTap: function(event) {
    this.getSearchResult(event.target.dataset.keyword);
  },

  getSearchResult(keyword) {
    this.setData({
      keyword: keyword,
      page: 1,
      delicacyArticleList: []
    });

    this.getDelicacyList();
  },


  onReachBottom() {
    console.log('我到底啦');
    this.getDelicacyList();
  },

  onKeywordConfirm(event) {
    this.getSearchResult(event.detail.value);
  },

  enterDelicacyDetail(e) {
    let id = e.currentTarget.dataset.id;
    navigateTo(`/pages/delicacyDetail/delicacyDetail?id=${id}`)
  }

})

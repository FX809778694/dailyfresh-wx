var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
import {
  showLoading,
  timeStrOperate
} from "../../../utils/toolMethods"

var app = getApp();

Page({

  data: {
    applyDetailData: {},
    allStatusData: [],
    statusData: [],
    showMoreBtn: true,
  },

  onLoad: function (options) {
    this.getApplyDetail(options.aftersalesId)
  },

  onShow: function () {

  },

  getApplyDetail(id) {
    showLoading();
    util.request(api.serviceApplyDetail, {aftersalesId: id}).then(res => {
      console.log(res);
      res.data.list.map(item => {
        item.createTime = util.formatTime(new Date(item.createTime));

        // res.data.list.push(item);
        // res.data.list.push(item);
        // res.data.list.push(item);
      });
      res.data.aftersales.applyImages = res.data.aftersales.applyImages.split(',');
      this.setData({
        applyDetailData: res.data,
      });

      // res.data.list = res.data.list.reverse();
      let _statueData = [];
      res.data.list.map((item, index) => {
        if(index < 3) {
          _statueData.push(item)
        }
      });
      this.setData({
        allStatusData: res.data.list,
        statusData: _statueData,
      });

      wx.hideLoading();
    })
  },

  // 点击显示更多 把全部数据赋值到显示数据
  showMoreData() {
    let _statusData = this.data.allStatusData;
    this.setData({
      statusData: _statusData,
      showMoreBtn: false
    })
  }


});

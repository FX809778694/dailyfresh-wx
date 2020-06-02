var util = require('../../utils/util.js');
var api = require('../../config/api.js');
import {
  dateClockFormat,
  showLoading,
  navigateTo,
  takeOutTime, priceSupplement
} from '../../utils/toolMethods'

var app = getApp();

Page({

  data: {
    totalSecond: 3600 * 1000 * 8,
    clock: '',
    clockHr: '',
    clockMin: '',
    clockSec: '',
    microSec: '',

    timeList: [],
    selectTime: 0, // 选中的时间段
    initialLeft: 0,

    itemStatus: 2, //选中的类型

    windowHeight: 0,
    shopList: [],
    totalSize: 1,

    noDataWrapHeight: 0
  },

  onShow: function() {
    this.setData({
      windowHeight: app.globalData.hh - 90,
      noDataWrapHeight: app.globalData.hh - 90
    });
    // console.log(app.globalData);
    this.getSkillTimeList();

    this.countdown(this)
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

  onReachBottom() {

  },

  getSkillTimeList() {
    let that = this;
    showLoading();
    util.request(api.skillTimeList).then(function(res) {
      res.data.map(item => {
        item.itemStart = takeOutTime(item.itemStart, 'hh:mm');
      });
      if (res.errno === 0) {
        let listData = [...that.data.timeList, ...res.data];
        let selTimeAry = listData.filter(item => item.itemStatus === 2);
        that.setData({
          timeList: listData,
          selectTime: selTimeAry[0].itemId,
          totalSecond: selTimeAry[0].remainTime
        });

        wx.nextTick(() => {

          const $ = wx.createSelectorQuery();
          const target = $.selectAll('.active-time-t');

          target.boundingClientRect(function (rects) {

            that.setData({
              initialLeft: rects[0].left
            })

          }).exec();
        });

        that.getSkillShopList(selTimeAry[0].itemId);

        wx.hideLoading();
      }
    });
  },

  getSkillShopList(itemId) {
    let that = this;
    if(this.data.page > this.data.totalPages) {
      this.setData({
        noData: true
      });
      return
    }
    showLoading();
    util.request(api.skillShopList, {
      itemId: itemId
    }).then(function(res) {
      if (res.errno === 0) {
        res.data.map(item => {
          // 处理价格补0
          item.retailPrice = priceSupplement(item.retailPrice)
          item.goodsFlashPrice = priceSupplement(item.goodsFlashPrice)
          // debugger
          if(item.goodsStock == 0) {
            item.processWidth = 100
          } else {
            item.processWidth =  item.goodsStock / item.goodsMaxNumber * 100 * 0.3 + 70;
          }
        })
        that.setData({
          shopList: res.data,
          totalSize: res.data.length
        });
        wx.hideLoading();
      }
    });
  },

  selectTimeHandle(e) {
    let item = e.currentTarget.dataset.item;
    this.setData({
      selectTime: item.itemId,
      itemStatus: item.itemStatus
    });
    this.getSkillShopList(item.itemId);
  },

  timeScrollHandle() {

  },

  enterGoodDetail(e) {
    let id = e.currentTarget.dataset.goodsid;
    navigateTo(`/pages/goods/goods?id=${id}`)
  },

  onHide() {
    clearInterval(this.interval);
    this.setData({
      timeList: []
    })
  },

  onUnload() {
    clearInterval(this.interval);
    this.setData({
      timeList: []
    })
  }

});

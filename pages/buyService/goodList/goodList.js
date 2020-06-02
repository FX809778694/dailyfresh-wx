var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
import {
  timeStrOperate,
  navigateTo,
  showLoading,
  successToast
} from "../../../utils/toolMethods"

var app = getApp();

Page({

  data: {
    tabsActive: '0',
    listData: [],
    orderId: 0,
    orderSn: 0,
    serviceListData: [],
  },

  onLoad: function (options) {
    console.log(options);
    this.setData({
      orderId: options.id,
      orderSn: options.orderSn
    });
    this.getApplyOrderGoodsList(options.id);
  },


  getApplyOrderGoodsList(id) {
    showLoading();
    util.request(api.serviceOrderGoodsList,{orderId: id}).then(res => {
      console.log(res);
      this.setData({
        listData: res.data,
        listTotal: res.data.length
      });
      wx.hideLoading();
    })
  },
  getGoodsApplyOrderList() {
    showLoading();
    util.request(api.serviceGoodsRecordList,{orderSn: this.data.orderSn}).then(res => {
      console.log(res);
      res.data.map(item => {
        item.aftersales.createTime = util.formatTime(new Date(item.aftersales.createTime))
      });
      this.setData({
        serviceListData: res.data,
        listTotal: res.data.length
      });
      wx.hideLoading();
    })
  },

  selectTabs(e) {
    let active = e.currentTarget.dataset.item;
    if(active === this.data.tabsActive) return;
    this.setData({
      tabsActive: active,
      listData: []
    });
    console.log(active);
    if(active === '1') { // 获取该订单下的售后记录列表
      this.setData({
        listData: []
      });
      this.getGoodsApplyOrderList();
    } else {
      this.setData({
        serviceListData: []
      });
      this.getApplyOrderGoodsList(this.data.orderId);
    }
  },

  enterApplyService(e) {
    let orderSn = this.data.orderSn;
    let goodsId = e.currentTarget.dataset.goodsId;
    console.log(e.currentTarget.dataset);
    wx.setStorageSync('serviceGoodsData', e.currentTarget.dataset.item);
    navigateTo(`/pages/buyService/serviceApply/serviceApply?orderSn=${orderSn}&goodsId=${goodsId}`)
  },

  enterApplyDetail(e) {
    let aftersalesId = e.currentTarget.dataset.id;
    navigateTo(`/pages/buyService/serviceDetail/serviceDetail?aftersalesId=${aftersalesId}`)
  },

  // 撤销申请
  cancelApply(e) {
    let id = e.currentTarget.dataset.id;
    let that = this;
    wx.showModal({
      title: '',
      content: '您确定撤销申请吗？',
      success(re) {
        if (re.confirm) {
          util.request(api.cancelApply, {aftersalesId: id}).then(res => {
            console.log(res);
            successToast("撤销成功");
            that.setData({
              serviceListData: [],
              listData: []
            });
            that.getGoodsApplyOrderList();

          })
        }
      }
    });

  }

});

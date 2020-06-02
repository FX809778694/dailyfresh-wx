var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
import {
  timeStrOperate,
  navigateTo,
  showLoading,
  successToast,
  priceSupplement
} from "../../../utils/toolMethods"

var app = getApp();

Page({

  data: {
    tabsActive: '0',
    listData: [], // 订单列表数据
    serviceListData: [],
    listTotal: 1
  },

  onLoad: function (options) {
    if(options.from === 'serviceApply') {
      this.setData({
        listData: [],
        tabsActive: 'all'
      });
      this.getAllApplyOrderList();
    }
  },

  onShow: function () {
    this.getApplyOrderList();
  },

  getApplyOrderList() {
    showLoading();
    util.request(api.serviceOrderList).then(res => {
      console.log(res);
      res.data.map(item => {
        // 价格补0
        item.actualPrice = priceSupplement(item.actualPrice)
      })
      this.setData({
        listData: res.data,
        listTotal: res.data.total
      });
      wx.hideLoading();
    })
  },

  getAllApplyOrderList() {
    console.log("获取全部记录");
    showLoading();
    util.request(api.serviceAllOrderList).then(res => {
      console.log(res);
      res.data.map(item => {
        item.aftersales.createTime = util.formatTime(new Date(item.aftersales.createTime))
        // 价格补0
        item.orderGoods.price = priceSupplement(item.orderGoods.price)
      });
      this.setData({
        serviceListData: res.data,
        listTotal: res.data.total
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
    if(active === 'all') {
      this.setData({
        listData: []
      });
      this.getAllApplyOrderList();
    } else {
      this.setData({
        serviceListData: []
      });
      this.getApplyOrderList();
    }
  },

  enterGoodsList(e) {
    let id = e.currentTarget.dataset.id;
    let orderSn = e.currentTarget.dataset.sn;
    navigateTo(`/pages/buyService/goodList/goodList?id=${id}&orderSn=${orderSn}`)
  },

  enterOrderDetail(e) {
    let id = e.currentTarget.dataset.id;
    navigateTo(`/pages/ucenter/orderDetail/orderDetail?id=${id}`)
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
              listData: [],
              serviceListData: []
            });
            that.getAllApplyOrderList();

          })
        }
      }
    });

  }

});

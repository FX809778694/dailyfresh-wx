import {
  showLoading,
  navigateBack,
  navigateTo
} from "../../../utils/toolMethods";

var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();

Page({
  data: {
    addressList: [],
    total: 1,
    page: 1,
    isCheckbox: false,
  },

  onLoad: function(options) {
    if (options.page) {
      this.setData({
        page: options.page
      })
    }

    if(options.page == 'chekout'){
      this.setData({
        isCheckbox: true
      })
    }
  },

  onShow: function() {
    this.getAddressList();
  },

  // 地址列表
  getAddressList() {
    showLoading();
    util.request(api.AddressList).then(res => {
      if (res.errno === 0) {
        // 处理数据 打钩选择的地址id
        let selAddressId = wx.getStorageSync('addressId');
        res.data.list.map( item => {
          item.checked = item.id === selAddressId;
        });
        this.setData({
          addressList: res.data.list,
          total: res.data.total,
        });
        wx.hideLoading();
      }
    });
  },

  // 编辑地址
  editAddress(event) {
    navigateTo('/pages/ucenter/addressAdd/addressAdd');
    wx.setStorageSync('addressAddPage', this.data.page);
    wx.setStorageSync('addressAddId', event.currentTarget.dataset.id);
    // wx.navigateTo({
    //   url: '/pages/ucenter/addressAdd/addressAdd?id=' + event.currentTarget.dataset.id + '&page=' + this.data.page
    // })
  },

  // 新增地址
  addressAdd() {
    navigateTo('/pages/ucenter/addressAdd/addressAdd');
    wx.setStorageSync('addressAddPage', this.data.page);
    wx.removeStorageSync('addressAddId'); // 移除addressAddId 表示为新增地址
    // wx.navigateTo({
    //   url: '/pages/ucenter/addressAdd/addressAdd?page=' + this.data.page
    // })
  },

  // 默认
  checkedAddress(e) {
    let index = e.currentTarget.dataset.itemIndex;
    let address = this.data.addressList[index];
    // debugger
    if(address.checked) {
      wx.removeStorageSync('addressId');
    } else {
      wx.setStorageSync('addressId', address.id);
    }

    navigateBack(1);
  }
});

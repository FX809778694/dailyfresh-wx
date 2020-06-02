var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

import {
  showLoading
} from "../../../utils/toolMethods"
var app = getApp();

Page({
  data: {
    longitudeDeliver: '',
    latitudeDeliver: '',
    scale: 17, // 位置的精确度

    deliveryInfo: {}, // 配送员信息

    markers: [{
      latitude: '',
      longitude: '',
      iconPath: 'https://images.niuniufresh.com/kkd8jq174ya574i4ixu9.png',
      width: 30,
      height: 36
    }],
  },

  onLoad(option) {
    console.log(option);
    this.setData({
      longitudeDeliver: option.lng,
      latitudeDeliver: option.lat,
      'markers[0].latitude': option.lat,
      'markers[0].longitude': option.lng,
    });
    this.getDeliveryInfo(option);
  },

  getDeliveryInfo(option) {
    util.request(api.OrderDeliveryInfo, {
      deliveryId :option. deliveryId,
    }).then(res => {
      if (res.errno === 0) {
        this.setData({
          deliveryInfo: res.data,
          distance: this.getDistance(option.lat, option.lng, option.addressLat, option.addressLng)
        })
      }
    });
  },

  /**
   * @return {number}
   */
  Rad: function(d) { //根据经纬度判断距离
    return d * Math.PI / 180.0;
  },

  getDistance: function(lat1, lng1, lat2, lng2) {
    // lat1用户的纬度
    // lng1用户的经度
    // lat2商家的纬度
    // lng2商家的经度
    var radLat1 = this.Rad(lat1);
    var radLat2 = this.Rad(lat2);
    var a = radLat1 - radLat2;
    var b = this.Rad(lng1) - this.Rad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(2); //保留两位小数
    console.log('经纬度计算的距离:' + s);
    return s
  },

  callPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.deliveryInfo.account //仅为示例，并非真实的电话号码
    })
  }



});

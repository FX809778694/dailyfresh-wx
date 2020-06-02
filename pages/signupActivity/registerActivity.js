const util = require('../../utils/util.js');
const api = require('../../config/api.js');
import {
    showLoading,
    priceSupplement,
    switchTab,
} from "../../utils/toolMethods"

//获取应用实例
const app = getApp();

Page({
    data: {
        couponList:[],
        goodsData:[],
    },
    onLoad: function (options) {

    },
    onShow() {
        this.getMyCouponData();
        this.fetchHotList();
    },
    goClassify(e) {
        switchTab('/pages/catalog/catalog');
    },
    getMyCouponData() {
        let that = this;
        util.request(api.CouponMyList, {
            page: 1,
            limit: 100
        }).then(function(res) {
            if (res.errno === 0) {
                that.setData({
                    couponList: res.data.list.map(item => {
                        item.discount = parseInt(item.discount)
                        return item
                    })
                });
            }
        });
    },
    fetchHotList() {
        showLoading();
        util.request(api.activityHotGoods, {}).then(res => {
            let _list = [];
            res.data.map(item => {
                item.displayFlag = true;
                item.animationX = 0;
                item.animationY = 0;
                item.number = 0;
                // 处理价格补0
                item.retailPrice = priceSupplement(item.retailPrice)
                item.marketPrice = priceSupplement(item.marketPrice)
                _list.push(item)
            });
            // debugger
            this.setData({
                goodsData: _list,
            });

            wx.hideLoading();

        });
    },
});

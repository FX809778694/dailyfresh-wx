const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');

//获取应用实例
const app = getApp();

Page({
  data: {
    goodsList: [], //商品列表
    title: ["新品推荐", "健康生活", "500以下积分", "500-1000积分", "1000-2000积分", "2000以上积分"]
  },

  // 列表
  getIndexData: function () {
    util.request(api.IndexUrl).then(res => {
      if (res.errno === 0) {
        // 组装商品列表
        let goodsList = [];
        if (res.data.channel.length > 0) {
          res.data.channel.forEach(item => {
            //如果分类下面有商品就追加，没有加不追加
            if (res.data[`hotGoodsList${item.id}`] !== undefined) {
              if (res.data[`hotGoodsList${item.id}`].length > 0) {
                goodsList.push({
                  list: res.data[`hotGoodsList${item.id}`]
                })
              }
            }
          })
        }

        this.setData({
          goodsList: goodsList,
        });
      }
    });

    util.request(api.GoodsCount).then(res => {
      this.setData({
        goodsCount: res.data
      });
    });
  },

  onShow() {
    this.getIndexData();
    this.setData({
      swiperImgPrefix: app.globalData.swiperImgPrefix,
      plainImgPrefix: app.globalData.plainImgPrefix,
    });
  }
})

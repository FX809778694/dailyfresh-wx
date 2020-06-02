var util = require('./utils/util.js');
var api = require('./config/api.js');
var user = require('./utils/user.js');

App({
  onLaunch: function(e) {
    // 存储邀请参数
    wx.setStorageSync('inviteId', e.query.co);
    wx.getShareInfo({shareTicket:e.shareTicket,
      success: function (res) {
      }
    });

    const updateManager = wx.getUpdateManager();
    wx.getUpdateManager().onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    });

    //  获取页面的有关信息
    wx.getSystemInfo({
      success: res => {

        this.globalData.ww = res.windowWidth - 100;
        this.globalData.hh = res.windowHeight;
        const model = res.model;
        this.globalData.isIphoneX = /iphone\sx/i.test(model)
          || (/iphone/i.test(model) && /unknown/.test(model))
          || /iphone\s11/i.test(model);
      }
    });
    console.log(this.globalData.isIphoneX);
  },
  onShow: function(options) {
    // debugger
    user.checkLogin().then(res => {
      this.globalData.hasLogin = true;
    }).catch(() => {
      this.globalData.hasLogin = false;
    });
  },

  globalData: {
    hasLogin: false, // 是否登录
    tabBarCartNum: 0, // tabBar 购物车数量
    balanceMoney: 0, // 个人账户余额
    userIntegration: 0, // 个人积分
    classifyId:null, // 分类ID
    cartList:[], // 购物车商品购买数量
    animationTime:0, // 点击添加购物车动画时间
    swiperImgPrefix: '', // 轮播 图片的拼接前缀
    plainImgPrefix: 'http://dailyfresh-api.haowai77.com', // 一般的图片的前缀拼接
    fixedTop: 0, // 首页吸顶元素顶部值
    fixedFoodsTop: 0, // 美食社的吸顶元素顶部值
    isIphoneX: false,
  }
})

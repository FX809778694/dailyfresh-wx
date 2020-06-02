/**
 * 用户相关服务
 */
const util = require('../utils/util.js');
const api = require('../config/api.js');


/**
 * Promise封装wx.checkSession
 */
function checkSession() {
  return new Promise(function(resolve, reject) {
    wx.checkSession({
      success: function() {
        resolve(true);
      },
      fail: function() {
        login()
      }
    })
  });
}

/**
 * Promise封装wx.login
 */
function login() {
  return new Promise(function(resolve, reject) {
    wx.login({
      success: function(res) {
        if (res.code) {
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function(err) {
        reject(err);
      }
    });
  });
}

/**
 * 调用微信登录
 */
function loginByWeixin(userInfo, decryptData) {

  return new Promise(function(resolve, reject) {
    return login().then((res) => {
      //登录远程服务器
      util.request(api.loginByWeChatPhone, {
        code: res.code,
        userInfo: userInfo,
        encryptedData: decryptData.encryptedData,
        iv: decryptData.iv,
      }, 'POST').then(res => {
        if (res.errno === 0) {
          //存储用户信息
          wx.setStorageSync('userInfo', res.data.userInfo);
          wx.setStorageSync('token', res.data.token);

          resolve(res);
        } else {
          reject(res);
        }
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    })
  });
}

/**
 * 判断用户是否登录
 */
function checkLogin() {
  return new Promise(function(resolve, reject) {
    if (wx.getStorageSync('userInfo') && wx.getStorageSync('token')) {
      util.request(api.UserIndex).then(res => {
        if (res.errno === 0) {
          getApp().globalData.tabBarCartNum = res.data.cartGoodsCount
          getApp().globalData.balanceMoney = res.data.balanceMoney
          getApp().globalData.userIntegration = res.data.userIntegration

          util.request(api.CartList).then(res => {
            if (res.errno === 0) {
              if (res.data.cartList.length > 0) {
                res.data.cartList.forEach(item => {
                  getApp().globalData.cartList.push({
                    id: item.goodsId,
                    number: item.number
                  })
                })
              }else{
                getApp().globalData.cartList = []
              }
            }
          });
        }
      });
      checkSession().then(() => {
        resolve(true);
      }).catch(() => {
        reject(false);
      });
    } else {
      reject(false);
    }
  });
}

module.exports = {
  loginByWeixin,
  checkLogin,
};

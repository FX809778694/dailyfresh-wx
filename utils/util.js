var api = require('../config/api.js');

function formatTime(date, type) {
  // debugger;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  if(type === 'yy-mm-dd') {
    return [year, month, day].map(formatNumber).join('-');
  } else {
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n
}

/**
 * 封微信的的request
 */
function request(url, data = {}, method = "GET") {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'X-Token': wx.getStorageSync('token')
      },
      success: function(res) {

        if (res.statusCode == 200) {

          if (res.data.errno == 501) {
            // 清除登录相关内容
            try {
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('token');
            } catch (e) {
              // Do something when catch error
            }
            // 切换到登录页面
            wx.navigateTo({
              url: '/pages/auth/login/login'
            });
          } else {
            resolve(res.data);
          }
        } else {
          reject(res.errMsg);
        }

      },
      fail: function(err) {
        reject(err)
      }
    })
  });
}

function redirect(url) {

  //判断页面是否需要登录
  wx.redirectTo({
    url: url
  });
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

// tabBar 购物车数量
function tabBarCartNum(num) {
  if (num !== 0) {
    let storageNum = getApp().globalData.tabBarCartNum + (num);
    getApp().globalData.tabBarCartNum = storageNum
  }

  if (getApp().globalData.tabBarCartNum !== 0) {
    wx.setTabBarBadge({
      index: 3,
      text: `${getApp().globalData.tabBarCartNum}`,
    })
  } else {
    wx.removeTabBarBadge({
      index: 3,
    })
  }
}

//添加到购物车
function addToCart(goodsId, type, skillShop) {
  return new Promise(function(resolve, reject) {
    request(api.CartAdd, {
      goodsId: goodsId,
      number: 1,
      isFlashGoods: skillShop ? 1 : 0
    }, "POST").then(res => {
      if (res.errno == 0) {
        getApp().globalData.cartList = [];
        request(api.CartList).then(response => {
          if (response.errno === 0) {
            if (response.data.cartList.length > 0) {
              response.data.cartList.forEach(item => {
                getApp().globalData.cartList.push({
                  id: item.goodsId,
                  number: item.number
                })
              })
            }
          }
        });
        if(type === 'needUpdateTabBar') tabBarCartNum(1);
        resolve()
      } else {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: res.errmsg,
          mask: true
        });
        reject()
      }
    });
  });
}

module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast,
  tabBarCartNum,
  addToCart
};

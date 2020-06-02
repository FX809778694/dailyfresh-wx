var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data: {
    password: '',
    phone: '',
    validateCode: ''
  },

  // 支付密码
  bindPassword(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 手机号
  bindPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 获取验证码
  getCode() {
    if (!(/^1[34578]\d{9}$/.test(this.data.phone))) {
      wx.showToast({
        title: '手机号码有误',
        duration: 2000,
        icon: 'none'
      });
      return false;
    }

    util.request(api.GetvalidateCode, {
      phone: this.data.phone,
    }).then(res => {
      if (res.errno === 0) {}
    });
  },

  // 验证码
  bindValidateCode(e) {
    this.setData({
      validateCode: e.detail.value
    })
  },

  // 确定
  confirm() {
    if (this.data.password === '') {
      wx.showToast({
        title: '支付密码不能为空',
        duration: 2000,
        icon: 'none'
      });
      return false;
    }

    if (!(/^\d{6}$/.test(this.data.password))) {
      wx.showToast({
        title: '支付密码格式不对',
        duration: 2000,
        icon: 'none'
      });
      return false;
    }

    if (this.data.validateCode === '') {
      wx.showToast({
        title: '验证码不能为空',
        duration: 2000,
        icon: 'none'
      });
      return false;
    }

    util.request(api.SetPassword, {
      payPassword: this.data.password,
      validateCode: this.data.validateCode,
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.showToast({
          title: '操作成功',
          duration: 2000,
        });
      }
    });
  }
})
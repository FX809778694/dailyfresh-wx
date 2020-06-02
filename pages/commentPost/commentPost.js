var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
import {
  errToast
} from '../../utils/toolMethods'

Page({
  data: {
    orderId: 0,
    goodsList: [],
    itemIndex: 0,
  },

  onLoad: function(options) {
    console.log(options.orderid)
    this.setData({
      orderId: options.orderid,
    });

    this.getOrderDetail()
  },

  // 获取订单详情
  getOrderDetail: function() {
    wx.showLoading({
      title: '加载中',
    });

    util.request(api.OrderDetail, {
      orderId: this.data.orderId
    }).then(res => {
      if (res.errno === 0) {
        let _goodsList = []
        res.data.orderGoods.forEach(item => {

          if(item.comment == '0') {
            item.files = [];
            item.content = "";
            item.star = "1"
            _goodsList.push(item)
          }

        });
        this.setData({
          goodsList: _goodsList,
        });
      }

      wx.hideLoading();
    });
  },

  // 上传图片按钮
  chooseImage: function(e) {
    this.setData({
      itemIndex: e.currentTarget.dataset.itemIndex
    });

    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        let setFiles = `goodsList[${this.data.itemIndex}].files`;
        this.data.goodsList[this.data.itemIndex].files.push(res.tempFilePaths);

        this.setData({
          [setFiles]: this.data.goodsList[this.data.itemIndex].files
        });
        this.upload(res);
      }
    })
  },

  // 上传
  upload: function(res) {
    const uploadTask = wx.uploadFile({
      url: api.StorageUpload,
      filePath: res.tempFilePaths[0],
      name: 'file',
      success: res => {
        let _res = JSON.parse(res.data);
        if (_res.errno === 0) {}
      },
      fail: function(e) {
        wx.showModal({
          title: '错误',
          content: '上传失败',
          showCancel: false
        })
      },
    })
  },

  // 评分
  selectRater: function(e) {
    this.setData({
      itemIndex: e.currentTarget.dataset.itemIndex
    });
    console.log(e.currentTarget.dataset.num);
    let setStar = `goodsList[${this.data.itemIndex}].star`;
    this.setData({
      [setStar]: e.currentTarget.dataset.num
    });
  },

  // 评论
  bindInputValue: function(e) {
    let value = e.detail.value;
    this.setData({
      itemIndex: e.currentTarget.dataset.itemIndex
    });

    //判断是否超过140个字符
    if (value && value.length > 140) {
      return false;
    }

    let setContent = `goodsList[${this.data.itemIndex}].content`;
    this.setData({
      [setContent]: e.detail.value,
    });
  },

  // 取消评论
  onClose: function() {
    wx.navigateBack();
  },

  // 发表评论
  onPost: function() {
    let arr = [];
    let num = 0;

    this.data.goodsList.forEach(item => {
      arr.push({
        orderItemId: item.id,
        commentContent: item.content,
        commentImages: item.files.join(','),
        commentResult: item.star,
        commentReason: "",
      });

      // 如果有评论就 +1
      if (item.content !== '') {
        num++
      }
    });

    if (num === 0) {
      wx.showToast({
        title: '最少评论一条',
        icon: 'none',
        duration: 2000
      });
      return false
    }

    util.request(api.OrderEvaluate, {
      orderItemCommentList: arr
    }, 'POST').then(function(res) {
      // debugger
      if (res.errno === 0) {
        wx.showToast({
          title: '评论成功',
          complete: function() {
            wx.navigateBack();
          }
        })
      } else {

        errToast(res.errmsg)
        setTimeout(() => {
          wx.navigateBack();
        }, 1000)

      }
    });
  },
});

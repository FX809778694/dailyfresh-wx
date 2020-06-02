var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
import {
  showLoading,
  errToast,
  successToast,
  redirectTo
} from "../../../utils/toolMethods"
import arithmetic from '../../../utils/arithmetic'

var app = getApp();

Page({

  data: {
    isIphoneX: false,
    goodsInfo: {},
    shopNumber: 1,
    reasonScaleAry: [
      {
        name: '5%',
        value: 5
      }, {
        name: '10%',
        value: 10
      }, {
        name: '30%',
        value: 30
      }, {
        name: '50%',
        value: 50
      }, {
        name: '70%',
        value: 70
      }, {
        name: '100%',
        value: 100
      }
    ],
    activeSelIndex: 0,
    reasonScale: 5,
    refundAmount: 0,
    oneLevelReasonData: [
      { name: '0', value: '商品问题', checked: 'true'},
      { name: '1', value: '物流问题',  },
      { name: '2', value: '用户问题' },
    ],
    oneLevelActiveReason: '0',
    oneLevelName: '商品问题',
    twoLevelReasonData: [
      {
        classifyItemId: 1,
        itemContent: '商品坏了'
      }, {
        classifyItemId: 2,
        itemContent: '商品坏了'
      }
    ],
    twoLevelActiveReason: '',
    twoLevelName: '',
    allTwoLevelReasonData: [], // 接口获取的所有的二级申请原因数据 一级的前端写死了

    reasonContent: '',

    overage: 3, // 图片选择的总数
    imgListData: [], // 上传的图片列表 最多三个

    successSubmit: false, // 成功提交的弹框
  },

  onLoad: function (options) {
    this.setData({
      orderSn: options.orderSn,
      orderGoodsId: options.goodsId
    })
  },

  onShow: function () {
    let _goodsInfo = wx.getStorageSync('serviceGoodsData');
    let price = _goodsInfo.isFlashGoods ? _goodsInfo.flashPrice : _goodsInfo.price;
    let newMoney = arithmetic.multiply(arithmetic.multiply(this.data.shopNumber, price), this.data.reasonScale/100);
    this.setData({
      isIphoneX: app.globalData.isIphoneX,
      goodsInfo: _goodsInfo,
      refundAmount: newMoney.toFixed(2)
    });
    this.getReasonData();
  },

  cutShopNumber() {
    let newNum = this.data.shopNumber - 1;
    if(newNum <= 1) newNum = 1;
    let price = this.data.goodsInfo.isFlashGoods ? this.data.goodsInfo.flashPrice : this.data.goodsInfo.price;
    let newMoney = arithmetic.multiply(arithmetic.multiply(newNum, price), this.data.reasonScale/100);
    this.setData({
      shopNumber: newNum,
      refundAmount: newMoney.toFixed(2)
    })
  },

  addShopNumber() {
    let newNum = this.data.shopNumber + 1;
    // 限制数量选择最大值
    if (newNum > this.data.goodsInfo.number) {
      errToast("超过可申请数量");
      return
    }
    let price = this.data.goodsInfo.isFlashGoods ? this.data.goodsInfo.flashPrice : this.data.goodsInfo.price;
    let newMoney = arithmetic.multiply(arithmetic.multiply(newNum, price), this.data.reasonScale/100);
    this.setData({
      shopNumber: newNum,
      refundAmount: newMoney.toFixed(2)
    })
  },

  bindReasonScalePickerChange(e) {
    let selKey = e.detail.value;
    let price = this.data.goodsInfo.isFlashGoods ? this.data.goodsInfo.flashPrice : this.data.goodsInfo.price;
    let shopNum = this.data.shopNumber;
    let newMoney = arithmetic.multiply(arithmetic.multiply(shopNum, price), this.data.reasonScaleAry[selKey].value/100);

    this.setData({
      activeSelIndex: selKey,
      reasonScale: this.data.reasonScaleAry[selKey].value,
      refundAmount: newMoney.toFixed(2)
    })
  },

  textareaInputHandle(e) {
    this.setData({
      reasonContent: e.detail.value
    })
  },

  radioOneReasonChange(e) {
    let value = e.detail.value;
    let setAry = this.data.oneLevelReasonData.filter( item => item.value === value);
    if(setAry[0].name === '0') {
      this.setData({
        twoLevelReasonData: this.data.allTwoLevelReasonData[0][0]
      })
    } else if (setAry[0].name === '1') {
      this.setData({
        twoLevelReasonData: this.data.allTwoLevelReasonData[1][1]
      })
    } else if (setAry[0].name === '2') {
      this.setData({
        twoLevelReasonData: this.data.allTwoLevelReasonData[2][2]
      })
    }

    this.setData({
      oneLevelActiveReason: setAry[0].name,
      oneLevelName: value,
      twoLevelActiveReason: '',
      twoLevelName: ''
    })
  },

  twoReasonClickHandle(e) {
    let item = e.currentTarget.dataset.item;
    this.setData({
      twoLevelActiveReason: item.classifyItemId,
      twoLevelName: item.itemContent,
    })
  },

  getReasonData() {
    showLoading();
    util.request(api.serviceReason).then(res => {
      this.setData({
        allTwoLevelReasonData: res.data,
        twoLevelReasonData: res.data[0][0],
      });
      wx.hideLoading();
    })
  },

  // 选择图片上传
  _choose() {
    const that = this;
    let _overage = this.data.overage;

    wx.chooseImage({
      count: 3,
      sizeType: ['original'], // compressed original
      sourceType: ['album', 'camera'],
      success(res) {
        const _tempFiles = res.tempFiles;

        for (let i = 0; i < _tempFiles.length; i++) {
          if (_overage > 0) {
            that.compressed(_tempFiles[i], function(res) {

              wx.uploadFile({
                url: api.StorageUpload, //仅为示例，非真实的接口地址
                filePath: res,
                name: 'file',
                success (res){
                  let _res = JSON.parse(res.data);

                  if (_res.errno === 0) {
                    successToast(`第${i+1}张上传成功`);
                    let newImgList = that.data.imgListData;
                    newImgList.push(_res.data.url);
                    that.setData({
                      imgListData: newImgList
                    });
                  } else {
                    successToast(`第${i+1}张上传失败`);
                  }
                }
              });

              _overage--;
              that.setData({
                overage: _overage
              })
            });
          } else {
            errToast(`最多上传3张`)
          }
        }
        wx.hideLoading()
      },
      fail(res) {
        errToast('选择图片失败', res)
      }
    })

  },

  /**
   * 图片压缩
   * 小于1M不压缩
   * 大于1M小于5M 图片质量为20% （ios实际上压缩了3倍左右）
   * 大于5M小于10M 图片质量为10%
   * 大于10M 图片质量为5%
   *
   * ***/
  compressed(file, completec) {
    let _size = (parseInt(file.size >> 10) / 1024).toFixed(2);
    let _quality;

    if (_size < 1) {
      _quality = 100
    } else if (_size >= 1 && _size < 5) {
      _quality = 20
    } else if (_size >= 5 && _size < 10) {
      _quality = 10
    } else {
      _quality = 5
    }

    if (_quality !== 100) {
      wx.compressImage({
        src: file.path,
        quality: _quality,
        success(res) {
          let _file = res.tempFilePath;
          // console.log('图片压缩成功, 图片原始大小为:' + _size + 'M\n', '图片质量为:' + _quality + '%');
          completec(_file)
        },
        fail(res) {
          wx.hideLoading();
          errToast('图片压缩失败', res);
          completec(file.path)
        }
      })
    } else {
      completec(file.path)
    }
  },

  // 提交申请
  submitApplyHandle() {

    if (this.data.twoLevelActiveReason === '') {
      errToast('请选择申请原因');
      return false;
    }

    if (this.data.reasonContent === '') {
      errToast('请输入您的详细问题描述');
      return false;
    }

    if (this.data.imgListData.length <= 0) {
      errToast('请上传图片描述');
      return false;
    }

    let params = {
      orderSn: this.data.orderSn,
      orderGoodsId: this.data.orderGoodsId,
      applyNum: this.data.shopNumber,
      availableApplyNum: this.data.goodsInfo.number,
      problemProportion: this.data.reasonScale,
      applyAmount: this.data.refundAmount,
      applyContent: this.data.reasonContent,
      applyImages: this.data.imgListData.join(),
      classifyName: this.data.oneLevelName,
      classifyItemId: this.data.twoLevelActiveReason,
      classifyItemContent: this.data.twoLevelName,
    };
    util.request(api.serviceSubmitApply, params).then(res => {

      if(res.errno === 0) {
        this.setData({
          successSubmit: true
        });
      }

    })

  },

  deleteImg(e) {
    let index = e.currentTarget.dataset.item;
    let imgData = this.data.imgListData;
    imgData.splice(index, 1);
    this.setData({
      imgListData: imgData
    })
  },

  enterOrder() {
    redirectTo("/pages/buyService/orderList/orderList?from=serviceApply");
    setTimeout(() => {
      wx.removeStorageSync('serviceGoodsData')
    },400)
  },

  onHide() {

  }

});

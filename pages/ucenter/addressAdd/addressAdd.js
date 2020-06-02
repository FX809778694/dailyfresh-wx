import {navigateBack} from "../../../utils/toolMethods";

var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var check = require('../../../utils/check.js');

var app = getApp();
Page({
  data: {
    id: 0,
    name: '',
    tel: '',
    city: '',
    addressDetail: '',
    isDefault: false,
    addressId: 0,
    longitude: '',
    latitude: '',
    page: '',
    checkSexGirlStatus: true,
    checkSexBoyStatus: false,
    addressTagData:[
      {
        name: '家',
        value: 0
      }, {
        name: '公司',
        value: 1
      }, {
        name: '学校',
        value: 2
      }
    ],
    activeTag: 0
  },

  onShow() {
    // 判断是否是新建地址还是修改地址
    let addressAddPage = wx.getStorageSync('addressAddPage');
    let addressAddId = wx.getStorageSync('addressAddId');
    let addressAddObj = wx.getStorageSync('addressAddObj');

    // debugger
    if (addressAddPage && addressAddId !== 0 && !addressAddObj) {
      this.setData({
        addressId: addressAddId
      });
      this.getAddressDetail();
    }

    // 判断有没有选择收货地址
    if (addressAddObj) {
      let obj = addressAddObj;
      this.setData({
        addressId: obj.id,
        id: obj.id,
        name: obj.name,
        tel: obj.tel,
        city: obj.city,
        addressDetail: obj.addressDetail,
        isDefault: obj.isDefault,
        longitude: obj.longitude,
        latitude: obj.latitude,
      });
    }

    // console.log('新增地址页面的参数page', addressAddPage);
    if (addressAddPage) {
      this.setData({
        page: addressAddPage
      })
    }
  },

  onHide() {
    // console.log('离开了添加地址页面');
    wx.removeStorageSync('addressAddObj')
  },

  checkSexGirl(e) {
    if(this.data.checkSexBoyStatus) {
      this.setData({
        checkSexBoyStatus: false
      })
    }
    this.setData({
      checkSexGirlStatus: true
    })
  },
  checkSexBoy(e) {
    if(this.data.checkSexGirlStatus) {
      this.setData({
        checkSexGirlStatus: false
      })
    }
    this.setData({
      checkSexBoyStatus: true
    })
  },

  selectAddressTag(e) {
    let active = e.currentTarget.dataset.item;
    this.setData({
      activeTag: active
    })
  },

  // 地址详情
  getAddressDetail() {
    util.request(api.AddressDetail, {
      id: this.data.addressId
    }).then(res => {
      // console.log(res);
      if (res.errno === 0) {
        if (res.data) {
          this.setData({
            id: res.data.id,
            name: res.data.name,
            tel: res.data.tel,
            city: res.data.city,
            addressDetail: res.data.addressDetail,
            isDefault: res.data.isDefault,
            longitude: res.data.lng,
            latitude: res.data.lat,
            activeTag: res.data.label,
          });
        }
        // 设置性别的选中
        if(res.data.gender == '0') {
          this.setData({
            checkSexGirlStatus: true,
            checkSexBoyStatus: false
          })
        } else {
          this.setData({
            checkSexGirlStatus: false,
            checkSexBoyStatus: true
          })
        }


      }
    });
  },

  // 收货人
  bindinputName(event) {
    this.setData({
      name: event.detail.value
    });
  },

  // 手机
  bindinputMobile(event) {
    this.setData({
      tel: event.detail.value
    });
  },

  // 门牌号
  bindinputAddress(event) {
    this.setData({
      addressDetail: event.detail.value
    });
  },

  // 是否默认
  bindIsDefault() {
    this.setData({
      isDefault: !this.data.isDefault
    });
  },

  // 保存
  saveAddress() {
    if (this.data.name == '') {
      util.showErrorToast('请输入姓名');
      return false;
    }

    if (this.data.tel == '') {
      util.showErrorToast('请输入手机号码');
      return false;
    }

    if (this.data.city == '') {
      util.showErrorToast('请选择收货地址');
      return false;
    }

    if (this.data.addressDetail == '') {
      util.showErrorToast('请输入详细地址');
      return false;
    }

    if (!check.isValidPhone(this.data.tel)) {
      util.showErrorToast('手机号不正确');
      return false;
    }

    util.request(api.AddressSave, {
      id: this.data.id,
      name: this.data.name,
      tel: this.data.tel,
      province: '',
      city: this.data.city,
      // county: `,${this.data.longitude},${this.data.latitude},`,
      lng: this.data.longitude,
      lat: this.data.latitude,
      areaCode: '',
      addressDetail: this.data.addressDetail,
      isDefault: this.data.isDefault,
      gender: this.data.checkSexGirlStatus ? '0' : '1',
      label: this.data.activeTag
    }, 'POST').then(res => {
      if (res.errno === 0) {
        navigateBack(1);
        wx.removeStorageSync('addressAddObj')
      }
    });
  },

  // 删除
  deleteAddress() {
    wx.showModal({
      title: '',
      content: '确定要删除地址？',
      success: res => {
        if (res.confirm) {
          util.request(api.AddressDelete, {
            id: this.data.addressId
          }, 'POST').then(resp => {
            if (resp.errno === 0) {
              navigateBack(1);
              wx.removeStorageSync('addressAddId');
              wx.removeStorageSync('addressAddObj')
            }
          });
        }
      }
    });
    return false;
  },

  // 地图选择地址
  goMap() {
    wx.getSetting({
      success: res => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: res => {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: dataAu => {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      });
                      wx.getLocation({
                        type: 'wgs84',
                        success: response => {
                          const latitude = response.latitude;
                          const longitude = response.longitude;
                          let obj = {
                            id: this.data.id,
                            name: this.data.name,
                            tel: this.data.tel,
                            city: this.data.city,
                            addressDetail: this.data.addressDetail,
                            isDefault: this.data.isDefault,
                          };

                          // 如果URL没有携带经纬度参数【证明还没有选择地址】
                          if (this.data.longitude === '' && this.data.latitude === '') {
                            wx.navigateTo({
                              url: '/pages/ucenter/addressMap/addressMap?latitude=' + latitude + '&longitude=' + longitude + '&obj=' + JSON.stringify(obj) + '&page=' + this.data.page,
                            })
                          } else {
                            wx.navigateTo({
                              url: '/pages/ucenter/addressMap/addressMap?latitude=' + this.data.latitude + '&longitude=' + this.data.longitude + '&obj=' + JSON.stringify(obj) + '&page=' + this.data.page,
                            })
                          }
                        }
                      })

                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          wx.getLocation({
            type: 'wgs84',
            success: () => {}
          })
        } else {
          wx.getLocation({
            type: 'wgs84',
            success: res => {
              const latitude = res.latitude;
              const longitude = res.longitude;

              let obj = {
                id: this.data.id,
                name: this.data.name,
                tel: this.data.tel,
                city: this.data.city,
                addressDetail: this.data.addressDetail,
                isDefault: this.data.isDefault,
              };

              // 如果URL没有携带经纬度参数【证明还没有选择地址】
              if (this.data.longitude === '' && this.data.latitude === '') {
                wx.navigateTo({
                  url: '/pages/ucenter/addressMap/addressMap?latitude=' + latitude + '&longitude=' + longitude + '&obj=' + JSON.stringify(obj) + '&page=' + this.data.page,
                })
              } else {
                wx.navigateTo({
                  url: '/pages/ucenter/addressMap/addressMap?latitude=' + this.data.latitude + '&longitude=' + this.data.longitude + '&obj=' + JSON.stringify(obj) + '&page=' + this.data.page,
                })
              }
            }
          })
        }
      }
    })
  },
});

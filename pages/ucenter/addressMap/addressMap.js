// 引入SDK核心类
import {navigateBack} from "../../../utils/toolMethods";

let QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
let qqmapsdk;

Page({
  data: {
    id: 0,
    longitude: '', // 经度
    latitude: '', // 纬度
    scale: 17, // 位置的精确度
    markers: [],
    searchFlag: false,
    suggestion: [],
    keyword: '',
    nearbyList: [],
    obj: {},
    page:'',
  },
  onLoad: function(options) {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'MMSBZ-T2Z2S-4Y3OG-6AXU5-RUDK5-B6FT7'
    });

    // 设置用户当前位置的经纬度
    let markerObj = {
      iconPath: "https://niuniu-wx.oss-cn-beijing.aliyuncs.com/addIcon.png",
      latitude: options.latitude,
      longitude: options.longitude,
      width: 25,
      height: 25
    };
    this.data.markers.push(markerObj);
    this.setData({
      longitude: options.longitude,
      latitude: options.latitude,
      obj: JSON.parse(options.obj),
      markers: this.data.markers
    });

    if (options.page){
      this.setData({
        page: options.page
      })
    }
  },

  onShow(){
    this.nearby()
  },

  //关键词下拉选择
  keywordChange(e) {
    var id = e.currentTarget.id;
    for (var i = 0; i < this.data.suggestion.length; i++) {
      if (i == id) {
        this.setData({
          keyword: '',
          searchFlag: false,
        });

        this.setData({
          'obj.city': this.data.suggestion[i].title,
          'obj.longitude': this.data.suggestion[i].longitude,
          'obj.latitude': this.data.suggestion[i].latitude,
        });

        navigateBack(1);
        wx.setStorageSync('addressAddPage', this.data.page);
        wx.setStorageSync('addressAddObj', this.data.obj);

        // wx.redirectTo({
        //   url: '/pages/ucenter/addressAdd/addressAdd?obj=' + JSON.stringify(this.data.obj) + '&page=' + this.data.page,
        // })
      }
    }
  },

  //附近位置选择
  nearbyChange(e) {
    // debugger
    var id = e.currentTarget.id;
    for (var i = 0; i < this.data.nearbyList.length; i++) {
      if (i == id) {
        this.setData({
          'obj.city': this.data.nearbyList[i].title,
          'obj.longitude': this.data.nearbyList[i].longitude,
          'obj.latitude': this.data.nearbyList[i].latitude,
        });

        navigateBack(1);
        wx.setStorageSync('addressAddPage', this.data.page);
        wx.setStorageSync('addressAddObj', this.data.obj);

        // wx.redirectTo({
        //   url: '/pages/ucenter/addressAdd/addressAdd?obj=' + JSON.stringify(this.data.obj) + '&page=' + this.data.page,
        // })

      }
    }
  },

  //触发关键词输入提示事件
  getsuggest(e) {
    let keyword = e.detail.value;
    this.keywordSearch(keyword, 1);
  },

  // 取消关键词搜索
  cancel() {
    this.setData({
      keyword: '',
      searchFlag: false,
    });
  },

  // 关键词搜索
  keywordSearch(keyword, type) {
    // debugger
    qqmapsdk.getSuggestion({
      keyword: keyword,
      region: '全国',
      policy: 1,
      page_size: 20,
      sig: 'xXyAts9EGyMjkOESrxmCkJcJx77ikXL',
      success: res => {
        let addressList = [];
        let latLng = [];
        for (let i in res.data) {
          addressList.push({
            title: res.data[i].title,
            id: res.data[i].id,
            addr: res.data[i].address,
            city: res.data[i].city,
            district: res.data[i].district,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
          });

          // 获取经纬度数组
          latLng.push({
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
          });
        }

        // 计算距离
        qqmapsdk.calculateDistance({
          from: `${this.data.latitude},${this.data.longitude}`,
          to: latLng,
          sig: 'xXyAts9EGyMjkOESrxmCkJcJx77ikXL',
          success: resp => {
            let distanceArr = [];
            for (let i in resp.result.elements) {
              addressList[i].distance = resp.result.elements[i].distance;
              distanceArr.push(resp.result.elements[i].distance)
            }

            // 距离排序[升序]
            distanceArr = distanceArr.sort(function(a, b) {
              return a - b;
            });

            // 根据距离远近组成新的地址列表
            let newAddressList = [];
            distanceArr.forEach(item => {
              addressList.forEach(val => {
                if (item === val.distance) {
                  newAddressList.push(val);
                }
              })
            });
            // 去重【有些距离一样的地址会重复写入】
            newAddressList = [...new Set(newAddressList)];

            // 格式化距离单位
            newAddressList.forEach(item => {
              if (item.distance > 1000) {
                item.distance = (item.distance / 1000).toFixed(2) + '千米';
              } else {
                item.distance = item.distance + '米';
              }

              if (item.latitude === this.data.latitude && item.longitude === this.data.longitude) {
                item.mapCurrentFlag = true
              }
            });

            /**
             * type = 1 搜索框关键词
             * type = 2 用户当前位置
             */
            switch (type) {
              case 1:
                this.setData({
                  suggestion: newAddressList,
                  searchFlag: true,
                });
                break;
              case 2:
                this.setData({
                  nearbyList: newAddressList,
                });
                break;
            }
          }
        })
      },
    });
  },

  // 附近地址
  nearby() {
    qqmapsdk.reverseGeocoder({
      location: `${this.data.latitude},${this.data.longitude}`,
      sig: 'xXyAts9EGyMjkOESrxmCkJcJx77ikXL',
      success: res => {
        let keyword = res.result.address;
        this.keywordSearch(keyword, 2);
      },
    })
  },

  // 点击地图
  mapClick(e) {
    this.setData({
      latitude: e.detail.latitude,
      longitude: e.detail.longitude
    });

    // 更新附近位置
    this.nearby();

    // 更新标记
    let latitude = 'markers[0].latitude';
    let longitude = 'markers[0].longitude';
    this.setData({
      [latitude]: e.detail.latitude,
      [longitude]: e.detail.longitude,
    })
  },

  // 地图视野发生变化
  mapChange(e) {
    if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
      this.mapCtx = wx.createMapContext("map");
      this.mapCtx.getCenterLocation({
        type: 'gcj02',
        sig: 'xXyAts9EGyMjkOESrxmCkJcJx77ikXL',
        success: res => {
          this.setData({
            latitude: res.latitude,
            longitude: res.longitude,
          });

          // 更新附近位置
          this.nearby();

          // 更新标记
          let latitude = 'markers[0].latitude';
          let longitude = 'markers[0].longitude';
          this.setData({
            [latitude]: res.latitude,
            [longitude]: res.longitude,
          })
        }
      })
    }
  },
});

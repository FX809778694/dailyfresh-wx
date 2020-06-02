const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n
};

module.exports = {

  /*倒计时功能需要的时间整理方法*/
  dateClockFormat: (micro_second, type) => {
    let second = Math.floor(micro_second / 1000);
    let day = Math.floor(second / 3600 / 24);
    day = formatNumber(day);
    let hr = Math.floor(second / 3600);
    let hr2 = formatNumber(hr % 24);

    let min = Math.floor((second - hr *3600) / 60);
    min = formatNumber(min);

    let sec = second - hr * 3600 - min * 60;
    sec = formatNumber(sec);
    let micro_sec = Math.floor((micro_second % 1000) / 100);

    if(type === 'combination') {
      return day + '天' + hr2 + '时' + min + '分' + sec + '秒' + micro_sec
    } else if(type === 'partObj') {
      return {
        hr: hr2,
        min: min,
        sec: sec,
        micro_sec: micro_sec
      }
    } else if(type === 'hh:mm') {
      return `${hr2}:${min}`
    }
  },

  // 取出时间段
  takeOutTime(timeSpan, type) {
    let time = new Date(timeSpan);
    let hr = formatNumber(time.getHours());
    let min = formatNumber(time.getMinutes());
    if(type === 'hh:mm') {
      return `${hr}:${min}`
    }
  },

  /*获取地址栏里的参数*/
  getRequest: url => {
    let data = {};
    let _url = decodeURIComponent(url); // 解码
    if (_url.indexOf("?") != -1) {
      data.apiurl = _url.split('?')[0];
      let list = _url.split('?')[1].split('&');
      data.param = {};
      list.forEach(res => {
        data.param[res.split('=')[0]] = res.split('=')[1]
      })
    } else {
      data.apiurl = _url
    }

    return data;
  },

  // 微信提示
  successToast: msg => {
    wx.showToast({
      title: msg || '成功'
    })
  },
  errToast: (msg = '错误', duration = 1500) => {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: duration
    })
  },

  // 微信路由跳转
  switchTab: path => {
    wx.switchTab({
      url: path
    })
  },

  navigateTo: path => {
    wx.navigateTo({
      url: path
    })
  },

  redirectTo: path => {
    wx.redirectTo({
      url: path
    })
  },

  navigateBack: num => {
    wx.navigateBack({
      delta: num
    })
  },

  reLaunch: path => {
    wx.reLaunch({
      url: path
    })
  },

  // 获取手机信息
  getSystemInfo: () => {
    let _res;
    wx.getSystemInfo({
      success(res) {
        _res = res
      }
    });
    return _res
  },

  // loading
  showLoading: (msg = '加载中') => {
    wx.showLoading({
      title: msg,
      mask: true
    })
  },

  // 严格的身份证校验
  isCardID: (sId) => {
    if (!/(^\d{15}$)|(^\d{17}(\d|X|x)$)/.test(sId)) {
      wx.showToast({
        title: '你输入的身份证长度或格式错误',
        icon: 'none'
      });
      return false
    }
    //身份证城市
    var aCity = {
      11: "北京",
      12: "天津",
      13: "河北",
      14: "山西",
      15: "内蒙古",
      21: "辽宁",
      22: "吉林",
      23: "黑龙江",
      31: "上海",
      32: "江苏",
      33: "浙江",
      34: "安徽",
      35: "福建",
      36: "江西",
      37: "山东",
      41: "河南",
      42: "湖北",
      43: "湖南",
      44: "广东",
      45: "广西",
      46: "海南",
      50: "重庆",
      51: "四川",
      52: "贵州",
      53: "云南",
      54: "西藏",
      61: "陕西",
      62: "甘肃",
      63: "青海",
      64: "宁夏",
      65: "新疆",
      71: "台湾",
      81: "香港",
      82: "澳门",
      91: "国外"
    };
    if (!aCity[parseInt(sId.substr(0, 2))]) {
      wx.showToast({
        title: '身份证地区非法',
        icon: 'none'
      });
      return false
    }

    // 出生日期验证
    var sBirthday = (sId.substr(6, 4) + "-" + Number(sId.substr(10, 2)) + "-" + Number(sId.substr(12, 2))).replace(/-/g, "/"),
      d = new Date(sBirthday);
    if (sBirthday != (d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate())) {
      wx.showToast({
        title: '身份证上的出生日期非法',
        icon: 'none'
      });
      return false
    }

    // 身份证号码校验
    var sum = 0,
      weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
      codes = "10X98765432";
    for (var i = 0; i < sId.length - 1; i++) {
      sum += sId[i] * weights[i];
    }
    var last = codes[sum % 11]; //计算出来的最后一位身份证号码
    if (sId[sId.length - 1] != last) {
      wx.showToast({
        title: '你输入的身份证号非法',
        icon: 'none'
      });
      return false
    }
    return true
  },

  /**
   * String去除空格
   * @param  {str}
   * @param  {type}
   *       type:  1-所有空格  2-前后空格  3-前空格 4-后空格
   * @return {String}
   */
  trim: (str, type) => {
    type = type || 1;
    switch (type) {
      case 1:
        return str.replace(/\s+/g, "");
      case 2:
        return str.replace(/(^\s*)|(\s*$)/g, "");
      case 3:
        return str.replace(/(^\s*)/g, "");
      case 4:
        return str.replace(/(\s*$)/g, "");
      default:
        return str;
    }
  },


  /**
   * String 大小写操作
   * @param  {str}
   * @param  {type}
   *       type:  1:首字母大写  2：首页母小写  3：大小写转换  4：全部大写  5：全部小写
   * @return {String}
   */
  changeCase: (str, type) => {
    type = type || 4;
    switch (type) {
      case 1:
        return str.replace(/\b\w+\b/g, function(word) {
          return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();

        });
      case 2:
        return str.replace(/\b\w+\b/g, function(word) {
          return word.substring(0, 1).toLowerCase() + word.substring(1).toUpperCase();
        });
      case 3:
        return str.split('').map(function(word) {
          if (/[a-z]/.test(word)) {
            return word.toUpperCase();
          } else {
            return word.toLowerCase()
          }
        }).join('');
      case 4:
        return str.toUpperCase();
      case 5:
        return str.toLowerCase();
      default:
        return str;
    }
  },

  isFalse: (o) => {
    return !o || o === 'null' || o === 'undefined' || o === 'false' || o === 'NaN'
  },

  isTrue: (o) => {
    let flag = o && o !== 'null' && o !== 'undefined' && o !== 'false' && o !== 'NaN';
    return flag || flag === 0
  },

  isNullObject: (e) => {
    let flag = Object.prototype.toString.call(e) === '[object Object]' && Object.keys(e).length;
    return !flag
  },

  debounce: (fn, delay = 1000) => {
    var timer;
    return function() {
      var context = this;
      var args = arguments;
      if (timer) {
        clearTimeout(timer);
      }
      var doNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, delay);
      if (doNow) {
        fn.apply(context, args);
      }
    }
  },

  throttle: (fn, interval) => {
    let canRun = true;
    return function () {
      if (!canRun) return;
      canRun = false;
      setTimeout(() => {
        fn.apply(this, arguments);
        canRun = true;
      }, interval);
    };
  },

  timeStrOperate(str) {
    let sliceStartIndex = str.indexOf('(');
    let sliceEndIndex = str.indexOf(')');
    // console.log(sliceStartIndex, sliceEndIndex);

    let startStr = str.substring(0, sliceStartIndex + 1);
    let middleStr = str.substring(sliceStartIndex + 1, sliceEndIndex);
    let endStr = str.substring(sliceEndIndex);
    return {
      startStr: startStr,
      middleStr: middleStr,
      endStr: endStr
    }

  },

  //处理价格 小数点后补0
  priceSupplement (price) {
    if (!price) price = 0;
    let prcieAry = price.toString().split('.')
    // console.log(prcieAry);
    if(!prcieAry[1]){
      return `${price}.00`
    } else if(prcieAry[1].length === 1) {
      return `${price}0`
    } else {
      return price
    }
  }

};

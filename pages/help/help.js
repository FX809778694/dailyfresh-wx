var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp()

Page({
  data: {
    issueList: [],
    page: 1,
    limit: 10,
  },

  onShow() {
    util.request(api.IssueList, {
      page: this.data.page,
      limit: this.data.limit
    }).then(res => {
      if (res.errno === 0) {
        this.setData({
          issueList: res.data.list,
        });
      }
    });
  },
})
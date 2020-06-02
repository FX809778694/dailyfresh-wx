// 以下是业务服务器API地址
// 本机开发时使用
// var WxApiRoot = 'http://192.168.0.3:8080/wx/';
// 局域网测试使用
//var WxApiRoot = 'http://localhost:9100/wx/';
// 云平台部署时使用
// var WxApiRoot = 'http://wx-api.freemanzhao.top/';
// 云平台上线时使用
var WxApiRoot = 'https://wx-api.niuniufresh.com/';

// 小程序后台账号
// niuniutec@163.com   niuniu@2020 wxa4980b09f0a1cb2e

module.exports = {
  IndexUrl: WxApiRoot + 'home/page', //首页数据接口
  CatalogList: WxApiRoot + 'catalog/index', //分类目录全部分类数据接口
  CatalogCurrent: WxApiRoot + 'catalog/current', //分类目录当前分类数据接口

  AuthLoginByWeixin: WxApiRoot + 'auth/login_by_weixin', //微信登录
  loginByWeChatPhone: WxApiRoot + 'auth/loginByWeChatPhone', // 微信手机号登录 新地址
  getSessionKeyByCode: WxApiRoot + 'auth/getSessionKeyByCode', // getSessionKeyByCode
  AuthLoginByAccount: WxApiRoot + 'auth/login', //账号登录
  AuthLogout: WxApiRoot + 'auth/logout', //账号登出
  AuthRegister: WxApiRoot + 'auth/register', //账号注册
  AuthReset: WxApiRoot + 'auth/reset', //账号密码重置
  AuthRegisterCaptcha: WxApiRoot + 'auth/regCaptcha', //验证码
  AuthBindPhone: WxApiRoot + 'auth/bindPhone', //绑定微信手机号
  AuthLoginVerify: WxApiRoot + 'auth/regCaptcha', //手机短信验证码
  AuthPhoneLogin: WxApiRoot + 'auth/login_by_phone', //手机验证码登录

  IndexNewShopList: WxApiRoot + 'home/new', //首页的新品上市商品
  IndexClassifyShopList: WxApiRoot + 'home/categoryL1Goods', //首页的一级分类下的商品
  GoodsCount: WxApiRoot + 'goods/count', //统计商品总数
  GoodsList: WxApiRoot + 'goods/list', //获得商品列表
  GoodsCategory: WxApiRoot + 'goods/category', //获得分类数据
  GoodsDetail: WxApiRoot + 'goods/detail', //获得商品的详情
  GoodsRelated: WxApiRoot + 'goods/related', //商品详情页的关联商品（大家都在看）
  GoodsFoods: WxApiRoot + 'goods/cooks', // 商品的相关做法

  CartList: WxApiRoot + 'cart/index', //获取购物车的数据
  CartAddGoods: WxApiRoot + 'goods/choose/addon', //去凑单
  CartRecommendList: WxApiRoot + 'cart/recommend', //购物车猜你喜欢
  CartAdd: WxApiRoot + 'cart/add', // 添加商品到购物车
  CartFastAdd: WxApiRoot + 'cart/fastadd', // 立即购买商品
  CartUpdate: WxApiRoot + 'cart/update', // 更新购物车的商品
  CartDelete: WxApiRoot + 'cart/delete', // 删除购物车的商品
  CartChecked: WxApiRoot + 'cart/checked', // 选择或取消选择商品
  CartGoodsCount: WxApiRoot + 'cart/goodscount', // 获取购物车商品件数
  CartCheckout: WxApiRoot + 'cart/checkout', // 下单前信息确认

  CollectList: WxApiRoot + 'collect/list', //收藏列表
  CollectAddOrDelete: WxApiRoot + 'collect/addordelete', //添加或取消收藏

  SearchIndex: WxApiRoot + 'search/index', //搜索关键字
  SearchResult: WxApiRoot + 'search/result', //搜索结果
  SearchHelper: WxApiRoot + 'search/helper', //搜索帮助
  SearchClearHistory: WxApiRoot + 'search/clearhistory', //搜索历史清楚

  AddressList: WxApiRoot + 'address/list', //收货地址列表
  AddressDetail: WxApiRoot + 'address/detail', //收货地址详情
  AddressSave: WxApiRoot + 'address/save', //保存收货地址
  AddressDelete: WxApiRoot + 'address/delete', //删除收货地址

  ExpressQuery: WxApiRoot + 'express/query', //物流查询

  RegionList: WxApiRoot + 'region/list', //获取区域列表

  OrderSubmit: WxApiRoot + 'order/submit', // 提交订单
  OrderPrepay: WxApiRoot + 'order/prepay', // 订单的预支付会话
  OrderBalancePay: WxApiRoot + `/order/balancePay?userId=${wx.getStorageSync('token')}`, // 余额支付
  OrderList: WxApiRoot + 'order/list', //订单列表
  OrderDetail: WxApiRoot + 'order/detail', //订单详情
  OrderCancel: WxApiRoot + 'order/cancel', //取消订单
  OrderRefund: WxApiRoot + 'order/refund', //退款取消订单
  OrderDelete: WxApiRoot + 'order/delete', //删除订单
  OrderConfirm: WxApiRoot + 'order/confirm', //确认收货
  OrderGoods: WxApiRoot + 'order/goods', // 待评价商品信息
  OrderComment: WxApiRoot + 'order/comment', // 评价订单商品信息
  OrderEvaluate: WxApiRoot + `comment/insert`, // 评价[新增接口]
  OrderOnce: WxApiRoot + 'cart/copy', // 再来一单
  OrderExchange: WxApiRoot + `integral/consumer/exchange?userId=${wx.getStorageSync('token')}`, // 积分兑换
  OrderPaddword: WxApiRoot + `payPwd/check?userId=${wx.getStorageSync('token')}`, // 账户支付确认密码
  OrderCoordinate: WxApiRoot + 'delivery/coordinate', // 获取配送员位置
  OrderDeliveryInfo: WxApiRoot + 'delivery/info', // 获取配送员基本信息

FeedbackAdd: WxApiRoot + 'feedback/submit', //添加反馈
  FootprintList: WxApiRoot + 'footprint/list', //足迹列表
  FootprintDelete: WxApiRoot + 'footprint/delete', //删除足迹

  CouponList: WxApiRoot + 'coupon/list', //优惠券列表
  CouponMyList: WxApiRoot + 'coupon/mylist', //我的优惠券列表
  CouponSelectList: WxApiRoot + 'coupon/selectlist', //当前订单可用优惠券列表
  indexCouponList: WxApiRoot + 'coupon/index ', // 首页优惠券弹框
  CouponReceive: WxApiRoot + 'coupon/receive', //优惠券领取
  CouponExchange: WxApiRoot + 'coupon/exchange', //优惠券兑换

  StorageUpload: WxApiRoot + 'storage/upload', //图片上传,

  UserIndex: WxApiRoot + 'user/index', //个人页面用户相关信息
  IssueList: WxApiRoot + 'issue/list', //帮助信息
  GetvalidateCode: WxApiRoot + 'user/validateCode', //设置支付密码 - 获取验证码
  SetPassword: WxApiRoot + `payPwd/set?userId=${wx.getStorageSync('token')}`, //设置支付密码

  skillIndexData: WxApiRoot + 'flash/index', // 首页秒杀部分
  skillTimeList: WxApiRoot + 'flash/list', // 秒杀的时间段列表
  skillShopList: WxApiRoot + 'flash/goods', // 秒杀的商品列表

  delicacyTabs: WxApiRoot + 'cookClassify/list', // 美食社的tabs
  delicacyList: WxApiRoot + 'cook/list', // 美食社的列表数据
  delicacyBannerList: WxApiRoot + 'cook/banner', // 美食社的轮播推荐数据
  delicacyIndexList: WxApiRoot + 'cook/index', // 首页的美食社接口
  delicacyDetail: WxApiRoot + 'cook/detail', // 美食社的详情数据
  delicacyPraise: WxApiRoot + 'cook/like', // 点赞取消点赞
  delicacySearch: WxApiRoot + 'cook/search', // 菜谱的搜索

  serviceOrderList: WxApiRoot + 'aftersales/order', // 售后的订单列表
  serviceAllOrderList: WxApiRoot + 'aftersales/list', //全部申请列表
  serviceOrderGoodsList: WxApiRoot + 'aftersales/orderDetail', // 售后的订单明细 商品申请列表
  serviceGoodsRecordList: WxApiRoot + 'aftersales/order/finish', // 售后订单里面 关于该商品的售后记录列表数据
  serviceReason: WxApiRoot + 'aftersales/classifyList', // 获取售后申请的原因
  serviceSubmitApply: WxApiRoot + 'aftersales/submit', // 提交售后申请
  serviceApplyDetail: WxApiRoot + 'aftersales/detail', // 申请详情
  cancelApply: WxApiRoot + 'aftersales/cancel', // 撤销申请

  activityHotGoods: WxApiRoot + 'goods/activity/hots'

};

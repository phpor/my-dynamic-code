// pages/qrcode/qrcode.js
// 		$data = sprintf("otpauth://totp/Beebank:%s?secret=%s&issuer=Beebank", $username, $secret);

var Totp = require("totp.js");
var DB = require("db.js");
var deleting = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  showCode: function () {
    var page = this;
    DB.query( function (data) {
        var seconds = (new Date()).getSeconds();
        var life = '' + (100 - (seconds % 30) / 29 * 100) + '%';
       // console.log(res);
        for (var i in data) {
         // console.log(data[i]["secret"]);
          // secret 不能含有空格，否则会报错，耽误了我1个多小时
          data[i]["code"] = Totp.genarate(data[i]["secret"]).replace(/\B(?=(?:\d{3})+\b)/g, ' ');
        }
       // console.log(data);
        page.setData({
          "life": life,
          "account_list": data,
        });
      });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   // return;
    var page = this;
    this.showCode();
    setInterval(function () {
      page.showCode();
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  bindRemove: function(e) {
    if(deleting) return ;
    deleting = true;
    console.log(e);
    var name = e.currentTarget.dataset.name;
    var page = this;
    this.setData({
      deleting: name
    })
    var showCode = this.showCode;
    var clearDel = function() {
      page.setData({
        deleting: null,
      });
      showCode();
    };
    wx.showModal({
      title: '提示',
      content: '确认删除 ' + name + ' ？',
      success: function(sm) {
        deleting = null;
        console.log(sm);
        if (sm.confirm) {
          DB.del(name, function() {
            showCode();
          });
        } else {
          clearDel();
        }
      },
      complete: function() {
        clearDel();
      },
    })
  },
  bindScan: function() {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode'],
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) {
        var item = Totp.parseUrl(res.result);
        if (!item) {
          wx.showToast({
            title: res.result,
            duration: 1000 * 10,
            icon: "none",
          });
          return;
        }
        DB.query(function(data) {
          data[item.name] = item;
          DB.save(data);
        });
      },
    })
  }
})
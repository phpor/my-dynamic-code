// pages/qrcode/qrcode.js
// 		$data = sprintf("otpauth://totp/Beebank:%s?secret=%s&issuer=Beebank", $username, $secret);
var Sha1 = require("sha1.js");
console.log(Sha1);

var Totp = function() {
  'use strict';

  var dec2hex = function (s) {
    return (s < 15.5 ? "0" : "") + Math.round(s).toString(16);
  };

  var hex2dec = function (s) {
    return parseInt(s, 16);
  };

  var leftpad = function (s, l, p) {
    if (l + 1 >= s.length) {
      s = Array(l + 1 - s.length).join(p) + s;
    }
    return s;
  };

  var base32tohex = function (base32) {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var bits = "";
    var hex = "";
    for (var i = 0; i < base32.length; i++) {
      var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
      bits += leftpad(val.toString(2), 5, '0');
    }
    for (var i = 0; i + 4 <= bits.length; i += 4) {
      var chunk = bits.substr(i, 4);
      hex = hex + parseInt(chunk, 2).toString(16);
    }
    return hex;
  };

  var getOTP = function (secret) {
    try {
      var epoch = Math.round(new Date().getTime() / 1000.0);
      var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, "0");
      var hmacObj = new Sha1.sha1(time, "HEX");
      var hmac = hmacObj.getHMAC(base32tohex(secret), "HEX", "SHA-1", "HEX");
      var offset = hex2dec(hmac.substring(hmac.length - 1));
      var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec("7fffffff")) + "";
      otp = (otp).substr(otp.length - 6, 6);
    } catch (error) {
      throw error;
    }
    return otp;
  };

  var parseUrl = function (protocol) {
    var regex = new RegExp("^otpauth://totp/([^?]+)[?]secret=([^&]+)&issuer=(.+)$");
    var arr = protocol.match(regex);
    if (!arr) return null;
    return {
      name: arr[1],
      secret: decodeURIComponent(arr[2]).replace(/ /g, ""), // 空格不能被正确处理
      issuer: decodeURIComponent(arr[3]),
    }
  };

  return {
    genarate: getOTP,
    parseUrl: parseUrl,
  }
}();

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
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
    var showCode = function () {
      wx.getStorage({
        key: 'account-list',
        success: function (res) {
          // show account-list
        },
        complete: function (res) {
          var seconds = (new Date()).getSeconds();
          var life = '' + (100 - ( seconds % 30 ) / 29 * 100) + '%';
          var data = [];
          /*
          data = [
            { name: "phpor", secret: "mysecret", 'code': '123 456' },
            { name: "phpor", secret: "mysecret", 'code': '123 456' },
            { name: "phpor", secret: "mysecret", 'code': '123 456' },
          ];
          */
          if (res.data) data = res.data;
          console.log(res);
          for(var i in data ) {
            console.log(data[i]["secret"]);
            // secret 不能含有空格，否则会报错，耽误了我1个多小时
            data[i]["code"] = Totp.genarate(data[i]["secret"]).replace(/\B(?=(?:\d{3})+\b)/g, ' ');
          }
          page.setData({
            "life": life,
            "account_list": data,
          })
        }
      })
    }
    showCode();
    setInterval(function () {
      showCode();
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
  scan: function() {
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
        }
        wx.getStorage({
          key: 'account-list',
          complete: function(res) {
            var arr = [];
            if (res.data) {
              arr = res.data;
            }
            arr[arr.length] = item;
            wx.setStorage({
              key: 'account-list',
              data: arr,
            });
          },
        })
      },
    })
  }
})
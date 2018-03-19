
module.exports = function () {
  var keyName = 'account-list';
  return {
    save: function (data, onComplete) {
      wx.setStorage({
        key: keyName,
        data: data,
        complete: onComplete,
      });
    },
    query: function (onComplete) {
      wx.getStorage({
        key: keyName,
        complete: function (res) {
          var data = {};
          if (res.data) {
            data = res.data;
          }
          onComplete(data);
        },
      })
    },
    del: function (name, onComplete) {
      var db = this;
      this.query(function (data) {
        delete data[name];
        db.save(data, onComplete);
      });
    },
  }
}();

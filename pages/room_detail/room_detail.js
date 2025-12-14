// pages/room_detail/room_detail.js
const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    today:'',
    // end_day:'',
    checkInDate:'',
    checkOutDate:'',
    roomDetail: {}
  },
  onCollectTap(e){
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      checkInDate:app.globalData.checkInDate,
      checkOutDate:app.globalData.checkOutDate,
      today:app.globalData.today
    })
    
    const cacheKey = options.cacheKey; // 父页面的cacheKey
    const id = options.id;     // 卡片的ID

    if (!cacheKey || !id) {
      wx.showToast({ title: "参数异常，无法加载房间详情", icon: "none" });
      wx.navigateBack(); // 参数错误返回上一页
      return;
    }

    const roomList = wx.getStorageSync(cacheKey)
    if (!roomList || !Array.isArray(roomList)) {
      wx.showToast({ title: "房间数据失效，请重新搜索", icon: "none" });
      wx.navigateBack();
      return;
    }

    const targetRoom = roomList.find(item => {
      // 兼容：item.id可能是数字，roomId是字符串，转成同一类型再比较
      return String(item.id) === String(id);
    });

    if (!targetRoom) {
      wx.showToast({ title: "未找到该房间信息", icon: "none" });
      wx.navigateBack();
      return;
    }

    this.setData({
      roomDetail:targetRoom
    })

    console.log('roomDetail:',this.data.roomDetail)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
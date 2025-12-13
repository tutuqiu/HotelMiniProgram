// pages/room_result/room_result.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const {cacheKey}=options
    const searchResult = wx.getStorageSync(cacheKey)
    console.log('onLoad room_result')
    if(searchResult){
      console.log('searchResult:',searchResult)
      this.setData({
        roomList:searchResult
      })
    }else{
      wx.showToast({ title: "搜索结果失效，请重新搜索", icon: "none" });
      wx.navigateBack();
    }
  },
  onRoomCollect(e){
    const id = e.detail.id
    console.log('id:',id)

    const newRoomList = this.data.roomList.map(room => {
      if (room.id === id) {
        // 切换收藏状态（true变false，false变true）
        room.isCollected = !room.isCollected;
      }
      return room;
    });
    this.setData({ roomList: newRoomList });
    console.log('roomList:',this.data.roomList)
    // todo 更新后端
  },
  onCardTap(e){
    const id = e.detail.id
    const { cacheKey } = this.options;
    wx.navigateTo({
      url: `/pages/room_detail/room_detail?cacheKey=${cacheKey}&id=${id}`
      // 注意：参数需用encodeURIComponent处理特殊字符（可选，防止参数解析失败）
      // url: `/pages/room_detail/room_detail?cacheKey=${encodeURIComponent(cacheKey)}&roomId=${roomId}`
    });

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
  // 页面卸载时清理
  onUnload() {
    const { cacheKey } = this.options;
    cacheKey && wx.removeStorageSync(cacheKey);
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
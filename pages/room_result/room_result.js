// pages/room_result/room_result.js
// import {HTTPRequest} from '../../utils/request.js';
import {updateCollectedList} from '../../services/collected'
const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomList:[],
    collectedList:[],
    today:'',
    checkInDate:'',
    checkOutDate:'',
    imgPrefix:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      checkInDate:app.globalData.checkInDate,
      checkOutDate:app.globalData.checkOutDate,
      today:app.globalData.today,
      imgPrefix:app.globalData.imgPrefix,
      collectedList:app.globalData.userInfo.collectedList,
    })
    
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

  async onRoomCollect(e){
    const token = wx.getStorageSync('token') || ""
    if(!token){
      wx.showModal({
        title: '您还未登录',
        content: '为了给您提供更好服务，请您先登录',
        showCancel: true,
        cancelText: '暂不登录', // 取消按钮文字
        cancelColor: '#666', // 取消按钮颜色
        confirmText: '立即登录', // 确认按钮文字
        confirmColor: '#ff4400', // 确认按钮颜色
        complete: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url:'/pages/login/login'
            })
          }
        }
      })
    }
    else{
      const targetId = e.detail.id
      console.log('id:',targetId)
      // 更新后端 + app +this
      await updateCollectedList(targetId)
      this.setData({
        collectedList:app.globalData.userInfo.collectedList
      })
      this.updateRoomCard(targetId)
    }
  },

  updateRoomCard(id){
    console.log('room_result:updateRoomCard')
    const key=`#roomCard-${id}`
    const roomCard=this.selectComponent(key)
    if(roomCard){
      console.log('find roomCard')
      console.log(this.data.collectedList)
      roomCard.updateCollectedList(this.data.collectedList)
    }
      
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
    this.setData({
      checkInDate:app.globalData.checkInDate,
      checkOutDate:app.globalData.checkOutDate,
      collectedList:app.globalData.userInfo.collectedList,
    })
    // 更新卡片收藏状态
    const roomList = this.data.roomList
    for(const room of roomList)
      this.updateRoomCard(room.id)
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
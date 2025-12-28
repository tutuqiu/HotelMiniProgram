// pages/login/login.js
import {HTTPRequest, getUserInfo} from '../../utils/request.js';

const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:"",
    avatarUrl:"",
    nickName:""
  },
   /**
   * 生命周期函数--监听页面加载
   */
   onLoad(options) {
    console.log('app:',app.globalData)
    this.setData({
      isLogin:app.globalData.isLogin,
      avatarUrl:app.globalData.userInfo.avatarUrl,
      nickName:app.globalData.userInfo.nickName
    })
    console.log('mine data',this.data)
   },

   onLogin(){
    wx.navigateTo({
      url:'/pages/login/login'
    })
   },

  goToProfileEdit(){
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit',
    })
  },

  goToCollectedRoom(){
    wx.navigateTo({
      url: '/pages/room_collected/room_collected',
    })
  },

  goToOrders(e){
    const status =e.currentTarget.dataset.status
    console.log('mine status:',status)
    wx.navigateTo({
      url:`/pages/orders/orders?status=${status}`
    })
  },
 
  goToGuestServices(){
    wx.navigateTo({
      url: '/pages/guest-services/guest-services',
    })
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
      isLogin:app.globalData.isLogin,
      avatarUrl:app.globalData.userInfo.avatarUrl,
      nickName:app.globalData.userInfo.nickName
    })
    console.log('mine data',this.data)
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
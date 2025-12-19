// pages/reservation/reservation.js
const app=getApp()
import {searchRoomById} from '../../services/rooms'
import {calDayCount} from '../../utils/util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    roomDetail:{},
    checkInDate:'',
    checkOutDate:'',
    dayCount:'',
    guestName:'',
    phone:'',
  },

  onChangeGuestName(e){
    this.setData({
      guestName:e.detail.value
    })
    console.log('reservation guestName:',this.data.guestName)
  },

  onChangePhone(e){
    this.setData({
      phone:e.detail.value
    })
    console.log('reservation phone:',this.data.phone)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function(options) {
    const id = options.id;     // 卡片的ID
    const oldTotalPrice = options.oldTotalPrice
    if (!id) {
      wx.showToast({ title: "参数异常，无法加载预定详情", icon: "none" });
      wx.navigateBack(); // 参数错误返回上一页
    }

    this.setData({
      id:id
    })

    const status = await this.searchRoom()
    if(status=="NOT VACANT"){
      wx.showToast({ title: "您来晚啦~该时间段已售罄,请重新选择", icon: "none" });
      wx.navigateBack(); // 返回上一页
    }else if(status=="ERROR"){
      wx.navigateBack(); // 返回上一页
    }

    if(this.data.roomDetail.totalPrice!=oldTotalPrice){
      wx.showToast({ title: "价格已发生变化，请您注意确认", icon: "none" });
    }

    this.setData({
      checkInDate:app.globalData.checkInDate,
      checkOutDate:app.globalData.checkOutDate
    })
    this.setDayCount()
  },

  setDayCount(){
    this.setData({
      dayCount:calDayCount(app.globalData.checkInDate,app.globalData.checkOutDate)
    })
  },

  async searchRoom(){
    const result = await searchRoomById(this.data.id)
    if(result){
      if(result.status=="VACANT"){
        this.setData({
          roomDetail:result
        })
        return "OK"
      }else{
        this.setData({
          roomDetail:result
        })
        return "NOT VACANT"
      }
    }else{
      return "ERROR"
    } 
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
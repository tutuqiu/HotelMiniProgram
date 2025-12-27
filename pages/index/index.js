// pages/index/index.js
import {HTTPRequest} from '../../utils/request.js';
import {calDayCount} from '../../utils/util'

const app=getApp()

Page({
  // prices:{
  //   "2025-12-11":130,

  // }
  /**
   * 页面的初始数据
   */
  data: {
    showDateSelector:false,
    today:'',
    end_day:'',
    checkInDate:'',
    checkOutDate:'',
    dayCount:'',
    headCount:'',
    minPrice:'',
    maxPrice:'',
    
    images:["/images/index-background.png","/images/index-background.png","/images/index-background.png"]
  },

  async onSearch(){
    //统一更新app的值 供room_result查询使用
    app.globalData.checkInDate=this.data.checkInDate
    app.globalData.checkOutDate=this.data.checkOutDate
    app.globalData.headCount=this.data.headCount
    app.globalData.minPrice=this.data.minPrice
    app.globalData.maxPrice=this.data.maxPrice

    wx.navigateTo({
      url: '/pages/room_result/room_result'
    });
  },
  onMinus(){
    this.setData({
      headCount:this.data.headCount-1
    })
    console.log('headCount:',this.data.headCount)
  },
  onAdd(){
    this.setData({
      headCount:this.data.headCount+1
    })
    console.log('headCount:',this.data.headCount)
  },
  lowValueChangeAction(e){
    this.setData({
      minPrice:e.detail.lowValue
    })
  },
  highValueChangeAction(e){
    this.setData({
      maxPrice:e.detail.heighValue
    })
  },
  setDayCount(){
    this.setData({
      dayCount:calDayCount(this.data.checkInDate,this.data.checkOutDate)
    })
    console.log('dayCount:',this.data.dayCount)
  },

  onHideModal(){
    this.setData({
      showDateSelector:false
    })
  },
  
  onShowModal(){
    this.setData({
      showDateSelector:true
    })
  },

  confirmDate(e){
    const {checkInDate,checkOutDate}=e.detail
    console.log('index checkInDate:',checkInDate)
    console.log('index checkOutDate:',checkOutDate)

    this.setData({
      checkInDate:checkInDate,
      checkOutDate:checkOutDate
    })
    this.setDayCount()

    this.onHideModal()
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      today:app.globalData.today,
      checkInDate:app.globalData.checkInDate,
      checkOutDate:app.globalData.checkOutDate,
      headCount:2,
      minPrice:0,
      maxPrice:1500,
    })
    this.setDayCount()
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
    })
    this.setDayCount()
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
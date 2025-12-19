// pages/room_detail/room_detail.js
import {updateCollectedList} from '../../services/collected'
import {searchRoomById} from '../../services/rooms'
import {calDayCount} from '../../utils/util'

const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    today:'',
    imgPrefix:'',
    cacheKey:'',
    checkInDate:'',
    checkOutDate:'',
    dayCount:'',
    roomDetail: {},
    collectedList:[],
    isCollected:false,
    showDateSelector:false,
    canReserve:true
  },
  onBook(){
    console.log('onBook')
    console.log('id:',this.data.id)
    console.log('old:',this.data.roomDetail.totalPrice)
    wx.navigateTo({
      url:`/pages/reservation/reservation?id=${this.data.id}&oldTotalPrice=${this.data.roomDetail.totalPrice}`
    })
  },
  async onCollectTap(){
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
    }else{
      const id=this.data.roomDetail.id
      await updateCollectedList(id)
      this.setData({
        collectedList:app.globalData.userInfo.collectedList
      })
      this.setCollected()
    }
  },

  async searchRoom(){
    const result = await searchRoomById(this.data.id)
    if(result){
      if(result.status=="VACANT"){
        console.log('result:',result)
        this.setData({
          roomDetail:result
        })
        return "OK"
      }else{
        this.setData({
          roomDetail:result,
          canReserve:false
        })
        return "NOT VACANT"
      }
    }else{
      return "ERROR"
    } 
  },

  async updateStatus(){
    const status = await this.searchRoom()
    if(status=="NOT VACANT"){
      wx.showToast({ title: "您来晚啦~该时间段已售罄", icon: "none" });
    }else if(status=="ERROR"){
      wx.navigateBack(); // 返回上一页
    }
  },

  onHideModal(){
    this.setData({
      showDateSelector:false
    })
  },
  
  onShowModal(){
    console.log('onShowModal')
    this.setData({
      showDateSelector:true
    })
    console.log('showDateSelector:',this.data.showDateSelector)
  },

  confirmDate(e){
    const {checkInDate,checkOutDate}=e.detail
    console.log('index checkInDate:',checkInDate)
    console.log('index checkOutDate:',checkOutDate)

    this.setData({
      checkInDate:checkInDate,
      checkOutDate:checkOutDate
    })
    app.globalData.checkInDate=checkInDate
    app.globalData.checkOutDate=checkOutDate
    
    this.searchRoom()
    this.setDayCount()
    this.onHideModal()
  },

  setDayCount(){
    this.setData({
      dayCount:calDayCount(app.globalData.checkInDate,app.globalData.checkOutDate)
    })
    console.log('dayCount:',this.data.dayCount)
  },

  setCollected(){
    const status=this.data.collectedList.includes(this.data.roomDetail.id)
    console.log(`room ${this.data.roomDetail.id} collected?:${status}`)
    this.setData({
      isCollected:status
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const id = options.id;     // 卡片的ID
    if (!id) {
      wx.showToast({ title: "参数异常，无法加载房间详情", icon: "none" });
      wx.navigateBack(); // 参数错误返回上一页
    }

    this.setData({
      id:id
    })
    const status = this.searchRoom()
    if(status=="NOT VACANT"){
      wx.showToast({ title: "您来晚啦~该时间段已售罄", icon: "none" });
    }else if(status=="ERROR"){
      wx.navigateBack(); // 返回上一页
    }
    
    //"OK":正常流程
    this.setData({
      checkInDate:app.globalData.checkInDate,
      checkOutDate:app.globalData.checkOutDate,
      today:app.globalData.today,
      imgPrefix:app.globalData.imgPrefix,
      collectedList:app.globalData.userInfo.collectedList
    })
    console.log('gotodaycount')
    this.setDayCount()
    this.setCollected()

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
    this.setData({
      collectedList:app.globalData.userInfo.collectedList
    })
    this.setCollected()
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
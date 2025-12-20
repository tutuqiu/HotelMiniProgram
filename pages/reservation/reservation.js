// pages/reservation/reservation.js
const app=getApp()
import {searchRoomById} from '../../services/rooms'
import {calDayCount,genIdempotencyKey,validatePhone} from '../../utils/util'
import {HTTPRequest} from '../../utils/request'

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
    idempotencyKey:''
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
      wx.showToast({ title: "参数异常，无法加载预定详情", icon: "none" });
      wx.navigateBack(); // 返回上一页
    }

    if(this.data.roomDetail.totalPrice!=oldTotalPrice){
      wx.showToast({ title: "价格已发生变化，请您注意确认", icon: "none" });
    }

    this.setData({
      checkInDate:app.globalData.checkInDate,
      checkOutDate:app.globalData.checkOutDate,
      idempotencyKey:genIdempotencyKey()
    })
    this.setDayCount()
  },

  setDayCount(){
    this.setData({
      dayCount:calDayCount(app.globalData.checkInDate,app.globalData.checkOutDate)
    })
  },
  
  async onPay(){
    // 检查名字
    const name = this.data.guestName
    if(!name){
      wx.showToast({ title: "请检查入住人姓名", icon: "none" });
      return
    }

    //检查手机号
    const phone=this.data.phone
    const re_validation=validatePhone(phone)
    console.log("validate result:",re_validation)
    if(re_validation){
      wx.showToast({
        title: re_validation,
        icon: "none",
        duration: 2000
      });
      return;
    }

    //检查房间状态
    const result = await searchRoomById(this.data.id)
    if(!result){
      wx.showToast({ title: "参数异常，无法提交预定请求", icon: "none" });
      wx.navigateBack(); // 返回上一页
    }
    if(result.status!="VACANT"){
      wx.showToast({ title: "您来晚啦~该时间段已售罄,请重新选择", icon: "none" });
      wx.navigateBack(); // 返回上一页
    }
    if(result.totalPrice!=this.data.roomDetail.totalPrice){
      wx.showToast({ title: "价格已发生变化,订单失效，请重新选择", icon: "none" });
      wx.navigateBack(); // 返回上一页
    }

    //提交订单 成功则跳转去模拟支付页面
    this.reserveRoom()
  },

  async reserveRoom(){
    const data={
      guestName:this.data.guestName,
      phone:this.data.phone,
      roomId:this.data.id,
      checkInDate:this.data.checkInDate,
      checkOutDate:this.data.checkOutDate
    }
    const header={
      'Authorization':'Bearer ' + app.globalData.userInfo.token,
      'Idempotency-Key':this.data.idempotencyKey
    }
    try{
      const res=await HTTPRequest('POST','/reservations',data,header)
      console.log(res)

      if(res.statusCode==201){
        console.log('预约下单成功')
        wx.showToast({ title: '预约下单成功' })
        console.log("id:",res.data.id)
        wx.navigateTo({
          url:`/pages/pay/pay?totalPrice=${this.data.roomDetail.totalPrice}&id=${res.data.id}`
        })
      }else{
        wx.showToast({
          title:res.data.message || `预约下单失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
      }
    }catch(err){
      console.error('预约下单失败:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
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
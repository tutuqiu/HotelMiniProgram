// pages/order-detail/order-detail.js
import {HTTPRequest} from '../../utils/request.js';
import {calDayCount} from '../../utils/util'

const app=getApp()
const titleMap={
  "HOLD":"等待支付",
  "CONFIRMED":"待入住",
  "CHECKED_IN":"已入住",
  "ACCOMPLISHED":"感谢您的预定",
  "CANCELLED":"您的订单已取消",
  "EXPIRED":"您的订单已取消"
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'',
    orderDetail:{},
    dayCount:'',
    imgPrefix:''
  },

  goToRoomDetail(){
    wx.navigateTo({
      url: `/pages/room_detail/room_detail?id=${this.data.orderDetail.roomId}`,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const id=options.id

    const update=()=>{
      this.setData({
        dayCount:calDayCount(this.data.orderDetail.checkInDate,this.data.orderDetail.checkOutDate),
        title:titleMap[this.data.orderDetail.status],
        imgPrefix:app.globalData.imgPrefix
      })
    }

    //第一种跳转情况：从支付页面、续住跳转 则用id查
    if(id){
      console.log('order-detail id:',id)
      await this.searchOrderById(id)
      update()
    }
    //第二种跳转情况：通过orders跳转 会通过channel传数据
    else{
      const channel= this.getOpenerEventChannel()
      channel.on('init',(data)=>{
        console.log('init data:',data)
        this.setData({
          orderDetail:data
        })
        update()
      })
    }
  },

  async searchOrderById(id){
    if(app.needToRefresh())
      await app.refresh()

    const data={}
    const header={
      'Authorization':'Bearer ' + app.getToken()
    }
    try{
      const res = await HTTPRequest('GET',`/orders/${id}`,data,header)

      console.log(res)
      if(res.statusCode==200){
        this.setData({
          orderDetail:res.data,
        })
        console.log("orderDetail:",res.data)
      }else{
        wx.showToast({
          title:res.data.message || `请求失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
        // wx.navigateBack()
      }
    }catch(err){
      console.error('请求订单详情异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },

  async onCancel(){
    wx.showModal({
      content: '您确定要取消订单吗？',
      showCancel: true,
      cancelText: '再想想', // 取消按钮文字
      cancelColor: '#666', // 取消按钮颜色
      confirmText: '确定', // 确认按钮文字
      confirmColor: '#ff4400', // 确认按钮颜色
      complete:async(res)=>{
        if(res.confirm){
          if(app.needToRefresh())
            await app.refresh()

          const header={
            'Authorization':'Bearer ' + app.getToken()
          }
          try{
            const res = await HTTPRequest('POST',`/reservations/${this.data.orderDetail.id}/cancel`,{},header)

            console.log("cancel:",res)
            if(res.statusCode==200){
              this.setData({
                orderDetail:{
                  ...this.data.orderDetail,
                  status:"CANCELLED"
                },
                title:titleMap["CANCELLED"],
              })
            }else{
              wx.showToast({
                title:res.data.message || `取消订单失败（code:${res.statusCode}）`,
                icon: 'none',
                duration: 2000
              })
              // wx.navigateBack()
            }
          }catch(err){
            console.error('取消订单异常:', err);
            wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
          }
              }

            }})
    

  },

  goToPay(){
    wx.navigateTo({
      url:`/pages/pay/pay?totalPrice=${this.data.orderDetail.priceTotal}&id=${this.data.orderDetail.id}`
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
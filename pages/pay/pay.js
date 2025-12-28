// pages/pay/pay.js
import {HTTPRequest} from '../../utils/request.js';

const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalPrice:'',
    id:''
  },

  async onPay(){
    if(app.needToRefresh())
      await app.refresh()

    const header={
      'Authorization':'Bearer ' + app.getToken()
    }
    try{
      const res = await HTTPRequest('POST',`/reservations/${this.data.id}/confirm`,{},header)

      console.log(res)
      if(res.statusCode==200){
        console.log("支付成功")
        this.goToOrderDetail()
      }else{
        wx.showToast({
          title:res.data.message || `请求失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
        wx.navigateBack()
      }
    }catch(err){
      console.error('支付异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },

  goToOrderDetail(){
    wx.navigateTo({
      url:`/pages/order-detail/order-detail?id=${this.data.id}`
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      totalPrice:options.totalPrice,
      id:options.id
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
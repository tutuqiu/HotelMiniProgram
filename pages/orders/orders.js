// pages/orders/orders.js
import {HTTPRequest} from '../../utils/request.js';

const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList:[],
    activeTab: '',
    isEmpty:true
  },

  goToRoomDetail(e){
    const id = e.currentTarget.dataset.id
    //TODO FIND ORDER
    const orders=this.data.orderList
    const orderDetail=orders.filter((order)=>order.id==id)[0]
    console.log("order:",orderDetail)
    const roomId=orderDetail.roomId
    console.log("roomId:",roomId)

    console.log("gotoRoomDetail")
    wx.navigateTo({
      url: `/pages/room_detail/room_detail?id=${roomId}`
    });
  },
  goToOrderDetail(e){
    const id = e.currentTarget.dataset.id
    //TODO FIND ORDER
    const orders=this.data.orderList
    console.log("orders:",orders)
    console.log("targetId:",id)
    const orderDetail=orders.filter((order)=>order.id==id)[0]
    console.log("order:",orderDetail)

    console.log("gotoOrderDetail")
    wx.navigateTo({
      url: '/pages/order-detail/order-detail',
      success:(res)=>{
        res.eventChannel.emit('init',orderDetail)
      }
    })
  },

  onTab(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ activeTab: status });
    this.searchOrders()
  },

  onCancel(e){
    const id = e.currentTarget.dataset.id
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
            
          const data ={}
          const header ={
            'content-type': 'application/json',
            'Authorization':'Bearer ' + app.getToken()
          }
          try{
            const res = await HTTPRequest('POST',`/reservations/${id}/cancel`,data,header)
            
            console.log(res)
            if(res.statusCode==200){
              console.log('已取消订单')
              wx.showToast({ title: '已取消订单' })
              //更新card状态
              const key=`#order-${id}`
              const order=this.selectComponent(key)
              console.log(this.data.orderList)
              console.log("id:",id)
              console.log("key",key)
              console.log("order:",order)

              if(order){
                console.log('find order:',id)
                order.updateStatus("CANCELLED")
              }
            }else{
              wx.showToast({
                title:res.data.message || `取消订单失败（code:${res.statusCode}）`,
                icon: 'none',
                duration: 2000
              })
            }
          }catch(err){
            console.error('请求异常:', err);
            wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
          }
        }
      }
    })
  },

  onContact(){
    const id=app.globalData.prebookRoomId
    wx.navigateTo({
      url: `/pages/chat-room/chat-room?id=${id}`,
    })
  },

  async searchOrders(){
    if(app.needToRefresh())
      await app.refresh()

    const status=this.data.activeTab
    let data={"status": []}
    if(status=="CANCELLED"){
      data={status:["CANCELLED","EXPIRED"]}
    }else if(status!="ALL"){
      data={status:[status]}
    }
    console.log("REQ data:",data)
    const header={
      'content-type': 'application/json',
      'Authorization':'Bearer ' + app.globalData.userInfo.token
    }
    console.log("header:",header)
    try{
      const res = await HTTPRequest('POST','/orders',data,header)

      console.log(res)
      if(res.statusCode==200){
        this.setData({
          orderList:res.data.items,
          isEmpty:res.data.items.length===0?true:false
        })
        console.log("list:",res.data.items)
        console.log("isEmpty:",this.data.isEmpty)
      }else{
        wx.showToast({
          title:res.data.message || `请求失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
        // wx.navigateBack()
      }
    }catch(err){
      console.error('请求订单列表异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const status=options.status
    console.log('staus:',status)
    this.setData({
      activeTab:status
    })

    this.searchOrders()
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
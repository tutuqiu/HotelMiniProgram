// pages/service/service.js
const app = getApp()
import {HTTPRequest, getUserInfo} from '../../utils/request.js';
// SERVICE_MAP={

// }

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:false,
    socketStatus:'',
    chatRoomsDetails:[],
    unreadByChatRoom: {},
    imgPrefix:'',

    socketOpen:false,

    fixedServiceList:[{
      type:"DELIVERY",
      icon:"http://cdn.xtuctuy.top/images/delivery.png",
      label:"客房送物"
    },{
      type:"EXTEND_STAY",
      icon:"http://cdn.xtuctuy.top/images/extend-stay.png",
      label:"续住"
    },{
      type:"CLEANING",
      icon:"http://cdn.xtuctuy.top/images/cleaning.png",
      label:"客房清洁"
    },{
      type:"LAUNDRY",
      icon:"http://cdn.xtuctuy.top/images/laundry.png",
      label:"洗衣净物"
    }],
    content:'',
    note:'',
    extendDay:1,
    isShowServiceModal:false,
    serviceName:'',
    serviceType:'',
    stayRoomId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //刷新chatroom
    if(app.globalData.isLogin)
      app.getChatRoomsDetails()

    this.setData({
      isLogin:app.globalData.isLogin,
      socketStatus:app.globalData.socketStatus,
      imgPrefix:app.globalData.imgPrefix,
      unreadByChatRoom:app.globalData.unreadByChatRoom,
      chatRoomsDetails:app.globalData.chatRoomsDetails
    })
    if(this.data.isLogin)
      this.setStayRoomId()

    // 订阅全局消息 收到消息时全局会调用这个函数 更新unread ->chat-card自动更新(observer)
    app.onChatMessage((msg)=>{
      console.log("update unread!:",app.globalData.unreadByChatRoom)
      this.setData({
        unreadByChatRoom:app.globalData.unreadByChatRoom
      })
    })

    console.log("service data:",this.data)
  },

  goToChatRoom(e){
    const id=e.currentTarget.dataset.id

    wx.navigateTo({
      url: `/pages/chat-room/chat-room?id=${id}`,
    })
  },

  setStayRoomId(){
    //认为一个人只能同时入住一间房=>同时最多只有一个房间chatroom+客服chatroom
    if(this.data.chatRoomsDetails.length==1)
      return

    const chatRoom=this.data.chatRoomsDetails.find(r=>r.type!="PREBOOK")
    this.setData({
      stayRoomId:chatRoom.roomId
    })
  },

  showServiceModal(e){
    // 检查是否入住
    if(!this.data.stayRoomId){
      wx.showToast({
        title: '您还未入住哦~',
        icon: 'none',
        duration: 1500
      })
      return
    }

    const type=e.currentTarget.dataset.type
    const service=this.data.fixedServiceList.find(service=>service.type==type)
    this.setData({
      isShowServiceModal:true,
      serviceName:service.label,
      serviceType:type,
    })
    console.log(this.data.serviceType)
  },

  async sendServiceRequest(){
    const type=this.data.serviceType
    if(!type){
      console.log("err:no service type")
      return
    }
    
    if(app.needToRefresh())
      await app.refresh()

    //content没查 因为空的话 按钮为disable
    //TODO:extendDay也还没查 
    const data={
      roomId:this.data.stayRoomId,
      type:type,
      content:this.data.content,
      extraNights:this.data.extendDay,
      note:this.data.note
    }
    const header={
      'Authorization':'Bearer ' + app.getToken()
    }
    try{
      const res = await HTTPRequest('POST','/guest-services',data,header)
      console.log("guestService res:",res)
  
      if(res.statusCode==201){
        console.log('提交客房服务请求成功:',res.data)
        if(type!="EXTEND_STAY")
          wx.showToast({
            title:'提交客房服务请求成功',
            icon: 'none',
            duration: 2000
          })
        else{
          //goto预定支付页面
          wx.navigateTo({
            url:`/pages/order-detail/order-detail?id=${res.data.reservationId}`
          })
        }
        this.hideServiceModal()
        
      }else{
        wx.showToast({
          title:res.data.message || `提交客房服务请求失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
      }
    }catch(err){
      console.error('获取聊天列表异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
    
    
    
  },

  hideServiceModal(){
    console.log("hide")
    this.setData({
      isShowServiceModal:false,
      serviceName:'',
      serviceType:'',
      extendDay:1,
      content:'',
      note:''
    })
  },

  onInputChange(e){
    const type=e.currentTarget.dataset.type
    if(type=="content"){
      this.setData({
        content:e.detail.value
      })
      console.log("content:",this.data.content)
    }else if(type=="note"){
      this.setData({
        note:e.detail.value
      })
      console.log("note:",this.data.note)
    }else if(type=="extendDay"){
      this.setData({
        extendDay:e.detail.value
      })
      console.log("extendDay:",this.data.extendDay)
    }
  },

  onMinus(){
    this.setData({
      extendDay:this.data.extendDay-1
    })
  },

  onAdd(){
    this.setData({
      extendDay:this.data.extendDay+1
    })
  },

  goToLogin(){
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  noop(){},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    //刷新chatroom
    if(app.globalData.isLogin)
      app.getChatRoomsDetails()
      
    this.setData({
      isLogin:app.globalData.isLogin,
      socketStatus:app.globalData.socketStatus,
      imgPrefix:app.globalData.imgPrefix,
      unreadByChatRoom:app.globalData.unreadByChatRoom,
      chatRoomsDetails:app.globalData.chatRoomsDetails
    })
    app.refreshTabBarBadge()

    console.log("service data:",this.data)
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
    // 页面卸载时主动关闭 WebSocket 连接
    if (this.data.socketOpen) {
      wx.closeSocket({
        success: (res) => {
          console.log("主动关闭 WebSocket 连接成功", res);
        },
        fail: (err) => {
          console.error("主动关闭 WebSocket 连接失败", err);
        }
      });
    }
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
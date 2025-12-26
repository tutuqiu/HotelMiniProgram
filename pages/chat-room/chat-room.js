// pages/service/service.js
import {HTTPRequest} from '../../utils/request.js';

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chatRoomId:'',
    id:'',
    msgList: [], // 消息列表（展示收发的消息）
    avatarUrl:'',
    nickName:'',
    chatRoomDetails:{},
    inputMsg:"",
    memberCount:'',


    isLogin:false,
    socketOpen:false,
    socketMsgQueue: [], // 待发送的消息队列（连接未打开时缓存）
  
    otherAvatarUrl: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0" // 对方/服务器默认头像
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const chatRoomId=options.id
    console.log("chatRoom id:",chatRoomId)
    this.setData({
      chatRoomId:chatRoomId,
      id:app.globalData.userInfo.id,
    })

    app.onChatMessage((msg)=>{
      if(!msg)
        return
      //只处理当前房间的消息
      if(msg.roomId!=this.data.chatRoomId)
        return
      const memberMap=new Map(this.data.chatRoomDetails.members.map(m=>[String(m.id),m]))

      const sender = memberMap.get(String(msg.senderId)) || null
      const fullMsg={
        ...msg,
        senderName: sender?.name || "未知用户",
        senderAvatarUrl: sender?.avatarUrl || this.data.otherAvatarUrl
      }

      this.setData({
        msgList:this.data.msgList.concat(fullMsg)
      })
       
    })

    this.setData({
      chatRoomDetails:app.globalData.chatRoomsDetails.find(r=>r.id==chatRoomId)
    })
    this.setData({
      memberCount:this.data.chatRoomDetails.members.length
    })
    console.log("chat-room data:",this.data)
    this.getMessage()
  },

  async getMessage(){
    if(app.needToRefresh()){
      console.log("getMessage need to refresh")
      await app.refresh()
    }
    console.log("refresh done")

    const header={
      'Authorization':'Bearer ' + app.getToken()
    }
    try{
      const res = await HTTPRequest('GET',`/chat/rooms/${this.data.chatRoomId}/messages`,{},header)
      console.log(res)
  
      if(res.statusCode==200){
        let msgs = res.data
        console.log('获取消息列表成功:',msgs)
        const memberMap=new Map(this.data.chatRoomDetails.members.map(m=>[String(m.id),m]))
        const withSenderInfoMsgs=msgs.map(msg=>{
          const sender = memberMap.get(String(msg.senderId)) || null;
          return{
            ...msg,
            senderName:sender?.name||"未知用户",
            senderAvatarUrl:sender?.avatarUrl||this.data.otherAvatarUrl
          }
        })
        this.setData({
          msgList:withSenderInfoMsgs
        })
        console.log("chat-room msgList:",this.data.msgList)
      }else{
        wx.showToast({
          title:res.data.message || `获取消息失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
      }
    }catch(err){
      console.error('获取消息列表异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },

  sendMessage(){
    if (!this.data.inputMsg) {
      wx.showToast({ title: "请输入消息内容", icon: "none" });
      return;
    }
    // // 2. 双重校验连接状态（兜底，避免极端情况）
    // if (!this.data.socketOpen) {
    //   wx.showToast({ title: "连接未就绪，无法发送", icon: "none" });
    //   return;
    // }

    const bodyObj={
      content:this.data.inputMsg,
      contentType:"TEXT"
    }
    app.stompSendFrame("SEND", {
      destination: `/app/rooms/${this.data.chatRoomId}/send`,
      "content-type": "application/json",
      "Authorization": "Bearer " + app.getToken()
    },JSON.stringify(bodyObj));

    this.setData({ inputMsg: '' })
  },


  formatTime(date) {
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${hour}:${minute}`;
  },

  onInputChange(e){
    this.setData({
      inputMsg: e.detail.value.trim()
    });
    console.log('input:',this.data.inputMsg)
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
    app.globalData.currentChatRoomId=''
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    app.globalData.currentChatRoomId=''
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
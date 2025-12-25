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
      id:app.globalData.userInfo.id
    })
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
        const msgs = res.data
        console.log('获取消息列表成功:',msgs)
        this.setData({
          msgList:msgs
        })
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

  handleSendMsg() {
    // 1. 校验输入内容
    if (!this.data.inputMsg) {
      wx.showToast({ title: "请输入消息内容", icon: "none" });
      return;
    }

    // 2. 双重校验连接状态（兜底，避免极端情况）
    if (!this.data.socketOpen) {
      wx.showToast({ title: "连接未就绪，无法发送", icon: "none" });
      return;
    }

    // 3. 构造消息体（根据后端要求调整格式）
    const sendMsg = {
      type: "chat",
      content: this.data.inputMsg,
      timestamp: Date.now()
    };

    // 4. 发送消息
    wx.sendSocketMessage({
      data: JSON.stringify(sendMsg),
      success:(res)=>{
        console.log("消息发送成功", res);
        // 5. 将发送的消息添加到消息列表
        this.setData({
          msgList: [
            ...this.data.msgList,
            {
              isSelf: true, // 自己发送的消息
              avatar: this.data.avatarUrl, // 自己的头像
              content: this.data.inputMsg,
              time: this.formatTime(new Date())
            }
          ],
          inputMsg: "" // 清空输入框
        });
      },
      fail:(err)=>{
        console.error("消息发送失败", err);
        wx.showToast({ title: "发送失败", icon: "none" });
      }
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
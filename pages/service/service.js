// pages/service/service.js
const app = getApp()
import {HTTPRequest, getUserInfo} from '../../utils/request.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:false,
    socketOpen:false,
    socketMsgQueue: [], // 待发送的消息队列（连接未打开时缓存）
    wsUrl:"ws://xtuctuy.top:8080/ws",
    msgList: [], // 消息列表（展示收发的消息）
    avatarUrl:'',
    nickName:'',
    otherAvatarUrl: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0" // 对方/服务器默认头像
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      isLogin:app.globalData.isLogin,
    })

    if(this.data.isLogin){
      this.setData({
        avatarUrl:app.globalData.userInfo.avatarUrl,
        nickName:app.globalData.userInfo.nickName,
      })
      // console.log('avatarUrl:',this.data.avatarUrl)
      console.log('nickName:',this.data.nickName)
      this.connectWebSocket();
    }
      
  },
  formatTime(date) {
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${hour}:${minute}`;
  },
  // 建立 WebSocket 连接
  connectWebSocket(){
     // 1. 创建连接
    wx.connectSocket({
      url: this.data.wsUrl,
      header:{
        'content-type': 'application/json',
        'Authorization':'Bearer ' + app.globalData.userInfo.token
      },
      success: (res) => {
        console.log('创建连接成功', res);
      },
      fail: (err) => {
        console.error('创建连接失败', err);
        wx.showToast({ title: "连接失败", icon: "none", duration: 2000 });
      }
    })

    // 2. 监听连接成功
    wx.onSocketOpen((res) => {
      console.log('WebSocket 连接已打开', res);
      this.setData({ socketOpen: true });
      wx.showToast({ title: "连接成功", icon: "success", duration: 1500 });

      // 发送缓存的消息（连接成功后补发）
      if (this.data.socketMsgQueue.length > 0) {
        this.data.socketMsgQueue.forEach(msg => {
          this.sendSocketMessage(msg);
        });
        this.setData({ socketMsgQueue: [] });
      }
    });

    // 3. 监听服务器推送的消息
    wx.onSocketMessage((res) => {
      console.log('收到服务器消息', res.data);
      // 解析消息（根据后端格式调整，示例为 JSON 格式）
      let recvMsg;
      try {
        recvMsg = JSON.parse(res.data);
      } catch (e) {
        recvMsg = { content: res.data, type: "text" };
      }
      // 将收到的消息添加到消息列表
      this.setData({
        msgList: [
          ...this.data.msgList,
          {
            isSelf: false, // 非自己发送的消息
            content: recvMsg.content || "无内容",
            time: this.formatTime(new Date())
          }
        ]
      });
    });

    // 4. 监听连接错误
    wx.onSocketError((err) => {
      console.error('WebSocket 连接错误', err);
      this.setData({ socketOpen: false });
      wx.showToast({ title: "连接异常", icon: "none", duration: 2000 });

      // 重连
      this.reconnectWebSocket();
    });

    // 5. 监听连接关闭
    wx.onSocketClose((res) => {
      console.log('WebSocket 连接已关闭', res);
      this.setData({ socketOpen: false });

      wx.showToast({ title: "连接已断开", icon: "none", duration: 2000 });
      // 6. 重连逻辑
      this.reconnectWebSocket();
    });

  },
  reconnectWebSocket(){
    wx.showToast({ title: "重新连接中", icon: "none" })
    this.connectWebSocket()
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

  login(){
    wx.login({
      success: async (res)=>{
        console.log(res)
        if(res.code){
          console.log('获取code成功! ',res.code);

          try{
            const data={
              code:res.code
            }
            const header={
              'content-type': 'application/json',
            }
            const loginResult = await HTTPRequest('POST','/public/wx/login',data,header);
            console.log('loginResult:',loginResult)
            if (loginResult.statusCode === 200){
              console.log('登录成功');
              wx.showToast({ title: '登录成功' });
              app.globalData.isLogin=true;

              const token=loginResult.data.accessToken
              const expiresInSeconds=loginResult.data.expiresInSeconds
              const refreshTokenId=loginResult.data.refreshTokenId

              console.log('login token:',token)
              console.log('login expiresInSeconds:',expiresInSeconds)
              console.log('login refreshTokenId:',refreshTokenId)
                
              const expiresTime = new Date(Date.now() + expiresInSeconds * 1000)//有效时间转化为毫秒级别

              wx.setStorageSync('expireTime',expiresTime.getTime())
              wx.setStorageSync('token',token)
              wx.setStorageSync('refreshTokenId',refreshTokenId)

              app.getUserInfo(token)

              app.globalData.userInfo.token=token
              this.setData({
                isLogin:true
              })
            }else{
              wx.showToast({
                title: loginResult.message || `登录失败（code: ${loginResult.statusCode}）`,
                icon: 'none',
                duration: 2000
              });
            }
          }catch(err){
            console.error('登录异常:', err);
            wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
          }
        }else{
          console.error('获取code失败:', res.errMsg);
        }
      },
      fail:(err)=>{
        console.error('wx.login调用失败:', err);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
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
    this.setData({
      isLogin:app.globalData.isLogin,
    })

    if(this.data.isLogin){
      this.setData({
        avatarUrl:app.globalData.userInfo.avatarUrl
      })
      this.connectWebSocket();
    }
      
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
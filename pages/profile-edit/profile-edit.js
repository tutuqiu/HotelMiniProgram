// pages/profile-edit/profile-edit.js
import {HTTPRequest} from '../../utils/request.js';
const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:"",
    nickName:"",
    phoneNumber:"",
    newPhoneNumber:"",
    isModalShow:false,
    sms:""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      avatarUrl:app.globalData.userInfo.avatarUrl,
      nickName:app.globalData.userInfo.nickName,
      phoneNumber:app.globalData.userInfo.phoneNumber,
    })
  },
  showPhoneModal(){
    this.setData({
      isModalShow:true
    })
  },
  noop(){

  },
  hidePhoneModal(){
    this.setData({
      isModalShow:false
    })
  },
  onChooseAvatar(e){
    const {avatarUrl} = e.detail
    this.setData({
      avatarUrl,
    })
    console.log('profile-edit now avatarUrl:',this.data.avatarUrl)
  },
  onChangeNickName(e){
    this.setData({
      nickName:e.detail.value
    })
    console.log('profile-edit nickName:',this.data.nickName)
  },
  onPhoneInput(e){
    this.setData({
      newPhoneNumber:e.detail.value
    })
    console.log('profile-edit newPhoneNumber:',this.data.newPhoneNumber)
  },
  onSmsInput(e){
    this.setData({
     sms:e.detail.value
    })
    console.log('profile-edit sms:',this.data.sms)
  },
  onClickSms(){
    const oldPhone=this.data.phoneNumber
    const newPhone=this.data.newPhoneNumber
    // console.log(this.data.newPhoneNumber)
    // console.log(newPhone)
    // 1. 校验：是否为空
    if (!newPhone) {
      wx.showToast({
        title: "请输入新手机号",
        icon: "none",
        duration: 2000
      });
      return;
    }

    // 2. 校验：是否以1开头
    if (!/^1/.test(newPhone)) {
      wx.showToast({
        title: "手机号必须以1开头",
        icon: "none",
        duration: 2000
      });
      return;
    }

    // 3. 补充校验：是否为11位数字（手机号基础规则）
    if (newPhone.length !== 11) {
      wx.showToast({
        title: "请输入11位有效手机号",
        icon: "none",
        duration: 2000
      });
      return;
    }

    // 4. 校验：是否与旧手机号一致
    if (newPhone === oldPhone) {
      wx.showToast({
        title: "新手机号不能与原手机号相同",
        icon: "none",
        duration: 2000
      });
      return;
    }
    console.log('profile-edit safe newPhoneNumber:',this.data.newPhoneNumber)
    this.sendSms()

  },

  async sendSms(){
    const phone=this.data.newPhoneNumber
    const token=app.globalData.userInfo.token
   
    try{
      const data={
        phone:phone
      }
      const header={
        'content-type': 'application/json',
        'Authorization':'Bearer ' + token
      }
      const res = await HTTPRequest('POST','/public/wx/phone/code',data,header)

      console.log(res)

      if(res.statusCode==200){
        console.log('发送成功')
        wx.showToast({ title: '发送成功' })
      }else{
        wx.showToast({
          title:res.data.message || `请求失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
      }
    }catch(err){
      console.error('发送验证码异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }

  },

  async checkSms(){
    const phone=this.data.newPhoneNumber
    const sms = this.data.sms
    const token=app.globalData.userInfo.token

    try{
      const data={
        "phone":phone,
        "smsCode":sms,
      }
      const header={
        'content-type': 'application/json',
        'Authorization':'Bearer ' + token
      }
      const res = await HTTPRequest('POST','/public/wx/phone',data,header)
      console.log(res)

      if(res.statusCode==204){
        console.log('验证成功 已修改手机号')
        wx.showToast({ title: '验证成功 已修改手机号' })
        this.setData({
          phoneNumber:phone
        })
        app.globalData.userInfo.phoneNumber=phone
        this.setData({
          isModalShow:false
        })
      }else{
        wx.showToast({
          title:res.data.message || `验证失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
      }
    }catch(err){
      console.error('验证异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },

  async onSave(){
    const data ={
      nickname:this.data.nickName,
      avatarUrl:this.data.avatarUrl
    }
    const header ={
      'content-type': 'application/json',
      'Authorization':'Bearer ' + app.globalData.userInfo.token
    }
    try{
      const res = await HTTPRequest('POST','/public/wx/profile',data,header)
      console.log(res)

      if(res.statusCode==200){
        console.log('已修改信息')
        wx.showToast({ title: '成功修改信息' })

        app.globalData.userInfo.avatarUrl=this.data.avatarUrl;
        app.globalData.userInfo.nickName=this.data.nickName;
        app.globalData.userInfo.phoneNumber=this.data.phoneNumber;

        console.log('app:',app.globalData)

        wx.navigateBack()
      }else{
        wx.showToast({
          title:res.data.message || `修改失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
      }
    }catch(err){
      console.error('请求异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },

  onLogout(){
    wx.showModal({
      content: '请问是否确认退出当前账号？',
      showCancel: true,
      cancelText: '取消', // 取消按钮文字
      cancelColor: '#666', // 取消按钮颜色
      confirmText: '确定', // 确认按钮文字
      confirmColor: '#ff4400', // 确认按钮颜色
      complete:async(res)=>{
        if(res.confirm){
          // logout
          // 保存需要使失效的refreshTokenId
          const refreshTokenId = wx.getStorageSync('refreshTokenId')
          wx.removeStorageSync('refreshTokenId')
          wx.removeStorageSync('token')
          wx.removeStorageSync('expireTime')
          console.log('delete token?:',wx.getStorageSync('token'))

          const data ={
            'refreshTokenId':refreshTokenId
          }
          const header ={
            'content-type': 'application/json',
          }
          try{
            // 撤销refresh token
            const res = await HTTPRequest('POST','/public/auth/logout',data,header)
            console.log(res)
            if(res.statusCode==204){
              console.log('已退出登录')
              wx.showToast({ title: '已退出登录' })

              app.globalData.isLogin=false
              app.cleanUserInfo()

              wx.navigateBack()
            }else{
              wx.showToast({
                title:res.data.message || `退出登录失败（code:${res.statusCode}）`,
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
      avatarUrl:app.globalData.userInfo.avatarUrl,
      nickName:app.globalData.userInfo.nickName,
      phoneNumber:app.globalData.userInfo.phoneNumber,
      newPhoneNumber:"",
      isModalShow:false,
      sms:""
    })
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
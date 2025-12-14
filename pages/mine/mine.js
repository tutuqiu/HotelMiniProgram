// pages/login/login.js
import {HTTPRequest, getUserInfo} from '../../utils/request.js';

const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:"",
    avatarUrl:"",
    nickName:""
  },
   /**
   * 生命周期函数--监听页面加载
   */
   onLoad(options) {
    console.log('app:',app.globalData)
    this.setData({
      isLogin:app.globalData.isLogin,
      avatarUrl:app.globalData.userInfo.avatarUrl,
      nickName:app.globalData.userInfo.nickName
    })
    console.log('mine data',this.data)
    

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

  goToProfileEdit(){
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit',
    })
  },

  goToCollectedRoom(){
    wx.navigateTo({
      url: '/pages/room_collected/room_collected',
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
      avatarUrl:app.globalData.userInfo.avatarUrl,
      nickName:app.globalData.userInfo.nickName
    })
    console.log('mine data',this.data)
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
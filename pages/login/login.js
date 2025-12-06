// pages/login/login.js
import {loginPost} from '../../utils/request.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  login(){
    wx.login({
      success: async (res)=>{
        console.log(res)
        if(res.code){
          console.log('获取code成功! ',res.code);
          try{
            const loginResult = await loginPost(res.code);
            console.log('loginResult:',loginResult)
            if (loginResult.code === 200){
              wx.showToast({ title: '登录成功' });
              wx.navigateBack()
              // wx.({
              //   url: '/pages/mine/mine',
              // })
            }else{
              wx.showToast({
                title: loginResult.message || `登录失败（code: ${loginResult.code}）`,
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
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
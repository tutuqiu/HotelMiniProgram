// app.js
import {HTTPRequest} from '/utils/request.js';
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const defaultNickName = '1'

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    const token = wx.getStorageSync('token') || ""
    console.log(token)
    if(token){
      const expireTime = wx.getStorageSync('expireTime') || null
      if(expireTime){
        const now = Date.now().getTime()
        if (expireTime>now){
          //TODO:refresh new token
          this.getUserInfo(token)
          this.globalData.isLogin=true
        }else{
          wx.setStorageSync('token',"")
        } 
      }
      
    }
  },
  async getUserInfo(token){
    try{
      const data = {}
      const header={
        'Authorization':'Bearer ' + token
      }
      const res = await HTTPRequest('GET','/me',data,header)
      console.log(res)

      if(res.statusCode==200){
        info = res.data
        console.log('获取信息成功:',info)

        this.globalData.userInfo.avatarUrl=info.avatarUrl
        this.globalData.userInfo.nickName=info.name 
        this.globalData.userInfo.phont=info.phone

      }else{
        wx.showToast({
          title:res.data.message || `获取信息失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
      }
    }catch(err){
      console.error('验证异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },
  globalData: {
    isLogin:false,
    userInfo: {
      avatarUrl:defaultAvatarUrl,
      nickName:defaultNickName,
      // phoneNumber:"15259261379",
      phoneNumber:"",
      token:""
    }
  }
})

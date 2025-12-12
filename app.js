// app.js
// import {getUserInfo} from '/utils/request.js';
const req = require('/utils/request.js')
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const defaultNickName = '1'

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取登录状态+用户信息 在之前login时会存储token+expireTime(毫秒）在本地
    // token具有时效性 
    const token = wx.getStorageSync('token') || ""
    console.log('old token:',token)
    if(token){
      const expireTime = wx.getStorageSync('expireTime') || null
      console.log('expireTime:',expireTime)
      if(expireTime){
        const now = Date.now()
        if (expireTime>now){
          console.log('未过期，刷新登录状态')
          const refreshTokenId=wx.getStorageSync('refreshTokenId')||null
          // 刷新token 并用新token更新个人信息
          this.refresh(refreshTokenId)
          
        }else{
          wx.setStorageSync('token',"")
        } 
      }
      
    }
  },
  async refresh(refreshTokenId){
    try{
      const data = {
        refreshTokenId:refreshTokenId
      }
      const header ={
        'content-type': 'application/json',
      }
      const res = await req.HTTPRequest('POST','/public/auth/refresh',data,header)
      console.log(res)
  
      if(res.statusCode==200){
        const info = res.data
        console.log('刷新登录成功:',info)
  
        this.globalData.userInfo.token=info.accessToken
        wx.setStorageSync('token',info.accessToken)
        
        const expireTime = new Date(Date.now() + info.expiresInSeconds * 1000)//有效时间转化为毫秒级别
        wx.setStorageSync('expireTime',expireTime.getTime())

        wx.setStorageSync('refreshTokenId',info.refreshTokenId)

        this.globalData.isLogin=true

        // 更新个人信息
        this.getUserInfo(info.accessToken)
        
        console.log('userInfo:',this.globalData.userInfo)
        console.log('isLogin:',this.globalData.isLogin)
  
      }else{
        // wx.showToast({
        //   title:res.data.message || `获取信息失败（code:${res.statusCode}）`,
        //   icon: 'none',
        //   duration: 2000
        // })
        console.log('refreshTokenId过期')
      }
    }catch(err){
      console.error('验证异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },

  async getUserInfo(token){
    try{
      const data = {}
      const header={
        'Authorization':'Bearer ' + token
      }
      const res = await req.HTTPRequest('GET','/me',data,header)
      console.log(res)
  
      if(res.statusCode==200){
        const info = res.data
        console.log('获取信息成功:',info)
  
        this.globalData.userInfo.avatarUrl=info.avatarUrl
        this.globalData.userInfo.nickName=info.name 
        this.globalData.userInfo.phoneNumber=info.phone
        this.globalData.isLogin=true
        
        console.log('userInfo:',this.globalData.userInfo)
        console.log('isLogin:',this.globalData.isLogin)
  
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
      avatarUrl:"",
      nickName:"",
      // phoneNumber:"15259261379",
      phoneNumber:"",
      token:""
    }
  }
})

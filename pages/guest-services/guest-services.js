// pages/guest-services/guest-services.js
import {HTTPRequest} from '../../utils/request.js';

const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab:"ALL",
    serviceList:[],
    isEmpty:'',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.searchServices()
  },

  onTab(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ activeTab: status });
    this.searchServices()
  },

  async searchServices(){
    if(app.needToRefresh())
      await app.refresh()

    let src="/guest-services/me"
    const status=this.data.activeTab
    console.log("service status:",status)
    if(status!="ALL")
      src+=`?status=${status}`

    console.log("src:",src)
    
    const header={
      'Authorization':'Bearer ' + app.getToken()
    }

    try{
      const res = await HTTPRequest('GET',src,{},header)

      console.log(res)
      if(res.statusCode==200){
        this.setData({
          serviceList:res.data,
          isEmpty:res.data.length===0?true:false
        })
        console.log("list:",res.data)
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
      console.error('请求客房服务列表异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },

  async onCancel(e){
    const id = e.currentTarget.dataset.id
    wx.showModal({
      content: '您确定要取消该服务吗？',
      showCancel: true,
      cancelText: '取消', // 取消按钮文字
      cancelColor: '#666', // 取消按钮颜色
      confirmText: '确定', // 确认按钮文字
      confirmColor: '#ff4400', // 确认按钮颜色
      complete:async(res)=>{
        if(res.confirm){
          if(app.needToRefresh())
            await app.refresh()

          const header ={
            'Authorization':'Bearer ' + app.getToken()
          }
          console.log(`/guest-services/${id}/cancel`)
          console.log(header)
          console.log(app.getToken())
          try{
            const res = await HTTPRequest('PATCH',`/guest-services/${id}/cancel`,{note:'no why'},header)
            
            console.log("cancel service:",res)
            if(res.statusCode==200){
              console.log('已取消订单')
              wx.showToast({ title: '已取消订单' })

              const newList=(this.data.serviceList).map(item=>item.id===id?{...item,status:"CANCELLED"}:item)
              this.setData({
                serviceList:newList
              })
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
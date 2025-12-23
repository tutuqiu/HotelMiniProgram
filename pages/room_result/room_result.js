// pages/room_result/room_result.js
import {HTTPRequest} from '../../utils/request.js';
import {updateCollectedList} from '../../services/collected'
const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomList:[],
    collectedList:[],
    today:'',
    checkInDate:'',
    checkOutDate:'',
    minPrice:'',
    maxPrice:'',
    headCount:'',
    imgPrefix:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      checkInDate:app.globalData.checkInDate,
      checkOutDate:app.globalData.checkOutDate,
      minPrice:app.globalData.minPrice,
      maxPrice:app.globalData.maxPrice,
      headCount:app.globalData.headCount,

      today:app.globalData.today,
      imgPrefix:app.globalData.imgPrefix,
      collectedList:app.globalData.userInfo.collectedList,
    })
    this.onSearch()
  },

  async onSearch(){
    const data={
      in:this.data.checkInDate,
      out:this.data.checkOutDate,
      people:this.data.headCount,
      minPrice:this.data.minPrice,
      maxPrice:this.data.maxPrice,
      status:"VACANT"
    }
    console.log("search parameter:",data)
    const header={
      'content-type': 'application/json'
    }
    try{
      const res=await HTTPRequest('GET','/rooms/search',data,header)

      if(res.statusCode==200){
        console.log('成功获取房间列表')
        this.setData({
          roomList:res.data
        })
      }else{
        wx.showToast({
          title:res.data.message || `搜索失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
        wx.navigateBack()
      }
    }catch(err){
      console.error('请求异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },

  async onRoomCollect(e){
    const token = wx.getStorageSync('token') || ""
    if(!token){
      wx.showModal({
        title: '您还未登录',
        content: '为了给您提供更好服务，请您先登录',
        showCancel: true,
        cancelText: '暂不登录', // 取消按钮文字
        cancelColor: '#666', // 取消按钮颜色
        confirmText: '立即登录', // 确认按钮文字
        confirmColor: '#ff4400', // 确认按钮颜色
        complete: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url:'/pages/login/login'
            })
          }
        }
      })
    }
    else{
      const targetId = e.detail.id
      console.log('id:',targetId)
      // 更新后端 + app +this
      await updateCollectedList(targetId)
      this.setData({
        collectedList:app.globalData.userInfo.collectedList
      })
      this.updateRoomCard(targetId)
    }
  },

  updateRoomCard(id){
    console.log('room_result:updateRoomCard')
    const key=`#roomCard-${id}`
    const roomCard=this.selectComponent(key)
    if(roomCard){
      console.log('find roomCard')
      console.log(this.data.collectedList)
      roomCard.updateCollectedList(this.data.collectedList)
    }
      
  },

  onCardTap(e){
    const id = e.detail.id
    wx.navigateTo({
      url: `/pages/room_detail/room_detail?id=${id}`
    });
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
      checkInDate:app.globalData.checkInDate,
      checkOutDate:app.globalData.checkOutDate,
      minPrice:app.globalData.minPrice,
      maxPrice:app.globalData.maxPrice,
      headCount:app.globalData.headCount,

      today:app.globalData.today,
      imgPrefix:app.globalData.imgPrefix,
      collectedList:app.globalData.userInfo.collectedList,
    })
    this.onSearch()

    // 更新卡片收藏状态
    const roomList = this.data.roomList
    for(const room of roomList)
      this.updateRoomCard(room.id)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  // 页面卸载时清理
  onUnload() {
    const { cacheKey } = this.options;
    cacheKey && wx.removeStorageSync(cacheKey);
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
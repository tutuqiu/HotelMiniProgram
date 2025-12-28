// pages/room_collected/room_collected.js
import {searchRoomsByIds} from '../../services/rooms.js'
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    collectedList:[],
    collectedRoomsDetail:[],
    imgPrefix:'',
    isEmpty:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      collectedList:app.globalData.userInfo.collectedList,
      imgPrefix:app.globalData.imgPrefix,
    })
    if(this.data.collectedList.length==0){
      console.log("empty")
      this.setData({
        isEmpty:true
      })
    }
    else{
      this.seachRoomsDetail()
    }
  },
  
  async seachRoomsDetail(){
    if(app.needToRefresh())
      await app.refresh()

    const res_results=await searchRoomsByIds(this.data.collectedList)
    let collectedRoomsDetail=[]
    for(const res of res_results){
      collectedRoomsDetail.push(res.data)
    }

    this.setData({
      collectedRoomsDetail:collectedRoomsDetail
    })
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
      collectedList:app.globalData.userInfo.collectedList,
      imgPrefix:app.globalData.imgPrefix,
    })
    if(this.data.collectedList.lenth==0){
      this.setData({
        isEmpty:true
      })
    }
    else{
      this.seachRoomsDetail()
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
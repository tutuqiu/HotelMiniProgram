// component/room-card/room-card.js
Component({
  properties:{
    roomData:{
      type:Object
    },
    imgPrefix:{
      type:String
    },
    collectedList:{
      type:Array
    }
  },

  /**
   * 页面的初始数据
   */
  data: {
    isCollected:false
  },

  methods:{
    onCollectTap(e){
      // 触发父页面的“收藏事件”（传递房间ID）
      this.triggerEvent('collect', { id: this.properties.roomData.id });
    },
    onCardTap(){
      // 触发父页面的「卡片点击」事件，传递当前房间ID
      this.triggerEvent('cardTap', { 
        id: this.data.roomData.id 
      });
    },
    updateCollectedList(collectedList){
      console.log('room-card:updateCollectedList')
      this.setData({
        collectedList:collectedList
      })
      this.setCollected()
      // console.log('room-card',this.data.roomData.id)
      // console.log('room-card collectedList:',this.data.collectedList)
    },
    setCollected(){
      const status=this.data.collectedList.includes(this.data.roomData.id)
      console.log(`room ${this.data.roomData.id} collected?:${status}`)
      this.setData({
        isCollected:status
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  
  onLoad(options) {
    this.setCollected()
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
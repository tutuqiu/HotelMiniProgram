// component/room-card/room-card.js
Component({
  properties:{
    roomData:{
      type:Object
    },
    // image:{
    //   type:String
    // },
    // name:{
    //   type:String
    // },

    // // location:{
    // //   type:Object
    // // },
    // // address:{
    // //   type:String
    // // },
    // distance:{
    //   type:Number
    // },
    // // comment:{
    // //   type:String
    // // },
    // area:{
    //   type:Number
    // },

    // bedroom:{
    //   type:Number
    // },
    // livingdining:{
    //   type:Number
    // },
    // bed:{
    //   type:Number
    // },
    // capacity:{
    //   type:Number
    // },

    // price:{
    //   type:Number
    // },

    // tags:{
    //   type:Array[String]
    // },

    // isCollected:{
    //   type:bool
    // },
    
  },

  /**
   * 页面的初始数据
   */
  data: {

  },

  methods:{
    onCollectTap(e){
      // 触发父页面的“收藏事件”（传递房间ID）
      this.triggerEvent('collect', { id: this.data.roomData.id });
    },
    onCardTap(){
      // 触发父页面的「卡片点击」事件，传递当前房间ID
      this.triggerEvent('cardTap', { 
        id: this.data.roomData.id 
      });
    }
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